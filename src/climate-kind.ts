// ---------------------------------------------------------------------------
// ЕДИНЫЙ РАЗБОР КЛИМАТА — ОДИН НА ВСЮ СИСТЕМУ.
//
// Правило «что это за прибор — кондиционер, тёплый пол, конвектор или
// вентиляция» было написано ДВАЖДЫ: кружки под «домиком» комнаты
// (scene/climate-badges.ts) и разделы «мастера» (card/views/master-sections.ts)
// отвечали на один и тот же вопрос по-разному. Вторая копия ошибалась на живом
// объекте владельца, и одна из ошибок была опасной:
//   • реле без привязанного предмета считалось СВЕТОМ — а на объекте оба реле
//     коллектора это тёплый пол, и кнопка «Выключить весь свет» снимала с них
//     питание;
//   • домен `fan` всегда означал вентиляцию — а 13 из 14 «вентиляторов»
//     объекта это `fan.*_konvektor`, вентилятор ВНУТРИ конвектора, то есть
//     обогрев.
// Теперь правило живёт здесь одно, и спрашивают его оба. Второго списка
// моделей, режимов или подсказок по имени в репозитории быть не должно.
//
// Файл НАМЕРЕННО без единого импорта и лежит в корне `src/`: и сцена, и
// карточка ниже его по дереву, поэтому кольцу зависимостей взяться неоткуда.
//
// ПОРЯДОК ПРИЗНАКОВ (первый сработавший выигрывает):
//   1) climate.* со СПИСКОМ РЕЖИМОВ — режимы решают КЛАСС прибора. Это его
//      собственная правда о том, что он умеет: холодить (кондиционер), только
//      дуть (приточка, прикинувшаяся климатом), только греть (обогрев). Модель
//      предмета здесь лишь уточняет, ЧТО это за обогрев: пол или конвектор.
//      Режимы стоят выше модели именно у climate.*: приточку на плане вешают
//      на первую попавшуюся коробку `ac_unit` — модели для неё просто нет.
//   2) модель предмета, к которому привязана сущность (ac_unit, warm_floor,
//      radiator/convector, ceiling_vent/ceiling_fan/air_purifier/range_hood) —
//      для реле и вентиляторов это самый надёжный признак: предмет поставил
//      человек и назвал его сам.
//   3) подсказка по ИМЕНИ (entity_id + friendly_name). Для climate.* она
//      различает тёплый пол и конвектор внутри «только греет» и не может
//      перевернуть «греет» в «охлаждает». Для fan/switch она идёт ВПЕРЕДИ
//      домена, потому что домен там врёт.
//   4) домен: `fan` без иных признаков — вентиляция. Голое `switch.rele_3`
//      климатом НЕ считается: реле может быть чем угодно.
// Признаков не хватило — 'other', «климат неизвестного вида», а не выдуманный
// тип.
//
// ЧЕГО ЗДЕСЬ НЕТ И НЕ ДОЛЖНО ПОЯВИТЬСЯ: понятия «СВЕТ». Кружкам раздел «Свет»
// не нужен вовсе (лампа на плане и так светится), а «мастер» решает это сам:
// «не климат» с доменом switch/light — это свет. Правило здесь отвечает ровно
// на один вопрос: «климат такого-то вида или не климат».
// ---------------------------------------------------------------------------

/** Вид климатической техники. `other` — это климат, но вид не опознан. */
export type ClimateKind = 'ac' | 'floor' | 'heater' | 'vent' | 'other';

/** Одна привязка комнаты — ровно то, что лежит в RoomInfo.entities. */
export interface ClimateEntityRef {
  entity_id: string;
  behavior: string;
  model?: string;
}

/** Те атрибуты сущности Home Assistant, которые разбору вообще нужны. */
export interface ClimateAttrs {
  friendly_name?: unknown;
  hvac_modes?: unknown;
}

/** Модель предмета на плане → вид климата. Её выбрал человек. */
export const CLIMATE_MODEL_KIND: Readonly<Record<string, ClimateKind>> = {
  ac_unit: 'ac',
  warm_floor: 'floor',
  radiator: 'heater',
  convector: 'heater',
  ceiling_vent: 'vent',
  ceiling_fan: 'vent',
  air_purifier: 'vent',
  range_hood: 'vent',
};

/** Поведения, у которых вообще бывает «работает / не работает». Датчик
 *  температуры тёплого пола — это показание, а не работа: климатом он не
 *  считается ни у кружков, ни у «мастера». */
export const CLIMATE_CONTROL_BEHAVIORS: ReadonlySet<string> = new Set([
  'climate',
  'switch',
  'input_boolean',
  'fan',
]);

/** Режимы, которые умеет только охлаждающая техника. `auto` сюда НЕ входит:
 *  термостаты тёплого пола сплошь и рядом отдают ['off','heat','auto']. */
export const CLIMATE_COOL_MODES: readonly string[] = ['cool', 'heat_cool', 'dry', 'fan_only'];

/** Подсказки по названию. Порядок важен: «тёплый пол» проверяется до
 *  «обогрева», а «конвектор» — до «вентиляции», иначе «Вентилятор конвектора»
 *  ушёл бы в вентиляцию. */
const NAME_HINTS: readonly (readonly [ClimateKind, RegExp])[] = [
  ['floor', /(тепл\w*\s*пол|тёплый|teplyi[_ ]?pol|teplyy[_ ]?pol|warm[_ ]?floor|floor[_ ]?heat|underfloor|podogrev|\bpol[_ ]|[_ ]pol\b)/],
  ['heater', /(конвектор|konvektor|convector|радиатор|radiator|батаре|batare|обогрев|obogrev)/],
  ['ac', /(кондиц|kondic|konditsion|сплит|split|\bac[_ ]|[_ ]ac\b)/],
  // `ventil[a-z]*ats` ловит и «ventiliatsiia», и «ventilyacia»; на «вентилятор»
  // и «ventilyator_konvektor» не срабатывает — там между ventil и ats/ac нет
  // сплошных букв, а конвектор к тому же выигрывает строкой выше.
  ['vent', /(вентиляц|вытяж|приточ|ventil[a-z]*ats|ventil[a-z]*ac|vytyazh|pritoch)/],
];

/** Вид, на который намекает НАЗВАНИЕ сущности (id + friendly_name). */
export function climateNameHint(entityId: string, friendly?: unknown): ClimateKind | null {
  const hay = `${entityId} ${typeof friendly === 'string' ? friendly : ''}`.toLowerCase();
  for (const [kind, re] of NAME_HINTS) if (re.test(hay)) return kind;
  return null;
}

/** Поведение привязки; `auto` (и пустое) разворачивается в домен сущности. */
export function climateBehaviorOf(e: ClimateEntityRef): string {
  return !e.behavior || e.behavior === 'auto' ? e.entity_id.split('.')[0] : e.behavior;
}

function modesOf(attrs?: ClimateAttrs): string[] {
  return Array.isArray(attrs?.hvac_modes) ? (attrs!.hvac_modes as unknown[]).map(String) : [];
}

/**
 * ВИД КЛИМАТА этой сущности, либо null — «это не климат».
 *
 * Единственная точка, где вопрос решается. Функция чистая: ни карточки, ни
 * hass — только привязка и атрибуты сущности.
 */
export function climateKindOf(e: ClimateEntityRef, attrs?: ClimateAttrs): ClimateKind | null {
  const behavior = climateBehaviorOf(e);
  if (!CLIMATE_CONTROL_BEHAVIORS.has(behavior)) return null;

  const byModel = e.model ? CLIMATE_MODEL_KIND[e.model] : undefined;
  const hint = climateNameHint(e.entity_id, attrs?.friendly_name);

  if (behavior === 'climate') {
    const modes = modesOf(attrs);
    if (modes.length) {
      // Умеет ТОЛЬКО гонять воздух — приточка/вытяжка, прикинувшаяся климатом.
      if (modes.every((m) => m === 'off' || m === 'fan_only')) return 'vent';
      // Умеет холодить — кондиционер, что бы за коробку к нему ни привязали.
      if (modes.some((m) => CLIMATE_COOL_MODES.includes(m))) return 'ac';
      // Умеет только греть. ЧТО это за обогрев — пол или конвектор — режимы не
      // говорят; здесь решают модель предмета и имя.
      if (modes.includes('heat')) {
        if (byModel === 'floor' || byModel === 'heater') return byModel;
        return hint === 'floor' ? 'floor' : 'heater';
      }
    }
    // Режимов нет вовсе (или они ни о чём не говорят): модель, потом имя.
    return byModel ?? hint ?? 'other';
  }

  // Реле, переключатель, вентилятор: режимов у них не бывает, поэтому модель
  // предмета — самый сильный признак.
  if (byModel) return byModel;

  // Вентилятор: имя вперёд домена. «Вентилятор конвектора» — обогрев, и он
  // сливается с `climate.konvektor_*` той же комнаты в ОДИН кружок. Домен
  // остаётся вентиляцией только там, где имя промолчало.
  if (behavior === 'fan') return hint ?? 'vent';

  // Реле и переключатель: климат ТОЛЬКО по имени. «switch.rele_3» может быть
  // чем угодно, и климатом его объявлять нельзя; «Тёплый пол» на реле
  // коллектора — это настоящий тёплый пол, и без этого правила кнопка
  // «Выключить весь свет» сняла бы с него питание.
  return hint;
}

/**
 * Правило кнопки «Выключить ВСЁ» (state.ts allOffHouse и её счётчик
 * allOffCount): какие climate.* она СОХРАНЯЕТ включёнными.
 *
 * Это НЕ то же самое, что `climateKindOf(...) === 'heater' | 'floor'`, и
 * шире делать нельзя без слова владельца: здесь «только греет» — это
 * modes ⊆ {off, heat}, то есть термостат с режимом `auto` кнопка выключит.
 * Правило лежит рядом с остальными списками режимов, чтобы список `heat`
 * не расползся по файлам, но остаётся отдельным ответом на отдельный вопрос.
 * И оно вообще НЕ про реле: тёплый пол на голом `switch.*` эта кнопка гасит
 * как обычную нагрузку — так было и до объединения правил.
 */
export function isHeatOnlyClimate(attrs?: ClimateAttrs): boolean {
  const modes = modesOf(attrs);
  return modes.length > 0 && modes.every((m) => m === 'off' || m === 'heat');
}
