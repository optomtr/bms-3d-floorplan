// Заглушка карточки для проверок киоск-страницы.
//
// Проверяется не 3D, а живучесть страницы, поэтому здесь только договор, на
// который страница опирается: setConfig(config) и свойство hass. Настоящая
// сцена в этих проверках стоила бы по WebGL-контексту на прогон и ничего бы не
// добавила — потеря контекста проверяется отдельно, на живой карточке
// (tests/31-kiosk-webgl.spec.ts).

class FakeFloorplanCard extends HTMLElement {
  setConfig(config) {
    this.__config = config;
    this.__configs = (this.__configs || 0) + 1;
    const floors = (config && config.plan && config.plan.floors) || [];
    this.textContent = 'план · этажей: ' + floors.length;
    window.__CARD = this;
  }

  set hass(value) {
    this.__hass = value;
    this.__pushes = (this.__pushes || 0) + 1;
  }

  get hass() {
    return this.__hass;
  }
}

if (!customElements.get('bms-floorplan-card')) {
  customElements.define('bms-floorplan-card', FakeFloorplanCard);
}
window.__CARD_MODULE_LOADS = (window.__CARD_MODULE_LOADS || 0) + 1;
