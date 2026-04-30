"""
参考DXFテンプレート方式: 座金グループ単位で移動・削除・追加

方針:
1. 参考DXFから座金グループ（14エンティティ/座金）を特定
2. 新パラメータに合わせて座金グループのX座標を一括シフト
3. 余剰座金は削除、不足分は新規追加
4. パイプ矩形と寸法線を更新
5. 側面図はパイプ左端に合わせてシフト
"""
import ezdxf
from ezdxf.addons.drawing import Frontend, RenderContext, layout
from ezdxf.addons.drawing.svg import SVGBackend
import os
import math


TEMPLATE_FILE = os.path.expanduser('~/Desktop/横型手~1-dxf/横型手~1.dxf')

REF_LENGTH = 2500
REF_PIPE_LEFT = -1142.4
REF_PIPE_RIGHT = 1357.6
REF_PIPE_CENTER_X = (REF_PIPE_LEFT + REF_PIPE_RIGHT) / 2
REF_PIPE_TOP = 209.1
REF_PIPE_BOT = 184.1
REF_WASHER_Y = 161.3
REF_WASHER_XS = [-1042.4, -275.4, 490.6, 1257.6]


def _collect_washer_groups(msp):
    """
    座金グループを収集: 各座金の中心X座標に紐づくエンティティをまとめる

    座金1つ = CIRCLE×5 + POLYLINE×1 + LINE×3 + WIPEOUT×5 = 14エンティティ
    判定: Y座標が130〜215の範囲、X座標が側面図エリア(-1200)より右
    """
    groups = {wx: [] for wx in REF_WASHER_XS}

    for e in msp:
        etype = e.dxftype()
        cx = None  # このエンティティの代表X座標

        if etype == 'CIRCLE':
            c = e.dxf.center
            if 130 < c.y < 215 and c.x > -1200:
                cx = c.x

        elif etype == 'POLYLINE' and not e.is_closed:
            pts = list(e.points())
            ys = [p[1] for p in pts]
            xs = [p[0] for p in pts]
            if len(pts) == 4 and min(ys) > 150 and max(ys) < 215:
                avg_x = sum(xs) / 4
                if avg_x > -1200:
                    cx = avg_x

        elif etype == 'LINE':
            sx, sy = e.dxf.start.x, e.dxf.start.y
            ex, ey = e.dxf.end.x, e.dxf.end.y
            if (150 < sy < 215 or 150 < ey < 215) and sx > -1200 and ex > -1200:
                cx = (sx + ex) / 2

        elif etype == 'WIPEOUT':
            ins = e.dxf.insert
            if 130 < ins.y < 215 and ins.x > -1200:
                cx = ins.x + 22.5  # WIPEOUTのinsertは左下なので中心に補正

        if cx is not None:
            # 最も近い座金グループに割り当て
            min_dist = float('inf')
            best_wx = None
            for wx in REF_WASHER_XS:
                d = abs(cx - wx)
                if d < min_dist:
                    min_dist = d
                    best_wx = wx
            if min_dist < 100 and best_wx is not None:
                groups[best_wx].append(e)

    return groups


def _shift_entity_x(e, dx):
    """エンティティのX座標をdxだけシフト"""
    etype = e.dxftype()

    if etype == 'CIRCLE':
        c = e.dxf.center
        e.dxf.center = (c.x + dx, c.y, c.z)

    elif etype == 'LINE':
        s = e.dxf.start
        en = e.dxf.end
        e.dxf.start = (s.x + dx, s.y, s.z)
        e.dxf.end = (en.x + dx, en.y, en.z)

    elif etype == 'POLYLINE':
        for v in e.vertices:
            loc = v.dxf.location
            v.dxf.location = (loc.x + dx, loc.y, loc.z)

    elif etype == 'WIPEOUT':
        ins = e.dxf.insert
        e.dxf.insert = (ins.x + dx, ins.y, ins.z)


def _shift_side_view(msp, dx):
    """側面図エンティティをXシフト（X < -1200 のもの全て）"""
    for e in msp:
        etype = e.dxftype()

        if etype == 'LINE':
            sx = e.dxf.start.x
            ex = e.dxf.end.x
            if sx < -1200 or ex < -1200:
                s = e.dxf.start
                en = e.dxf.end
                e.dxf.start = (s.x + dx, s.y, s.z)
                e.dxf.end = (en.x + dx, en.y, en.z)

        elif etype == 'ARC':
            c = e.dxf.center
            if c.x < -1200:
                e.dxf.center = (c.x + dx, c.y, c.z)

        elif etype == 'CIRCLE':
            c = e.dxf.center
            if c.x < -1200:
                e.dxf.center = (c.x + dx, c.y, c.z)

        elif etype == 'POLYLINE' and e.is_closed:
            pts = list(e.points())
            xs = [p[0] for p in pts]
            if len(pts) == 4 and max(xs) < -1200:
                for v in e.vertices:
                    loc = v.dxf.location
                    v.dxf.location = (loc.x + dx, loc.y, loc.z)

        elif etype == 'SPLINE':
            ctrl = list(e.control_points)
            if ctrl and all(p[0] < -1200 for p in ctrl):
                new_pts = [(p[0] + dx, p[1], p[2] if len(p) > 2 else 0) for p in ctrl]
                e.control_points = new_pts


def _add_washer_group(msp, wx):
    """座金グループを新規追加（参考DXFの構造を再現）"""
    y = REF_WASHER_Y
    bw = 9.0  # 支柱幅
    bx_l = wx - bw / 2
    bx_r = wx + bw / 2

    # 支柱 POLYLINE
    msp.add_lwpolyline(
        [(bx_l, y), (bx_l, REF_PIPE_BOT), (bx_r, REF_PIPE_BOT), (bx_r, y)],
        close=False,
        dxfattribs={"layer": "一般", "lineweight": 5},
    )

    # 支柱 LINE×3（参考DXF互換）
    msp.add_line((bx_l, y), (bx_l, REF_PIPE_BOT - 0.3),
                 dxfattribs={"layer": "一般", "lineweight": 5})
    msp.add_line((bx_r, y), (bx_r, REF_PIPE_BOT - 0.3),
                 dxfattribs={"layer": "一般", "lineweight": 5})
    msp.add_line((bx_r, y), (bx_r + 0.1, y),
                 dxfattribs={"layer": "一般", "lineweight": 5})

    # 座金プレート 45φ
    msp.add_circle((wx, y), 22.5, dxfattribs={"layer": "一般", "lineweight": 5})
    # パイプ穴 9φ
    msp.add_circle((wx, y), 4.5, dxfattribs={"layer": "一般", "lineweight": 5})

    # ボルト穴 r=3.5 × 3箇所
    bolt_dist = 14.5
    msp.add_circle((wx, y - bolt_dist), 3.5,
                   dxfattribs={"layer": "一般", "lineweight": 5})
    msp.add_circle(
        (wx - bolt_dist * math.sin(math.radians(60)),
         y + bolt_dist * math.cos(math.radians(60))),
        3.5, dxfattribs={"layer": "一般", "lineweight": 5})
    msp.add_circle(
        (wx + bolt_dist * math.sin(math.radians(60)),
         y + bolt_dist * math.cos(math.radians(60))),
        3.5, dxfattribs={"layer": "一般", "lineweight": 5})


def generate_from_template(
    length_mm: int = 2500,
    washer_positions: list = None,
    angle_deg: float = 0,
    angle_dir: str = "left",
    product_name: str = "rune",
    color: str = "マットブラック",
    material: str = "ss400 stkm25.4 t2.3",
    customer_name: str = "",
    output_path: str = None,
) -> str:

    if washer_positions is None:
        ed = _get_end_dist(length_mm)
        count = _calc_washer_count(length_mm)
        washer_positions = []
        for i in range(count):
            if count == 1:
                washer_positions.append(length_mm // 2)
            else:
                washer_positions.append(round(ed + (length_mm - 2 * ed) * i / (count - 1)))

    doc = ezdxf.readfile(TEMPLATE_FILE)
    msp = doc.modelspace()

    # 新パイプ座標
    new_pipe_left = REF_PIPE_CENTER_X - length_mm / 2
    new_pipe_right = REF_PIPE_CENTER_X + length_mm / 2
    pipe_shift = new_pipe_left - REF_PIPE_LEFT  # パイプ左端のシフト量

    # 新座金X座標
    new_washer_xs = [new_pipe_left + pos for pos in washer_positions]
    new_washer_count = len(new_washer_xs)
    ref_washer_count = len(REF_WASHER_XS)

    # ========================================
    #  1. パイプ矩形を更新
    # ========================================
    for e in msp:
        if e.dxftype() == 'POLYLINE' and e.is_closed:
            pts = list(e.points())
            if len(pts) == 4:
                xs = [p[0] for p in pts]
                w = max(xs) - min(xs)
                if abs(w - REF_LENGTH) < 1:
                    vertices = list(e.vertices)
                    coords = [
                        (new_pipe_left, REF_PIPE_TOP),
                        (new_pipe_right, REF_PIPE_TOP),
                        (new_pipe_right, REF_PIPE_BOT),
                        (new_pipe_left, REF_PIPE_BOT),
                    ]
                    for v, (nx, ny) in zip(vertices, coords):
                        v.dxf.location = (nx, ny, 0)
                    break

    # ========================================
    #  2. 座金グループを移動・削除・追加
    # ========================================
    groups = _collect_washer_groups(msp)

    # ソートされた参考座金
    sorted_ref = sorted(REF_WASHER_XS)

    # 使う座金数 = min(参考座金数, 新座金数)
    use_count = min(ref_washer_count, new_washer_count)

    # 参考座金を新座金位置にシフト
    for i in range(use_count):
        old_wx = sorted_ref[i]
        new_wx = new_washer_xs[i]
        dx = new_wx - old_wx
        if old_wx in groups:
            for e in groups[old_wx]:
                _shift_entity_x(e, dx)

    # 余剰座金を削除（参考座金が多い場合）
    for i in range(use_count, ref_washer_count):
        old_wx = sorted_ref[i]
        if old_wx in groups:
            for e in groups[old_wx]:
                msp.delete_entity(e)

    # 不足座金を追加（新座金が多い場合）
    for i in range(ref_washer_count, new_washer_count):
        _add_washer_group(msp, new_washer_xs[i])

    # ========================================
    #  3. 寸法線を更新（全てDIMENSIONエンティティを使わず手動描画）
    #  理由: VectorworksはezdxfのDIMENSIONを斜め計測で誤表示する
    # ========================================
    dims_to_delete = [e for e in msp if e.dxftype() == 'DIMENSION']
    for d in dims_to_delete:
        msp.delete_entity(d)

    # DIMENSIONが参照していたアノニマスブロック（*D*）も完全削除
    # VectorworksはDIMENSIONエンティティがなくても*D*ブロックを表示するため
    anon_blocks = [b.name for b in doc.blocks if b.name.startswith('*D')]
    for bname in anon_blocks:
        try:
            doc.blocks.delete_block(bname, safe=False)
        except Exception:
            pass

    _lw = 5          # 線幅
    _dlayer = "寸法"
    _alen = 15       # 矢印の長さ
    _aw = 4.5        # 矢印の半幅
    _th = 34.2       # 文字高さ（dimtxt=34.2 に合わせる）
    _egap = 4        # 引出線と図形のギャップ
    _eovs = 8        # 引出線の寸法線突出量

    def _hdim(x1, x2, y_dim, y_obj, label):
        """水平寸法を手動描画: LINE引出線 + SOLID矢印 + MTEXT"""
        # 引出線（垂直）
        sign = 1 if y_dim > y_obj else -1
        msp.add_line((x1, y_obj + sign * _egap),
                     (x1, y_dim + sign * _eovs),
                     dxfattribs={"layer": _dlayer, "lineweight": _lw})
        msp.add_line((x2, y_obj + sign * _egap),
                     (x2, y_dim + sign * _eovs),
                     dxfattribs={"layer": _dlayer, "lineweight": _lw})
        # 寸法線（水平）と矢印
        span = abs(x2 - x1)
        if span >= 2 * _alen:
            # 矢印内向き（通常）
            msp.add_line((x1 + _alen, y_dim), (x2 - _alen, y_dim),
                         dxfattribs={"layer": _dlayer, "lineweight": _lw})
            msp.add_solid([(x1, y_dim), (x1 + _alen, y_dim + _aw),
                           (x1 + _alen, y_dim - _aw)],
                          dxfattribs={"layer": _dlayer})
            msp.add_solid([(x2, y_dim), (x2 - _alen, y_dim + _aw),
                           (x2 - _alen, y_dim - _aw)],
                          dxfattribs={"layer": _dlayer})
        else:
            # 矢印外向き（短い寸法）
            msp.add_line((x1, y_dim), (x2, y_dim),
                         dxfattribs={"layer": _dlayer, "lineweight": _lw})
            msp.add_solid([(x1, y_dim), (x1 - _alen, y_dim + _aw),
                           (x1 - _alen, y_dim - _aw)],
                          dxfattribs={"layer": _dlayer})
            msp.add_solid([(x2, y_dim), (x2 + _alen, y_dim + _aw),
                           (x2 + _alen, y_dim - _aw)],
                          dxfattribs={"layer": _dlayer})
        # テキスト（寸法線の中央上）
        cx = (x1 + x2) / 2
        txt_x = cx - len(str(label)) * _th * 0.3
        txt_y = y_dim + (sign * _th * 0.15)
        msp.add_mtext(str(label), dxfattribs={
            "layer": _dlayer, "char_height": _th,
            "insert": (txt_x, txt_y),
        })

    # ── 全長寸法（パイプ上方） ──
    dim_total_y = REF_PIPE_TOP + 200
    _hdim(new_pipe_left, new_pipe_right, dim_total_y, REF_PIPE_TOP, length_mm)

    # ── セグメント寸法（座金の間隔、パイプ下方） ──
    seg_y = REF_WASHER_Y - 22.5 - 80   # 寸法線Y
    seg_obj_y = REF_WASHER_Y - 22.5    # 計測点Y（座金外縁）
    all_offsets = [0] + washer_positions + [length_mm]
    for i in range(len(all_offsets) - 1):
        x1 = new_pipe_left + all_offsets[i]
        x2 = new_pipe_left + all_offsets[i + 1]
        seg_len = round(all_offsets[i + 1] - all_offsets[i])
        _hdim(x1, x2, seg_y, seg_obj_y, seg_len)

    # 側面図寸法
    wall_left_face = new_pipe_left - 185.4
    side_pipe_cx = new_pipe_left - 132.7   # パイプ断面中心X
    side_pipe_top = 196.8 + 12.7           # パイプ断面上端 = 209.5

    # 寸法40と45をLINE+SOLID(矢印)+MTEXTで手動描画
    lw_dim = 5
    dim_layer = "寸法"
    dim_h = 30
    arrow_len = 15  # 矢印の長さ
    arrow_half_w = 4  # 矢印の半幅
    ext_gap = 3  # 引出線の図形側ギャップ
    ext_overshoot = 8  # 引出線の寸法線突出量

    # ── 寸法40: 水平、壁面→壁面+40mm、パイプ上方に表記 ──
    dim40_left = wall_left_face
    dim40_right = wall_left_face + 40
    dim40_line_y = side_pipe_top + 50

    # 引出線（垂直）: 図形側にギャップ、寸法線を少し超える
    msp.add_line((dim40_left, side_pipe_top + ext_gap), (dim40_left, dim40_line_y + ext_overshoot),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    msp.add_line((dim40_right, side_pipe_top + ext_gap), (dim40_right, dim40_line_y + ext_overshoot),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    # 寸法線（水平、矢印の内側のみ）
    msp.add_line((dim40_left + arrow_len, dim40_line_y), (dim40_right - arrow_len, dim40_line_y),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    # 矢印（左向き＝左端）
    msp.add_solid(
        [(dim40_left, dim40_line_y),
         (dim40_left + arrow_len, dim40_line_y + arrow_half_w),
         (dim40_left + arrow_len, dim40_line_y - arrow_half_w)],
        dxfattribs={"layer": dim_layer})
    # 矢印（右向き＝右端）
    msp.add_solid(
        [(dim40_right, dim40_line_y),
         (dim40_right - arrow_len, dim40_line_y + arrow_half_w),
         (dim40_right - arrow_len, dim40_line_y - arrow_half_w)],
        dxfattribs={"layer": dim_layer})
    # 数字（下線中央直上）
    msp.add_mtext("40", dxfattribs={
        "layer": dim_layer, "char_height": dim_h,
        "insert": ((dim40_left + dim40_right) / 2 - 24, dim40_line_y + dim_h + 8),
    })

    # ── 寸法45: 垂直、壁面高さ、壁面の左に表記 ──
    dim45_top = 183.8
    dim45_bot = 138.8
    dim45_line_x = wall_left_face - 80

    # 引出線（水平）: 図形側にギャップ、寸法線を少し超える
    msp.add_line((wall_left_face - ext_gap, dim45_top), (dim45_line_x - ext_overshoot, dim45_top),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    msp.add_line((wall_left_face - ext_gap, dim45_bot), (dim45_line_x - ext_overshoot, dim45_bot),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    # 寸法線（垂直、矢印の内側のみ）
    msp.add_line((dim45_line_x, dim45_bot + arrow_len), (dim45_line_x, dim45_top - arrow_len),
                 dxfattribs={"layer": dim_layer, "lineweight": lw_dim})
    # 矢印（下向き＝下端）
    msp.add_solid(
        [(dim45_line_x, dim45_bot),
         (dim45_line_x - arrow_half_w, dim45_bot + arrow_len),
         (dim45_line_x + arrow_half_w, dim45_bot + arrow_len)],
        dxfattribs={"layer": dim_layer})
    # 矢印（上向き＝上端）
    msp.add_solid(
        [(dim45_line_x, dim45_top),
         (dim45_line_x - arrow_half_w, dim45_top - arrow_len),
         (dim45_line_x + arrow_half_w, dim45_top - arrow_len)],
        dxfattribs={"layer": dim_layer})
    # 数字（寸法線の左、重ならないよう十分離す）
    msp.add_mtext("45", dxfattribs={
        "layer": dim_layer, "char_height": dim_h,
        "insert": (dim45_line_x - dim_h - 25, (dim45_top + dim45_bot) / 2 + 15),
    })

    # ========================================
    #  4. 側面図をシフト
    # ========================================
    _shift_side_view(msp, pipe_shift)

    # ========================================
    #  5. テキスト更新
    # ========================================
    for e in msp:
        if e.dxftype() == 'MTEXT':
            text = e.text or ''

            if abs(e.dxf.char_height - 175.9) < 1:  # 製品名
                e.text = product_name + '\\P'
            elif 'マットブラック' in text:
                e.text = color
            elif 'stkm' in text.lower():
                e.text = material
            elif '0度' in text:
                if angle_deg > 0:
                    dir_t = angle_dir.replace('left', '左').replace('right', '右')
                    e.text = f'{dir_t}{angle_deg}度'

    # ========================================
    #  6. 引出注記（INSERT Callout）を削除
    # ========================================
    # 表題欄に素材情報があるので25.4φ注記は不要
    for e in list(msp):
        if e.dxftype() == 'INSERT' and e.dxf.name == 'Callout':
            msp.delete_entity(e)

    # ========================================
    #  7. 簡易表（参考DXFの情報表）を削除
    # ========================================
    _delete_simple_table(msp)

    # ========================================
    #  8. 側面図の重複線を削除
    # ========================================
    _deduplicate_side_view_lines(msp)

    # ========================================
    #  9. JIS図面要素を追加
    # ========================================
    _add_jis_elements(msp, doc, length_mm, product_name, material, color,
                      angle_deg, angle_dir, washer_positions, customer_name)

    # ========================================
    #  保存
    # ========================================
    if output_path is None:
        output_path = f"/tmp/handrail_{product_name}_{length_mm}.dxf"
    doc.saveas(output_path)
    return output_path


def _delete_simple_table(msp):
    """参考DXFの簡易情報表（Y < -250）を全て削除"""
    to_delete = []
    for e in msp:
        etype = e.dxftype()
        if etype == 'MTEXT':
            if e.dxf.insert.y < -250:
                to_delete.append(e)
        elif etype == 'LINE':
            if e.dxf.start.y < -250 or e.dxf.end.y < -250:
                to_delete.append(e)
        elif etype in ('POLYLINE', 'LWPOLYLINE'):
            pts = list(e.points()) if etype == 'POLYLINE' else list(e.get_points())
            ys = [p[1] for p in pts]
            if min(ys) < -250:
                to_delete.append(e)
    for e in to_delete:
        msp.delete_entity(e)


def _deduplicate_side_view_lines(msp):
    """側面図の重複LINE/SPLINEを削除（同じ座標の線を1本だけ残す）"""
    seen = set()
    to_delete = []
    for e in msp:
        if e.dxftype() == 'LINE':
            sx, sy = round(e.dxf.start.x, 1), round(e.dxf.start.y, 1)
            ex, ey = round(e.dxf.end.x, 1), round(e.dxf.end.y, 1)
            key = (sx, sy, ex, ey)
            if key in seen:
                to_delete.append(e)
            else:
                seen.add(key)
        elif e.dxftype() == 'ARC':
            cx = round(e.dxf.center.x, 1)
            cy = round(e.dxf.center.y, 1)
            r = round(e.dxf.radius, 1)
            sa = round(e.dxf.start_angle, 0)
            ea = round(e.dxf.end_angle, 0)
            key = ('ARC', cx, cy, r, sa, ea)
            if key in seen:
                to_delete.append(e)
            else:
                seen.add(key)
        elif e.dxftype() == 'SPLINE':
            ctrl = list(e.control_points)
            if ctrl:
                key = ('SPL', tuple((round(p[0],1), round(p[1],1)) for p in ctrl))
                if key in seen:
                    to_delete.append(e)
                else:
                    seen.add(key)
    for e in to_delete:
        msp.delete_entity(e)


def _add_jis_elements(msp, doc, length_mm, product_name, material, color,
                      angle_deg, angle_dir, washer_positions, customer_name=""):
    """
    JIS B 0001 / JIS Z 8311 準拠の図面要素を追加（Matrix44変換なし）

    方針:
    - 図面エンティティはDXF元座標（1:1 mm）のまま一切変換しない
    - JIS図枠・表題欄を「1:N スケール」の図面単位で描く
    - N は描画範囲に合わせて自動選択（1/2/5/10/20/50/100）
    - テキスト高さ・寸法もすべてN倍で指定
    → CADで「1:N」印刷すればA4にピッタリ収まる
    """
    from ezdxf import bbox as ezdxf_bbox
    from datetime import date

    # ── A4横 図枠（JIS Z 8311） ──
    # A4横: 297×210mm
    # マージン: 左20mm（綴じ代）、他10mm
    a4_w = 297
    a4_h = 210
    margin_bind = 20  # 左（綴じ代）
    margin_other = 10

    # ── 描画範囲を取得 ──
    cache = ezdxf_bbox.Cache()
    ext = ezdxf_bbox.extents(msp, cache=cache)
    if not ext.has_data:
        return

    draw_w = ext.extmax.x - ext.extmin.x
    draw_h = ext.extmax.y - ext.extmin.y
    draw_cx = (ext.extmin.x + ext.extmax.x) / 2
    draw_cy = (ext.extmin.y + ext.extmax.y) / 2

    # ── 尺度を自動選択（1:N） ──
    # A4横: 図面有効幅 267mm、表題欄除く高さ 145mm
    avail_w_mm = 247.0
    avail_h_mm = 145.0
    raw_scale = max(draw_w / avail_w_mm, draw_h / avail_h_mm)
    std_scales = [1, 2, 5, 10, 20, 50, 100]
    N = next((s for s in std_scales if s >= raw_scale), 100)

    # ── A4横 図枠サイズ（図面単位 = mm × N） ──
    a4_w_mm   = 297.0
    a4_h_mm   = 210.0
    mb_mm     = 20.0   # 左綴じ代
    mo_mm     = 10.0   # 他マージン
    frame_w_mm = a4_w_mm - mb_mm - mo_mm   # 267mm
    frame_h_mm = a4_h_mm - mo_mm * 2       # 190mm
    tb_h_mm   = 40.0   # 表題欄高さ

    # 図面単位へ変換
    FW  = frame_w_mm * N   # 図枠幅
    FH  = frame_h_mm * N   # 図枠高さ
    TBH = tb_h_mm * N      # 表題欄高さ

    # ── 図枠配置（描画中心に合わせ、下部に表題欄を置く） ──
    # 図面は図枠上部に、表題欄は図枠下部に
    frame_cx     = draw_cx
    frame_cy     = draw_cy + TBH / 2   # 図面分を上にずらす
    frame_left   = frame_cx - FW / 2
    frame_right  = frame_cx + FW / 2
    frame_bottom = frame_cy - FH / 2
    frame_top    = frame_cy + FH / 2
    tb_top       = frame_bottom + TBH
    tb_bottom    = frame_bottom

    # ── フォントスタイル登録（TTF明朝） ──
    style_names = [s.dxf.name for s in doc.styles]
    mincho_style = "Mincho"
    if mincho_style not in style_names:
        s = doc.styles.new(mincho_style)
        try:
            s.set_extended_font_data(family="Hiragino Mincho ProN", italic=False, bold=False)
        except Exception:
            s.dxf.font = "HiraginoMinchoPro.ttc"
    if "ProductName" not in style_names:
        pn = doc.styles.new("ProductName")
        try:
            pn.set_extended_font_data(family="Hiragino Mincho ProN", italic=False, bold=False)
        except Exception:
            pn.dxf.font = "HiraginoMinchoPro.ttc"

    jis_layer = "寸法"
    lw_frame = 50
    lw_inner = 25
    lw_thin  = 13

    # テキスト高さ（A4印刷時の可読サイズ × N → 図面単位）
    th_label = 2.0 * N
    th_value = 2.5 * N
    th_prod  = 4.0 * N
    th_note  = 1.8 * N
    tx_off   = 2.0 * N    # 左マージン
    txt_style = mincho_style

    # ── 外枠（用紙境界）──
    outer_l = frame_left  - mb_mm * N
    outer_r = frame_right + mo_mm * N
    outer_b = frame_bottom - mo_mm * N
    outer_t = frame_top  + mo_mm * N
    msp.add_lwpolyline(
        [(outer_l, outer_t), (outer_r, outer_t),
         (outer_r, outer_b), (outer_l, outer_b)],
        close=True,
        dxfattribs={"layer": jis_layer, "lineweight": lw_thin},
    )

    # ── 図枠（内枠線） ──
    msp.add_lwpolyline(
        [(frame_left, frame_top), (frame_right, frame_top),
         (frame_right, frame_bottom), (frame_left, frame_bottom)],
        close=True,
        dxfattribs={"layer": jis_layer, "lineweight": lw_frame},
    )

    # ── 中心マーク ──
    mk = 5.0 * N
    fcx = (frame_left + frame_right) / 2
    fcy = (frame_top + frame_bottom) / 2
    for p1, p2 in [
        ((fcx, frame_top), (fcx, frame_top + mk)),
        ((fcx, frame_bottom), (fcx, frame_bottom - mk)),
        ((frame_left, fcy), (frame_left - mk, fcy)),
        ((frame_right, fcy), (frame_right + mk, fcy)),
    ]:
        msp.add_line(p1, p2, dxfattribs={"layer": jis_layer, "lineweight": lw_thin})

    # ── 表題欄（図枠下部、幅40%、中央） ──
    tb_w   = FW * 0.4
    tb_cx  = (frame_left + frame_right) / 2
    tb_l   = tb_cx - tb_w / 2
    tb_r   = tb_cx + tb_w / 2
    msp.add_lwpolyline(
        [(tb_l, tb_top), (tb_r, tb_top),
         (tb_r, tb_bottom), (tb_l, tb_bottom)],
        close=True,
        dxfattribs={"layer": jis_layer, "lineweight": lw_inner},
    )

    # 行
    num_rows = 7
    row_h = TBH / num_rows
    for i in range(1, num_rows):
        y = tb_top - i * row_h
        msp.add_line((tb_l, y), (tb_r, y), dxfattribs={"layer": jis_layer, "lineweight": lw_thin})

    # 縦罫線
    lbl_w = tb_w * 0.25
    col1 = tb_l + lbl_w
    col2 = col1 + (tb_r - col1) / 2
    msp.add_line((col1, tb_top), (col1, tb_bottom), dxfattribs={"layer": jis_layer, "lineweight": lw_thin})
    msp.add_line((col2, tb_top - 4 * row_h), (col2, tb_top - 6 * row_h), dxfattribs={"layer": jis_layer, "lineweight": lw_thin})

    def _ry(i):
        return tb_top - i * row_h - row_h * 0.35

    # 各行テキスト
    rows = [
        ("図面名", None, None),
        ("図番",   f"IW-{product_name.upper()[:3]}-{length_mm}", th_value),
        ("材質",   material,   th_value),
        ("仕上げ", color,      th_value),
        ("尺度",   None,       th_value),
        ("設計",   None,       th_value),
        ("お客様名", customer_name, th_value),
    ]
    for i, (lbl, val, vh) in enumerate(rows):
        msp.add_mtext(lbl, dxfattribs={
            "layer": jis_layer, "char_height": th_label,
            "style": txt_style, "insert": (tb_l + tx_off, _ry(i)),
        })
        if val is not None:
            msp.add_mtext(val, dxfattribs={
                "layer": jis_layer, "char_height": vh,
                "style": txt_style, "insert": (col1 + tx_off, _ry(i)),
            })

    # Row 0: 商品名 + 横型手すり寸法テキスト
    msp.add_mtext(product_name.upper(), dxfattribs={
        "layer": jis_layer, "char_height": th_prod,
        "style": "ProductName", "insert": (col1 + tx_off, _ry(0)),
    })
    pw = len(product_name) * th_prod * 0.7
    msp.add_mtext(f"\u3000横型手すり {length_mm}mm", dxfattribs={
        "layer": jis_layer, "char_height": th_note,
        "style": txt_style, "insert": (col1 + tx_off + pw + 2 * N, _ry(0) - th_note * 0.5),
    })

    # Row 4: 尺度 | 投影法
    msp.add_mtext(f"1 : {N}", dxfattribs={
        "layer": jis_layer, "char_height": th_value, "style": txt_style,
        "insert": (col1 + tx_off, _ry(4))})
    msp.add_mtext("投影法", dxfattribs={
        "layer": jis_layer, "char_height": th_label, "style": txt_style,
        "insert": (col2 + tx_off, _ry(4))})
    msp.add_mtext("第三角法", dxfattribs={
        "layer": jis_layer, "char_height": th_value, "style": txt_style,
        "insert": (col2 + tx_off + 12 * N, _ry(4))})

    # Row 5: 設計 | 日付
    msp.add_mtext("蠣崎 良治", dxfattribs={
        "layer": jis_layer, "char_height": th_value, "style": txt_style,
        "insert": (col1 + tx_off, _ry(5))})
    msp.add_mtext("日付", dxfattribs={
        "layer": jis_layer, "char_height": th_label, "style": txt_style,
        "insert": (col2 + tx_off, _ry(5))})
    msp.add_mtext(date.today().strftime("%Y-%m-%d"), dxfattribs={
        "layer": jis_layer, "char_height": th_value, "style": txt_style,
        "insert": (col2 + tx_off + 8 * N, _ry(5))})

    # ── 三角法記号（表題欄右横） ──
    sym_cx = tb_r + 15 * N
    sym_cy = (tb_top + tb_bottom) / 2
    tw_b, tw_t, th_sym = 6 * N, 3 * N, 8 * N
    msp.add_lwpolyline(
        [(sym_cx - tw_b/2, sym_cy - th_sym/2),
         (sym_cx + tw_b/2, sym_cy - th_sym/2),
         (sym_cx + tw_t/2, sym_cy + th_sym/2),
         (sym_cx - tw_t/2, sym_cy + th_sym/2)],
        close=True,
        dxfattribs={"layer": jis_layer, "lineweight": lw_inner},
    )
    proj_cx = sym_cx + 12 * N
    proj_r  = 3 * N
    msp.add_circle((proj_cx, sym_cy), proj_r,       dxfattribs={"layer": jis_layer, "lineweight": lw_inner})
    msp.add_circle((proj_cx, sym_cy), proj_r * 0.3, dxfattribs={"layer": jis_layer, "lineweight": lw_inner})
    cl = proj_r + 2 * N
    msp.add_line((proj_cx - cl, sym_cy), (proj_cx + cl, sym_cy), dxfattribs={"layer": jis_layer, "lineweight": lw_thin})
    msp.add_line((proj_cx, sym_cy - cl), (proj_cx, sym_cy + cl), dxfattribs={"layer": jis_layer, "lineweight": lw_thin})


def _get_end_dist(length_mm):
    if length_mm > 1000:
        return 100
    return (length_mm // 100) * 10


def _calc_washer_count(length_mm):
    if length_mm <= 1050:
        return 2
    inner = length_mm - 2 * _get_end_dist(length_mm)
    return 1 + math.ceil(inner / 900)


def dxf_to_svg(dxf_path, svg_path=None):
    if svg_path is None:
        svg_path = dxf_path.replace(".dxf", ".svg")
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    ctx = RenderContext(doc)
    backend = SVGBackend()
    # 線幅をSVG表示用に細くする（lineweight_scaling）
    try:
        from ezdxf.addons.drawing import Configuration
        cfg = Configuration.defaults()
        cfg = cfg.replace(lineweight_scaling=0.5)
        frontend = Frontend(ctx, backend, config=cfg)
    except Exception:
        frontend = Frontend(ctx, backend)
    frontend.draw_layout(msp)
    # fit_page: 全エンティティをA4に自動フィット
    try:
        page = layout.Page(297, 210, layout.Units.mm,
                           margins=layout.Margins.all(5))
        svg = backend.get_string(page, settings=layout.Settings(scale=layout.Scale.fit_page))
    except Exception:
        page = layout.Page(297, 210)
        svg = backend.get_string(page)
    with open(svg_path, 'w') as f:
        f.write(svg)
    return svg_path


if __name__ == "__main__":
    # テスト1: 同条件（2500mm, 座金4点）
    print("=== Test 1: 2500mm, 4w ===")
    d1 = generate_from_template(length_mm=2500, washer_positions=[100, 867, 1633, 2400], product_name="rune")
    s1 = dxf_to_svg(d1, '/tmp/test1.svg')
    print(f"  {d1} -> {s1}")

    # テスト2: 3000mm, 座金5点
    print("=== Test 2: 3000mm, 5w ===")
    d2 = generate_from_template(length_mm=3000, washer_positions=[100, 800, 1500, 2200, 2900], product_name="rune")
    s2 = dxf_to_svg(d2, '/tmp/test2.svg')
    print(f"  {d2} -> {s2}")

    # テスト3: 1500mm, 座金3点
    print("=== Test 3: 1500mm, 3w ===")
    d3 = generate_from_template(length_mm=1500, washer_positions=[100, 750, 1400], product_name="rune")
    s3 = dxf_to_svg(d3, '/tmp/test3.svg')
    print(f"  {d3} -> {s3}")
