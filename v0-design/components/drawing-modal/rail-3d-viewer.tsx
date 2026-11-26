"use client"

// 横型手すり（René）の 3D 表示。rail-3d-button.tsx から next/dynamic で読み込むので、
// three.js はお客様が「立体で見る」を押したときだけダウンロードされる。
//
// 部品の分担:
//   - 座金＋支柱 … SolidCraft で作った public/models/rene-bracket.glb（René の座金は丸 φ45・t4.5・
//     表の角をテーパー C1.5・段付き穴3つ＝上2・下1・支柱9φ を R9 で曲げて手すりの下へ）。
//     原本は _drafts/3d/rene-bracket.solidcraft
//   - パイプ    … 長さが毎回変わるので、ここで回転体（LatheGeometry）として作る。端は R2 の丸み。
// 寸法は rene-svg.ts の座金側面詳細図と同じ: 壁〜パイプ背面 40mm・支柱の水平部はパイプ下面から 20mm 下。
//
// 座標（mm・Y が上）: 壁の面が z=0、手前が +z。パイプの中心線は y=0・z=40+半径。

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

const BRACKET_GLB = "/models/rene-bracket.glb"
const WALL_GAP_MM = 40 // 壁〜パイプ背面
const ARM_BELOW_PIPE_MM = 20 // パイプ下面〜支柱の水平部（中心）
const END_ROUND_MM = 2 // パイプ端の丸み

export interface Rail3DViewerProps {
  lengthMm: number
  pipeDiameter: number
  positions: number[] // 左端からの座金位置 mm
  angleDeg: number // 角度加工（0=なし）。あり＝階段の傾きに合わせて支柱を垂直に立てる
  angleDir: "left" | "right" // left＝左側が高い（2D シミュレーターの支柱の傾きと同じ向き）
}

// パイプ断面の半分（回転させる輪郭）。Y 軸方向に 0→L、端は R2 で丸める。
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

async function loadBracketGeometry(): Promise<THREE.BufferGeometry> {
  const gltf = await new GLTFLoader().loadAsync(BRACKET_GLB)
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

export default function Rail3DViewer({ lengthMm, pipeDiameter, positions, angleDeg, angleDir }: Rail3DViewerProps) {
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
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

    // 手すりの傾き（角度加工ありのときだけ階段に付けた姿で見せる）
    const theta = angleDeg > 0 ? (angleDeg * Math.PI) / 180 : 0
    const tilt = (angleDir === "left" ? -1 : 1) * theta
    const r = pipeDiameter / 2
    const railZ = WALL_GAP_MM + r
    const L = lengthMm
    const spanY = L * Math.sin(Math.abs(tilt))

    // 壁（端が見えないよう大きめ。影の範囲は手すりのまわりだけ）
    const wallW = L * Math.cos(tilt) + 1400
    const wallH = spanY + 1100
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
    sun.position.set(-L * 0.25 - 300, 900 + spanY, 1100)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const sc = sun.shadow.camera
    sc.left = -wallW / 2
    sc.right = wallW / 2
    sc.top = wallH / 2
    sc.bottom = -wallH / 2
    sc.near = 10
    sc.far = 5000
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.6
    scene.add(sun)
    scene.add(sun.target)

    // マットブラック（2液ウレタン）
    const iron = new THREE.MeshStandardMaterial({ color: "#1b1b1c", roughness: 0.58, metalness: 0.05 })

    // パイプ
    const pipeGeom = new THREE.LatheGeometry(pipeProfile(L, r), 48)
    pipeGeom.rotateZ(-Math.PI / 2) // Y 軸 → +X 軸
    pipeGeom.translate(-L / 2, 0, 0)
    const pipe = new THREE.Mesh(pipeGeom, iron)
    pipe.position.set(0, 0, railZ)
    pipe.rotation.z = tilt
    pipe.castShadow = true
    pipe.receiveShadow = true
    scene.add(pipe)

    // カメラを手すり全体が収まる位置へ（斜め右上の手前から）
    const fitCamera = () => {
      const box = new THREE.Box3().setFromObject(pipe)
      box.expandByScalar(40)
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const center = sphere.center.clone().setZ(railZ * 0.5).add(new THREE.Vector3(0, -15, 0))
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
      controls.target.copy(center)
      controls.minDistance = 120
      controls.maxDistance = dist * 2.5
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
    loadBracketGeometry()
      .then((geom) => {
        if (disposed) {
          geom.dispose()
          return
        }
        bracketGeom = geom
        const cos = Math.cos(tilt)
        const sin = Math.sin(tilt)
        const drop = r + ARM_BELOW_PIPE_MM // パイプ中心〜座金の中心
        for (const p of positions) {
          const s = p - L / 2
          const b = new THREE.Mesh(geom, iron)
          // 角度加工あり＝支柱は垂直のまま（座金は回さない）。なし（傾き 0）は手すりに直角。
          b.position.set(s * cos, s * sin - drop, 0)
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
      pipeGeom.dispose()
      bracketGeom?.dispose()
      wall.geometry.dispose()
      ;(wall.material as THREE.Material).dispose()
      iron.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [lengthMm, pipeDiameter, positions, angleDeg, angleDir])

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
