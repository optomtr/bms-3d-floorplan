// ---------------------------------------------------------------------------
// Демо-конфигурация для витрины карточек Lovelace.
// ---------------------------------------------------------------------------

import type { CardConfig } from '../types';
import { CARD_TAG } from './constants';

export function stubConfig(): CardConfig {
  return {
    type: `custom:${CARD_TAG}`,
    height: '500px',
    plan: {
      name: 'Demo',
      wallHeight: 2.6,
      floors: [
        {
          name: 'Ground',
          walls: [
            { start: [0, 0], end: [6, 0] },
            { start: [6, 0], end: [6, 5] },
            { start: [6, 5], end: [0, 5] },
            { start: [0, 5], end: [0, 0], openings: [{ kind: 'door', position: 2, width: 1 }] },
          ],
          rooms: [{ name: 'Living', polygon: [[0, 0], [6, 0], [6, 5], [0, 5]], color: '#cfc7ba' }],
          furniture: [
            { model: 'sofa', position: [1.5, 0, 1], rotation: 0, color: '#5b6b7a', id: 'sofa1' },
            { model: 'ceiling_light', position: [3, 2.5, 2.5], id: 'lamp1' },
          ],
          bindings: [
            { entity_id: 'light.living_room', anchor_object: 'lamp1', behavior: 'light' },
          ],
        },
      ],
    },
  };
}
