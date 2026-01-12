import type { Matrix } from "transformation-matrix"

/** Identity matrix - no transformation applied */
export const IDENTITY_MATRIX: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

/**
 * Computes a fit-to-viewport transform that centers and scales the SVG
 * to fit within its container while maintaining aspect ratio.
 *
 * Transform math:
 * - scale = min(containerW / svgW, containerH / svgH) ensures SVG fits in container
 * - tx centers horizontally: (containerW - scaledSvgW) / 2
 * - ty centers vertically: (containerH - scaledSvgH) / 2
 */
export function computeFitTransform(
  svgElement: SVGSVGElement,
  containerElement: HTMLElement,
): Matrix {
  const containerW = containerElement.clientWidth
  const containerH = containerElement.clientHeight

  if (containerW === 0 || containerH === 0) {
    return IDENTITY_MATRIX
  }

  // Try to get dimensions from viewBox first (preferred), fallback to getBBox()
  let svgW: number
  let svgH: number

  const viewBox = svgElement.viewBox.baseVal
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    svgW = viewBox.width
    svgH = viewBox.height
  } else {
    // Fallback to getBBox() for SVGs without viewBox
    try {
      const bbox = svgElement.getBBox()
      svgW = bbox.width
      svgH = bbox.height
    } catch {
      // getBBox() can throw if SVG is not rendered yet
      return IDENTITY_MATRIX
    }
  }

  if (svgW === 0 || svgH === 0) {
    return IDENTITY_MATRIX
  }

  // Scale to fit while maintaining aspect ratio
  const scale = Math.min(containerW / svgW, containerH / svgH)

  // Center the scaled SVG in the container
  const tx = (containerW - svgW * scale) / 2
  const ty = (containerH - svgH * scale) / 2

  return { a: scale, b: 0, c: 0, d: scale, e: tx, f: ty }
}
