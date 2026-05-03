import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import conductivityPads from "../assets/connectivity-test-pads.json" with {
  type: "json",
}

const TOP_COPPER_CUT_FILL_INDEX = 6
const BOTTOM_COPPER_CUT_FILL_INDEX = 7

const countShapesWithCutIndex = (node: unknown, cutIndex: number): number => {
  if (!node || typeof node !== "object") {
    return 0
  }

  const candidate = node as { cutIndex?: unknown; children?: unknown[] }
  const selfCount = candidate.cutIndex === cutIndex ? 1 : 0
  const childCount = Array.isArray(candidate.children)
    ? candidate.children.reduce(
        (sum, child) => sum + countShapesWithCutIndex(child, cutIndex),
        0,
      )
    : 0

  return selfCount + childCount
}

test("inserted conductivity pads are included in top and bottom copper cut fill", async () => {
  const board = {
    type: "pcb_board",
    pcb_board_id: "board",
    center: { x: 0, y: 0 },
    width: 120,
    height: 90,
    outline: [
      { x: -60, y: -45 },
      { x: 60, y: -45 },
      { x: 60, y: 45 },
      { x: -60, y: 45 },
    ],
  }
  const circuitJson = [board, ...conductivityPads] as CircuitJson

  const project = await convertCircuitJsonToLbrn(circuitJson, {
    includeCopper: true,
    includeCopperCutFill: true,
    includeLayers: ["top", "bottom"],
    origin: { x: 0, y: 0 },
    copperCutFillMargin: 0.5,
  })

  expect(
    countShapesWithCutIndex(project, TOP_COPPER_CUT_FILL_INDEX),
  ).toBeGreaterThan(0)
  expect(
    countShapesWithCutIndex(project, BOTTOM_COPPER_CUT_FILL_INDEX),
  ).toBeGreaterThan(0)
})
