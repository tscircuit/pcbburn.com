import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { CutSetting, ShapePath } from "lbrnts"
import { convertCircuitJsonToLbrn } from "../lib/helpers/convert-circuit-json-to-lbrn"
import { generateLightBurnSvgForPreview } from "../lib/helpers/generate-lightburn-svg-for-preview"
import circuitJson from "./examples/example01/1206x4_3216metric.json" with {
  type: "json",
}

const toolingPath = {
  type: "pcb_fabrication_note_path",
  pcb_fabrication_note_path_id:
    "pcb_fabrication_note_path_test_short_top_left_top_trace",
  pcb_component_id: "pcb_component_0",
  layer: "top",
  route: [
    { x: -1.5, y: 0 },
    { x: 1.5, y: 0 },
  ],
  stroke_width: 0.5,
  role: "tooling",
}

const replacementPath = {
  type: "pcb_fabrication_note_path",
  pcb_fabrication_note_path_id: "pcb_fabrication_note_path_cross_cut_0",
  pcb_component_id: "pcb_component_1",
  layer: "top",
  route: [
    { x: -2.02, y: -2.4 },
    { x: -0.52, y: -2.4 },
  ],
  stroke_width: 0.5,
  role: "copper_cut_fill",
  replaces_pcb_trace_id: "source_trace_0_0",
}

const collectShapes = (children: unknown[]): ShapePath[] =>
  children.flatMap((child) => {
    if (child instanceof ShapePath) return [child]
    if (
      child &&
      typeof child === "object" &&
      "children" in child &&
      Array.isArray(child.children)
    ) {
      return collectShapes(child.children)
    }
    return []
  })

test("adapts tooling fabrication paths selected by trace ref to T1 output", async () => {
  const project = await convertCircuitJsonToLbrn(
    [...circuitJson, toolingPath] as unknown as CircuitJson,
    {
      includeLayers: ["top"],
      toolingLayerIncludeRefs: ["test_short_*"],
      origin: { x: 0, y: 0 },
    },
  )

  expect(
    project.children.find(
      (child) => child instanceof CutSetting && child.index === 30,
    ),
  ).toMatchObject({ type: "Tool", name: "T1" })
  expect(
    collectShapes(project.children).filter((shape) => shape.cutIndex === 30)
      .length,
  ).toBeGreaterThan(0)
  const authoredToolingShape = collectShapes(project.children)
    .filter((shape) => shape.cutIndex === 30)
    .find((shape) => {
      const xs = shape.verts.map((vertex) => vertex.x)
      const ys = shape.verts.map((vertex) => vertex.y)
      return (
        Math.abs(Math.min(...xs) - -1.75) < 0.001 &&
        Math.abs(Math.max(...xs) - 1.75) < 0.001 &&
        Math.abs(Math.min(...ys) - -0.25) < 0.001 &&
        Math.abs(Math.max(...ys) - 0.25) < 0.001
      )
    })
  expect(authoredToolingShape).toBeDefined()
  expect(authoredToolingShape?.verts.at(-1)).toEqual(
    authoredToolingShape?.verts[0],
  )

  const previewSvg = generateLightBurnSvgForPreview(project)
  expect(previewSvg).toContain("#F36926")
  expect(project.getString()).toContain('CutIndex="30"')
})

test("does not infer tooling paths from their role", async () => {
  const project = await convertCircuitJsonToLbrn(
    [...circuitJson, toolingPath] as unknown as CircuitJson,
    {
      includeLayers: ["top"],
      toolingLayerIncludeRefs: ["unrelated_*"],
      origin: { x: 0, y: 0 },
    },
  )

  expect(
    project.children.some(
      (child) => child instanceof CutSetting && child.index === 30,
    ),
  ).toBeFalse()
})

test("replaces a corner trace fill with a perpendicular pill", async () => {
  const project = await convertCircuitJsonToLbrn(
    [...circuitJson, replacementPath] as unknown as CircuitJson,
    {
      includeLayers: ["top"],
      includeCopper: true,
      includeCopperCutFill: true,
      copperCutFillMargin: 0.5,
      origin: { x: 0, y: 0 },
    },
  )
  const copperFillShapes = collectShapes(project.children).filter(
    (shape) => shape.cutIndex === 6,
  )
  const replacementPill = copperFillShapes.find((shape) => {
    const xs = shape.verts.map((vertex) => vertex.x)
    const ys = shape.verts.map((vertex) => vertex.y)
    return (
      Math.abs(Math.min(...xs) - -2.27) < 0.001 &&
      Math.abs(Math.max(...xs) - -0.27) < 0.001 &&
      Math.abs(Math.min(...ys) - -2.65) < 0.001 &&
      Math.abs(Math.max(...ys) - -2.15) < 0.001
    )
  })

  expect(replacementPill?.isClosed).toBe(true)
  expect(copperFillShapes.length).toBeGreaterThan(1)
  expect(
    collectShapes(project.children).some((shape) => shape.cutIndex === 0),
  ).toBe(true)
})
