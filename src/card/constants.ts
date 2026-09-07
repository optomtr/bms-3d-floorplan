// ---------------------------------------------------------------------------
// Константы карточки: категории устройств, переводы, теги и маршруты,
// лимиты и список доменов, службы которых карточке разрешено вызывать.
// ---------------------------------------------------------------------------

/** Device categories shown when a room marker is tapped (only present ones).
 *  Fans/ventilation live under Climate (not Lights). */
export const DEVICE_CATEGORIES: { key: string; label: string; icon: string; behaviors: string[] }[] = [
  { key: 'lights', label: 'Lights', icon: 'bulb', behaviors: ['light', 'switch', 'input_boolean'] },
  { key: 'climate', label: 'Climate', icon: 'snow', behaviors: ['climate', 'fan'] },
  { key: 'curtains', label: 'Curtains', icon: 'curtain', behaviors: ['cover'] },
  { key: 'media', label: 'Media', icon: 'tv', behaviors: ['media_player'] },
  { key: 'locks', label: 'Locks', icon: 'lockClosed', behaviors: ['lock'] },
  { key: 'sensors', label: 'Sensors', icon: 'gauge', behaviors: ['sensor', 'binary_sensor'] },
];

/** Russian translations for the user-visible view-mode UI. English is the key
 *  and the fallback, so any language that isn't Russian shows English. */
export const RU_STRINGS: Record<string, string> = {
  Reset: 'Сброс',
  Edit: 'Изменить',
  'Done & Save': 'Готово',
  Auto: 'Авто',
  High: 'Высокое',
  Medium: 'Среднее',
  Low: 'Низкое',
  Quality: 'Качество',
  Lights: 'Свет',
  Climate: 'Климат',
  Curtains: 'Шторы',
  Media: 'Медиа',
  Locks: 'Замки',
  Sensors: 'Датчики',
  Other: 'Другое',
  'Water leak!': 'Протечка воды!',
  'Water detected': 'Обнаружена вода',
  'Open the valve': 'Открыть кран',
  'Water is shut off': 'Вода перекрыта',
  Close: 'Закрыть',
  'Fix the leak, then open the valve': 'Устраните протечку и откройте кран',
  'Valve is open': 'Кран открыт',
  Show: 'Показать',
  'Place this sensor on the plan to see the room': 'Разместите датчик на плане, чтобы видеть комнату',
  Room: 'Комната',
  'All on': 'Включить всё',
  'All off': 'Выключить всё',
  devices: 'устройств',
  'No controllable devices': 'Нет управляемых устройств',
  // Room control panel (Option 1A layout).
  Light: 'Свет',
  Brightness: 'Яркость',
  Volume: 'Громкость',
  Closed: 'Закрыто',
  Open: 'Открыто',
  On: 'Включён',
  Off: 'Выключен',
  Heating: 'Отопление',
  Cooling: 'Охлаждение',
  Ventilation: 'Вентиляция',
  Drying: 'Осушение',
  'Playing now': 'Играет сейчас',
  Paused: 'На паузе',
  Locked: 'Заперто',
  Unlocked: 'Отперто',
  'Front door': 'Входная дверь',
  'Turn everything off': 'Выключить всё',
  // Intercom (домофон)
  Intercom: 'Домофон',
  View: 'Просмотр',
  'Open door': 'Открыть дверь',
  Ringing: 'Входящий вызов',
  Viewing: 'Просмотр включён',
  Idle: 'Готов',
  'opened to': 'Открыто на',
  'No devices in this room': 'В этой комнате нет устройств',
  'Select a room': 'Выберите комнату',
  // Overview (Option 1B: house overview).
  Overview: 'Обзор',
  'lights on': 'свет включён',
  'on average': 'в среднем',
  'All off short': 'Всё выкл.',
  Floor: 'Пол',
  Window: 'Окно',
  'My home': 'Мой дом',
  rooms: 'комнат',
  'light sources active': 'источников света активно',
  // Screensaver + new controls (design v3).
  'Select a room to control its devices': 'Выберите комнату, чтобы управлять её устройствами',
  'Touch the screen to return': 'Коснитесь экрана, чтобы вернуться',
  'in the house': 'в доме',
  humidity: 'влажность',
  security: 'безопасность',
  'At home': 'Дома',
  'Heat mode': 'Обогрев',
  'Auto mode': 'Авто',
  'Off mode': 'Выкл',
  'Close blind': 'Закрыть',
  'Open blind': 'Открыть',
  'Stop blind': 'Стоп',
  Opening: 'Открывается',
  Closing: 'Закрывается',
  Warm: 'Тёплый',
  Cool: 'Холодный',
  now: 'сейчас',
  of: 'из',
  'blinds open': 'шторы открыты',
  'humidity in house': 'влажность в доме',
  'front door': 'входная дверь',
};

/** Tag names and routes are the contract with the integration
 *  (custom_components/bms_floorplan/const.py). Keep them in step with it. */
export const CARD_TAG = 'bms-floorplan-card';
export const CARD_EDITOR_TAG = 'bms-floorplan-card-editor';
export const KIOSK_PATH = '/bms-floorplan-kiosk';

/** How long a detached card waits before freeing its 3D scene. Long enough to
 *  ride out Lovelace re-attaching a card during a re-layout, short enough that
 *  a closed panel gives its WebGL context back straight away. */
export const DISPOSE_GRACE_MS = 4000;

/** Cards whose scene is waiting out the grace period above. The delay tells a
 *  Lovelace re-layout apart from a real removal, but it bounds the leak in TIME
 *  only — twenty quick opens leave twenty scenes waiting, and a browser keeps
 *  ~8-16 WebGL contexts before it starts killing live ones. So a card that is
 *  ATTACHED reclaims every pending scene immediately: nobody needs a spare
 *  context more than the visible panel needs to keep drawing. */
export const pendingTeardown = new Set<{ reclaimScene(): void }>();

/** Most sensor history series kept at once (24h, ≤120 points each). Bounded so
 *  a panel that runs for weeks can't accumulate one series per sensor visited. */
export const HIST_CACHE_MAX = 60;

/** Service domains this card is allowed to CALL.
 *
 *  Every control here is driven by an entity_id that came out of the stored
 *  plan, and the domain is taken from that id. Without a list, a plan carrying
 *  `script.open_the_gate` or `automation.disarm` turns a tap on a sofa into a
 *  call to it. These are the domains the card actually renders controls for;
 *  `script` and `automation` are deliberately NOT among them — those are
 *  "run anything" domains, and a floor plan has no business firing them.
 *  Entities outside the list still show their state, read-only. */
export const CONTROL_DOMAINS: ReadonlySet<string> = new Set([
  'light',
  'switch',
  'input_boolean',
  'fan',
  'cover',
  'climate',
  'media_player',
  'lock',
  'valve',
  'button',
]);
