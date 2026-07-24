import type { CircuitJson } from "circuit-json"
import { getFullConnectivityMapFromCircuitJson } from "circuit-json-to-connectivity-map"
import {
  convertCircuitJsonToLbrn as convertWithPackage,
  type ConvertCircuitJsonToLbrnOptions,
} from "circuit-json-to-lbrn"
import {
  CutSetting,
  type LightBurnBaseElement,
  type LightBurnProject,
  type Mat,
  ShapeBase,
  ShapeGroup,
  ShapePath,
} from "lbrnts"

const TOP_COPPER_CUT_FILL_INDEX = 6
const BOTTOM_COPPER_CUT_FILL_INDEX = 7
const TOOL_1_INDEX = 30

type PcbSide = "top" | "bottom"
type Point = { x: number; y: number }

type FabricationPath = {
  type: "pcb_fabrication_note_path"
  pcb_fabrication_note_path_id?: string
  layer: PcbSide
  route: Point[]
  stroke_width: number
}

type ToolingPath = FabricationPath & {
  role: "tooling"
}

type CopperCutFillReplacementPath = FabricationPath & {
  role: "copper_cut_fill"
  replaces_pcb_trace_id: string
}

const COPPER_GEOMETRY_TYPES = new Set([
  "pcb_plated_hole",
  "pcb_smtpad",
  "pcb_trace",
  "pcb_via",
])

const getFabricationPaths = (circuitJson: CircuitJson) =>
  circuitJson.flatMap((element) => {
    if (element.type !== "pcb_fabrication_note_path") return []

    const path = element as unknown as Record<string, unknown>
    const layer = path.layer
    const route = path.route
    const strokeWidth = path.stroke_width
    if (
      (layer !== "top" && layer !== "bottom") ||
      !Array.isArray(route) ||
      typeof strokeWidth !== "number"
    ) {
      return []
    }

    return [
      {
        ...path,
        type: "pcb_fabrication_note_path",
        layer,
        route: route as Point[],
        stroke_width: strokeWidth,
      } as FabricationPath & Record<string, unknown>,
    ]
  })

const TOOLING_PATH_ID_PREFIX = "pcb_fabrication_note_path_"

const matchesRef = (value: string, ref: string) => {
  const escapedRef = ref.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`^${escapedRef.replaceAll("*", ".*")}$`).test(value)
}

const getToolingPaths = (
  circuitJson: CircuitJson,
  includeRefs: string[],
): ToolingPath[] =>
  getFabricationPaths(circuitJson).filter((path): path is ToolingPath => {
    if (
      path.role !== "tooling" ||
      typeof path.pcb_fabrication_note_path_id !== "string"
    ) {
      return false
    }

    const pathRef = path.pcb_fabrication_note_path_id.startsWith(
      TOOLING_PATH_ID_PREFIX,
    )
      ? path.pcb_fabrication_note_path_id.slice(TOOLING_PATH_ID_PREFIX.length)
      : path.pcb_fabrication_note_path_id

    return includeRefs.some((ref) => matchesRef(pathRef, ref))
  })

const getCopperCutFillReplacementPaths = (
  circuitJson: CircuitJson,
): CopperCutFillReplacementPath[] =>
  getFabricationPaths(circuitJson).filter(
    (path): path is CopperCutFillReplacementPath =>
      path.role === "copper_cut_fill" &&
      typeof path.replaces_pcb_trace_id === "string",
  )

const getConnectedIdsForReplacementPaths = (
  circuitJson: CircuitJson,
  replacementPaths: CopperCutFillReplacementPath[],
) => {
  const connectivityMap = getFullConnectivityMapFromCircuitJson(circuitJson)
  const connectedIdsByLayer = {
    top: new Set<string>(),
    bottom: new Set<string>(),
  }

  for (const replacementPath of replacementPaths) {
    const replacedTrace = circuitJson.find(
      (element) =>
        element.type === "pcb_trace" &&
        element.pcb_trace_id === replacementPath.replaces_pcb_trace_id,
    )
    if (replacedTrace?.type !== "pcb_trace") {
      throw new Error(
        `Copper cut fill replacement references unknown trace ${replacementPath.replaces_pcb_trace_id}`,
      )
    }

    const connectivityId =
      replacedTrace.source_trace_id ?? replacedTrace.pcb_trace_id
    const netId = connectivityMap.getNetConnectedToId(connectivityId)
    if (!netId) {
      throw new Error(
        `Cannot resolve the net for copper cut fill replacement trace ${replacementPath.replaces_pcb_trace_id}`,
      )
    }

    for (const connectedId of connectivityMap.getIdsConnectedToNet(netId)) {
      connectedIdsByLayer[replacementPath.layer].add(connectedId)
    }
  }

  return connectedIdsByLayer
}

const removeConnectedCopperGeometry = (
  circuitJson: CircuitJson,
  connectedIds: Set<string>,
): CircuitJson =>
  circuitJson.filter((element) => {
    if (!COPPER_GEOMETRY_TYPES.has(element.type)) return true

    return !Object.entries(element).some(
      ([key, value]) =>
        key.endsWith("_id") &&
        typeof value === "string" &&
        connectedIds.has(value),
    )
  }) as CircuitJson

const keepOnlyCutIndex = (
  node: LightBurnBaseElement,
  cutIndex: number,
): boolean => {
  if (node instanceof CutSetting) return node.index === cutIndex
  if (node instanceof ShapeBase && !(node instanceof ShapeGroup)) {
    return node.cutIndex === cutIndex
  }
  if (node instanceof ShapeGroup) {
    node.children = node.children.filter((child) =>
      keepOnlyCutIndex(child, cutIndex),
    )
    return node.children.length > 0
  }
  return false
}

const appendCutFillLayer = (
  targetProject: LightBurnProject,
  fillProject: LightBurnProject,
  cutIndex: number,
) => {
  targetProject.children.push(
    ...fillProject.children.filter((child) =>
      keepOnlyCutIndex(child, cutIndex),
    ),
  )
}

const rotatePoint = (point: Point, center: Point, rotation: number): Point => {
  const deltaX = point.x - center.x
  const deltaY = point.y - center.y
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  return {
    x: center.x + deltaX * cos - deltaY * sin,
    y: center.y + deltaX * sin + deltaY * cos,
  }
}

const createStrokedSegment = ({
  start,
  end,
  strokeWidth,
  origin,
}: {
  start: Point
  end: Point
  strokeWidth: number
  origin: Point
}) => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const segmentLength = Math.hypot(deltaX, deltaY)
  if (segmentLength === 0) return null

  const center = {
    x: (start.x + end.x) / 2 + origin.x,
    y: (start.y + end.y) / 2 + origin.y,
  }
  const radius = strokeWidth / 2
  const capOffset = segmentLength / 2
  const rotation = Math.atan2(deltaY, deltaX)
  const verts: Point[] = []
  const prims: Array<{ type: number }> = []
  const addPoint = (point: Point) => {
    verts.push(rotatePoint(point, center, rotation))
    if (verts.length > 1) prims.push({ type: 0 })
  }

  for (let index = 0; index <= 32; index += 1) {
    const angle = -Math.PI / 2 + (index / 32) * Math.PI
    addPoint({
      x: center.x + capOffset + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    })
  }
  addPoint({ x: center.x - capOffset, y: center.y + radius })
  for (let index = 0; index <= 32; index += 1) {
    const angle = Math.PI / 2 + (index / 32) * Math.PI
    addPoint({
      x: center.x - capOffset + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    })
  }
  addPoint({ x: center.x + capOffset, y: center.y - radius })
  verts.push({ ...verts[0]! })
  prims.push({ type: 0 })

  return { verts, prims }
}

const getBottomLayerXform = (
  circuitJson: CircuitJson,
  origin: Point,
  mirrorBottomLayer: boolean,
): Mat | undefined => {
  if (!mirrorBottomLayer) return undefined

  const board = circuitJson.find((element) => element.type === "pcb_board")
  if (board?.type !== "pcb_board") return undefined

  let centerX = board.center?.x
  if (typeof centerX !== "number" && board.outline?.length) {
    const xs = board.outline.map((point) => point.x)
    centerX = (Math.min(...xs) + Math.max(...xs)) / 2
  }
  if (typeof centerX !== "number") return undefined

  return [-1, 0, 0, 1, 2 * (centerX + origin.x), 0]
}

const appendFabricationPaths = ({
  project,
  paths,
  cutIndex,
  origin,
  bottomLayerXform,
}: {
  project: LightBurnProject
  paths: FabricationPath[]
  cutIndex: number
  origin: Point
  bottomLayerXform?: Mat
}) => {
  for (const path of paths) {
    if (path.stroke_width <= 0) continue

    for (let index = 0; index < path.route.length - 1; index += 1) {
      const segment = createStrokedSegment({
        start: path.route[index]!,
        end: path.route[index + 1]!,
        strokeWidth: path.stroke_width,
        origin,
      })
      if (!segment) continue

      project.children.push(
        new ShapePath({
          ...segment,
          isClosed: true,
          cutIndex,
          xform: path.layer === "bottom" ? bottomLayerXform : undefined,
        }),
      )
    }
  }
}

const appendToolingPaths = ({
  project,
  paths,
  origin,
  bottomLayerXform,
}: {
  project: LightBurnProject
  paths: ToolingPath[]
  origin: Point
  bottomLayerXform?: Mat
}) => {
  if (paths.length === 0) return

  const hasToolingCutSetting = project.children.some(
    (child) => child instanceof CutSetting && child.index === TOOL_1_INDEX,
  )
  if (!hasToolingCutSetting) {
    project.children.push(
      new CutSetting({ type: "Tool", index: TOOL_1_INDEX, name: "T1" }),
    )
  }
  appendFabricationPaths({
    project,
    paths,
    cutIndex: TOOL_1_INDEX,
    origin,
    bottomLayerXform,
  })
}

export const convertCircuitJsonToLbrn = async (
  circuitJson: CircuitJson,
  options: ConvertCircuitJsonToLbrnOptions = {},
): Promise<LightBurnProject> => {
  const includeLayers = options.includeLayers ?? ["top", "bottom"]
  const packageToolingLayerIncludeRefs = (
    options.toolingLayerIncludeRefs ?? []
  ).filter((ref) => !ref.includes("*"))
  const toolingPaths = getToolingPaths(
    circuitJson,
    options.toolingLayerIncludeRefs ?? [],
  ).filter((path) => includeLayers.includes(path.layer))
  const replacementPaths = getCopperCutFillReplacementPaths(circuitJson).filter(
    (path) => includeLayers.includes(path.layer),
  )
  const shouldReplaceCopperCutFill =
    replacementPaths.length > 0 &&
    (options.includeCopper ?? true) &&
    (options.includeCopperCutFill ?? false)

  // The current package owns component selection and copper geometry. Keep the
  // primary conversion on its public API, suppressing only the fill that must
  // be regenerated without the replacement path's connected net.
  const project = await convertWithPackage(circuitJson, {
    ...options,
    toolingLayerIncludeRefs: packageToolingLayerIncludeRefs,
    includeCopperCutFill: shouldReplaceCopperCutFill
      ? false
      : options.includeCopperCutFill,
  })

  const origin = options.origin ?? { x: 0, y: 0 }
  const bottomLayerXform = getBottomLayerXform(
    circuitJson,
    origin,
    options.mirrorBottomLayer ?? false,
  )
  // The package handles component selectors. Trace refs such as test_short_*
  // resolve to authored fabrication paths in this adapter.
  appendToolingPaths({
    project,
    paths: toolingPaths,
    origin,
    bottomLayerXform,
  })

  if (!shouldReplaceCopperCutFill) return project

  const connectedIdsByLayer = getConnectedIdsForReplacementPaths(
    circuitJson,
    replacementPaths,
  )
  // Generate each side independently so replacing a top-layer testpoint does
  // not remove the same connected net from the bottom-layer fill.
  for (const layer of includeLayers) {
    const fillProject = await convertWithPackage(
      removeConnectedCopperGeometry(circuitJson, connectedIdsByLayer[layer]),
      {
        ...options,
        includeLayers: [layer],
        includeCopper: true,
        includeCopperCutFill: true,
        toolingLayerIncludeRefs: [],
      },
    )
    appendCutFillLayer(
      project,
      fillProject,
      layer === "top"
        ? TOP_COPPER_CUT_FILL_INDEX
        : BOTTOM_COPPER_CUT_FILL_INDEX,
    )
  }

  for (const layer of includeLayers) {
    appendFabricationPaths({
      project,
      paths: replacementPaths.filter((path) => path.layer === layer),
      cutIndex:
        layer === "top"
          ? TOP_COPPER_CUT_FILL_INDEX
          : BOTTOM_COPPER_CUT_FILL_INDEX,
      origin,
      bottomLayerXform,
    })
  }

  return project
}
