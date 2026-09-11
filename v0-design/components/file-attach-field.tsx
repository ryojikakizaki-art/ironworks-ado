"use client"

import { useRef, useState } from "react"
import { Paperclip } from "lucide-react"

/**
 * 図面・現場写真などをフォームから直接添付するための入力欄。
 *
 * ■ サイズ上限の根拠（重要）
 * Vercel Functions のリクエストボディ上限は **4.5MB**（プラン共通・超えると
 * 413 FUNCTION_PAYLOAD_TOO_LARGE）。したがって「1ファイル 10MB」のような
 * 上限を UI 側で謳っても、実際の送信は Vercel 側で弾かれる。
 * ここでは multipart のオーバーヘッド分を見込んで実効上限を 4MB に置き、
 * 画像はブラウザ内で長辺 1600px / JPEG q=0.82 に自動縮小してから積む
 * （サイト全体の画像圧縮標準と同じ数値）。
 * PDF は縮小できないため、大きい図面は上限超過としてメール送付へ誘導する。
 */

export const ATTACH_MAX_FILES = 5
export const ATTACH_MAX_FILE_BYTES = 4 * 1024 * 1024 // 4MB / file
export const ATTACH_MAX_TOTAL_BYTES = 4 * 1024 * 1024 // 4MB total（Vercel 4.5MB 制限内）

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]

// 自動縮小の基準（ec-rules-ui-design.md の画像掲載標準に合わせる）
const MAX_EDGE = 1600
const COMPRESS_QUALITY = 0.82
// これ以下の画像はそのまま通す（再エンコードで劣化だけ増やさない）
const COMPRESS_SKIP_BYTES = 600 * 1024

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 画像をブラウザ内で長辺 1600px の JPEG に縮小する。
 * HEIC など decode できない形式や、縮小して逆に大きくなる場合は元ファイルを返す。
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file
  if (file.size <= COMPRESS_SKIP_BYTES) return file
  if (typeof createImageBitmap !== "function") return file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const longEdge = Math.max(bitmap.width, bitmap.height)
    const scale = Math.min(1, MAX_EDGE / longEdge)
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", COMPRESS_QUALITY)
    )
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.(heic|heif|png|webp|jpeg|jpg)$/i, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified })
  } catch {
    // decode 不能（HEIC を扱えないブラウザ等）は元ファイルのまま
    return file
  }
}

export function FileAttachField({
  id,
  files,
  onFilesChange,
  label = "図面・現場写真の添付",
  optionalLabel = "任意",
  description,
}: {
  id: string
  files: File[]
  onFilesChange: (files: File[]) => void
  label?: string
  optionalLabel?: string
  description?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0)

  const handleFiles = async (incoming: FileList | null) => {
    setError("")
    if (!incoming || incoming.length === 0) return

    setProcessing(true)
    const next = [...files]
    let err = ""

    for (const raw of Array.from(incoming)) {
      if (next.length >= ATTACH_MAX_FILES) {
        err = `添付は最大 ${ATTACH_MAX_FILES} 件までです。`
        break
      }
      const isImage = raw.type.startsWith("image/")
      const isPdf = raw.type === "application/pdf"
      if (!isImage && !isPdf && !ALLOWED_TYPES.includes(raw.type)) {
        err = `「${raw.name}」はサポート外の形式です（画像 または PDF のみ）`
        continue
      }

      const f = isImage ? await compressImage(raw) : raw

      if (f.size > ATTACH_MAX_FILE_BYTES) {
        err = isPdf
          ? `「${raw.name}」は ${formatBytes(ATTACH_MAX_FILE_BYTES)} を超えています。PDF は圧縮できないため、大きい図面はお手数ですが ado@tantetuzest.com へ直接お送りください。`
          : `「${raw.name}」は縮小しても ${formatBytes(ATTACH_MAX_FILE_BYTES)} を超えています。`
        continue
      }
      if (next.reduce((a, x) => a + x.size, 0) + f.size > ATTACH_MAX_TOTAL_BYTES) {
        err = `合計 ${formatBytes(ATTACH_MAX_TOTAL_BYTES)} を超えるため追加できませんでした。分けてお送りいただくか、ado@tantetuzest.com へ直接お送りください。`
        break
      }
      next.push(f)
    }

    onFilesChange(next)
    setError(err)
    setProcessing(false)
    // 同じファイルを消したあと選び直せるように input をリセット
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
    setError("")
  }

  return (
    <div>
      <label className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-medium text-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">{optionalLabel}</span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add("border-gold")
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove("border-gold")}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove("border-gold")
          void handleFiles(e.dataTransfer.files)
        }}
        className="border border-dashed border-border rounded-md bg-secondary/50 px-4 py-6 text-center transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.pdf,.heic"
          onChange={(e) => void handleFiles(e.target.files)}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold text-gold text-[13px] tracking-wide cursor-pointer hover:bg-gold hover:text-white transition-colors"
        >
          <Paperclip className="w-4 h-4" strokeWidth={1.5} />
          {processing ? "読み込み中..." : "ファイルを選ぶ"}
        </label>
        <p className="text-[12px] text-muted-foreground mt-3 leading-[1.8]">
          {description ?? "図面（PDF）・現場写真をそのまま添付できます。スマートフォンからは撮影した写真をそのまま選べます。"}
          <br />
          画像は送信時に自動で軽量化します（合計 {formatBytes(ATTACH_MAX_TOTAL_BYTES)} まで / 最大{" "}
          {ATTACH_MAX_FILES} 件）
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 px-4 py-2.5 bg-background border border-border rounded-md text-[13px]"
            >
              <span className="text-gold text-[10px] tracking-wider uppercase shrink-0">
                {f.type === "application/pdf" ? "PDF" : f.type.startsWith("image/") ? "IMG" : "FILE"}
              </span>
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <span className="text-muted-foreground text-[11px] shrink-0">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-red-600 text-lg leading-none px-2 shrink-0"
                aria-label={`${f.name} を削除`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <p className="text-[11px] text-muted-foreground mt-2">
          合計 {files.length} 件 / {formatBytes(totalBytes)}（上限 {formatBytes(ATTACH_MAX_TOTAL_BYTES)}）
        </p>
      )}

      {error && (
        <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2 leading-[1.7]">
          {error}
        </p>
      )}
    </div>
  )
}
