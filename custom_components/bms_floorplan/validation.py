"""Shape and size checks for the shared plan document.

The plan is written by the card's editor (``src/storage.ts``) as::

    { active?: str, editPin?: str, projects: { <id>: FloorPlan } }

and every ``FloorPlan`` carries ``floors: [...]`` plus an optional human ``name``.
Anything else is refused rather than stored: this document is read back by every
tablet in the building, and the card drives Home Assistant services from what it
finds in there — so an unchecked write is an unchecked instruction.

Sizes are capped as well. A plan with design photos is legitimately measured in
megabytes, so the ceiling is generous, but it is a ceiling: HA's Store writes the
document to ``.storage`` on every save, and an unbounded write fills the disk.
"""

from __future__ import annotations

import json
from typing import Any

from .const import MAX_FLOORS_PER_PROJECT, MAX_PLAN_BYTES, MAX_PROJECTS


class PlanValidationError(Exception):
    """The submitted document is not a plan we are willing to store."""

    def __init__(self, message: str, code: str = "invalid_plan") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


def encoded_size(data: Any) -> int:
    """Byte length of the document as it will be written to .storage."""
    try:
        return len(json.dumps(data, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError) as err:
        raise PlanValidationError(
            "План не сериализуется в JSON.", "not_json"
        ) from err


def check_size(data: Any) -> int:
    """Raise when the document exceeds MAX_PLAN_BYTES; return its size."""
    size = encoded_size(data)
    if size > MAX_PLAN_BYTES:
        raise PlanValidationError(
            f"План слишком большой: {size // 1024} КБ при лимите "
            f"{MAX_PLAN_BYTES // 1024} КБ. Уменьшите фотографии в проектах.",
            "too_large",
        )
    return size


def _check_project(project_id: Any, plan: Any) -> None:
    if not isinstance(project_id, str) or not project_id or len(project_id) > 128:
        raise PlanValidationError("Некорректный идентификатор проекта.")
    if not isinstance(plan, dict):
        raise PlanValidationError(
            f"Проект «{project_id}» должен быть объектом."
        )

    floors = plan.get("floors")
    if not isinstance(floors, list):
        raise PlanValidationError(
            f"У проекта «{project_id}» нет списка этажей (floors)."
        )
    if len(floors) > MAX_FLOORS_PER_PROJECT:
        raise PlanValidationError(
            f"У проекта «{project_id}» слишком много этажей "
            f"(лимит {MAX_FLOORS_PER_PROJECT})."
        )
    if any(not isinstance(floor, dict) for floor in floors):
        raise PlanValidationError(
            f"Этаж проекта «{project_id}» должен быть объектом."
        )

    name = plan.get("name")
    if name is not None and not isinstance(name, str):
        raise PlanValidationError(
            f"Название проекта «{project_id}» должно быть строкой."
        )


def validate_plan_document(data: Any) -> dict:
    """Return the document when it has the expected shape, else raise.

    Deliberately permissive about EXTRA keys inside a plan (the card gains fields
    over time and an older backend must not start rejecting new saves) and strict
    about the frame that holds them.
    """
    if not isinstance(data, dict):
        raise PlanValidationError("Ожидался объект плана.")

    projects = data.get("projects")
    if not isinstance(projects, dict):
        raise PlanValidationError("В плане нет объекта projects.")
    if len(projects) > MAX_PROJECTS:
        raise PlanValidationError(
            f"Слишком много проектов (лимит {MAX_PROJECTS})."
        )
    for project_id, plan in projects.items():
        _check_project(project_id, plan)

    active = data.get("active")
    if active is not None and not isinstance(active, str):
        raise PlanValidationError("Поле active должно быть строкой.")

    edit_pin = data.get("editPin")
    if edit_pin is not None and (not isinstance(edit_pin, str) or len(edit_pin) > 128):
        raise PlanValidationError("Поле editPin должно быть короткой строкой.")

    check_size(data)
    return data
