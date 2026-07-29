import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import circuitJson from "./examples/example01/1206x4_3216metric.json" with {
  type: "json",
}
import {
  configureTopSoldermaskRemovalLayer,
  TOP_SOLDERMASK_REMOVAL_LAYER_INDEX,
  TOP_SOLDERMASK_REMOVAL_LAYER_NAME,
} from "../lib/helpers/configure-top-soldermask-removal-layer"

type ProjectNode = {
  children?: ProjectNode[]
  cutIndex?: number
}

const flattenProject = (nodes: ProjectNode[]): ProjectNode[] =>
  nodes.flatMap((node) => [node, ...flattenProject(node.children ?? [])])

test("creates top soldermask removal from cut fill without interior lines", async () => {
  const project = await convertCircuitJsonToLbrn(circuitJson as CircuitJson, {
    includeLayers: ["top"],
    includeCopper: true,
    includeCopperCutFill: true,
    includeSoldermaskAblation: true,
    copperCutFillMargin: 0.5,
    soldermaskAblationClearance: 0.5,
    origin: { x: 0, y: 0 },
  })

  const removalSetting = configureTopSoldermaskRemovalLayer(project)
  const projectNodes = flattenProject(project.children as ProjectNode[])
  const copperCutFillShapes = projectNodes.filter((node) => node.cutIndex === 6)
  const removalShapes = projectNodes.filter(
    (node) => node.cutIndex === TOP_SOLDERMASK_REMOVAL_LAYER_INDEX,
  )

  expect(removalSetting?.name).toBe(TOP_SOLDERMASK_REMOVAL_LAYER_NAME)
  expect(removalShapes).toHaveLength(1)
  expect(copperCutFillShapes.length).toBeGreaterThan(removalShapes.length)
  expect(project.getString()).toContain(
    `<name Value="${TOP_SOLDERMASK_REMOVAL_LAYER_NAME}"/>`,
  )
})
