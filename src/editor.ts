// ---------------------------------------------------------------------------
// <bms-floorplan-card-editor> — visual config editor for the card picker.
//
// Phase 1 scope: edit card-level settings (height/background/url/backend) and
// the floor-plan JSON directly, with live validation. Changes are written back
// via the standard `config-changed` event, which Lovelace persists with
// lovelace.saveConfig — no custom backend required.
//
// Phase 2 (planned): a top-down 2D wall-drawing canvas + furniture palette +
// per-placement entity-binding dropdowns populated from hass.states. The
// hooks (hass access, config-changed plumbing) are already in place here.
// ---------------------------------------------------------------------------

import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { CardConfig, HomeAssistant, FloorPlan } from './types';

/** The integration loads this bundle on every Home Assistant page, so the same
 *  tag can be handed to customElements twice (two dashboards, a kiosk frame, an
 *  older copy of the resource still listed in Lovelace). A second define() for a
 *  name that already exists THROWS, and the throw kills the whole module — the
 *  card disappears entirely. Register only if the name is still free. */
export const EDITOR_TAG = 'bms-floorplan-card-editor';

export class BmsFloorplanCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: CardConfig;
  @state() private _planText = '';
  @state() private _jsonError?: string;

  public setConfig(config: CardConfig): void {
    this._config = config;
    if (config.plan) {
      this._planText = JSON.stringify(config.plan, null, 2);
    } else if (!config.url && !config.projects) {
      this._planText = '';
    }
  }

  private _emit(config: CardConfig): void {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onField(key: keyof CardConfig, e: Event): void {
    if (!this._config) return;
    const value = (e.target as HTMLInputElement).value;
    const next = { ...this._config };
    if (value === '') delete (next as any)[key];
    else (next as any)[key] = value;
    this._emit(next);
  }

  private _onPlanInput(e: Event): void {
    this._planText = (e.target as HTMLTextAreaElement).value;
    if (!this._config) return;
    if (this._planText.trim() === '') {
      this._jsonError = undefined;
      const next = { ...this._config };
      delete next.plan;
      this._emit(next);
      return;
    }
    try {
      const plan = JSON.parse(this._planText) as FloorPlan;
      if (!plan.floors || !Array.isArray(plan.floors)) {
        throw new Error('Plan must have a "floors" array.');
      }
      this._jsonError = undefined;
      const next = { ...this._config, plan };
      delete next.url; // inline plan supersedes url
      this._emit(next);
    } catch (err: any) {
      this._jsonError = err?.message ?? 'Invalid JSON';
    }
  }

  protected override render() {
    if (!this._config) return nothing;
    return html`
      <div class="form">
        <label>
          Card height
          <input
            type="text"
            placeholder="500px"
            .value=${this._config.height ?? ''}
            @input=${(e: Event) => this._onField('height', e)}
          />
        </label>

        <label>
          Background color
          <input
            type="text"
            placeholder="#1b1d22"
            .value=${this._config.background ?? ''}
            @input=${(e: Event) => this._onField('background', e)}
          />
        </label>

        <label>
          Plan URL (alternative to inline plan)
          <input
            type="text"
            placeholder="/local/floorplans/home.json"
            .value=${this._config.url ?? ''}
            @input=${(e: Event) => this._onField('url', e)}
          />
        </label>

        <label>
          Backend URL (optional, stretch goal)
          <input
            type="text"
            placeholder="http://localhost:8099"
            .value=${this._config.backend ?? ''}
            @input=${(e: Event) => this._onField('backend', e)}
          />
        </label>

        <label class="plan">
          Floor plan JSON (inline)
          <textarea
            rows="16"
            spellcheck="false"
            .value=${this._planText}
            @input=${this._onPlanInput}
          ></textarea>
        </label>
        ${this._jsonError
          ? html`<div class="err">⚠ ${this._jsonError}</div>`
          : nothing}

        <p class="hint">
          A full visual wall-drawing editor with a furniture palette and
          entity-binding dropdowns is planned (Phase 2). For now, author the
          plan JSON here or point to a file under <code>/config/www/</code>.
        </p>
      </div>
    `;
  }

  static override styles = css`
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 13px;
      gap: 4px;
      color: var(--primary-text-color, #222);
    }
    input,
    textarea {
      font: inherit;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #222);
    }
    textarea {
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
      resize: vertical;
    }
    .err {
      color: #c0392b;
      font-size: 12px;
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }
    code {
      background: rgba(0, 0, 0, 0.07);
      padding: 1px 4px;
      border-radius: 4px;
    }
  `;
}

if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, BmsFloorplanCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'bms-floorplan-card-editor': BmsFloorplanCardEditor;
  }
}
