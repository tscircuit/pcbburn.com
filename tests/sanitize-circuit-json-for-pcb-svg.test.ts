import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { sanitizeCircuitJsonForPcbSvg } from "../lib/helpers/sanitize-circuit-json-for-pcb-svg"

const board = {
  type: "pcb_board",
  pcb_board_id: "board",
  center: { x: 0, y: 0 },
  width: 40,
  height: 40,
  outline: [
    { x: -20, y: -20 },
    { x: 20, y: -20 },
    { x: 20, y: 20 },
    { x: -20, y: 20 },
  ],
}

const buildTrace = (points: Record<string, unknown>[]) => ({
  type: "pcb_trace",
  pcb_trace_id: "trace1",
  route: points,
})

test("drops route points whose coordinates parse to non-finite numbers", () => {
  // distance.parse returns NaN (rather than throwing) for unparsable
  // strings, so these points must be filtered out explicitly.
  const trace = buildTrace([
    { route_type: "wire", x: "garbage", y: 0, width: 0.5, layer: "top" },
    { route_type: "wire", x: 10, y: 0, width: 0.5, layer: "top" },
  ])

  const sanitized = sanitizeCircuitJsonForPcbSvg([board, trace] as CircuitJson)
  const sanitizedTrace = sanitized.find(
    (element) => (element as { type?: string }).type === "pcb_trace",
  ) as { route: { x: number; y: number }[] }

  expect(sanitizedTrace.route).toHaveLength(1)
  expect(sanitizedTrace.route[0].x).toBe(10)
  expect(Number.isFinite(sanitizedTrace.route[0].x)).toBe(true)
})

test("removes unparsable width instead of keeping NaN or the raw value", () => {
  const trace = buildTrace([
    { route_type: "wire", x: -10, y: 0, width: "not-a-width", layer: "top" },
    { route_type: "wire", x: 10, y: 0, width: "not-a-width", layer: "top" },
  ])

  const sanitized = sanitizeCircuitJsonForPcbSvg([board, trace] as CircuitJson)
  const sanitizedTrace = sanitized.find(
    (element) => (element as { type?: string }).type === "pcb_trace",
  ) as { route: Record<string, unknown>[] }

  expect(sanitizedTrace.route).toHaveLength(2)
  for (const point of sanitizedTrace.route) {
    if ("width" in point) {
      expect(Number.isFinite(point.width as number)).toBe(true)
    }
  }
})

test("parses valid numeric and unit-suffixed distances", () => {
  const trace = buildTrace([
    { route_type: "wire", x: "-10", y: "0.5mm", width: "0.5mm", layer: "top" },
    { route_type: "wire", x: 10, y: 0, width: 0.25, layer: "top" },
  ])

  const sanitized = sanitizeCircuitJsonForPcbSvg([board, trace] as CircuitJson)
  const sanitizedTrace = sanitized.find(
    (element) => (element as { type?: string }).type === "pcb_trace",
  ) as { route: { x: number; y: number; width: number }[] }

  expect(sanitizedTrace.route).toHaveLength(2)
  expect(sanitizedTrace.route[0].x).toBe(-10)
  expect(sanitizedTrace.route[0].y).toBe(0.5)
  expect(sanitizedTrace.route[0].width).toBe(0.5)
  expect(sanitizedTrace.route[1].width).toBe(0.25)
})

test("sanitized circuit json with garbage distances renders without throwing", () => {
  const trace = buildTrace([
    { route_type: "wire", x: "garbage", y: 0, width: 0.5, layer: "top" },
    { route_type: "wire", x: 10, y: 0, width: "not-a-width", layer: "top" },
  ])

  const sanitized = sanitizeCircuitJsonForPcbSvg([board, trace] as CircuitJson)
  const svg = convertCircuitJsonToPcbSvg(sanitized)
  expect(svg.includes("NaN")).toBe(false)
})
