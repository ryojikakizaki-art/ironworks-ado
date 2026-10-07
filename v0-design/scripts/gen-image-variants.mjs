// public/images/ の写真から、表示幅ごとの縮小版を public/_v/<幅>/images/... に作る。
//
// なぜ必要か:
//   Vercel の画像最適化は月間枠超過で 402 を返す事故があり止めている（next.config.mjs の
//   images 参照）。そのままだと一覧の小さな枠にも原寸 JPEG が載り、着地ページが 10MB 超・
//   モバイル LCP 50 秒台になっていた（2026-09-27 Lighthouse 実測）。
//   ビルド時に自前で縮小版を作り、lib/image-loader.ts が srcset でそれを指す。
//
// 安全側の設計:
//   - sharp が読めない / 1 枚の変換に失敗した → 原寸をそのままコピーする。
//     loader が指す URL は必ず存在するので、画像が消えることはない（軽くならないだけ）。
//   - 縮小しても原寸より重くなった場合も原寸をコピー。

import { createRequire } from "module"
import { copyFile, mkdir, readdir, stat, writeFile } from "fs/promises"
import { dirname, extname, join, relative } from "path"

// lib/image-loader.ts の VARIANT_WIDTHS と必ず一致させる
export const VARIANT_WIDTHS = [384, 640, 828, 1200]
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"])

function loadSharp(rootDir) {
  const req = createRequire(join(rootDir, "package.json"))
  try {
    return req("sharp")
  } catch {}
  try {
    // pnpm では sharp は next の optionalDependency としてのみ入り、直下から見えない
    return createRequire(req.resolve("next/package.json"))("sharp")
  } catch {}
  return null
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(p)))
    else if (RASTER.has(extname(entry.name).toLowerCase())) out.push(p)
  }
  return out
}

async function isFresh(outPath, srcMtime) {
  try {
    return (await stat(outPath)).mtimeMs >= srcMtime
  } catch {
    return false
  }
}

function encode(pipeline, ext) {
  if (ext === ".png") return pipeline.png({ compressionLevel: 9 })
  if (ext === ".webp") return pipeline.webp({ quality: 78 })
  return pipeline.jpeg({ quality: 78, mozjpeg: true })
}

export async function generateImageVariants(rootDir) {
  const publicDir = join(rootDir, "public")
  const srcDir = join(publicDir, "images")
  const outRoot = join(publicDir, "_v")
  const sharp = loadSharp(rootDir)
  if (!sharp) console.warn("[image-variants] sharp が見つからないため原寸をコピーします")

  const files = await walk(srcDir)
  const started = Date.now()
  let resized = 0
  let copied = 0

  for (const src of files) {
    const ext = extname(src).toLowerCase()
    const rel = relative(publicDir, src) // images/...
    const srcStat = await stat(src)
    for (const w of VARIANT_WIDTHS) {
      const out = join(outRoot, String(w), rel)
      if (await isFresh(out, srcStat.mtimeMs)) continue
      await mkdir(dirname(out), { recursive: true })
      if (!sharp) {
        await copyFile(src, out)
        copied++
        continue
      }
      try {
        const buf = await encode(
          sharp(src).rotate().resize({ width: w, withoutEnlargement: true }),
          ext,
        ).toBuffer()
        if (buf.length >= srcStat.size) {
          await copyFile(src, out)
          copied++
        } else {
          await writeFile(out, buf)
          resized++
        }
      } catch (e) {
        console.warn(`[image-variants] ${rel} @${w}px 失敗 → 原寸をコピー: ${e?.message ?? e}`)
        await copyFile(src, out)
        copied++
      }
    }
  }

  console.log(
    `[image-variants] ${files.length} 枚 × ${VARIANT_WIDTHS.length} 幅: 縮小 ${resized} / 原寸コピー ${copied} (${Date.now() - started}ms)`,
  )
}
