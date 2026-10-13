// 蔦（室内階段手摺）の側面形状。設計図（stair-svg.ts の vine 分岐）で使う。
//
// 2026-10-11 蠣﨑さん指示「全て曲線の手すりなので、直線的な図だと混乱させてしまう。
// 実物写真4（ギャラリー4枚目 e567a5fc77ff175fcd67）をトレース」により、写真から画像処理で
// 中心線を抽出してプロファイル化した（ado作業ファイル/tsuta-stair-curve/ の trace_photo4.py →
// build_profile.py → export_profile_ts.py）。目視で描いた曲線ではない。
//
// 構成（本人確認済み）:
//  ① 握り手: 壁から勾配なりに下り、最下段の手前で外へ膨らんでから階段側へ戻りつつ床に着地
//  ② 柱: 踏み板から立ち上がり、握り手を越えて上り側へ輪を描いて握り手に戻る（3段目・5段目）
//  ③ 枝: 柱の途中から下り側へ弧を描いて握り手に流れ込む
// 写真は勾配約20°・室内階段は約40°なので、比率（弦長比・柱長比）で持って当てはめ、
// 枝の弓は握り手を突き抜けない範囲で浅くする。

type Pt = [number, number]

/** 符号の約束は export_profile_ts.py の冒頭を参照 */
const PROFILE = {
  slopeUp: [0.0000, -0.0038, -0.0067, -0.0090, -0.0108, -0.0120, -0.0131, -0.0139, -0.0143, -0.0143, -0.0138, -0.0128, -0.0113, -0.0096, -0.0077, -0.0056, -0.0034, -0.0011, 0.0013, 0.0039, 0.0064, 0.0088, 0.0110, 0.0128, 0.0140, 0.0148, 0.0150, 0.0145, 0.0133, 0.0115, 0.0088, 0.0050, 0.0000],
  crook: [[-0.1771, 1.0000], [-0.1587, 0.9885], [-0.1408, 0.9763], [-0.1234, 0.9635], [-0.1064, 0.9501], [-0.0899, 0.9360], [-0.0740, 0.9213], [-0.0586, 0.9061], [-0.0436, 0.8904], [-0.0291, 0.8744], [-0.0150, 0.8579], [-0.0013, 0.8411], [0.0118, 0.8239], [0.0246, 0.8064], [0.0368, 0.7885], [0.0485, 0.7703], [0.0597, 0.7517], [0.0702, 0.7328], [0.0800, 0.7135], [0.0891, 0.6938], [0.0973, 0.6738], [0.1045, 0.6533], [0.1107, 0.6326], [0.1159, 0.6115], [0.1198, 0.5902], [0.1226, 0.5688], [0.1243, 0.5472], [0.1248, 0.5255], [0.1242, 0.5039], [0.1227, 0.4823], [0.1202, 0.4607], [0.1169, 0.4393], [0.1128, 0.4181], [0.1082, 0.3969], [0.1030, 0.3759], [0.0974, 0.3550], [0.0914, 0.3341], [0.0853, 0.3134], [0.0789, 0.2926], [0.0725, 0.2720], [0.0660, 0.2513], [0.0596, 0.2306], [0.0532, 0.2099], [0.0469, 0.1892], [0.0408, 0.1684], [0.0350, 0.1475], [0.0293, 0.1266], [0.0239, 0.1056], [0.0188, 0.0846], [0.0138, 0.0635], [0.0091, 0.0424], [0.0045, 0.0212], [0.0000, 0.0000]],
  postUphill: [0.0000, 0.0009, 0.0013, 0.0012, 0.0006, -0.0003, -0.0017, -0.0036, -0.0057, -0.0082, -0.0112, -0.0147, -0.0186, -0.0226, -0.0267, -0.0308, -0.0347, -0.0385, -0.0420, -0.0450, -0.0474, -0.0490, -0.0498, -0.0495, -0.0478, -0.0445, -0.0391, -0.0311, -0.0197, -0.0042, 0.0171, -0.0168, 0.0000],
  postLean: 0.0273,
  loop: [[0.0000, -0.0015], [-0.0220, 0.0153], [-0.0440, 0.0298], [-0.0659, 0.0422], [-0.0879, 0.0527], [-0.1172, 0.0607], [-0.1392, 0.0657], [-0.1685, 0.0676], [-0.1905, 0.0662], [-0.2198, 0.0618], [-0.2417, 0.0547], [-0.2710, 0.0446], [-0.2930, 0.0327], [-0.3150, 0.0198], [-0.3370, 0.0074], [-0.3589, -0.0032], [-0.3882, -0.0104], [-0.4102, -0.0133]],
  branch: [[0.1831, -0.3444], [0.1978, -0.3248], [0.2198, -0.3054], [0.2344, -0.2862], [0.2491, -0.2673], [0.2637, -0.2487], [0.2857, -0.2304], [0.3003, -0.2125], [0.3150, -0.1949], [0.3370, -0.1777], [0.3516, -0.1609], [0.3736, -0.1445], [0.3956, -0.1284], [0.4102, -0.1126], [0.4322, -0.0973], [0.4542, -0.0824], [0.4688, -0.0680], [0.4908, -0.0541], [0.5128, -0.0408], [0.5347, -0.0281], [0.5567, -0.0162], [0.5787, -0.0052], [0.5933, 0.0000], [0.6153, 0.0000], [0.6373, 0.0000], [0.6593, 0.0000], [0.6886, 0.0000], [0.7105, 0.0000], [0.7325, 0.0000], [0.7545, 0.0000]],
  branchF0: 0.6205,
  branchBowUp: [0.0000, 0.0196, 0.0382, 0.0559, 0.0725, 0.0881, 0.1025, 0.1158, 0.1281, 0.1394, 0.1497, 0.1590, 0.1673, 0.1747, 0.1812, 0.1867, 0.1913, 0.1946, 0.1967, 0.1976, 0.1972, 0.1954, 0.1920, 0.1868, 0.1794, 0.1694, 0.1567, 0.1408, 0.1210, 0.0967, 0.0681, 0.0360, 0.0000],
} as const

/** 握り手の下端（床の着地）: 1段目の段鼻から手前へ (mm)。10/11「もっと階段に寄せる」 */
export const TSUTA_FOOT_OUT_MM = 150
/** 握り手の角（勾配区間と弧のつなぎ）をならす移動平均の半幅 (mm) */
const FILLET_MM = 160

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]]
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
const len = (a: Pt) => Math.hypot(a[0], a[1])
const unit = (a: Pt): Pt => mul(a, 1 / (len(a) || 1))
/** a に直交する単位ベクトルのうち上向き（y>0）のもの */
const upNormal = (a: Pt): Pt => {
  const u = unit(a)
  const n: Pt = [-u[1], u[0]]
  return n[1] >= 0 ? n : [-n[0], -n[1]]
}

function arcLengths(p: Pt[]): number[] {
  const s = [0]
  for (let i = 1; i < p.length; i++) s.push(s[i - 1] + len(sub(p[i], p[i - 1])))
  return s
}

function resample(p: Pt[], step: number): Pt[] {
  const s = arcLengths(p)
  const total = s[s.length - 1]
  const n = Math.max(2, Math.round(total / step))
  const out: Pt[] = []
  let j = 0
  for (let k = 0; k <= n; k++) {
    const t = (total * k) / n
    while (j < s.length - 2 && s[j + 1] < t) j++
    const f = (t - s[j]) / ((s[j + 1] - s[j]) || 1)
    out.push(add(p[j], mul(sub(p[j + 1], p[j]), f)))
  }
  return out
}

/** 等間隔に引き直して移動平均。両端の外に接線方向の仮想点を足してから全点フル窓で平滑化（端の凹み防止）・端点は固定 */
function fillet(path: Pt[], step: number, win: number): Pt[] {
  const a = resample(path, step)
  const m = Math.max(1, Math.round(win / step))
  const t0 = unit(sub(a[0], a[Math.min(3, a.length - 1)]))
  const t1 = unit(sub(a[a.length - 1], a[Math.max(0, a.length - 4)]))
  const ext: Pt[] = []
  for (let k = m; k >= 1; k--) ext.push(add(a[0], mul(t0, step * k)))
  ext.push(...a)
  for (let k = 1; k <= m; k++) ext.push(add(a[a.length - 1], mul(t1, step * k)))
  const out: Pt[] = []
  for (let i = m; i < ext.length - m; i++) {
    let sx = 0, sy = 0
    for (let k = -m; k <= m; k++) { sx += ext[i + k][0]; sy += ext[i + k][1] }
    out.push([sx / (2 * m + 1), sy / (2 * m + 1)])
  }
  out[0] = a[0]
  out[out.length - 1] = a[a.length - 1]
  return out
}

export interface TsutaShapeInput {
  noseX: number[]
  noseY: number[]
  going: number
  lastTreadMm: number
  /** 握り手が壁に当たる点（x）と、その高さを返す勾配線（段鼻＋手すり高さ） */
  railEndX: number
  railAt: (x: number) => number
  /** 途中の柱を立てる段（1 始まり） */
  postSteps: number[]
}

export interface TsutaPost {
  foot: Pt
  post: Pt[]
  loop: Pt[]
  branch: Pt[]
}

export interface TsutaShape {
  /** 握り手: 壁 → 勾配区間 → 弧 → 床の着地 */
  main: Pt[]
  foot: Pt
  posts: TsutaPost[]
  minX: number
  maxY: number
}

export function buildTsutaShape(inp: TsutaShapeInput): TsutaShape {
  const { noseX, noseY, going, lastTreadMm, railEndX, railAt, postSteps } = inp
  const steps = noseX.length
  // ── 弧: 床の着地 F' から、弧の始まり S' が勾配線に乗る縮尺 k で写真の比率どおりに描く ──
  const F: Pt = [noseX[0] - TSUTA_FOOT_OUT_MM, 0]
  const s0 = PROFILE.crook[0] // 弧の始まり（下り正・弧の高さ比）
  const slope = (railAt(railEndX) - railAt(noseX[0])) / (railEndX - noseX[0])
  // k = railAt(F.x - s0.x*k) = railAt(F.x) - slope*s0.x*k  →  k = railAt(F.x) / (s0.y + slope*s0.x)
  const k = railAt(F[0]) / (s0[1] + slope * s0[0])
  const crook: Pt[] = PROFILE.crook.map(([dx, dy]) => [F[0] - dx * k, dy * k] as Pt)
  const S = crook[0]
  // ── 勾配区間: 壁の点 W' → S' の弦に、写真の偏差（弦長比）を上向きに加える ──
  const W: Pt = [railEndX, railAt(railEndX)]
  const c = sub(S, W)
  const Lc = len(c)
  const nUp = upNormal(c)
  const slopePart: Pt[] = PROFILE.slopeUp.map((d, i) => {
    const t = i / (PROFILE.slopeUp.length - 1)
    return add(add(W, mul(c, t)), mul(nUp, d * Lc))
  })
  const main = fillet([...slopePart, ...crook.slice(1)], 10, FILLET_MM)
  const sMain = arcLengths(main)

  const railPointAt = (sv: number): { p: Pt; nUp: Pt } => {
    const t = Math.min(Math.max(sv, 0), sMain[sMain.length - 1])
    let j = 0
    while (j < sMain.length - 2 && sMain[j + 1] < t) j++
    const f = (t - sMain[j]) / ((sMain[j + 1] - sMain[j]) || 1)
    const p = add(main[j], mul(sub(main[j + 1], main[j]), f))
    const a = main[Math.max(0, j - 3)]
    const b = main[Math.min(main.length - 1, j + 3)]
    return { p, nUp: upNormal(sub(b, a)) }
  }
  /** x の真上にある握り手の点（足元より上・勾配区間側） */
  const railAbove = (x: number, minY: number): number => {
    let best = -1, bestD = Infinity
    main.forEach((q, i) => {
      if (q[1] <= minY) return
      const d = Math.abs(q[0] - x)
      if (d < bestD) { bestD = d; best = i }
    })
    return best
  }

  const posts: TsutaPost[] = []
  for (const st of postSteps) {
    const i = st - 1
    if (i < 0 || i >= steps) continue
    const fx = i < steps - 1 ? noseX[i] + going / 2 : noseX[i] + lastTreadMm / 2
    const foot: Pt = [fx, noseY[i]]
    // 握り手との交点 J': 柱脚の真上付近（写真の傾きぶん下りへ）
    const iUp = railAbove(fx, foot[1])
    const h = main[iUp][1] - foot[1]
    const iJ = railAbove(fx - PROFILE.postLean * h, foot[1])
    const J = main[iJ]
    const sJ = sMain[iJ]
    const pj = sub(J, foot)
    const L = len(pj)
    const uphill: Pt = [unit(pj)[1], -unit(pj)[0]] // 柱の弦に直交・上り（右）向き
    const postRaw: Pt[] = PROFILE.postUphill.map((d, n) => {
      const t = n / (PROFILE.postUphill.length - 1)
      return add(add(foot, mul(pj, t)), mul(uphill, d * L))
    })
    const follow = (sn: readonly (readonly [number, number])[]): Pt[] =>
      sn.map(([sv, nv]) => {
        const r = railPointAt(sJ + sv * L)
        return add(r.p, mul(r.nUp, nv * L))
      })
    const loopRaw = follow(PROFILE.loop)
    // 柱→輪は一本の材なので、つなぎ目の折れを小さい窓でならす
    const pl = fillet([...postRaw, ...loopRaw.slice(1)], 6, 60)
    let iSplit = 0, dMin = Infinity
    pl.forEach((q, n) => { const d = len(sub(q, J)); if (d < dMin) { dMin = d; iSplit = n } })
    const post = pl.slice(0, iSplit + 1)
    const loop = pl.slice(iSplit)
    // 枝: 柱の高さ比 branchF0 の点 → 握り手上の合流点。弓は写真のまま、握り手を突き抜けるなら浅く
    const ty = foot[1] + (J[1] - foot[1]) * PROFILE.branchF0
    let B0 = post[0]
    for (const q of post) if (Math.abs(q[1] - ty) < Math.abs(B0[1] - ty)) B0 = q
    const B1 = railPointAt(sJ + PROFILE.branch[PROFILE.branch.length - 1][0] * L).p
    const cb = sub(B1, B0)
    const Lb = len(cb)
    const nb = upNormal(cb)
    const makeBranch = (scale: number): Pt[] =>
      PROFILE.branchBowUp.map((d, n) => {
        const t = n / (PROFILE.branchBowUp.length - 1)
        return add(add(B0, mul(cb, t)), mul(nb, d * Lb * scale))
      })
    let scale = 1
    let branch = makeBranch(scale)
    for (let it = 0; it < 12; it++) {
      const over = branch.slice(2, -3).some((q) => {
        const ir = railAbove(q[0], foot[1])
        return ir >= 0 && q[1] > main[ir][1] - 12
      })
      if (!over) break
      scale *= 0.85
      branch = makeBranch(scale)
    }
    posts.push({ foot, post, loop, branch })
  }

  const all = [main, ...posts.flatMap((p) => [p.post, p.loop, p.branch])].flat()
  return {
    main,
    foot: main[main.length - 1],
    posts,
    minX: Math.min(...all.map((q) => q[0])),
    maxY: Math.max(...all.map((q) => q[1])),
  }
}
