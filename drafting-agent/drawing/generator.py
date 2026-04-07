"""
JIS B 0001 準拠 図面PDF生成ロジック
IRONWORKS ado 手すり製品用

JIS規格準拠:
- JIS B 0001: 機械製図
- JIS Z 8311: 製図用紙サイズ
- JIS Z 8312: 表題欄
- JIS Z 8316: 寸法記入法
- JIS Z 8317: 線の用法
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import os
import math
from datetime import date

# ===================================================================
# JIS 線種定義 (JIS Z 8317)
# ===================================================================
LINE_THICK = 0.7       # 太い実線（外形線）
LINE_MEDIUM = 0.35     # 中太線（寸法線・引出線）
LINE_THIN = 0.18       # 細い実線（ハッチング・寸法補助線）
LINE_BORDER = 0.7      # 図枠外枠
LINE_BORDER_INNER = 0.35  # 図枠内枠

# ===================================================================
# フォント登録（日本語対応）
# ===================================================================
_FONT_JP = "Helvetica"
_FONT_JP_BOLD = "Helvetica-Bold"

_FONT_CANDIDATES = [
    # macOS ヒラギノ角ゴシック
    ("/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc", "HiraginoW3", 0),
    ("/System/Library/Fonts/HiraginoSans-W3.ttc", "HiraginoW3", 0),
    ("/System/Library/Fonts/ヒラギノ角ゴ ProN W3.otf", "HiraginoW3", None),
    # macOS ヒラギノ角ゴシック W6 (Bold)
    ("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", "HiraginoW6", 0),
    ("/System/Library/Fonts/HiraginoSans-W6.ttc", "HiraginoW6", 0),
    # Linux (Render/Railway/Docker) Noto Sans CJK JP
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", "NotoSansCJK", 0),
    ("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc", "NotoSansCJK", 0),
    ("/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc", "NotoSansCJK", 0),
]

_fonts_registered = set()
for path, name, subfont_idx in _FONT_CANDIDATES:
    if name in _fonts_registered:
        continue
    if os.path.exists(path):
        try:
            if subfont_idx is not None:
                pdfmetrics.registerFont(TTFont(name, path, subfontIndex=subfont_idx))
            else:
                pdfmetrics.registerFont(TTFont(name, path))
            _fonts_registered.add(name)
            if name in ("HiraginoW3", "NotoSansCJK") and _FONT_JP == "Helvetica":
                _FONT_JP = name
            if name in ("HiraginoW6",) and _FONT_JP_BOLD == "Helvetica-Bold":
                _FONT_JP_BOLD = name
        except Exception:
            pass

# Bold がなければ通常フォントをBold扱い
if _FONT_JP_BOLD == "Helvetica-Bold" and _FONT_JP != "Helvetica":
    _FONT_JP_BOLD = _FONT_JP


# ===================================================================
# メイン生成関数
# ===================================================================
def generate_drawing_pdf(spec: dict) -> bytes:
    """
    JIS準拠 図面PDFを生成

    spec:
        drawing_title: 図面タイトル
        drawing_number: 図番 (例: "IW-ANT-001")
        product: 製品名 (antoine/noel/mignon/marie)
        material: 材質
        finish: 仕上げ
        scale: 尺度 (例: "1:5")
        sheet: シート番号 (例: "1/1")
        dimensions:
            length: 全長 (mm)
            pipe_diameter: パイプ外径 (mm)
            height: 取付高さ (mm) ※水平手すり
            bracket_count: ブラケット数
            bracket_type: ブラケットタイプ (A/B/C)
            bracket_spacing: ブラケット間隔 (mm) ※自動計算可
            wall_offset: 壁面からの出幅 (mm)
        notes: 注記リスト
        tolerances: 公差 (例: {"general": "±2mm", "holes": "±0.5mm"})
    """
    buffer = io.BytesIO()

    # A4横置き（手すり図面は横長が見やすい）
    page_size = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=page_size)
    w, h = page_size

    # === 図枠 (JIS Z 8311) ===
    frame = _draw_jis_frame(c, w, h)

    # === 表題欄 (JIS Z 8312) ===
    _draw_jis_title_block(c, w, h, spec, frame)

    # === 三角法記号 ===
    _draw_third_angle_symbol(c, frame)

    # === メイン描画 ===
    product = spec.get("product", "antoine")
    dims = spec.get("dimensions", {})
    draw_area = frame["draw_area"]

    if product in ("antoine", "noel", "mignon"):
        _draw_horizontal_handrail(c, dims, spec, draw_area)
    elif product == "marie":
        _draw_vertical_handrail(c, dims, spec, draw_area)
    else:
        _draw_horizontal_handrail(c, dims, spec, draw_area)

    # === 注記欄 ===
    _draw_notes_block(c, spec.get("notes", []), spec.get("tolerances", {}), frame)

    # === 部品表（簡易） ===
    _draw_parts_list(c, spec, frame)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()


# ===================================================================
# JIS図枠 (JIS Z 8311)
# ===================================================================
def _draw_jis_frame(c, w, h):
    """
    JIS Z 8311 準拠の図枠を描画
    A4横: 用紙297x210mm, 図枠余白 左20mm(綴じ代), 他10mm
    """
    margin_left = 20 * mm   # 綴じ代
    margin_right = 10 * mm
    margin_top = 10 * mm
    margin_bottom = 10 * mm

    fx = margin_left
    fy = margin_bottom
    fw = w - margin_left - margin_right
    fh = h - margin_top - margin_bottom

    # 外枠（太線）
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(LINE_BORDER)
    c.rect(fx, fy, fw, fh)

    # 中心マーク（図枠の各辺中央に小さな線）
    mark_len = 5 * mm
    c.setLineWidth(LINE_THIN)
    # 上
    cx = fx + fw / 2
    c.line(cx, fy + fh, cx, fy + fh + mark_len)
    # 下
    c.line(cx, fy, cx, fy - mark_len)
    # 左
    cy = fy + fh / 2
    c.line(fx, cy, fx - mark_len, cy)
    # 右
    c.line(fx + fw, cy, fx + fw + mark_len, cy)

    # 描画エリア（表題欄・注記欄を除いた部分）
    tb_h = 45 * mm   # 表題欄高さ
    notes_w = 80 * mm  # 注記欄幅

    draw_area = {
        "x": fx + 5 * mm,
        "y": fy + tb_h + 10 * mm,
        "w": fw - 10 * mm,
        "h": fh - tb_h - 15 * mm,
    }

    return {
        "fx": fx, "fy": fy, "fw": fw, "fh": fh,
        "w": w, "h": h,
        "draw_area": draw_area,
        "tb_h": tb_h,
    }


# ===================================================================
# JIS表題欄 (JIS Z 8312)
# ===================================================================
def _draw_jis_title_block(c, w, h, spec, frame):
    """
    JIS Z 8312 準拠の表題欄
    位置: 図枠右下
    構成: 図面名・図番・尺度・材質・仕上・投影法・作図者・承認者・日付
    """
    fx, fy, fw, fh = frame["fx"], frame["fy"], frame["fw"], frame["fh"]
    tb_h = frame["tb_h"]

    # 表題欄全体枠
    tb_w = 170 * mm
    tb_x = fx + fw - tb_w
    tb_y = fy

    c.setLineWidth(LINE_BORDER_INNER)
    c.rect(tb_x, tb_y, tb_w, tb_h)

    # --- レイアウト ---
    # 5行構成
    rows = 5
    row_h = tb_h / rows

    # 横罫線
    for i in range(1, rows):
        y = tb_y + row_h * i
        c.setLineWidth(LINE_THIN)
        c.line(tb_x, y, tb_x + tb_w, y)

    # 上段2行は全幅（図面名・図番）、下3行は2~3分割

    # 縦罫線（下3行を3分割）
    col1 = tb_x + 55 * mm
    col2 = tb_x + 110 * mm
    for i in range(3):
        y_bottom = tb_y + row_h * i
        y_top = tb_y + row_h * (i + 1)
        c.line(col1, y_bottom, col1, y_top)
        c.line(col2, y_bottom, col2, y_top)

    # --- テキスト記入 ---
    tx = 2 * mm  # テキスト左マージン
    ty = 2 * mm  # テキスト下マージン

    # Row 4 (最上段): 図面名
    c.setFont(_FONT_JP_BOLD, 12)
    c.drawString(tb_x + tx, tb_y + row_h * 4 + ty + 1 * mm,
                 spec.get("drawing_title", ""))

    # Row 3: 図番
    c.setFont(_FONT_JP, 7)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawString(tb_x + tx, tb_y + row_h * 3 + row_h - 3 * mm, "図番")
    c.setFillColorRGB(0, 0, 0)
    c.setFont(_FONT_JP, 10)
    drawing_num = spec.get("drawing_number", _auto_drawing_number(spec))
    c.drawString(tb_x + tx + 12 * mm, tb_y + row_h * 3 + ty + 1 * mm, drawing_num)

    # Row 2: 材質 / 仕上げ / 尺度
    c.setFont(_FONT_JP, 6)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawString(tb_x + tx, tb_y + row_h * 2 + row_h - 3 * mm, "材質")
    c.drawString(col1 + tx, tb_y + row_h * 2 + row_h - 3 * mm, "仕上げ")
    c.drawString(col2 + tx, tb_y + row_h * 2 + row_h - 3 * mm, "尺度")
    c.setFillColorRGB(0, 0, 0)
    c.setFont(_FONT_JP, 8)
    c.drawString(tb_x + tx, tb_y + row_h * 2 + ty, spec.get("material", ""))
    c.drawString(col1 + tx, tb_y + row_h * 2 + ty, spec.get("finish", ""))
    c.drawString(col2 + tx, tb_y + row_h * 2 + ty, spec.get("scale", "1:5"))

    # Row 1: 設計 / 承認 / 日付
    c.setFont(_FONT_JP, 6)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawString(tb_x + tx, tb_y + row_h * 1 + row_h - 3 * mm, "設計")
    c.drawString(col1 + tx, tb_y + row_h * 1 + row_h - 3 * mm, "承認")
    c.drawString(col2 + tx, tb_y + row_h * 1 + row_h - 3 * mm, "日付")
    c.setFillColorRGB(0, 0, 0)
    c.setFont(_FONT_JP, 8)
    c.drawString(tb_x + tx, tb_y + row_h * 1 + ty, "蠣崎 良治")
    c.drawString(col1 + tx, tb_y + row_h * 1 + ty, "")  # 承認欄（空白）
    c.drawString(col2 + tx, tb_y + row_h * 1 + ty, date.today().strftime("%Y-%m-%d"))

    # Row 0 (最下段): 会社名 / 単位 / シート
    c.setFont(_FONT_JP, 6)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawString(tb_x + tx, tb_y + row_h - 3 * mm, "社名")
    c.drawString(col1 + tx, tb_y + row_h - 3 * mm, "単位")
    c.drawString(col2 + tx, tb_y + row_h - 3 * mm, "図葉")
    c.setFillColorRGB(0, 0, 0)
    c.setFont(_FONT_JP, 7)
    c.drawString(tb_x + tx, tb_y + ty, "IRONWORKS ado")
    c.drawString(col1 + tx, tb_y + ty, "mm")
    c.drawString(col2 + tx, tb_y + ty, spec.get("sheet", "1/1"))


# ===================================================================
# 三角法記号 (JIS B 0001 第三角法)
# ===================================================================
def _draw_third_angle_symbol(c, frame):
    """第三角法記号を表題欄の左側に描画"""
    fx, fy = frame["fx"], frame["fy"]
    fw = frame["fw"]
    tb_h = frame["tb_h"]

    # 表題欄の左、図枠下部
    cx = fx + fw - 170 * mm - 20 * mm
    cy = fy + tb_h / 2

    r = 4 * mm  # 円錐投影の半径
    c.setLineWidth(LINE_MEDIUM)

    # 円錐台形（台形 = 正面図）
    trap_w = 6 * mm
    trap_h = 8 * mm
    trap_top = 3 * mm
    c.line(cx - trap_w / 2, cy - trap_h / 2,
           cx + trap_w / 2, cy - trap_h / 2)  # 底辺
    c.line(cx - trap_top / 2, cy + trap_h / 2,
           cx + trap_top / 2, cy + trap_h / 2)  # 上辺
    c.line(cx - trap_w / 2, cy - trap_h / 2,
           cx - trap_top / 2, cy + trap_h / 2)  # 左辺
    c.line(cx + trap_w / 2, cy - trap_h / 2,
           cx + trap_top / 2, cy + trap_h / 2)  # 右辺

    # 右側に投影円
    proj_cx = cx + 14 * mm
    c.circle(proj_cx, cy, r, stroke=1, fill=0)
    # 中心の小円
    c.circle(proj_cx, cy, r * 0.3, stroke=1, fill=0)
    # 中心線
    c.setLineWidth(LINE_THIN)
    c.setDash(6, 3)
    c.line(proj_cx - r - 2 * mm, cy, proj_cx + r + 2 * mm, cy)
    c.line(proj_cx, cy - r - 2 * mm, proj_cx, cy + r + 2 * mm)
    c.setDash()  # ダッシュ解除


# ===================================================================
# JIS寸法線 (JIS Z 8316 / JIS B 0001)
# ===================================================================
def _draw_dim_h(c, x1, x2, y, text, offset=10*mm):
    """
    JIS準拠 水平寸法線
    - 寸法補助線（細実線）
    - 寸法線（中太線）+ 塗り矢印
    - 寸法値（寸法線の上、中央配置）
    """
    dim_y = y - offset

    c.setStrokeColorRGB(0, 0, 0)

    # 寸法補助線（細実線、寸法線から2mm離して開始）
    c.setLineWidth(LINE_THIN)
    gap = 2 * mm
    ext = 3 * mm  # 寸法線を超える突出量
    c.line(x1, y - gap, x1, dim_y - ext)
    c.line(x2, y - gap, x2, dim_y - ext)

    # 寸法線（中太線）
    c.setLineWidth(LINE_MEDIUM)
    c.line(x1, dim_y, x2, dim_y)

    # JIS矢印（塗りつぶし三角、先端角度30°、長さ3mm）
    _draw_jis_arrow(c, x1, dim_y, 0)    # →方向
    _draw_jis_arrow(c, x2, dim_y, 180)  # ←方向

    # 寸法値（寸法線の上、中央）
    c.setFont(_FONT_JP, 8)
    text_w = c.stringWidth(text, _FONT_JP, 8)
    c.drawString((x1 + x2) / 2 - text_w / 2, dim_y + 1 * mm, text)


def _draw_dim_v(c, x, y1, y2, text, offset=10*mm):
    """JIS準拠 垂直寸法線"""
    dim_x = x + offset

    c.setStrokeColorRGB(0, 0, 0)

    # 寸法補助線
    c.setLineWidth(LINE_THIN)
    gap = 2 * mm
    ext = 3 * mm
    c.line(x + gap, y1, dim_x + ext, y1)
    c.line(x + gap, y2, dim_x + ext, y2)

    # 寸法線
    c.setLineWidth(LINE_MEDIUM)
    c.line(dim_x, y1, dim_x, y2)

    # JIS矢印
    _draw_jis_arrow(c, dim_x, y1, 270)  # ↓方向
    _draw_jis_arrow(c, dim_x, y2, 90)   # ↑方向

    # 寸法値（回転）
    c.saveState()
    c.translate(dim_x - 1.5 * mm, (y1 + y2) / 2)
    c.rotate(90)
    c.setFont(_FONT_JP, 8)
    text_w = c.stringWidth(text, _FONT_JP, 8)
    c.drawString(-text_w / 2, 0, text)
    c.restoreState()


def _draw_dim_diameter(c, cx, cy, r, text):
    """径寸法（φ記号付き引出線）"""
    c.setLineWidth(LINE_MEDIUM)
    # 引出線（右上方向へ）
    lx = cx + r + 15 * mm
    ly = cy + 10 * mm
    c.line(cx + r, cy, lx, ly)
    # 横線
    c.line(lx, ly, lx + 15 * mm, ly)
    # テキスト
    c.setFont(_FONT_JP, 8)
    c.drawString(lx + 2 * mm, ly + 1.5 * mm, text)


def _draw_jis_arrow(c, x, y, angle_deg):
    """
    JIS準拠 塗りつぶし矢印
    先端角度: 30°（片側15°）
    長さ: 3mm
    """
    length = 3 * mm
    half_angle = 15  # 度

    angle_rad = math.radians(angle_deg)
    a1 = math.radians(angle_deg + 180 - half_angle)
    a2 = math.radians(angle_deg + 180 + half_angle)

    p1x = x + length * math.cos(a1)
    p1y = y + length * math.sin(a1)
    p2x = x + length * math.cos(a2)
    p2y = y + length * math.sin(a2)

    path = c.beginPath()
    path.moveTo(x, y)
    path.lineTo(p1x, p1y)
    path.lineTo(p2x, p2y)
    path.close()
    c.drawPath(path, fill=1, stroke=0)


# ===================================================================
# 溶接記号 (JIS Z 3021)
# ===================================================================
def _draw_weld_symbol(c, x, y, weld_type="fillet"):
    """溶接記号を描画"""
    c.setLineWidth(LINE_MEDIUM)

    # 基線（水平線）
    base_len = 12 * mm
    c.line(x, y, x + base_len, y)

    # 矢（引出線）
    c.line(x, y, x - 5 * mm, y - 8 * mm)

    if weld_type == "fillet":
        # すみ肉溶接記号（三角形）
        s = 3 * mm
        c.line(x + 2 * mm, y, x + 2 * mm + s, y)
        c.line(x + 2 * mm, y, x + 2 * mm, y + s)
        c.line(x + 2 * mm, y + s, x + 2 * mm + s, y)
    elif weld_type == "butt":
        # 突合せ溶接記号（V字）
        s = 3 * mm
        c.line(x + 2 * mm, y, x + 2 * mm + s / 2, y + s)
        c.line(x + 2 * mm + s / 2, y + s, x + 2 * mm + s, y)


# ===================================================================
# 水平手すり描画（Antoine / Noel / Mignon）
# ===================================================================
def _draw_horizontal_handrail(c, dims, spec, draw_area):
    """水平手すりの側面図 + 正面図"""
    length = dims.get("length", 2000)
    pipe_d = dims.get("pipe_diameter", 25.4)
    height = dims.get("height", 800)
    bracket_count = dims.get("bracket_count", 2)
    wall_offset = dims.get("wall_offset", 80)

    # スケール計算（描画エリアに収まるよう）
    area_w = draw_area["w"]
    area_h = draw_area["h"]

    # 側面図は上半分、正面図は下半分
    side_area = {
        "x": draw_area["x"],
        "y": draw_area["y"] + area_h * 0.45,
        "w": area_w * 0.65,
        "h": area_h * 0.5,
    }
    front_area = {
        "x": draw_area["x"] + area_w * 0.68,
        "y": draw_area["y"],
        "w": area_w * 0.3,
        "h": area_h * 0.9,
    }

    # --- 側面図 ---
    scale_s = min(side_area["w"] * 0.8 / length, side_area["h"] * 0.5 / max(pipe_d * 3, 100))
    ox = side_area["x"] + 15 * mm
    oy = side_area["y"] + side_area["h"] * 0.4

    # ビュータイトル
    c.setFont(_FONT_JP_BOLD, 9)
    c.drawString(side_area["x"], side_area["y"] + side_area["h"] - 3 * mm, "側面図")
    c.setLineWidth(LINE_THIN)
    c.line(side_area["x"], side_area["y"] + side_area["h"] - 5 * mm,
           side_area["x"] + 20 * mm, side_area["y"] + side_area["h"] - 5 * mm)

    pipe_len = length * scale_s
    pipe_r = max((pipe_d / 2) * scale_s, 1.2 * mm)

    # 中心線（一点鎖線）
    c.setLineWidth(LINE_THIN)
    c.setDash([8, 3, 2, 3], 0)  # 一点鎖線
    c.line(ox - 5 * mm, oy, ox + pipe_len + 5 * mm, oy)
    c.setDash()

    # パイプ外形（太実線）
    c.setLineWidth(LINE_THICK)
    c.line(ox, oy + pipe_r, ox + pipe_len, oy + pipe_r)
    c.line(ox, oy - pipe_r, ox + pipe_len, oy - pipe_r)
    # 端部（半円 or 線）
    c.arc(ox - pipe_r, oy - pipe_r, ox + pipe_r, oy + pipe_r, 90, 180)
    c.arc(ox + pipe_len - pipe_r, oy - pipe_r,
          ox + pipe_len + pipe_r, oy + pipe_r, 270, 180)

    # ブラケット
    if bracket_count >= 1:
        spacing = pipe_len / (bracket_count - 1) if bracket_count > 1 else 0
        for i in range(bracket_count):
            bx = ox + spacing * i
            _draw_bracket_side(c, bx, oy, pipe_r, wall_offset * scale_s)

    # 寸法線: 全長
    _draw_dim_h(c, ox, ox + pipe_len, oy - pipe_r, f"{length}", offset=12 * mm)

    # 寸法線: ブラケット間隔（3本以上の場合）
    if bracket_count >= 3:
        bsp = pipe_len / (bracket_count - 1)
        for i in range(bracket_count - 1):
            bx1 = ox + bsp * i
            bx2 = ox + bsp * (i + 1)
            actual_spacing = round(length / (bracket_count - 1))
            _draw_dim_h(c, bx1, bx2, oy - pipe_r, f"{actual_spacing}", offset=22 * mm)

    # パイプ径注記
    _draw_dim_diameter(c, ox + pipe_len, oy, pipe_r, f"φ{pipe_d}")

    # 溶接記号（ブラケット接合部）
    if bracket_count >= 1:
        wx = ox + (spacing if bracket_count > 1 else pipe_len / 2)
        _draw_weld_symbol(c, wx + 3 * mm, oy + pipe_r + 2 * mm)

    # --- 正面図 ---
    scale_f = min(front_area["w"] * 0.5 / max(wall_offset * 2, 200),
                  front_area["h"] * 0.7 / max(height, 600))
    fox = front_area["x"] + front_area["w"] * 0.3
    foy = front_area["y"] + 15 * mm

    # ビュータイトル
    c.setFont(_FONT_JP_BOLD, 9)
    c.drawString(front_area["x"], front_area["y"] + front_area["h"] - 3 * mm, "正面図")
    c.setLineWidth(LINE_THIN)
    c.line(front_area["x"], front_area["y"] + front_area["h"] - 5 * mm,
           front_area["x"] + 20 * mm, front_area["y"] + front_area["h"] - 5 * mm)

    # 壁面（太実線 + ハッチング）
    wall_h_scaled = height * scale_f + 30 * mm
    c.setLineWidth(LINE_THICK)
    c.line(fox, foy, fox, foy + wall_h_scaled)

    # ハッチング (JIS: 45°細実線)
    c.setLineWidth(LINE_THIN)
    hatch_w = 5 * mm
    for i in range(0, int(wall_h_scaled / mm) + 5, 3):
        hy = foy + i * mm
        if hy < foy + wall_h_scaled:
            c.line(fox - hatch_w, hy, fox, hy + hatch_w)

    # ブラケット + パイプ断面
    hand_y = foy + height * scale_f
    bracket_len = wall_offset * scale_f

    c.setLineWidth(LINE_THICK)
    # ブラケットアーム
    c.line(fox, hand_y, fox + bracket_len, hand_y)
    # ブラケット台座（壁側）
    base_w = 12 * scale_f
    base_h = 40 * scale_f
    c.rect(fox - 1, hand_y - base_h / 2, 3, base_h)

    # パイプ断面（円）
    pipe_r_f = max((pipe_d / 2) * scale_f, 2 * mm)
    c.circle(fox + bracket_len, hand_y, pipe_r_f, stroke=1, fill=0)
    # 中心マーク
    c.setLineWidth(LINE_THIN)
    c.setDash(6, 3)
    c.line(fox + bracket_len - pipe_r_f - 2 * mm, hand_y,
           fox + bracket_len + pipe_r_f + 2 * mm, hand_y)
    c.line(fox + bracket_len, hand_y - pipe_r_f - 2 * mm,
           fox + bracket_len, hand_y + pipe_r_f + 2 * mm)
    c.setDash()

    # FL（床面）線
    c.setLineWidth(LINE_THIN)
    c.setDash([8, 3, 2, 3], 0)
    c.line(fox - 10 * mm, foy, fox + bracket_len + 20 * mm, foy)
    c.setDash()
    c.setFont(_FONT_JP, 7)
    c.drawString(fox + bracket_len + 12 * mm, foy + 1 * mm, "FL")

    # 寸法線: 高さ
    _draw_dim_v(c, fox + bracket_len + pipe_r_f, foy, hand_y,
                f"{height}", offset=8 * mm)

    # 寸法線: 壁面からの出幅
    _draw_dim_h(c, fox, fox + bracket_len, hand_y + pipe_r_f,
                f"{wall_offset}", offset=-8 * mm)


# ===================================================================
# 縦型手すり描画（Marie）
# ===================================================================
def _draw_vertical_handrail(c, dims, spec, draw_area):
    """縦型手すりの正面図"""
    length = dims.get("length", 600)
    pipe_d = dims.get("pipe_diameter", 25.4)
    wall_offset = dims.get("wall_offset", 65)

    area_w = draw_area["w"]
    area_h = draw_area["h"]

    scale = min(area_w * 0.3 / max(wall_offset * 2, 200),
                area_h * 0.7 / max(length, 500))

    ox = draw_area["x"] + area_w * 0.35
    oy = draw_area["y"] + 20 * mm

    # ビュータイトル
    c.setFont(_FONT_JP_BOLD, 9)
    c.drawString(draw_area["x"], draw_area["y"] + area_h - 3 * mm, "正面図（縦型）")
    c.setLineWidth(LINE_THIN)
    c.line(draw_area["x"], draw_area["y"] + area_h - 5 * mm,
           draw_area["x"] + 35 * mm, draw_area["y"] + area_h - 5 * mm)

    pipe_len = length * scale
    pipe_r = max((pipe_d / 2) * scale, 1.2 * mm)

    # 壁面
    wall_x = ox - wall_offset * scale
    wall_h = pipe_len + 40 * mm
    c.setLineWidth(LINE_THICK)
    c.line(wall_x, oy - 10 * mm, wall_x, oy + wall_h)

    # ハッチング
    c.setLineWidth(LINE_THIN)
    hatch_w = 5 * mm
    for i in range(0, int(wall_h / mm) + 5, 3):
        hy = oy - 10 * mm + i * mm
        if hy < oy + wall_h:
            c.line(wall_x - hatch_w, hy, wall_x, hy + hatch_w)

    # 中心線
    c.setLineWidth(LINE_THIN)
    c.setDash([8, 3, 2, 3], 0)
    c.line(ox, oy - 8 * mm, ox, oy + pipe_len + 8 * mm)
    c.setDash()

    # パイプ（太実線、縦二重線）
    c.setLineWidth(LINE_THICK)
    c.line(ox - pipe_r, oy, ox - pipe_r, oy + pipe_len)
    c.line(ox + pipe_r, oy, ox + pipe_r, oy + pipe_len)
    # 端部（半円）
    c.arc(ox - pipe_r, oy - pipe_r, ox + pipe_r, oy + pipe_r, 180, 180)
    c.arc(ox - pipe_r, oy + pipe_len - pipe_r,
          ox + pipe_r, oy + pipe_len + pipe_r, 0, 180)

    # ブラケット（上下2箇所）
    bracket_inset = min(50 * scale, pipe_len * 0.15)
    bracket_positions = [oy + bracket_inset, oy + pipe_len - bracket_inset]
    for by in bracket_positions:
        c.setLineWidth(LINE_THICK)
        c.line(wall_x, by, ox - pipe_r, by)
        # 台座
        c.rect(wall_x - 1, by - 5 * scale, 3, 10 * scale)

    # 寸法線: 全長
    _draw_dim_v(c, ox + pipe_r, oy, oy + pipe_len, f"{length}", offset=10 * mm)

    # 寸法線: 壁からの出幅
    _draw_dim_h(c, wall_x, ox, bracket_positions[0], f"{wall_offset}", offset=15 * mm)

    # パイプ径
    _draw_dim_diameter(c, ox, oy + pipe_len / 2, pipe_r, f"φ{pipe_d}")


# ===================================================================
# ブラケット詳細描画
# ===================================================================
def _draw_bracket_side(c, x, y, pipe_r, wall_dist):
    """ブラケット側面図（より詳細）"""
    c.setLineWidth(LINE_THICK)

    # ブラケットアーム（パイプ下から壁方向へ）
    arm_top = y - pipe_r
    arm_bottom = arm_top - wall_dist

    c.line(x, arm_top, x, arm_bottom)

    # 台座プレート（壁面固定部）
    plate_w = 10 * mm
    plate_h = 2 * mm
    c.rect(x - plate_w / 2, arm_bottom - plate_h, plate_w, plate_h)

    # 取付穴（点線円）
    c.setLineWidth(LINE_THIN)
    hole_r = 1.2 * mm
    c.setDash(1, 1)
    c.circle(x - plate_w / 4, arm_bottom - plate_h / 2, hole_r, stroke=1, fill=0)
    c.circle(x + plate_w / 4, arm_bottom - plate_h / 2, hole_r, stroke=1, fill=0)
    c.setDash()


# ===================================================================
# 注記欄
# ===================================================================
def _draw_notes_block(c, notes, tolerances, frame):
    """注記欄（図枠左下）"""
    fx, fy = frame["fx"], frame["fy"]
    tb_h = frame["tb_h"]
    fw = frame["fw"]

    # 注記欄枠
    notes_w = fw - 170 * mm - 35 * mm  # 表題欄と三角法記号の左側
    notes_h = tb_h
    notes_x = fx
    notes_y = fy

    c.setLineWidth(LINE_BORDER_INNER)
    c.rect(notes_x, notes_y, notes_w, notes_h)

    # ヘッダー
    c.setFont(_FONT_JP_BOLD, 8)
    c.drawString(notes_x + 3 * mm, notes_y + notes_h - 5 * mm, "注記")
    c.setLineWidth(LINE_THIN)
    c.line(notes_x, notes_y + notes_h - 7 * mm, notes_x + notes_w, notes_y + notes_h - 7 * mm)

    # 一般公差
    y_pos = notes_y + notes_h - 12 * mm
    c.setFont(_FONT_JP, 7)
    if tolerances:
        general_tol = tolerances.get("general", "±2mm")
        c.drawString(notes_x + 3 * mm, y_pos, f"一般公差: {general_tol}")
        y_pos -= 4 * mm
        hole_tol = tolerances.get("holes", "")
        if hole_tol:
            c.drawString(notes_x + 3 * mm, y_pos, f"穴位置公差: {hole_tol}")
            y_pos -= 4 * mm
    else:
        c.drawString(notes_x + 3 * mm, y_pos, "一般公差: JIS B 0405-m (中級)")
        y_pos -= 4 * mm

    # ユーザー注記
    for i, note in enumerate(notes):
        if y_pos < notes_y + 3 * mm:
            break
        c.drawString(notes_x + 3 * mm, y_pos, f"{i+1}. {note}")
        y_pos -= 4 * mm


# ===================================================================
# 部品表（簡易）
# ===================================================================
def _draw_parts_list(c, spec, frame):
    """簡易部品表（図枠右上）"""
    fx, fy = frame["fx"], frame["fy"]
    fw, fh = frame["fw"], frame["fh"]

    # 部品表位置（右上）
    pl_w = 80 * mm
    pl_x = fx + fw - pl_w
    pl_y = fy + fh - 5 * mm  # 上端から5mm下

    dims = spec.get("dimensions", {})
    product = spec.get("product", "")

    parts = []
    # パイプ
    parts.append({
        "no": "1",
        "name": f"手すりパイプ φ{dims.get('pipe_diameter', 25.4)}",
        "material": spec.get("material", "SS400"),
        "qty": "1",
    })
    # ブラケット
    bc = dims.get("bracket_count", 2)
    bt = dims.get("bracket_type", "A")
    parts.append({
        "no": "2",
        "name": f"ブラケット {bt}型",
        "material": "SS400",
        "qty": str(bc),
    })
    # 取付ボルト
    parts.append({
        "no": "3",
        "name": "取付ボルト M8x40",
        "material": "SUS304",
        "qty": str(bc * 4),
    })

    # ヘッダー
    row_h = 4.5 * mm
    c.setLineWidth(LINE_THIN)

    header_y = pl_y
    c.setFont(_FONT_JP, 6)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    cols = [pl_x, pl_x + 8 * mm, pl_x + 45 * mm, pl_x + 65 * mm]
    headers = ["No.", "品名", "材質", "数量"]
    for col, hdr in zip(cols, headers):
        c.drawString(col + 1 * mm, header_y - row_h + 1 * mm, hdr)
    c.setFillColorRGB(0, 0, 0)

    c.line(pl_x, header_y, pl_x + pl_w, header_y)
    c.line(pl_x, header_y - row_h, pl_x + pl_w, header_y - row_h)

    # 部品行
    c.setFont(_FONT_JP, 6)
    for i, part in enumerate(parts):
        py = header_y - row_h * (i + 1)
        c.drawString(cols[0] + 1 * mm, py - row_h + 1.5 * mm, part["no"])
        c.drawString(cols[1] + 1 * mm, py - row_h + 1.5 * mm, part["name"])
        c.drawString(cols[2] + 1 * mm, py - row_h + 1.5 * mm, part["material"])
        c.drawString(cols[3] + 1 * mm, py - row_h + 1.5 * mm, part["qty"])
        c.line(pl_x, py - row_h, pl_x + pl_w, py - row_h)

    # 縦罫線
    for col in cols:
        c.line(col, header_y, col, header_y - row_h * (len(parts) + 1))
    c.line(pl_x + pl_w, header_y, pl_x + pl_w, header_y - row_h * (len(parts) + 1))


# ===================================================================
# ユーティリティ
# ===================================================================
def _auto_drawing_number(spec):
    """図番自動生成"""
    product = spec.get("product", "X").upper()[:3]
    length = spec.get("dimensions", {}).get("length", 0)
    return f"IW-{product}-{length}"


def _calc_scale(max_dim_mm):
    """図面上に収まるスケール係数を計算"""
    available = 150 * mm
    if max_dim_mm <= 0:
        return 0.1
    scale = available / max_dim_mm
    return min(scale, 0.5)
