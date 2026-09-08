// ---------------------------------------------------------------------------
// Экранный слой: строка состояния, поля размеров у курсора, кнопки.
//
// Два правила, ради которых он вообще существует:
//   1) размер можно НАБРАТЬ. Поле длины и угла стоит рядом с курсором, Enter
//      фиксирует. Запятая работает (num.ts), потому что на планшете её и жмут.
//   2) привязка выключается ЭКРАННОЙ кнопкой. Ни Shift, ни Ctrl, ни Alt: на
//      планшете их нет, а именно там чертят.
//
// Поля пересобираются только при смене НАБОРА полей. Пересборка на каждый кадр
// выбивала бы фокус и стирала бы наполовину набранное число.
// ---------------------------------------------------------------------------

import { humanNum } from './num';

export interface FieldSpec {
  key: string;
  label: string;
  value: number;
  digits?: number;
}

export interface ModeSpec {
  id: string;
  label: string;
  active?: boolean;
}

export interface HudCallbacks {
  onMode(id: string): void;
  onSnapToggle(): void;
  onFit(): void;
  onZoom(dir: 1 | -1): void;
  onCommitFields(values: Record<string, number>): void;
  onAsk(yes: boolean): void;
}

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, txt?: string): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};

export class Hud {
  readonly root: HTMLDivElement;
  private readonly modesBox: HTMLDivElement;
  private readonly fieldsBox: HTMLDivElement;
  private readonly statusBox: HTMLDivElement;
  private readonly askBox: HTMLDivElement;
  private readonly askText: HTMLSpanElement;
  private readonly askYes: HTMLButtonElement;
  private readonly askNo: HTMLButtonElement;
  private readonly snapBtn: HTMLButtonElement;
  private inputs = new Map<string, HTMLInputElement>();
  /** Поля, в которые человек уже что-то набрал. Их значение НЕ перетирается
   *  тем, что показывает курсор: иначе набрал ширину, перешёл к глубине — и
   *  ширина стёрлась под рукой. */
  private dirty = new Set<string>();
  private fieldSig = '';
  private modeSig = '';

  constructor(private readonly cb: HudCallbacks) {
    this.root = el('div', 'e2-hud');

    this.modesBox = el('div', 'e2-modes');
    this.root.appendChild(this.modesBox);

    this.askBox = el('div', 'e2-ask');
    this.askText = el('span', 'e2-ask-tx');
    this.askYes = el('button', 'e2-btn e2-on', 'Да');
    this.askNo = el('button', 'e2-btn', 'Нет');
    this.askYes.type = 'button';
    this.askNo.type = 'button';
    this.askYes.setAttribute('data-role', 'ask-yes');
    this.askNo.setAttribute('data-role', 'ask-no');
    this.askYes.addEventListener('click', () => this.cb.onAsk(true));
    this.askNo.addEventListener('click', () => this.cb.onAsk(false));
    this.askBox.append(this.askText, this.askYes, this.askNo);
    this.root.appendChild(this.askBox);

    this.fieldsBox = el('div', 'e2-fields');
    this.root.appendChild(this.fieldsBox);

    this.statusBox = el('div', 'e2-status');
    this.root.appendChild(this.statusBox);

    const controls = el('div', 'e2-controls');
    this.snapBtn = el('button', 'e2-btn', 'Привязка');
    this.snapBtn.type = 'button';
    this.snapBtn.setAttribute('data-role', 'snap');
    this.snapBtn.addEventListener('click', () => this.cb.onSnapToggle());
    const fit = el('button', 'e2-btn', 'Вписать');
    fit.type = 'button';
    fit.setAttribute('data-role', 'fit');
    fit.addEventListener('click', () => this.cb.onFit());
    const zoomRow = el('div');
    zoomRow.style.display = 'flex';
    zoomRow.style.gap = '8px';
    const zOut = el('button', 'e2-btn', '−');
    const zIn = el('button', 'e2-btn', '+');
    zOut.type = 'button';
    zIn.type = 'button';
    zOut.setAttribute('data-role', 'zoom-out');
    zIn.setAttribute('data-role', 'zoom-in');
    zOut.addEventListener('click', () => this.cb.onZoom(-1));
    zIn.addEventListener('click', () => this.cb.onZoom(1));
    zoomRow.append(zOut, zIn);
    controls.append(this.snapBtn, fit, zoomRow);
    this.root.appendChild(controls);
  }

  setStatus(text: string): void {
    if (this.statusBox.textContent !== text) this.statusBox.textContent = text;
  }

  setSnap(on: boolean): void {
    this.snapBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    this.snapBtn.textContent = on ? 'Привязка вкл' : 'Привязка выкл';
  }

  setModes(list: ModeSpec[]): void {
    const sig = list.map((m) => `${m.id}:${m.label}:${m.active ? 1 : 0}`).join('|');
    if (sig === this.modeSig) return;
    this.modeSig = sig;
    this.modesBox.textContent = '';
    for (const m of list) {
      const b = el('button', `e2-btn${m.active ? ' e2-on' : ''}`, m.label);
      b.type = 'button';
      b.setAttribute('data-mode', m.id);
      b.addEventListener('click', () => this.cb.onMode(m.id));
      this.modesBox.appendChild(b);
    }
  }

  ask(text: string | null): void {
    if (!text) {
      this.askBox.removeAttribute('data-open');
      return;
    }
    this.askText.textContent = text;
    this.askBox.setAttribute('data-open', '1');
  }

  /** Поля размеров у курсора. `null` прячет их вместе с набранным. */
  setFields(specs: FieldSpec[] | null, at: [number, number] | null): void {
    if (!specs || !specs.length) {
      this.fieldsBox.removeAttribute('data-open');
      this.fieldSig = '';
      this.inputs.clear();
      this.dirty.clear();
      this.fieldsBox.textContent = '';
      return;
    }
    const sig = specs.map((f) => `${f.key}:${f.label}`).join('|');
    if (sig !== this.fieldSig) {
      this.fieldSig = sig;
      this.inputs.clear();
      this.dirty.clear();
      this.fieldsBox.textContent = '';
      for (const f of specs) {
        const wrap = el('div', 'e2-field');
        const lab = el('label', undefined, f.label);
        const inp = el('input');
        const id = `e2f-${f.key}-${Math.random().toString(36).slice(2, 7)}`;
        inp.id = id;
        lab.htmlFor = id;
        inp.type = 'text';
        inp.inputMode = 'decimal';
        inp.autocomplete = 'off';
        inp.setAttribute('data-field', f.key);
        inp.addEventListener('input', () => this.dirty.add(f.key));
        inp.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            this.cb.onCommitFields(this.values());
          }
        });
        wrap.append(lab, inp);
        this.fieldsBox.appendChild(wrap);
        this.inputs.set(f.key, inp);
      }
      const ok = el('button', 'e2-btn', '✓');
      ok.type = 'button';
      ok.setAttribute('data-role', 'commit');
      ok.title = 'Зафиксировать размер';
      ok.addEventListener('click', () => this.cb.onCommitFields(this.values()));
      this.fieldsBox.appendChild(ok);
      const hint = el('div', 'e2-fields-hint', 'Наберите и нажмите Enter');
      this.fieldsBox.appendChild(hint);
    }
    for (const f of specs) {
      const inp = this.inputs.get(f.key);
      // Пока человек печатает — и пока набранное не пущено в дело — поле не
      // трогаем: иначе «3,» затирается тем, что показывает курсор.
      if (!inp || document.activeElement === inp || this.dirty.has(f.key)) continue;
      const next = fmtField(f.value, f.digits ?? 2);
      if (inp.value !== next) inp.value = next;
    }
    this.fieldsBox.setAttribute('data-open', '1');
    this.placeFields(at);
  }

  /**
   * Где стоит коробка с полями.
   *
   * Она идёт ЗА курсором по горизонтали, но живёт в одной из двух полос —
   * верхней или нижней, и всегда в ТОЙ, где курсора нет. Коробка, честно
   * висящая «в 18 пикселях от курсора», перехватывает следующее касание: человек
   * ставит вторую точку стены, а попадает в поле ввода. Полоса это исключает
   * по построению, а сама цифра всё равно стоит у курсора — её рисует план
   * (плашки длины и угла).
   */
  private placeFields(at: [number, number] | null): void {
    const rw = this.root.clientWidth || 800;
    const rh = this.root.clientHeight || 600;
    const bw = this.fieldsBox.offsetWidth || 300;
    const bh = this.fieldsBox.offsetHeight || 84;
    const bottomY = Math.max(86, rh - bh - 62);
    const topY = 86;
    const cursorLow = at ? at[1] >= bottomY - 24 : false;
    // В нижней полосе справа стоят кнопки камеры — коробка не должна под них
    // залезать, иначе «Вписать» и «Привязка» оказываются под полем ввода.
    const rightGuard = cursorLow ? 8 : 150;
    const x = Math.max(8, Math.min((at ? at[0] : rw / 2) - bw / 2, rw - bw - rightGuard));
    this.fieldsBox.style.left = `${Math.round(x)}px`;
    this.fieldsBox.style.top = `${Math.round(cursorLow ? topY : bottomY)}px`;
  }

  /** Что сейчас набрано в полях (запятая понимается). */
  values(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [key, inp] of this.inputs) out[key] = humanNum(inp.value);
    return out;
  }

  /** Набранное пущено в дело: снять фокус и вернуть полям право обновляться
   *  вслед за курсором. */
  blurFields(): void {
    for (const inp of this.inputs.values()) if (document.activeElement === inp) inp.blur();
    this.dirty.clear();
  }

  destroy(): void {
    this.root.remove();
    this.inputs.clear();
  }
}

function fmtField(v: number, digits: number): string {
  if (!Number.isFinite(v)) return '';
  return v
    .toFixed(digits)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '')
    .replace('.', ',');
}
