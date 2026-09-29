"""
Image pipeline for the Abnauona website (optional helper — the site already
ships with the generated files in src/assets/img/).

Run it again only when you replace a photo:

    pip install pillow numpy
    python scripts/optimize-images.py

What it does
------------
1. Converts every photo listed in PHOTOS (from the /assets originals folder)
   into responsive WebP files:  <name>-<width>.webp
2. Rebuilds the logo mark (brown + gold, transparent) from the fees poster.
3. Generates favicons, PWA icons and the Open-Graph share image.

After running it, update the image "sizes" in src/data/site.json if you
changed the widths below.
"""

import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets")                     # original uploads
OUT = os.path.join(ROOT, "src", "assets", "img")

# name -> (source file, list of output widths, optional crop box (l,t,r,b))
PHOTOS = {
    "facade-night":   ("781869449_2144889459745780_2234308011223005012_n.jpg", [640, 1024, 1600, 2048], None),
    "facade-day":     ("782169218_2144889526412440_7877593788877840798_n.jpg", [480, 800, 1280, 1800], None),
    "corridor":       ("780238739_2144889489745777_6057122625997391332_n.jpg", [480, 800, 1280, 1800], None),
    "graduation-2025": ("unnamed (1).png", [480, 680], None),
    "gate-detail":    ("782169218_2144889526412440_7877593788877840798_n.jpg", [480, 800, 1100], (700, 480, 1800, 1356)),
    "sign-night":     ("781869449_2144889459745780_2234308011223005012_n.jpg", [480, 800, 1100], (560, 470, 1600, 1060)),
    "column-detail":  ("780238739_2144889489745777_6057122625997391332_n.jpg", [480, 800], (1020, 40, 1420, 1356)),
    "poster-calendar": ("729186696_27175004642190925_1994432843993022491_n.jpg", [540, 1054], None),
    "poster-fees":    ("743805997_27395431826814871_3678798088649465457_n.jpg", [480, 678], None),
}

LOGO_SOURCE = "743805997_27395431826814871_3678798088649465457_n.jpg"
LOGO_CROP = (292, 24, 393, 120)   # the brown mark at the top of the fees poster

BROWN = (122, 74, 46)
GOLD_TOP = np.array([243, 208, 110])
GOLD_BOTTOM = np.array([184, 137, 30])
LAPIS = (30, 58, 138)
ROYAL = (59, 42, 122)


def save_webp(img, path, quality=78):
    img.save(path, "WEBP", quality=quality, method=6)


def export_photos():
    for name, (src, widths, crop) in PHOTOS.items():
        im = Image.open(os.path.join(SRC, src)).convert("RGB")
        if crop:
            im = im.crop(crop)
        folder = "posters" if name.startswith("poster") else "photos"
        os.makedirs(os.path.join(OUT, folder), exist_ok=True)
        for w in widths:
            w = min(w, im.width)
            h = round(im.height * w / im.width)
            save_webp(im.resize((w, h), Image.LANCZOS), os.path.join(OUT, folder, f"{name}-{w}.webp"))
        print(f"{name}: {im.width}x{im.height} -> {widths}")


def logo_alpha():
    """Turn the small brown logo into a smooth, upscaled alpha mask."""
    im = Image.open(os.path.join(SRC, LOGO_SOURCE)).convert("RGB").crop(LOGO_CROP)
    k = 8
    im = im.resize((im.width * k, im.height * k), Image.BICUBIC)
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    brown = (r - b > 18) & (r < 200) & (g < 170) & (b < 150)
    dark = np.clip((215 - lum) / 110, 0, 1)
    m = Image.fromarray(((dark * brown) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.2))
    arr = np.asarray(m).astype(np.float32) / 255
    arr = np.clip((arr - 0.38) / 0.16, 0, 1)
    # remove the poster's arch frame (top corners) and a stray speck
    h, w = arr.shape
    arr[:200, :310] = 0
    arr[:200, 550:] = 0
    arr[560:620, 250:300] = 0
    alpha = Image.fromarray((arr * 255).astype(np.uint8))
    return alpha.crop(alpha.getbbox())


def gold_fill(size):
    w, h = size
    t = np.linspace(0, 1, h)[:, None, None]
    col = GOLD_TOP * (1 - t) + GOLD_BOTTOM * t
    return np.broadcast_to(col, (h, w, 3)).astype(np.uint8)


def export_logo():
    alpha = logo_alpha()
    brand = os.path.join(OUT, "brand")
    os.makedirs(brand, exist_ok=True)

    brown = Image.new("RGBA", alpha.size, BROWN + (0,))
    brown.putalpha(alpha)
    gold = Image.fromarray(np.dstack([gold_fill(alpha.size), np.asarray(alpha)]), "RGBA")

    for name, img in (("logo-mark-brown", brown), ("logo-mark-gold", gold)):
        for hgt in (96, 192, 400):
            w = round(img.width * hgt / img.height)
            r = img.resize((w, hgt), Image.LANCZOS)
            save_webp(r, os.path.join(brand, f"{name}-{hgt}.webp"), quality=90)
            if name == "logo-mark-brown" and hgt == 400:   # PNG copy for Schema.org "logo"
                r.save(os.path.join(brand, f"{name}-{hgt}.png"), optimize=True)
    return gold


def rounded_bg(size, radius):
    w = h = size
    bg = Image.new("RGBA", (w, h))
    t = np.linspace(0, 1, h)[:, None, None]
    col = np.array(ROYAL) * (1 - t) + np.array(LAPIS) * t
    bg = Image.fromarray(np.dstack([np.broadcast_to(col, (h, w, 3)).astype(np.uint8),
                                    np.full((h, w), 255, np.uint8)]), "RGBA")
    if radius:
        mask = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
        bg.putalpha(mask)
    return bg


def export_icons(gold):
    brand = os.path.join(OUT, "brand")
    for size, radius, pad, name in ((512, 0, 0.18, "icon-maskable-512"), (512, 96, 0.12, "icon-512"),
                                    (192, 36, 0.12, "icon-192"), (180, 0, 0.14, "apple-touch-icon"),
                                    (64, 12, 0.08, "favicon-64")):
        bg = rounded_bg(size, radius)
        inner = int(size * (1 - 2 * pad))
        mark = gold.copy()
        mark.thumbnail((inner, inner), Image.LANCZOS)
        bg.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
        if name == "favicon-64":
            bg.save(os.path.join(ROOT, "src", "static", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
        else:
            bg.save(os.path.join(brand, f"{name}.png"), optimize=True)


def export_og(gold):
    """1200x630 share image: night facade + gradient + gold logo."""
    W, H = 1200, 630
    im = Image.open(os.path.join(SRC, PHOTOS["facade-night"][0])).convert("RGB")
    scale = W / im.width
    im = im.resize((W, round(im.height * scale)), Image.LANCZOS)
    top = max(0, (im.height - H) // 2 + 40)
    canvas = im.crop((0, top, W, top + H)).convert("RGBA")
    shade = np.zeros((H, W, 4), np.uint8)
    shade[..., 0], shade[..., 1], shade[..., 2] = 20, 16, 48
    x = np.linspace(1, 0, W)[None, :]
    shade[..., 3] = (np.clip(0.35 + 0.55 * x, 0, 0.92) * 255).astype(np.uint8)
    canvas.alpha_composite(Image.fromarray(shade, "RGBA"))
    mark = gold.copy()
    mark.thumbnail((300, 300), Image.LANCZOS)
    canvas.alpha_composite(mark, (90, (H - mark.height) // 2 - 40))
    d = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("georgiab.ttf", 46)
        small = ImageFont.truetype("georgia.ttf", 26)
    except OSError:
        font = small = ImageFont.load_default()
    d.text((90, (H + mark.height) // 2 - 10), "ABNAUONA INSTITUTE", font=font, fill=(236, 196, 92))
    d.text((92, (H + mark.height) // 2 + 50), "Egyptian curriculum  •  Ajman, UAE", font=small, fill=(245, 236, 215))
    canvas.convert("RGB").save(os.path.join(OUT, "brand", "og-image.jpg"), quality=86, optimize=True)


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "src", "static"), exist_ok=True)
    export_photos()
    g = export_logo()
    export_icons(g)
    export_og(g)
    print("done")
