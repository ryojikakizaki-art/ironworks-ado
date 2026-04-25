#!/usr/bin/env python3
"""
DXF modelspace から Claude 縦型手すり制作図の全要素を抽出し、
CAD精密な SVG に変換する。

抽出対象 (すべて modelspace, 1mm = 1 SVG unit):
- HATCH  → 壁ハッチング (45°斜線, 簡易生成)
- 壁面線 + 40mm 寸法
- 正面図バー (polyline) — data-role="bar"
- 上下の座金A平面図 (circles + spline) — data-role="washer-top"/"washer-bottom"
- 5 dimensions (1000/800/100/100/40) — 各寸法に data-role タグ
- タイトルブロック (polyline + line x5 + mtext x6)
- ado ロゴ (public/images/ado_logo_W.png を使用, DXF IMAGE は参照せず)

出力: v0-design/lib/drawing-modal/full-drawing-fragment.ts
"""
import math
import sys
from pathlib import Path
from typing import Optional

import ezdxf

DXF_PATH = Path(__file__).parent / "references" / "claude-vertical.dxf"
OUT_PATH = Path(__file__).parent.parent / "v0-design" / "lib" / "drawing-modal" / "full-drawing-fragment.ts"

# DXF→SVG: Y軸反転 (DXF 上+/SVG 下+)
def fy(y: float) -> float:
    return -y

STROKE_LINE = "#222"
STROKE_DIM = "#333"
STROKE_EXT = "#888"
STROKE_W = 2.5  # modelspace mm 単位
TEXT_SCALE = 1.5  # 全テキスト拡大倍率
TEXT_FONT = "sans-serif"
BAR_FILL = "#ffffff"  # バー内部は白で塗り、裏側の座金を隠す

# DIMENSION ロールを defpoint で識別
DIM_ROLE_BY_DEFPOINT = {
    (round(-373.8, 1), round(750.0, 1)): ("dim-top-seg", 100),        # 上端座金→バー頂部 100mm
    (round(-373.8, 1), round(650.0, 1)): ("dim-middle-seg", 800),     # 座金間 800mm
    (round(-373.8, 1), round(-250.0, 1)): ("dim-bottom-seg", 100),    # 下端座金→バー底部 100mm
    (round(-251.2, 1), round(750.0, 1)): ("dim-total", 1000),         # 総長 1000mm
    (round(-922.2, 1), round(767.0, 1)): ("dim-wall-gap", 40),         # 壁〜バー 40mm
}


def esc_xml(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;"))


def emit_line(x1, y1, x2, y2, stroke=STROKE_LINE, sw=STROKE_W, role: Optional[str] = None) -> str:
    attrs = f'x1="{x1:.2f}" y1="{fy(y1):.2f}" x2="{x2:.2f}" y2="{fy(y2):.2f}"'
    attrs += f' stroke="{stroke}" stroke-width="{sw}" fill="none"'
    if role:
        attrs += f' data-role="{role}"'
    return f"<line {attrs} />"


def emit_circle(cx, cy, r, stroke=STROKE_LINE, sw=STROKE_W, role: Optional[str] = None) -> str:
    attrs = f'cx="{cx:.2f}" cy="{fy(cy):.2f}" r="{r:.2f}"'
    attrs += f' stroke="{stroke}" stroke-width="{sw}" fill="none"'
    if role:
        attrs += f' data-role="{role}"'
    return f"<circle {attrs} />"


def emit_rect_polyline(pts: list[tuple[float, float]], stroke=STROKE_LINE, sw=STROKE_W, role: Optional[str] = None, fill="none") -> str:
    """Closed polyline → SVG polygon"""
    points = " ".join(f"{x:.2f},{fy(y):.2f}" for x, y in pts)
    attrs = f'points="{points}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}"'
    if role:
        attrs += f' data-role="{role}"'
    return f"<polygon {attrs} />"


def emit_text(x, y, text: str, size: float = 36, anchor: str = "middle", rot: float = 0,
              baseline: str = "middle", role: Optional[str] = None) -> str:
    xform = f' transform="rotate({-rot} {x:.2f} {fy(y):.2f})"' if rot else ""
    role_attr = f' data-role="{role}"' if role else ""
    return (
        f'<text x="{x:.2f}" y="{fy(y):.2f}" font-size="{size}" fill="{STROKE_LINE}" '
        f'text-anchor="{anchor}" dominant-baseline="{baseline}" '
        f'font-family="{TEXT_FONT}"{xform}{role_attr}>{esc_xml(text)}</text>'
    )


# DXF MTEXT attachment_point → SVG dominant-baseline
DXF_ATTACH_TO_BASELINE = {
    1: "hanging",   # TOP_LEFT
    2: "hanging",   # TOP_CENTER
    3: "hanging",   # TOP_RIGHT
    4: "middle",    # MIDDLE_LEFT
    5: "middle",    # MIDDLE_CENTER
    6: "middle",    # MIDDLE_RIGHT
    7: "text-after-edge",  # BOTTOM_LEFT
    8: "text-after-edge",  # BOTTOM_CENTER
    9: "text-after-edge",  # BOTTOM_RIGHT
}


def mtext_baseline(mtext) -> str:
    ap = mtext.dxf.get("attachment_point", 1)
    return DXF_ATTACH_TO_BASELINE.get(ap, "middle")


def emit_solid(pts: list[tuple[float, float]]) -> str:
    points = " ".join(f"{x:.2f},{fy(y):.2f}" for x, y in pts[:3])
    return f'<polygon points="{points}" fill="{STROKE_LINE}" />'


def emit_spline(flat_pts: list[tuple[float, float]], stroke=STROKE_LINE, sw=STROKE_W, role: Optional[str] = None) -> str:
    if not flat_pts:
        return ""
    d = []
    for i, (x, y) in enumerate(flat_pts):
        cmd = "M" if i == 0 else "L"
        d.append(f"{cmd} {x:.2f} {fy(y):.2f}")
    d.append("Z")
    attrs = f'd="{" ".join(d)}" stroke="{stroke}" stroke-width="{sw}" fill="none"'
    if role:
        attrs += f' data-role="{role}"'
    return f"<path {attrs} />"


def generate_wall_hatch(x_min: float, x_max: float, y_min: float, y_max: float, spacing: float = 18) -> str:
    """45°斜線による壁ハッチング (DXF HATCH パターンの視覚的近似)"""
    lines = []
    # 壁領域: [-1072, -962] × [-290, 795]
    # 45°斜線 (lower-left → upper-right)
    span = (x_max - x_min) + (y_max - y_min)
    start = x_min - (y_max - y_min)
    end = x_max
    x = start
    while x < x_max + span:
        # 線 from (x, y_min) ～ (x + (y_max - y_min), y_max) clipped to rect
        x1 = max(x, x_min)
        y1 = y_min + (x1 - x)
        x2 = min(x + (y_max - y_min), x_max)
        y2 = y_min + (x2 - x)
        if y1 < y_max and y2 > y_min and x2 > x1:
            y1c = max(y1, y_min)
            y2c = min(y2, y_max)
            x1c = x + (y1c - y_min)
            x2c = x + (y2c - y_min)
            x1c = max(x_min, x1c); x2c = min(x_max, x2c)
            if x2c > x1c:
                lines.append(emit_line(x1c, y1c, x2c, y2c, STROKE_LINE, 1.0))
        x += spacing
    return "\n  ".join(lines)


def extract():
    doc = ezdxf.readfile(DXF_PATH)
    msp = doc.modelspace()
    parts: list[str] = []

    # ========== 壁ハッチング (ハッチのみ、外枠なし) ==========
    for e in msp.query("HATCH"):
        path = e.paths[0]
        xs = [edge.start[0] for edge in path.edges if hasattr(edge, "start")]
        ys = [edge.start[1] for edge in path.edges if hasattr(edge, "start")]
        if not xs:
            continue
        hx1, hx2 = min(xs), max(xs)
        hy1, hy2 = min(ys), max(ys)
        parts.append("<!-- wall hatch (diagonal lines only) -->")
        parts.append(f'<g data-role="wall-hatch">')
        parts.append(generate_wall_hatch(hx1, hx2, hy1, hy2, spacing=22))
        parts.append("</g>")
        # 壁面線 (右端・壁の表面) は保持 — 壁の存在を示す
        parts.append(emit_line(hx2, hy1, hx2, hy2, STROKE_LINE, STROKE_W * 1.2))

    # ========== 側面図: バー + 座金プレート側面 + 連結線 ==========
    # 側面バー polyline: x=[-922.2, -896.8], y=[-247.5, 752.5]
    # 上座金プレート側面: x=[-962.2, -957.7], y=[632.5, 667.5]
    # 下座金プレート側面: x=[-962.2, -957.7], y=[-167.5, -132.5]
    parts.append("<!-- side view -->")
    parts.append('<g data-role="side-view">')
    side_bar_emitted = False
    for e in msp.query("POLYLINE"):
        pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
        if not pts:
            continue
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        # 側面バー
        if -923 < min(xs) < -921 and -249 < min(ys) < -246:
            parts.append(emit_rect_polyline(pts, STROKE_LINE, STROKE_W, role="side-bar", fill=BAR_FILL))
            side_bar_emitted = True
        # 座金プレート側面 (上/下)
        elif -963 < min(xs) < -961 and (631 < min(ys) < 634 or -169 < min(ys) < -166):
            parts.append(emit_rect_polyline(pts, STROKE_LINE, STROKE_W, fill=BAR_FILL))
    # 連結線 (プレート→バー水平線) at y=654.5/645.5/-145.5/-154.5, x=[-957.71, -922.21]
    for e in msp.query("LINE"):
        s = e.dxf.start; t = e.dxf.end
        if (-958 < s.x < -957 and -923 < t.x < -921
                and abs(s.y - t.y) < 0.5
                and (640 < s.y < 660 or -160 < s.y < -140)):
            parts.append(emit_line(s.x, s.y, t.x, t.y, STROKE_LINE, STROKE_W))
    parts.append("</g>")

    # ========== 座金A 平面図 (上下2箇所) ==========
    # 正面図バーの裏側を隠すため、バーより先に描画する
    # y=650: top washer, y=-150: bottom washer
    top_circles = []
    bot_circles = []
    for e in msp.query("CIRCLE"):
        c = e.dxf.center
        if abs(c.y - 650) < 1:
            top_circles.append((c.x, c.y, e.dxf.radius))
        elif abs(c.y + 150) < 1:
            bot_circles.append((c.x, c.y, e.dxf.radius))
    top_spline = None
    bot_spline = None
    for e in msp.query("SPLINE"):
        first = list(e.control_points)[0]
        flat = [(p[0], p[1]) for p in e.flattening(distance=0.2, segments=64)]
        if first[1] > 0:
            top_spline = flat
        else:
            bot_spline = flat

    for role, circles, spline in [("washer-top", top_circles, top_spline), ("washer-bottom", bot_circles, bot_spline)]:
        parts.append(f'<!-- {role} (drawn before bar so bar masks the back half) -->')
        parts.append(f'<g data-role="{role}">')
        if spline:
            # 楕円は白塗りつぶし (裏のハッチング等を隠す)
            parts.append(emit_spline(spline, STROKE_LINE, STROKE_W).replace('fill="none"', f'fill="{BAR_FILL}"'))
        for (cx, cy, r) in circles:
            parts.append(emit_circle(cx, cy, r, STROKE_LINE, STROKE_W))
        parts.append("</g>")

    # ========== 正面図バー (塗りつぶし、座金の裏側をマスク) ==========
    # Modelspace polyline at x=[-491.5, -466.1], y=[-250, 750]
    for e in msp.query("POLYLINE"):
        pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
        if not pts:
            continue
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        if -492 < min(xs) < -490 and -252 < min(ys) < -248:
            parts.append("<!-- front view bar (white fill to hide washers behind) -->")
            parts.append(emit_rect_polyline(pts, STROKE_LINE, STROKE_W, role="bar", fill=BAR_FILL))

    # ========== 5 dimensions ==========
    for e in msp.query("DIMENSION"):
        block_name = e.dxf.geometry
        if not block_name:
            continue
        dp = e.dxf.defpoint
        tmp = e.dxf.text_midpoint
        key = (round(dp.x, 1), round(dp.y, 1))
        role_info = DIM_ROLE_BY_DEFPOINT.get(key)
        role = role_info[0] if role_info else None
        # 垂直寸法か判定: defpoint と text_midpoint の Δy > Δx なら寸法線は縦
        is_vertical_dim = abs(dp.y - tmp.y) > abs(dp.x - tmp.x)
        text_rot = 90 if is_vertical_dim else 0
        parts.append(f"<!-- DIMENSION {e.get_measurement():.1f} role={role} vertical={is_vertical_dim} -->")
        parts.append(f'<g data-role="{role}" data-dim-value="{int(e.get_measurement())}">')
        block = doc.blocks.get(block_name)
        for sub in block:
            st = sub.dxftype()
            if st == "LINE":
                s = sub.dxf.start; t = sub.dxf.end
                parts.append(emit_line(s.x, s.y, t.x, t.y, STROKE_DIM, STROKE_W * 0.8))
            elif st == "SOLID":
                tri = [(sub.dxf.vtx0.x, sub.dxf.vtx0.y),
                       (sub.dxf.vtx1.x, sub.dxf.vtx1.y),
                       (sub.dxf.vtx2.x, sub.dxf.vtx2.y)]
                parts.append(emit_solid(tri))
            elif st == "MTEXT":
                p = sub.dxf.insert
                parts.append(emit_text(p.x, p.y, sub.text,
                                       size=sub.dxf.char_height * 0.9 * TEXT_SCALE,
                                       rot=text_rot,
                                       baseline=mtext_baseline(sub),
                                       role=f"{role}-text" if role else None))
        parts.append("</g>")

    # ========== タイトルブロック (枠 + 横線 + 縦線 + MTEXT) ==========
    # 枠 polyline: (-1131.6, -515) → (168.4, -915)
    # 横線 y=-515, -615, -715, -815 at x=[-1131.6, 168.4]
    # 縦線 x=-781.6 at y=[-515, -915]
    parts.append("<!-- title block -->")
    parts.append('<g data-role="title-block">')
    for e in msp.query("POLYLINE"):
        pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
        if not pts:
            continue
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        # Title block frame
        if abs(min(xs) - (-1131.6)) < 1 and abs(min(ys) - (-915)) < 1:
            parts.append(emit_rect_polyline(pts, STROKE_LINE, STROKE_W))
    for e in msp.query("LINE"):
        s = e.dxf.start; t = e.dxf.end
        # Title block internal lines
        if abs(s.x - (-1131.6)) < 1 and abs(s.y - t.y) < 0.1 and -915 < s.y < -515:
            parts.append(emit_line(s.x, s.y, t.x, t.y, STROKE_LINE, STROKE_W))
        elif abs(s.x - (-781.6)) < 1 and abs(t.x - (-781.6)) < 1:
            parts.append(emit_line(s.x, s.y, t.x, t.y, STROKE_LINE, STROKE_W))
    # MTEXT (title block content) — DXF attachment_point に応じてbaseline設定
    for e in msp.query("MTEXT"):
        p = e.dxf.insert
        if -1131 < p.x < 170 and -915 < p.y < -515:
            parts.append(emit_text(p.x, p.y, e.text,
                                   size=e.dxf.char_height * TEXT_SCALE,
                                   anchor="start",
                                   baseline=mtext_baseline(e)))
    parts.append("</g>")

    # ========== ado ロゴ ==========
    # 位置: 座金A詳細図の下、右下の空白エリア (SVG座標で x=300-750, y=300-900)
    # 座金A詳細はネストSVGで x=[280,780] y=[-750,150] を占有、その下が空白
    parts.append("<!-- ado logo (bottom-right empty area) -->")
    parts.append(
        '<image href="/images/ado_logo_W.png" '
        'x="350" y="320" width="400" height="500" '
        'preserveAspectRatio="xMidYMid meet" opacity="0.9" />'
    )

    # ========== viewBox 計算 (modelspace 全体 + 余白) ==========
    # x: [-1131.6, 168.4] → width 1300
    # y: [-932, 795] (modelspace 最下 -915 or IMAGE -932)
    # Y反転後: y_svg = -y → 範囲は [-795, 932]
    # 上部は 40mm 寸法が切れないよう余白大きめ (150mm)
    top_margin = 150
    side_margin = 40
    vx_min = -1131.6 - side_margin
    vx_max = 168.4 + side_margin
    vy_min_flipped = -795 - top_margin
    vy_max_flipped = 915 + side_margin
    vb_w = vx_max - vx_min
    vb_h = vy_max_flipped - vy_min_flipped
    viewbox = f"{vx_min:.1f} {vy_min_flipped:.1f} {vb_w:.1f} {vb_h:.1f}"

    inner = "\n  ".join(parts)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" preserveAspectRatio="xMidYMid meet">
  {inner}
</svg>'''
    return svg, viewbox


def main():
    svg, viewbox = extract()
    (Path("/tmp") / "claude-full-drawing.svg").write_text(svg, encoding="utf-8")
    print(f"Wrote /tmp/claude-full-drawing.svg ({len(svg)} bytes)  viewBox={viewbox}", file=sys.stderr)

    ts_content = f'''// Auto-generated from drafting-agent/references/claude-vertical.dxf
// via drafting-agent/extract_full_drawing.py
// DO NOT EDIT MANUALLY — regenerate with `python3 drafting-agent/extract_full_drawing.py`
//
// Claude 縦型手すり制作図 フル SVG (modelspace 1mm=1unit, Y反転済み, L=1000mm デフォルト)
//
// data-role タグ付き要素 (TS 側で動的更新可能):
//   - "bar"              — 正面図バー (polygon)
//   - "washer-top"       — 上端座金 平面図 (g)
//   - "washer-bottom"    — 下端座金 平面図 (g)
//   - "dim-top-seg"      — 上セグメント寸法 (g)  初期値100
//   - "dim-middle-seg"   — 中間セグメント寸法 (g) 初期値800
//   - "dim-bottom-seg"   — 下セグメント寸法 (g)  初期値100
//   - "dim-total"        — 総長寸法 (g)         初期値1000
//   - "dim-wall-gap"     — 壁ギャップ寸法 (g)    固定40
//   - "wall-hatch"       — 壁ハッチング (g)
//   - "title-block"      — タイトルブロック (g)

export const FULL_DRAWING_VIEWBOX = "{viewbox}" as const

export const FULL_DRAWING_SVG = {svg!r}
'''
    OUT_PATH.write_text(ts_content, encoding="utf-8")
    print(f"Wrote {OUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
