// ---------------------------------------------------------------------------
// Каркас DOM: корневой узел, холст и экранный слой.
//
// Отдельно от editor.ts, чтобы в редакторе остался жизненный цикл, а не разметка.
// Стиль кладётся внутрь корня <style>-узлом: движок может стоять в любом месте
// страницы (и в теневом дереве оболочки), и тащить правила в document.head
// значило бы пачкать чужую страницу и ломаться в теневом дереве.
// ---------------------------------------------------------------------------

import type { HudCallbacks } from './hud';
import { Hud } from './hud';
import { ENGINE_CSS } from './styles';

const NS = 'http://www.w3.org/2000/svg';

export interface Chrome {
  root: HTMLDivElement;
  svg: SVGSVGElement;
  hud: Hud;
}

export function buildChrome(host: HTMLElement, tool: string, cb: HudCallbacks): Chrome {
  const root = document.createElement('div');
  root.className = 'e2-root';
  root.setAttribute('data-tool', tool);

  const style = document.createElement('style');
  style.textContent = ENGINE_CSS;
  root.appendChild(style);

  const svg = document.createElementNS(NS, 'svg') as SVGSVGElement;
  svg.setAttribute('class', 'e2-svg');
  root.appendChild(svg);

  const hud = new Hud(cb);
  root.appendChild(hud.root);

  host.appendChild(root);
  return { root, svg, hud };
}
