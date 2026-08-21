import * as THREE from 'three';

const WOOD = 0x9c6b3f;

function mat(color: number | THREE.Color, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...opts });
}
function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}
function cyl(rTop: number, rBot: number, h: number, material: THREE.Material, x = 0, y = 0, z = 0, seg = 16): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), material);
  m.position.set(x, y, z);
  return m;
}
function tint(mesh: THREE.Mesh, color: THREE.Color): THREE.Mesh {
  (mesh.material as THREE.MeshStandardMaterial).color.copy(color);
  return mesh;
}

export const builders: Record<string, (c: THREE.Color) => THREE.Group> = {
  // Raking stair guard — a handrail that climbs the pitch of a flight on vertical
  // balusters, with a chunky newel at the foot, one at the turn, and a short level
  // run along the landing edge. balustrade and terrace_glass_parapet are dead-level
  // runs at a fixed Y, and a placement only offers per-axis scale plus rotation
  // about the vertical axis — nothing that can lean a level fence over to a 32°
  // pitch — while the four stair builders emit treads, risers and stringers and no
  // guard at all. Cut to stairs_down's flight: 2.40 m going, 1.52 m rise, then
  // 0.55 m of landing. For the open stair in Коридор.
  stair_railing: (c) => {
    const g = new THREE.Group();
    const steps = 8, rise = 0.19, run = 0.30;
    const ang = Math.atan2(rise, run); // ~32°, the pitch the stair builders climb
    const cosA = Math.cos(ang);
    const goX = steps * run, goY = steps * rise; // 2.40 m going, 1.52 m rise
    const topX = 0.55; // level return along the landing edge
    const L = goX + topX;
    const x0 = -L / 2, xK = x0 + goX, xE = L / 2; // foot, turn, far end
    const D = 0.09, railT = 0.055, shoeT = 0.05, subT = 0.025;
    const H = 0.95, landH = 1.0; // guard height on the rake / on the landing
    const wood = mat(WOOD, { roughness: 0.5 });
    const bronze = mat(0x3a3a40, { metalness: 0.55, roughness: 0.4 }); // balusters
    const pitch = (x: number) => (x - x0) * (rise / run); // nosing line
    // Heights measured vertically off the nosing line, so the raking run and the
    // landing run are cut from the same section.
    const shoeTop = shoeT / cosA;
    const railBot = H - (railT + subT) / cosA;
    const balH = railBot - shoeTop;
    // Raking run: shoe rail, the fillet the balusters die into, and the handrail.
    const slope = goX / cosA, xm = x0 + goX / 2;
    const raked = (h: number, d: number, off: number) => {
      const b = tint(box(slope, h, d, wood, xm, goY / 2 + off + (h / 2) / cosA, 0), c);
      b.rotation.z = ang;
      g.add(b);
    };
    raked(shoeT, D, 0);
    raked(subT, D - 0.02, railBot);
    raked(railT, D + 0.03, railBot + subT / cosA);
    // Landing run: same three members, level, standing on the upper floor.
    const lm = (xK + xE) / 2, landBot = goY + landH - railT - subT;
    g.add(tint(box(topX, shoeT, D, wood, lm, goY + shoeT / 2, 0), c));
    g.add(tint(box(topX, subT, D - 0.02, wood, lm, landBot + subT / 2, 0), c));
    g.add(tint(box(topX, railT, D + 0.03, wood, lm, goY + landH - railT / 2, 0), c));
    // Balusters stay VERTICAL under the rake — that is what a raked guard is.
    const balusters = (a: number, b: number, foot: (x: number) => number, h: number) => {
      const n = Math.max(1, Math.round((b - a) / 0.145));
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n;
        g.add(cyl(0.014, 0.017, h, bronze, x, foot(x) + h / 2, 0, 10));
      }
    };
    balusters(x0 + 0.18, xK - 0.13, (x) => pitch(x) + shoeTop, balH);
    balusters(xK + 0.16, xE - 0.15, () => goY + shoeT, landBot - goY - shoeT);
    // Newels: capped posts, turned finials on the two exposed terminations.
    const newel = (x: number, yA: number, yB: number, w: number, finial: boolean) => {
      g.add(tint(box(w, yB - yA, w, wood, x, (yA + yB) / 2, 0), c));
      g.add(tint(box(w + 0.04, 0.035, w + 0.04, wood, x, yB + 0.018, 0), c));
      if (finial) {
        g.add(tint(cyl(0.032, 0.05, 0.05, wood, x, yB + 0.06, 0, 12), c));
        g.add(tint(cyl(0.012, 0.036, 0.05, wood, x, yB + 0.11, 0, 12), c));
      }
    };
    newel(x0 + 0.07, 0, H + 0.1, 0.12, true); // foot newel — the only part on the floor
    newel(xK, goY - 0.42, goY + landH + 0.03, 0.11, false); // at the turn, dying into the string
    newel(xE - 0.07, goY, goY + landH + 0.03, 0.11, true);
    return g;
  },
};
