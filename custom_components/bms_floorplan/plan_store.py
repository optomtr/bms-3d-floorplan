"""The two documents this integration owns, and the rules for writing them.

``plan_api`` is the API surface (WebSocket commands and the HTTP view); this is
the storage layer underneath it, kept apart so neither file grows past the point
where it can be read in one sitting.

Two documents live here:

* THE PLAN — one per install, versioned. Every write stamps a monotonic
  ``version`` and an ``updated_at``. A writer says which version it started
  from; if the document has moved on since, the write is refused and the caller
  is handed the document that won. Before this, two tablets saving a second
  apart meant the second one silently deleted the first one's projects.
* THE EDIT PIN — its own document. It used to sit inside the plan, so every plan
  save rewrote it and a device whose copy predated the PIN erased it.

A read that FAILED raises rather than returning "empty". That distinction is the
guard the whole package rests on: an empty answer is a licence to save on top,
and saving on top of a failed read is how one device wipes the install.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DATA_PIN_STORE,
    DOC_UPDATED_KEY,
    DOC_VERSION_KEY,
    DOMAIN,
    LEGACY_PLAN_PIN_KEY,
    PIN_STORAGE_KEY,
    PIN_STORAGE_VERSION,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .validation import PlanValidationError, validate_pin, validate_plan_document

_LOGGER = logging.getLogger(__name__)

# Failure codes. They travel to the browser, so the card can say WHY a save did
# not happen instead of the single "не смог" it used to show.
ERR_CONFLICT = "version_conflict"
ERR_UNAVAILABLE = "storage_unavailable"

CONFLICT_MSG = (
    "План уже изменён на другом устройстве. Ваша запись отменена, "
    "чтобы не стереть чужие правки — обновите план и повторите."
)
UNAVAILABLE_MSG = "Хранилище плана недоступно, повторите позже."
PIN_UNAVAILABLE_MSG = "Хранилище PIN недоступно, повторите позже."


def _now() -> str:
    """Timestamp for ``updated_at`` — UTC, so devices in one house agree."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def doc_version(doc: Any) -> int:
    """Version of a stored document.

    Anything written before versioning existed (or anything malformed) is
    version 0, which is what a first-time writer sends as its base — so old data
    keeps working with no manual migration.
    """
    if not isinstance(doc, dict):
        return 0
    value = doc.get(DOC_VERSION_KEY)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return 0
    return value


class PlanConflictError(Exception):
    """Someone else saved first. The write did NOT happen."""

    def __init__(self, current: dict, version: int) -> None:
        super().__init__(CONFLICT_MSG)
        self.code = ERR_CONFLICT
        self.message = CONFLICT_MSG
        self.current = current
        self.version = version


class StoreUnavailableError(Exception):
    """The store could not be read or written. NOT the same as 'it is empty'."""

    def __init__(self, message: str = UNAVAILABLE_MSG) -> None:
        super().__init__(message)
        self.code = ERR_UNAVAILABLE
        self.message = message


class PlanStore:
    """Load/save the shared plan document, cached in memory."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict | None = None
        self._loaded = False

    async def async_load(self) -> dict | None:
        """The stored document, or None when nothing has ever been saved.

        Raises StoreUnavailableError when the read FAILED — see the module
        docstring for why that is not the same answer as an empty plan.
        """
        if self._loaded:
            return self._data
        try:
            data = await self._store.async_load()
        except Exception as err:  # noqa: BLE001 - reported, not swallowed
            _LOGGER.warning("Не удалось прочитать общий план: %s", err)
            # Deliberately NOT cached: a transient failure must not poison every
            # later read for the lifetime of the process.
            raise StoreUnavailableError() from err
        self._data = data if isinstance(data, dict) else None
        self._loaded = True
        return self._data

    async def async_version(self) -> int:
        """Version currently on disk (0 when nothing is stored)."""
        return doc_version(await self.async_load())

    async def async_save(self, data: Any, base_version: int | None = None) -> int:
        """Validate, stamp with the next version, persist. Returns that version.

        ``base_version=None`` is the OLD-CLIENT PATH: a card bundle from before
        this package sends nothing and writes blindly, exactly as it always did.
        Every current client sends it and is protected.
        """
        if not isinstance(data, dict):
            raise PlanValidationError("Ожидался объект плана.")

        current = await self.async_load()
        version = doc_version(current)
        if base_version is not None and base_version != version:
            raise PlanConflictError(current or {}, version)

        doc = dict(data)
        doc[DOC_VERSION_KEY] = version + 1
        doc[DOC_UPDATED_KEY] = _now()
        validate_plan_document(doc)

        await self._store.async_save(doc)
        # Cache only after the write actually landed, so a failed save cannot
        # leave this process serving a document that is not on disk.
        self._data = doc
        self._loaded = True
        return version + 1


class PinStore:
    """The edit PIN, in a document of its own.

    It used to sit inside the plan document, which meant every plan save rewrote
    it: a device whose copy of the plan predated the PIN erased the PIN, and an
    admin editing the plan could not avoid touching it.

    What is stored is the hash the card computes in the browser, never the
    digits. Reading is open to any authenticated user because the card has to
    know whether Edit mode is locked before it can ask for the PIN; that hash is
    weak by design (see ``hashPin`` in src/storage.ts) — casual
    tamper-protection for a wall tablet, not a secret.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, PIN_STORAGE_VERSION, PIN_STORAGE_KEY)
        self._data: dict | None = None
        self._loaded = False

    async def async_load(self) -> dict:
        if self._loaded and self._data is not None:
            return self._data
        try:
            data = await self._store.async_load()
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Не удалось прочитать PIN редактора: %s", err)
            raise StoreUnavailableError(PIN_UNAVAILABLE_MSG) from err
        self._data = data if isinstance(data, dict) else {}
        self._loaded = True
        return self._data

    async def async_get(self) -> str | None:
        """The stored PIN hash, or None when Edit mode is not locked."""
        pin = (await self.async_load()).get("pin")
        return pin if isinstance(pin, str) and pin else None

    async def _async_write(self, pin: str | None, adopted: bool = False) -> dict:
        current = await self.async_load()
        doc = {
            "pin": pin,
            DOC_VERSION_KEY: doc_version(current) + 1,
            DOC_UPDATED_KEY: _now(),
            # Latched once the PIN that used to live in the plan has been taken
            # over, so removing the PIN later cannot resurrect the old one from
            # the copy still sitting in the plan document.
            "adopted_from_plan": bool(current.get("adopted_from_plan") or adopted),
        }
        try:
            await self._store.async_save(doc)
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Не удалось сохранить PIN редактора: %s", err)
            raise StoreUnavailableError(PIN_UNAVAILABLE_MSG) from err
        self._data = doc
        self._loaded = True
        return doc

    async def async_set(self, pin: Any) -> dict:
        """Set or clear the PIN (None / "" clears it)."""
        return await self._async_write(validate_pin(pin))

    async def async_adopt(self, plan: dict | None) -> None:
        """One-time carry-over of a PIN saved before this store existed.

        Copies, does not cut: rewriting the plan document during a READ would
        bump its version under other devices' feet for no reason. The leftover
        key inside the plan is harmless — nothing reads it any more, and the next
        save from a current card drops it.
        """
        if not isinstance(plan, dict):
            return
        legacy = plan.get(LEGACY_PLAN_PIN_KEY)
        if not isinstance(legacy, str) or not legacy.strip():
            return
        try:
            current = await self.async_load()
            if current.get("adopted_from_plan") or current.get("pin"):
                return
            await self._async_write(validate_pin(legacy), adopted=True)
        except (StoreUnavailableError, PlanValidationError) as err:
            # Never break a plan read over the PIN: the next read tries again.
            _LOGGER.warning("Не удалось перенести PIN из плана: %s", err)
            return
        _LOGGER.info("PIN редактора перенесён из документа плана в своё хранилище.")


def pin_store(hass: HomeAssistant) -> PinStore:
    """The install's PIN store, created on first use.

    Kept in hass.data next to the plan store so a reload reuses the same cache.
    """
    data = hass.data.setdefault(DOMAIN, {})
    store = data.get(DATA_PIN_STORE)
    if store is None:
        store = PinStore(hass)
        data[DATA_PIN_STORE] = store
    return store
