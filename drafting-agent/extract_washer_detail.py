#!/usr/bin/env python3
"""
DXF paperspace から 座金A詳細図 の geometry を抽出し、
精密な SVG フラグメントを生成する。

対象エンティティ:
- ARC (支柱の丸み)
- SPLINE (楕円プレート アウトライン × 2)
- CIRCLE (中央穴 + 段付き穴 × 2)
- LINE (側面図 プレート・支柱)
- DIMENSION (4 個の寸法 - 40/35/55/4.5)
- INSERT (Callout 9φ / Callout-1 4.5φ-7φ段付き穴)
- MTEXT (座金A詳細図 ラベル)

出力: stdout に SVG <g> フラグメント (viewBox の mm 座標そのまま)
"""
import math
import sys
from pathlib import Path

import ezdxf

DXF_PATH = Path(__file__).parent / "references" / "claude-vertical.dxf"
OUT_PATH = Path(__file__).parent.parent / "v0-design" / "lib" / "drawing-modal" / "washer-detail-fragment.ts"

# mm → SVG scale factor (paperspace は 1:1 mm、SVG 座標も mm そのままで出す)
# Y軸反転: DXF は上+, SVG は下+ なので y を反転
Y_FLIP = True

STROKE_LINE = "#222"
STROKE_DIM = "#444"
STROKE_W = 0.35  # 線を少し太く
TEXT_SCALE = 1.5  # 全テキスト拡大倍率
TEXT_SIZE = 5.0  # mm 単位のフォントサイズ


def fy(y: float) -> float:
    """Y反転（パース時に反転を適用する基準 y 値が必要ならここで管理）"""
    return -y if Y_FLIP else y


def arc_to_path(cx: float, cy: float, r: float, start_deg: float, end_deg: float) -> str:
    """DXF ARC (反時計回り) → SVG path d 属性"""
    start_rad = math.radians(start_deg)
    end_rad = math.radians(end_deg)
    x1 = cx + r * math.cos(start_rad)
    y1 = cy + r * math.sin(start_rad)
    x2 = cx + r * math.cos(end_rad)
    y2 = cy + r * math.sin(end_rad)
    # DXF は常に反時計回りなので sweep 方向を決める
    arc_span = (end_deg - start_deg) % 360
    large_arc = 1 if arc_span > 180 else 0
    # SVG: Y反転すると sweep flag 反転
    sweep = 0 if Y_FLIP else 1
    return f"M {x1:.3f} {fy(y1):.3f} A {r:.3f} {r:.3f} 0 {large_arc} {sweep} {x2:.3f} {fy(y2):.3f}"


def spline_to_path(control_points: list[tuple[float, float]], flatten_pts: list[tuple[float, float]]) -> str:
    """Flatten 済みの spline 点列 → SVG polyline path"""
    d = []
    for i, (x, y) in enumerate(flatten_pts):
        cmd = "M" if i == 0 else "L"
        d.append(f"{cmd} {x:.3f} {fy(y):.3f}")
    return " ".join(d) + " Z"


def emit_line(x1, y1, x2, y2, stroke=STROKE_LINE, sw=STROKE_W):
    return f'<line x1="{x1:.3f}" y1="{fy(y1):.3f}" x2="{x2:.3f}" y2="{fy(y2):.3f}" stroke="{stroke}" stroke-width="{sw}" fill="none" />'


def emit_circle(cx, cy, r, stroke=STROKE_LINE, sw=STROKE_W):
    return f'<circle cx="{cx:.3f}" cy="{fy(cy):.3f}" r="{r:.3f}" stroke="{stroke}" stroke-width="{sw}" fill="none" />'


def emit_text(x, y, text, size=TEXT_SIZE, anchor="middle", rot=0):
    esc = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    xform = f' transform="rotate({-rot if Y_FLIP else rot} {x:.3f} {fy(y):.3f})"' if rot else ""
    return (
        f'<text x="{x:.3f}" y="{fy(y):.3f}" font-size="{size}" fill="#222" '
        f'text-anchor="{anchor}" dominant-baseline="middle" '
        f'font-family="sans-serif"{xform}>{esc}</text>'
    )


def emit_solid_triangle(pts: list[tuple[float, float]]):
    """DXF SOLID (矢印) → SVG polygon"""
    points = " ".join(f"{x:.3f},{fy(y):.3f}" for x, y in pts[:3])
    return f'<polygon points="{points}" fill="#222" />'


def extract():
    doc = ezdxf.readfile(DXF_PATH)
    psp = doc.layouts.get("シートレイヤ-1")

    parts = []

    # ------- 座金A詳細図の範囲に含まれるエンティティを抽出 -------
    # detail bbox: x=[55, 130], y=[-35, 108]
    in_detail = lambda x, y: 55 < x < 130 and -35 < y < 108

    # ARCS
    for e in psp.query("ARC"):
        c = e.dxf.center
        if in_detail(c.x, c.y):
            d = arc_to_path(c.x, c.y, e.dxf.radius, e.dxf.start_angle, e.dxf.end_angle)
            parts.append(f'<path d="{d}" stroke="{STROKE_LINE}" stroke-width="{STROKE_W}" fill="none" />')

    # SPLINES (oval)
    for e in psp.query("SPLINE"):
        cps = [(p[0], p[1]) for p in e.control_points]
        first = cps[0]
        if not in_detail(first[0], first[1]):
            continue
        flat = [(p[0], p[1]) for p in e.flattening(distance=0.02, segments=48)]
        d = spline_to_path(cps, flat)
        parts.append(f'<path d="{d}" stroke="{STROKE_LINE}" stroke-width="{STROKE_W}" fill="none" />')

    # CIRCLES
    for e in psp.query("CIRCLE"):
        c = e.dxf.center
        if in_detail(c.x, c.y):
            parts.append(emit_circle(c.x, c.y, e.dxf.radius))

    # LINES (側面図の支柱・プレート)
    for e in psp.query("LINE"):
        s = e.dxf.start; t = e.dxf.end
        # 寸法グリッド(y=54.71 etc で横に長いもの)は除外 → プレート・支柱は y in [50, 92]
        if in_detail(s.x, s.y) and 48 < s.y < 95 and 48 < t.y < 95:
            parts.append(emit_line(s.x, s.y, t.x, t.y))

    # POLYLINE (プレート断面の底部輪郭)
    # (115.17, 53.71) → (115.17, 50.21) → (60.17, 50.21) → (60.17, 53.71)
    for e in psp.query("POLYLINE"):
        pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
        if not pts:
            continue
        xs = [p[0] for p in pts]
        if 55 < min(xs) < 130 and not e.is_closed:
            # open polyline in detail area = plate bottom profile
            d_parts = []
            for i, (x, y) in enumerate(pts):
                cmd = "M" if i == 0 else "L"
                d_parts.append(f"{cmd} {x:.3f} {fy(y):.3f}")
            d = " ".join(d_parts)
            parts.append(f'<path d="{d}" stroke="{STROKE_LINE}" stroke-width="{STROKE_W}" fill="none" />')

    # DIMENSIONS (40 / 35 / 55 / 4.5)
    for e in psp.query("DIMENSION"):
        m = e.get_measurement()
        block_name = e.dxf.geometry
        if not block_name:
            continue
        block = doc.blocks.get(block_name)
        # 4.5 寸法はデフォルト位置だと線と重なるので左にずらして配置
        text_offset_x = 0.0
        text_offset_y = 0.0
        if abs(m - 4.5) < 0.1:
            text_offset_x = 6.0  # 右にずらして板厚線と分離
            text_offset_y = -0.5
        for sub in block:
            st = sub.dxftype()
            if st == "LINE":
                s = sub.dxf.start; t = sub.dxf.end
                parts.append(emit_line(s.x, s.y, t.x, t.y, STROKE_DIM))
            elif st == "SOLID":
                pts = [(sub.dxf.vtx0.x, sub.dxf.vtx0.y),
                       (sub.dxf.vtx1.x, sub.dxf.vtx1.y),
                       (sub.dxf.vtx2.x, sub.dxf.vtx2.y)]
                parts.append(emit_solid_triangle(pts))
            elif st == "MTEXT":
                p = sub.dxf.insert
                rot = math.degrees(sub.dxf.rotation) if hasattr(sub.dxf, "rotation") else 0
                parts.append(emit_text(p.x + text_offset_x, p.y + text_offset_y, sub.text,
                                       size=sub.dxf.char_height * 0.9 * TEXT_SCALE, anchor="start" if text_offset_x > 0 else "middle"))

    # INSERT (Callout 引き出し線)
    for e in psp.query("INSERT"):
        block = doc.blocks.get(e.dxf.name)
        ipos = e.dxf.insert
        rot_deg = e.dxf.rotation
        rot_rad = math.radians(rot_deg)
        cos_r = math.cos(rot_rad); sin_r = math.sin(rot_rad)

        def xf(px: float, py: float) -> tuple[float, float]:
            """Callout block 内座標 → paperspace 座標"""
            return (ipos.x + px * cos_r - py * sin_r,
                    ipos.y + px * sin_r + py * cos_r)

        # "段付き穴" ラベルの Callout-1 は特別扱い: テキストを左へ再配置し、
        # テキスト下の水平アンダーライン + 矢印付き引出線を手書きで描画する。
        is_stepped_hole_callout = e.dxf.name == "Callout-1"
        if is_stepped_hole_callout:
            # テキスト配置 (viewBox 左側の空白)
            label_x = 22
            label_y = 6
            label_text = None
            label_size = 5.4
            for sub in block:
                if sub.dxftype() == "MTEXT":
                    label_text = sub.text
                    label_size = sub.dxf.char_height * 0.9 * TEXT_SCALE
                    break
            if label_text:
                # テキスト (anchor="start", ベースライン相当 y=label_y)
                parts.append(emit_text(label_x, label_y, label_text, size=label_size, anchor="start"))
                # アンダーライン (テキスト直下)
                text_w = len(label_text) * label_size * 0.9  # 日本語混在なので簡易計算
                ul_y = label_y - label_size * 0.55
                ul_x2 = label_x + text_w
                parts.append(emit_line(label_x, ul_y, ul_x2, ul_y, STROKE_LINE, STROKE_W))
                # アンダーライン右端 → 段付き穴中心 (67.22, 21) へ引出線
                target_x, target_y = 67.22, 21.0
                parts.append(emit_line(ul_x2, ul_y, target_x, target_y, STROKE_LINE, STROKE_W))
                # 矢印頭 (target 方向を指す)
                dx = target_x - ul_x2
                dy = target_y - ul_y
                ln = (dx*dx + dy*dy) ** 0.5 or 1
                ux, uy = dx / ln, dy / ln
                # perpendicular
                px, py = -uy, ux
                head_len = 3.0
                half_w = 1.2
                bx = target_x - ux * head_len
                by = target_y - uy * head_len
                tri = [
                    (target_x, target_y),
                    (bx + px * half_w, by + py * half_w),
                    (bx - px * half_w, by - py * half_w),
                ]
                parts.append(emit_solid_triangle(tri))
            continue  # DXF 内の LINE/SOLID/MTEXT はスキップ

        for sub in block:
            st = sub.dxftype()
            if st == "LINE":
                s = sub.dxf.start; t = sub.dxf.end
                x1, y1 = xf(s.x, s.y); x2, y2 = xf(t.x, t.y)
                parts.append(emit_line(x1, y1, x2, y2))
            elif st == "SOLID":
                raw = [(sub.dxf.vtx0.x, sub.dxf.vtx0.y),
                       (sub.dxf.vtx1.x, sub.dxf.vtx1.y),
                       (sub.dxf.vtx2.x, sub.dxf.vtx2.y)]
                pts = [xf(px, py) for px, py in raw]
                parts.append(emit_solid_triangle(pts))
            elif st == "MTEXT":
                p = sub.dxf.insert
                gx, gy = xf(p.x, p.y)
                parts.append(emit_text(gx, gy, sub.text,
                                       size=sub.dxf.char_height * 0.9 * TEXT_SCALE,
                                       rot=0, anchor="start"))

    # MTEXT (座金A詳細図)
    for e in psp.query("MTEXT"):
        p = e.dxf.insert
        if in_detail(p.x, p.y):
            parts.append(emit_text(p.x + 20, p.y, e.text, size=e.dxf.char_height * 0.9 * TEXT_SCALE))

    # "2×20°面取り" 注記 + 引出線 (DXF には無い、手動追加)
    # 面取り位置: 左チャンファー (62.17, 54.71) → (60.17, 53.71)
    # overflow=visible 前提で viewBox 外(左)に配置可
    parts.append("<!-- 2×20° chamfer annotation (manual) -->")
    # 引出線: (5, 70) → (61.2, 54.2) 左チャンファー角へ
    parts.append(emit_line(5, 70, 61.2, 54.2, STROKE_LINE, STROKE_W))
    # 矢印頭 (チャンファー側を指す三角)
    parts.append(
        '<polygon points="61.2,{} 58.7,{} 59.5,{}" fill="#222" />'.format(
            fy(54.2), fy(56.0), fy(57.0)
        )
    )
    # テキスト "2×20°面取り" (引出線左端の上)
    parts.append(emit_text(4, 72, "2×20°面取り", size=6.0, anchor="start"))

    # bbox (座金A詳細図 の viewBox)
    # x: 55 ~ 130, y: -35 ~ 108 → 75mm × 143mm
    # 少しマージン足す
    bbox_x = 50
    bbox_y = -38
    bbox_w = 85
    bbox_h = 150

    svg_inner = "\n  ".join(parts)
    # Y反転後のビューボックス計算
    # y_dxf ∈ [-38, 112] → y_svg ∈ [-112, 38]
    vb_y_min = fy(bbox_y + bbox_h)  # 最上 (DXF上端)
    vb_y_max = fy(bbox_y)           # 最下 (DXF下端)
    vb_x_min = bbox_x
    vb_x_max = bbox_x + bbox_w
    vb = f"{vb_x_min} {vb_y_min} {vb_x_max - vb_x_min} {vb_y_max - vb_y_min}"

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" preserveAspectRatio="xMidYMid meet">
  {svg_inner}
</svg>"""
    return svg, (bbox_x, bbox_y, bbox_w, bbox_h)


def main():
    svg, bbox = extract()
    out_svg = Path("/tmp/washer-a-detail.svg")
    out_svg.write_text(svg, encoding="utf-8")
    print(f"Wrote {out_svg} ({len(svg)} bytes)  bbox={bbox}", file=sys.stderr)

    ts_content = f'''// Auto-generated from drafting-agent/references/claude-vertical.dxf
// via drafting-agent/extract_washer_detail.py
// DO NOT EDIT MANUALLY — regenerate with `python3 drafting-agent/extract_washer_detail.py`
//
// 座金A詳細図 (paperspace mm 座標, Y反転済み)
// viewBox: "{svg.split('viewBox="')[1].split('"')[0]}"
// bbox (DXF mm): x=[{bbox[0]},{bbox[0]+bbox[2]}] y=[{bbox[1]},{bbox[1]+bbox[3]}]

export const WASHER_A_DETAIL_SVG = {svg!r}

/** 詳細図の paperspace bbox (mm, DXF 座標系 Y=上) */
export const WASHER_A_DETAIL_BBOX = {{
  x: {bbox[0]},
  y: {bbox[1]},
  width: {bbox[2]},
  height: {bbox[3]},
}} as const
'''
    OUT_PATH.write_text(ts_content, encoding="utf-8")
    print(f"Wrote {OUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
