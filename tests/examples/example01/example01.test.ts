import { test, expect } from "bun:test"
import circuitJson from "./1206x4_3216metric.json" with { type: "json" }
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { generateLightBurnSvg } from "lbrnts"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import { stackSvgsVertically } from "stack-svgs"
import { CircuitJson } from "circuit-json"

test("renders basic pcb vias with copper and hole", async () => {
  const pcbSvg = await convertCircuitJsonToPcbSvg(circuitJson as CircuitJson)

  const project = await convertCircuitJsonToLbrn(circuitJson)

  const lbrnSvg = generateLightBurnSvg(project)

  expect(stackSvgsVertically([pcbSvg, lbrnSvg])).toMatchSvgSnapshot(
    import.meta.filename,
  )
})
