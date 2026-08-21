"""Render the kiosk app icon (white house-in-a-circle on navy) to PNG.

The icons are derived artifacts: edit the geometry here and re-run

    python tools/make_kiosk_icons.py

to regenerate everything in custom_components/ha_3d_floorplan/frontend/. Drawn at
4x and downsampled, because PIL has no anti-aliasing of its own.
"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join("custom_components", "ha_3d_floorplan", "frontend")
NAVY = (22, 36, 61, 255)
WHITE = (255, 255, 255, 255)
S = 640            # design space
SS = 4             # supersample factor

# --- geometry, in the 640-unit design space -------------------------------
CX = CY = S / 2
RING_OUTER, RING_INNER = 302, 236
APEX = (320, 126)
ROOF_L, ROOF_R = (122, 344), (518, 344)
ROOF_W = 62
CHIMNEY = (158, 182, 248, 320)      # l, t, r, b
WIN = 48                            # window side
WIN_R = 13                          # window corner radius
WIN_CX = (283, 357)
WIN_CY = (338, 412)


def draw_logo(size, pad=0.0):
    """pad = fraction of the canvas kept EMPTY around the art (for maskable)."""
    px = size * SS
    img = Image.new("RGBA", (px, px), NAVY)
    d = ImageDraw.Draw(img)
    k = (px / S) * (1 - 2 * pad)
    off = px * pad

    def T(x, y):
        return (off + x * k, off + y * k)

    def circle(r, fill=None, outline=None, w=0):
        d.ellipse([T(CX - r, CY - r), T(CX + r, CY + r)], fill=fill, outline=outline, width=w)

    # Ring: an outer white disc with the navy punched back out of the middle.
    circle(RING_OUTER, fill=WHITE)
    circle(RING_INNER, fill=NAVY)
    # Roof: one thick mitred polyline, left tip -> apex -> right tip.
    d.line([T(*ROOF_L), T(*APEX), T(*ROOF_R)], fill=WHITE, width=int(ROOF_W * k), joint="curve")
    # Chimney merges into the left slope.
    l, t, r, b = CHIMNEY
    d.rectangle([T(l, t), T(r, b)], fill=WHITE)
    # Four windows.
    h = WIN / 2
    for cx in WIN_CX:
        for cy in WIN_CY:
            d.rounded_rectangle([T(cx - h, cy - h), T(cx + h, cy + h)], radius=WIN_R * k, fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    made = []
    for name, size, pad in [
        ("icon-192.png", 192, 0.0),
        ("icon-512.png", 512, 0.0),
        ("icon-180.png", 180, 0.0),          # apple-touch-icon
        ("favicon-64.png", 64, 0.0),
        ("icon-maskable-512.png", 512, 0.13),  # safe zone for Android masking
    ]:
        img = draw_logo(size, pad)
        p = os.path.join(OUT, name)
        img.save(p, "PNG", optimize=True)
        made.append((name, size, os.path.getsize(p)))
    for n, s, b in made:
        print(f"  {n:<24} {s}px  {b/1024:.1f} KB")


if __name__ == "__main__":
    main()
