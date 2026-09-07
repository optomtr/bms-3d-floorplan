// Планы для проверок. Мелкие и предсказуемые: чем меньше геометрии, тем
// быстрее строится сцена и тем однозначнее падение проверки.

export interface AnyPlan {
  name?: string;
  wallHeight?: number;
  floors: any[];
}

/** Квадратная комната 6x5 с четырьмя стенами. */
export function room(name = 'Зал', w = 6, d = 5) {
  return {
    name,
    polygon: [
      [0, 0],
      [w, 0],
      [w, d],
      [0, d],
    ],
    material: 'wood',
  };
}

export function boxWalls(w = 6, d = 5) {
  return [
    { start: [0, 0], end: [w, 0] },
    { start: [w, 0], end: [w, d] },
    { start: [w, d], end: [0, d] },
    { start: [0, d], end: [0, 0] },
  ];
}

/** Обычный рабочий план: комната, мебель со светильником и замком. */
export function simplePlan(): AnyPlan {
  return {
    name: 'Проверочный план',
    wallHeight: 2.6,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: boxWalls(),
        rooms: [room()],
        furniture: [
          { id: 'lamp1', model: 'floor_lamp', position: [1.4, 0, 1.4] },
          { id: 'sofa1', model: 'sofa', position: [3, 0, 3], rotation: 0 },
          { id: 'door1', model: 'door', position: [5.6, 0, 2.5], rotation: 90 },
        ],
        bindings: [
          { entity_id: 'light.zal', anchor_object: 'lamp1', behavior: 'light' },
          { entity_id: 'lock.front_door', anchor_object: 'door1', behavior: 'lock' },
        ],
      },
    ],
  };
}

/** План с ЯВНЫМ браком: у стены нет второй координаты конца, у предмета нет
 *  position. Остальное — нормальная комната, которая обязана остаться видимой. */
export function brokenPlan(): AnyPlan {
  return {
    name: 'Битый план',
    wallHeight: 2.6,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: [
          ...boxWalls(),
          // Брак №1: конец стены без второй координаты.
          { start: [0, 0], end: [undefined as any, 2] },
        ],
        rooms: [room()],
        furniture: [
          { id: 'lamp1', model: 'floor_lamp', position: [1.4, 0, 1.4] },
          // Брак №2: предмет без position.
          { id: 'ghost', model: 'sofa' } as any,
        ],
        bindings: [{ entity_id: 'light.zal', anchor_object: 'lamp1', behavior: 'light' }],
      },
    ],
  };
}

/** План для проверки тапа: светильник вынесен ЗА комнату, поэтому получает
 *  собственный значок, а не сливается в общий значок комнаты (тот открывает
 *  панель комнаты, а нам нужен именно попап устройства). */
export function tapPlan(): AnyPlan {
  const p = simplePlan();
  // Модель — телевизор: сплошная панель. Тонкая ножка торшера дала бы широкий
  // габарит при почти нулевой площади попадания, и «промах» было бы не
  // отличить от «жест отбракован».
  p.floors[0].furniture.push({ id: 'veranda_tv', model: 'tv', position: [10, 1.5, 2.5], scale: [3, 3, 3] });
  p.floors[0].bindings.push({
    entity_id: 'switch.veranda',
    anchor_object: 'veranda_tv',
    behavior: 'switch',
  });
  return p;
}

/** План с опасными сущностями: скрипт и автоматизация привязаны к мебели. */
export function dangerousPlan(): AnyPlan {
  const p = simplePlan();
  p.floors[0].furniture.push(
    { id: 'gate', model: 'tv', position: [4.5, 0, 0.6] },
    { id: 'alarm', model: 'tv', position: [1, 0, 4.2] },
  );
  p.floors[0].bindings.push(
    { entity_id: 'script.open_the_gate', anchor_object: 'gate', behavior: 'switch' },
    { entity_id: 'automation.disarm', anchor_object: 'alarm', behavior: 'switch' },
  );
  return p;
}

/** План с вентилятором — он анимируется каждый кадр, пока включён. */
export function fanPlan(): AnyPlan {
  const p = simplePlan();
  p.floors[0].furniture.push({ id: 'fan1', model: 'ceiling_fan', position: [3, 2.2, 2.5] });
  p.floors[0].bindings.push({ entity_id: 'fan.zal', anchor_object: 'fan1', behavior: 'fan' });
  return p;
}

/** Набор состояний под simplePlan(). */
export function baseStates(): Record<string, any> {
  return {
    'light.zal': { state: 'on', attributes: { friendly_name: 'Свет в зале', supported_color_modes: ['brightness'], brightness: 180 } },
    'lock.front_door': { state: 'locked', attributes: { friendly_name: 'Входная дверь' } },
  };
}

/** N сущностей, которых НЕТ в плане — ни одной привязки, сцене они не нужны. */
export function unboundSensors(n: number): Record<string, any> {
  const out: Record<string, any> = {};
  for (let i = 0; i < n; i++) {
    out[`sensor.unbound_${i}`] = {
      state: String(20 + (i % 7)),
      attributes: { friendly_name: `Датчик ${i}`, unit_of_measurement: '°C' },
    };
  }
  return out;
}

/** Проектный набор для WS-хранилища: два проекта. */
export function twoProjects() {
  return {
    active: 'p_first',
    projects: {
      p_first: { ...simplePlan(), name: 'Первый объект' },
      p_second: { ...simplePlan(), name: 'Второй объект' },
    },
  };
}
