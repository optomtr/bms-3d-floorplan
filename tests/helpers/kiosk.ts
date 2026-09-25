import type { Page } from '@playwright/test';

/** Обе копии киоск-страницы. Проверки гоняются по ОБЕИМ: владелец не знает,
 *  какую именно показывает его планшет, поэтому «починено в одной» не считается
 *  за починено. */
export const KIOSK_PAGES = {
  интеграция: 'custom_components/bms_floorplan/standalone/index.html',
  корневая: 'standalone/index.html',
} as const;

export type KioskPage = keyof typeof KIOSK_PAGES;

/** Приборная панель ядра киоска (standalone/kiosk/60-start.js). */
export interface KioskState {
  source: string | null;
  hasKioskCred: boolean;
  hasKioskToken: boolean;
  pairing: boolean;
  pairCode: string | null;
  offline: boolean;
  socket: number;
  planOnScreen: boolean;
  planLoaded: boolean;
  attempt: number;
  reloads: number;
  selfPaired: boolean;
  glRecoveries: number;
  sinceGoodMs: number;
  entities: number;
}

declare global {
  interface Window {
    BMSKiosk: {
      state(): KioskState;
      kick(why?: string): void;
    };
    __HA: any;
    __CARD: any;
  }
}

export interface KioskOptions {
  /** Своя привязка киоска уже есть (device_id + secret + возможно токен). */
  cred?: { token?: string | null; withSecret?: boolean };
  /** Токен сессии Home Assistant в localStorage hassTokens. */
  session?: { access?: string; expiresInMs?: number; refresh?: string | null } | null;
  /** false — в браузере вошёл не администратор: подтверждать код ему нельзя. */
  sessionAdmin?: boolean;
  /** План, показанный в прошлый раз (кэш на устройстве). */
  cachedPlan?: boolean;
  /** Запретить сторожу перезагружать страницу (проверка не про него). */
  blockReload?: boolean;
  /** Что сервер считает годным на старте. */
  grant?: string[];
  /** Сервер лежит с самого начала. */
  down?: boolean;
  /** Отвечает ли /auth/token. */
  refreshOk?: boolean;
}

const NS = 'bms_floorplan_kiosk';

/** Открыть киоск-страницу с поддельным Home Assistant.
 *
 *  BMS_KIOSK_PAGE подменяет ФАЙЛ страницы — так проверка гоняется против
 *  намеренно испорченной копии и доказывает, что умеет краснеть
 *  (tests/tools/prove-kiosk.mjs). */
export async function openKiosk(page: Page, which: KioskPage, opts: KioskOptions = {}): Promise<void> {
  const patched = process.env.BMS_KIOSK_PAGE;
  const file = patched ? `${patched}/${which === 'интеграция' ? 'integration' : 'root'}.html` : KIOSK_PAGES[which];

  await page.addInitScript({ path: 'tests/fixtures/kiosk-ha.js' });
  await page.addInitScript(
    ({ opts, NS }) => {
      const HA = (window as any).__HA;
      // Страницу «раздаёт Home Assistant»: та же ветка, что на объекте.
      (window as any).__HA3D__ = { useSession: true, live: true, app: true };
      const hex = (n: number) => {
        const a = new Uint8Array(n);
        crypto.getRandomValues(a);
        return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
      };
      // Второй и последующие заходы (перезагрузка сторожем) ничего не
      // переписывают: состояние устройства обязано пережить перезагрузку.
      if (!sessionStorage.getItem('__KIOSK_SEEDED')) {
        sessionStorage.setItem('__KIOSK_SEEDED', '1');
        for (const t of opts.grant || []) HA.grant(t);
        if (opts.down) HA.set({ down: true });
        if (opts.refreshOk === false) HA.set({ refreshOk: false });
        if (opts.sessionAdmin === false) HA.set({ sessionAdmin: false });
        if (opts.cred) {
          const secret = hex(32);
          HA.pair.device_id = hex(16);
          HA.pair.secret = secret;
          HA.pair.approved = true;
          HA.save();
          const cred: any = { device_id: HA.pair.device_id, secret };
          if (opts.cred.token) {
            cred.token = opts.cred.token;
            // Далеко не «почти истёк»: страница обязана взять его как есть.
            cred.exp = Date.now() + 3650 * 86400 * 1000;
          }
          localStorage.setItem(NS + '.cred', JSON.stringify(cred));
        }
        if (opts.session) {
          localStorage.setItem(
            'hassTokens',
            JSON.stringify({
              access_token: opts.session.access ?? 'session-token-1',
              expires: Date.now() + (opts.session.expiresInMs ?? 3600_000),
              refresh_token: opts.session.refresh === null ? undefined : (opts.session.refresh ?? 'refresh-1'),
              clientId: location.origin + '/',
            }),
          );
        }
        if (opts.cachedPlan) localStorage.setItem(NS + '.plan', JSON.stringify(HA.samplePlan()));
        // Сторож не должен перезагружать страницу там, где проверяется не он.
        if (opts.blockReload) localStorage.setItem(NS + '.reload', String(Date.now()));
      }
    },
    { opts, NS },
  );

  await page.goto(`/${file}?card=/tests/fixtures/fake-card.js`);
  await page.waitForFunction(() => !!(window as any).BMSKiosk);
}

export const kioskState = (page: Page): Promise<KioskState> => page.evaluate(() => window.BMSKiosk.state());

/** Дождаться живого соединения с планом на экране. */
export async function waitLive(page: Page, timeout = 30_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const s = window.BMSKiosk.state();
      return s.socket === 1 && s.planOnScreen && !s.offline;
    },
    undefined,
    { timeout, polling: 100 },
  );
}

export const ha = <T>(page: Page, fn: (HA: any) => T): Promise<T> =>
  page.evaluate(`(${fn.toString()})(window.__HA)`) as Promise<T>;
