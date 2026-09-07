// ---------------------------------------------------------------------------
// Внутренние типы карточки: свой диалог, домофон, протечка.
// ---------------------------------------------------------------------------

/** Input for the card's own modal (the company forbids window.alert/confirm/
 *  prompt — a system pop-up on a wall tablet is unreadable and unstyled). */
export interface AskOptions {
  title: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  /** Paint the confirm button as destructive. */
  danger?: boolean;
  /** Ask for a value instead of a yes/no. */
  input?: { placeholder?: string; value?: string; inputmode?: string };
}

/** A BMS Intercom's related entities, discovered by their shared base name. */
export interface IntercomGroup {
  base: string;
  prosmotr: string; // switch — Просмотр (live view / sound)
  vyzov: string; // binary_sensor — Вызов (call state)
  camera?: string; // camera — Видео
  open?: string; // button — Открыть дверь
  answer?: string; // button — Ответить (integration pop-up handles the call)
  reset?: string; // button — Сбросить
  ids: Set<string>; // all of the above, to hide from the per-domain cards
}

/** A live water leak: the sensors reporting wet, plus the shut-off to reopen
 *  once the leak has been dealt with. Both are discovered from hass, so adding a
 *  second sensor later needs no change to the plan or this card's config. */
export interface LeakAlarm {
  sensors: string[];
  valve?: string;
  /** A sensor is wet right now, as opposed to the supply merely still being shut. */
  wet: boolean;
}
