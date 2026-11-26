"use client"

// 壁付け手すりの 3D 表示。rail-3d-button.tsx から next/dynamic で読み込むので、
// three.js はお客様が「立体で見る」を押したときだけダウンロードされる。
//
// 形の設定（商品ごとの断面・色・座金の GLB）は lib/drawing-modal/rail-3d-models.ts。
//   - 座金＋支柱 … SolidCraft で作った GLB（座金の中心が原点・壁の面が y=0・支柱は +y＝手前へ）
//   - バー本体   … 長さが毎回変わるので、ここで作る（丸パイプ＝回転体・端 R2／フラットバー＝角丸の押し出し）
//
// 座標（mm・Y が上）: 壁の面が z=0、手前が +z。バーの中心線は y=0。
//   横型 … バーは X 方向。座金はバー下面から 20mm 下（J 字の支柱で上へ曲げてバーへ）
//   縦型 … バーは Y 方向。座金はバーの真後ろ（支柱はまっすぐ）。位置は上端から測る

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import type { Rail3DSpec } from "@/lib/drawing-modal/rail-3d-models"

const WALL_GAP_MM = 40 // 丸パイプ: 壁〜パイプ背面 ／ フラットバー: 壁〜FB 中心（rene-svg.ts と同じ）
const ARM_BELOW_BAR_MM = 20 // 横型: バー下面〜支柱の水平部（中心）
const END_ROUND_MM = 2 // 丸パイプ端の丸み
const FLAT_CORNER_MM = 5 // フラットバーの端の角丸（上から見たとき）
const FLAT_EDGE_MM = 0.8 // フラットバーの稜線の面取り

export interface Rail3DViewerProps {
  spec: Rail3DSpec
  lengthMm: number
  positions: number[] // 横型＝左端から／縦型＝上端からの座金位置 mm
  angleDeg: number // 横型の角度加工（0=なし）。あり＝階段の傾きに合わせて支柱を垂直に立てる
  angleDir: "left" | "right" // left＝左側が高い（2D シミュレーターの支柱の傾きと同じ向き）
}

const COLORS = {
  black: { color: "#1b1b1c", roughness: 0.58 },
  white: { color: "#ecebe7", roughness: 0.62 },
} as const

// 丸パイプ断面の半分（回転させる輪郭）。Y 軸方向に 0→L、端は R2 で丸める。
function pipeProfile(L: number, r: number): THREE.Vector2[] {
  const f = Math.min(END_ROUND_MM, r / 2)
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)]
  const steps = 6
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / steps)
    pts.push(new THREE.Vector2(r - f + f * Math.cos(a), f + f * Math.sin(a)))
  }
  for (let i = 0; i <= steps; i++) {
    const a = (Math.PI / 2) * (i / steps)
    pts.push(new THREE.Vector2(r - f + f * Math.cos(a), L - f + f * Math.sin(a)))
  }
  pts.push(new THREE.Vector2(0, L))
  return pts
}

function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(x0 + r, y0)
  s.lineTo(x1 - r, y0)
  s.quadraticCurveTo(x1, y0, x1, y0 + r)
  s.lineTo(x1, y1 - r)
  s.quadraticCurveTo(x1, y1, x1 - r, y1)
  s.lineTo(x0 + r, y1)
  s.quadraticCurveTo(x0, y1, x0, y1 - r)
  s.lineTo(x0, y0 + r)
  s.quadraticCurveTo(x0, y0, x0 + r, y0)
  return s
}

// バー本体。中心線が原点を通り、横型は X、縦型は Y 方向。z はバーの中心（壁からの距離）に置く。
function buildBarGeometry(spec: Rail3DSpec, L: number): { geom: THREE.BufferGeometry; centerZ: number; halfHeight: number } {
  if (spec.profile.type === "flat") {
    const { width: w, thickness: t } = spec.profile
    const b = FLAT_EDGE_MM
    const centerZ = WALL_GAP_MM
    // 上から見た角丸の長方形（shape の y → 回転後に -z）を厚み方向へ押し出す
    const shape = roundedRect(-L / 2 + b, -(w / 2) + b, L / 2 - b, w / 2 - b, FLAT_CORNER_MM)
    const depth = t - 2 * b
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 2,
      curveSegments: 8,
    })
    geom.rotateX(-Math.PI / 2) // 押し出し方向 → +Y、shape の y → -Z
    geom.translate(0, -depth / 2, 0)
    if (spec.orientation === "vertical") geom.rotateZ(Math.PI / 2)
    return { geom, centerZ, halfHeight: t / 2 }
  }
  const r = spec.profile.diameter / 2
  const geom = new THREE.LatheGeometry(pipeProfile(L, r), 48)
  geom.translate(0, -L / 2, 0) // Y 方向・中心を原点へ
  if (spec.orientation === "horizontal") geom.rotateZ(-Math.PI / 2)
  return { geom, centerZ: WALL_GAP_MM + r, halfHeight: r }
}

async function loadBracketGeometry(url: string): Promise<THREE.BufferGeometry> {
  const gltf = await new GLTFLoader().loadAsync(url)
  gltf.scene.updateMatrixWorld(true)
  const parts: THREE.BufferGeometry[] = []
  gltf.scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const g = mesh.geometry.clone()
    g.applyMatrix4(mesh.matrixWorld)
    // 結合できるよう位置と法線だけ残す
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal") g.deleteAttribute(name)
    }
    if (!g.attributes.normal) g.computeVertexNormals()
    parts.push(g.index ? g.toNonIndexed() : g)
  })
  if (parts.length === 0) throw new Error("bracket glb has no mesh")
  const geom = parts.length === 1 ? parts[0] : mergeGeometries(parts)
  if (!geom) throw new Error("bracket merge failed")
  geom.scale(1000, 1000, 1000) // glTF は m → mm
  // SolidCraft は Z 上・壁から +Y に出る形で作図。glTF(Y 上)に直すと手前が -z になるので反転する。
  geom.computeBoundingBox()
  if (geom.boundingBox && geom.boundingBox.min.z < -1) geom.rotateY(Math.PI)
  geom.computeBoundingBox()
  return geom
}

export default function Rail3DViewer({ spec, lengthMm, positions, angleDeg, angleDir }: Rail3DViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let raf = 0

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true })
    } catch {
      setStatus("error")
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap // r18x で PCFSoft は廃止（警告が出る）
    renderer.domElement.style.display = "block"
    renderer.domElement.style.touchAction = "none"
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f3f4f6")
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.55

    const camera = new THREE.PerspectiveCamera(35, 1, 5, 40000)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.zoomToCursor = true // 座金など、指した所へ寄れる
    // 壁の裏に回り込まないように
    controls.minAzimuthAngle = -1.35
    controls.maxAzimuthAngle = 1.35
    controls.minPolarAngle = 0.25
    controls.maxPolarAngle = Math.PI - 0.25

    const L = lengthMm
    const vertical = spec.orientation === "vertical"
    // 横型の傾き（角度加工ありのときだけ階段に付けた姿で見せる）
    const theta = !vertical && angleDeg > 0 ? (angleDeg * Math.PI) / 180 : 0
    const tilt = (angleDir === "left" ? -1 : 1) * theta
    const extX = vertical ? 0 : L * Math.cos(tilt)
    const extY = vertical ? L : L * Math.sin(Math.abs(tilt))

    // 壁（端が見えないよう大きめ。影の範囲は手すりのまわりだけ）
    const wallW = extX + 1400
    const wallH = extY + 1100
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallW + 12000, wallH + 8000),
      new THREE.MeshStandardMaterial({ color: "#c4c6c9", roughness: 0.95, metalness: 0 })
    )
    wall.position.set(0, -60, 0)
    wall.receiveShadow = true
    scene.add(wall)

    // 照明
    scene.add(new THREE.HemisphereLight("#ffffff", "#cfcfcf", 0.7))
    const sun = new THREE.DirectionalLight("#ffffff", 1.8)
    sun.position.set(-extX * 0.25 - 300, 900 + extY * 0.6, 1100)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const sc = sun.shadow.camera
    sc.left = -wallW / 2
    sc.right = wallW / 2
    sc.top = wallH / 2
    sc.bottom = -wallH / 2
    sc.near = 10
    sc.far = 6000
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.6
    scene.add(sun)
    scene.add(sun.target)

    // 仕上げ色（2液ウレタン艶消し）
    const finish = COLORS[spec.color]
    const iron = new THREE.MeshStandardMaterial({ color: finish.color, roughness: finish.roughness, metalness: 0.05 })

    // バー
    const bar = buildBarGeometry(spec, L)
    const barMesh = new THREE.Mesh(bar.geom, iron)
    barMesh.position.set(0, 0, bar.centerZ)
    barMesh.rotation.z = tilt
    barMesh.castShadow = true
    barMesh.receiveShadow = true
    scene.add(barMesh)

    // カメラを手すり全体が収まる位置へ（斜め右上の手前から）
    let fitDist = 1000
    const fitCamera = () => {
      const box = new THREE.Box3().setFromObject(barMesh)
      box.expandByScalar(40)
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const center = sphere.center.clone().setZ(bar.centerZ * 0.5).add(new THREE.Vector3(0, -15, 0))
      const vFov = (camera.fov * Math.PI) / 180
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
      const fov = Math.min(vFov, hFov)
      const dir = new THREE.Vector3(0.75, 0.3, 1).normalize()
      // 斜めから見るので手前の端が大きく写る。箱の角を画面に投影して、両端が枠に収まる距離まで調整する
      let dist = sphere.radius / Math.tan(fov / 2)
      const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(
        (i) =>
          new THREE.Vector3(
            i & 1 ? box.max.x : box.min.x,
            i & 2 ? box.max.y : box.min.y,
            i & 4 ? box.max.z : box.min.z
          )
      )
      for (let k = 0; k < 40; k++) {
        camera.position.copy(center).addScaledVector(dir, dist)
        camera.lookAt(center)
        camera.updateMatrixWorld()
        const m = Math.max(...corners.map((c) => { const p = c.clone().project(camera); return Math.max(Math.abs(p.x), Math.abs(p.y)) }))
        if (m > 0.9) dist *= 1.06
        else if (m < 0.78) dist *= 0.95
        else break
      }
      fitDist = dist
      controls.target.copy(center)
      controls.minDistance = 120
      controls.maxDistance = fitDist * 2.5
      controls.update()
    }

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    fitCamera()
    const ro = new ResizeObserver(() => resize())
    ro.observe(host)

    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    // 座金＋支柱（GLB）
    let bracketGeom: THREE.BufferGeometry | null = null
    loadBracketGeometry(spec.bracketGlb)
      .then((geom) => {
        if (disposed) {
          geom.dispose()
          return
        }
        bracketGeom = geom
        const cos = Math.cos(tilt)
        const sin = Math.sin(tilt)
        const drop = bar.halfHeight + ARM_BELOW_BAR_MM // 横型: バー中心〜座金の中心
        for (const p of positions) {
          const b = new THREE.Mesh(geom, iron)
          if (vertical) {
            b.position.set(0, L / 2 - p, 0) // 上端から p
          } else {
            const s = p - L / 2
            // 角度加工あり＝支柱は垂直のまま（座金は回さない）。なし（傾き 0）は手すりに直角。
            b.position.set(s * cos, s * sin - drop, 0)
          }
          b.castShadow = true
          b.receiveShadow = true
          scene.add(b)
        }
        setStatus("ready")
      })
      .catch(() => {
        if (!disposed) setStatus("error")
      })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      bar.geom.dispose()
      bracketGeom?.dispose()
      wall.geometry.dispose()
      ;(wall.material as THREE.Material).dispose()
      iron.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      // 開け閉めを繰り返してもブラウザの WebGL 上限（16前後）に達しないよう、すぐ手放す
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [spec, lengthMm, positions, angleDeg, angleDir])

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="absolute inset-0" />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-muted-foreground">
          読み込み中…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f3f4f6] p-6 text-center text-[13px] leading-relaxed text-muted-foreground">
          お使いの端末では立体表示ができませんでした。
          <br />
          下の取り付けイメージ図でご確認ください。
        </div>
      )}
    </div>
  )
}
