import { distance, type CircuitJson } from "circuit-json"

const pcbRenderableElementTypes = new Set([
  "pcb_board",
  "pcb_component",
  "pcb_component_outside_board_error",
  "pcb_copper_pour",
  "pcb_copper_text",
  "pcb_courtyard_circle",
  "pcb_courtyard_outline",
  "pcb_courtyard_overlap_error",
  "pcb_courtyard_polygon",
  "pcb_courtyard_rect",
  "pcb_cutout",
  "pcb_fabrication_note_dimension",
  "pcb_fabrication_note_path",
  "pcb_fabrication_note_rect",
  "pcb_fabrication_note_text",
  "pcb_footprint_overlap_error",
  "pcb_group",
  "pcb_hole",
  "pcb_keepout",
  "pcb_note_dimension",
  "pcb_note_line",
  "pcb_note_path",
  "pcb_note_rect",
  "pcb_note_text",
  "pcb_panel",
  "pcb_plated_hole",
  "pcb_silkscreen_circle",
  "pcb_silkscreen_line",
  "pcb_silkscreen_oval",
  "pcb_silkscreen_path",
  "pcb_silkscreen_pill",
  "pcb_silkscreen_rect",
  "pcb_silkscreen_text",
  "pcb_smtpad",
  "pcb_trace",
  "pcb_trace_error",
  "pcb_via",
  "pcb_via_trace_clearance_error",
])

const parseDistanceValue = (value: unknown): number | undefined => {
  try {
    const parsed = distance.parse(value as any)
    // distance.parse returns NaN instead of throwing for unparsable
    // strings, so non-finite results must be rejected explicitly
    if (!Number.isFinite(parsed)) return undefined
    return parsed
  } catch {
    return undefined
  }
}

const sanitizePcbPointArray = (points: unknown): unknown => {
  if (!Array.isArray(points)) return points

  return points.flatMap((point) => {
    if (!point || typeof point !== "object") return []

    const pointRecord = point as Record<string, unknown>
    const x = parseDistanceValue(pointRecord.x)
    const y = parseDistanceValue(pointRecord.y)
    if (x === undefined || y === undefined) return []

    const { width: rawWidth, ...rest } = pointRecord
    const sanitizedPoint: Record<string, unknown> = {
      ...rest,
      x,
      y,
    }

    if ("width" in pointRecord) {
      const width = parseDistanceValue(rawWidth)
      // An unparsable width would corrupt the rendered SVG, and a missing
      // width renders fine, so it is dropped rather than kept as-is
      if (width !== undefined) {
        sanitizedPoint.width = width
      }
    }

    return [sanitizedPoint]
  })
}

export const sanitizeCircuitJsonForPcbSvg = (
  circuitJson: CircuitJson,
): CircuitJson =>
  circuitJson.flatMap((element) => {
    const elementRecord = element as Record<string, unknown>
    if (!pcbRenderableElementTypes.has(String(elementRecord.type))) return []

    let sanitizedElement = elementRecord

    const cloneElement = () => {
      if (sanitizedElement === elementRecord) {
        sanitizedElement = { ...elementRecord }
      }
      return sanitizedElement
    }

    if (Array.isArray(elementRecord.route)) {
      cloneElement().route = sanitizePcbPointArray(elementRecord.route)
    }

    if (Array.isArray(elementRecord.points)) {
      cloneElement().points = sanitizePcbPointArray(elementRecord.points)
    }

    if (Array.isArray(elementRecord.outline)) {
      cloneElement().outline = sanitizePcbPointArray(elementRecord.outline)
    }

    return [sanitizedElement]
  }) as CircuitJson
