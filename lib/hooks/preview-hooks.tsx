import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { generateLightBurnSvg } from "lbrnts"
import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  type Matrix,
  compose,
  scale,
  toString as transformToString,
  translate,
} from "transformation-matrix"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { IDENTITY_MATRIX, computeFitTransform } from "../helpers/svg-transform"

export function useSvgGeneration({
  circuitJson,
  lbrnOptions,
  viewMode,
}: {
  circuitJson: CircuitJson | null
  lbrnOptions: ConvertCircuitJsonToLbrnOptions
  viewMode: "lbrn" | "pcb" | "both"
}) {
  const [lbrnSvg, setLbrnSvg] = useState("")
  const [pcbSvg, setPcbSvg] = useState("")
  const [isGeneratingLbrn, setIsGeneratingLbrn] = useState(false)
  const [isGeneratingPcb, setIsGeneratingPcb] = useState(false)

  const isGenerating = isGeneratingLbrn || isGeneratingPcb

  const lastLbrnInputs = useRef<{
    circuitJson: CircuitJson
    lbrnOptions: ConvertCircuitJsonToLbrnOptions
  } | null>(null)
  const lastPcbCircuit = useRef<CircuitJson | null>(null)

  useEffect(() => {
    if (!circuitJson) {
      setLbrnSvg("")
      setIsGeneratingLbrn(false)
      lastLbrnInputs.current = null
      return
    }

    if (viewMode === "pcb") {
      setIsGeneratingLbrn(false)
      return
    }

    if (
      lbrnSvg &&
      lastLbrnInputs.current?.circuitJson === circuitJson &&
      lastLbrnInputs.current?.lbrnOptions === lbrnOptions
    ) {
      setIsGeneratingLbrn(false)
      return
    }

    let cancelled = false

    const generateLbrnSvg = async () => {
      setIsGeneratingLbrn(true)
      try {
        const lbrnProject = convertCircuitJsonToLbrn(
          circuitJson as CircuitJson,
          lbrnOptions,
        )
        const lbrnSvgResult = generateLightBurnSvg(lbrnProject)
        if (!cancelled) {
          setLbrnSvg(String(lbrnSvgResult))
          lastLbrnInputs.current = { circuitJson, lbrnOptions }
        }
      } catch (err) {
        console.error("Failed to generate LBRN SVG:", err)
        if (!cancelled) {
          setLbrnSvg("")
          lastLbrnInputs.current = null
        }
      } finally {
        if (!cancelled) {
          setIsGeneratingLbrn(false)
        }
      }
    }

    generateLbrnSvg()

    return () => {
      cancelled = true
    }
  }, [circuitJson, lbrnOptions, viewMode, lbrnSvg])

  useEffect(() => {
    if (!circuitJson) {
      setPcbSvg("")
      setIsGeneratingPcb(false)
      lastPcbCircuit.current = null
      return
    }

    if (viewMode === "lbrn") {
      setIsGeneratingPcb(false)
      return
    }

    if (pcbSvg && lastPcbCircuit.current === circuitJson) {
      setIsGeneratingPcb(false)
      return
    }

    let cancelled = false

    const generatePcbSvg = async () => {
      setIsGeneratingPcb(true)
      try {
        const pcbSvgResult = convertCircuitJsonToPcbSvg(
          circuitJson as CircuitJson,
        )
        if (!cancelled) {
          setPcbSvg(String(pcbSvgResult))
          lastPcbCircuit.current = circuitJson
        }
      } catch (err) {
        console.error("Failed to generate PCB SVG:", err)
        if (!cancelled) {
          setPcbSvg("")
          lastPcbCircuit.current = null
        }
      } finally {
        if (!cancelled) {
          setIsGeneratingPcb(false)
        }
      }
    }

    generatePcbSvg()

    return () => {
      cancelled = true
    }
  }, [circuitJson, viewMode, pcbSvg])

  return { lbrnSvg, pcbSvg, isGenerating }
}

export function useSvgTransform({
  svgToPreview,
  viewMode,
  lbrnSvgDivRef,
  pcbSvgDivRef,
  lbrnContainerRef,
  pcbContainerRef,
  lbrnSvg,
  pcbSvg,
  circuitJson,
  isSideBySide = false,
}: {
  svgToPreview: "lbrn" | "pcb"
  viewMode: "lbrn" | "pcb" | "both"
  lbrnSvgDivRef: RefObject<HTMLDivElement | null>
  pcbSvgDivRef: RefObject<HTMLDivElement | null>
  lbrnContainerRef: RefObject<HTMLElement | null>
  pcbContainerRef: RefObject<HTMLElement | null>
  lbrnSvg: string
  pcbSvg: string
  circuitJson: CircuitJson | null
  isSideBySide?: boolean
}) {
  // Track whether we've computed the initial fit for each view
  const [lbrnInitialized, setLbrnInitialized] = useState(false)
  const [pcbInitialized, setPcbInitialized] = useState(false)

  // Store computed fit transforms to pass as initialTransform
  const [lbrnInitialTransform, setLbrnInitialTransform] =
    useState<Matrix>(IDENTITY_MATRIX)
  const [pcbInitialTransform, setPcbInitialTransform] =
    useState<Matrix>(IDENTITY_MATRIX)

  // Pass initialTransform to the hook - this sets the starting point for mouse interactions
  const lbrnHookResult = useMouseMatrixTransform({
    enabled: svgToPreview === "lbrn" || isSideBySide,
    initialTransform: lbrnInitialTransform,
  })

  const pcbHookResult = useMouseMatrixTransform({
    enabled: svgToPreview === "pcb" || isSideBySide,
    initialTransform: pcbInitialTransform,
  })

  // Compute and set initial fit transform for LBRN when circuit changes
  useLayoutEffect(() => {
    if (!circuitJson || !lbrnSvg || lbrnInitialized) return

    // Use requestAnimationFrame to ensure SVG is rendered in DOM
    const frameId = requestAnimationFrame(() => {
      const svgDiv = lbrnSvgDivRef.current
      const container = lbrnContainerRef.current
      if (!svgDiv || !container) return

      const svgElement = svgDiv.querySelector("svg")
      if (!svgElement) return

      const fitTransform = computeFitTransform(svgElement, container)
      setLbrnInitialTransform(fitTransform)
      lbrnHookResult.setTransform(fitTransform)
      setLbrnInitialized(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [
    circuitJson,
    lbrnSvg,
    lbrnSvgDivRef,
    lbrnContainerRef,
    lbrnInitialized,
    lbrnHookResult,
  ])

  // Compute and set initial fit transform for PCB when circuit changes
  useLayoutEffect(() => {
    if (!circuitJson || !pcbSvg || pcbInitialized) return

    const frameId = requestAnimationFrame(() => {
      const svgDiv = pcbSvgDivRef.current
      const container = pcbContainerRef.current
      if (!svgDiv || !container) return

      const svgElement = svgDiv.querySelector("svg")
      if (!svgElement) return

      const fitTransform = computeFitTransform(svgElement, container)
      setPcbInitialTransform(fitTransform)
      pcbHookResult.setTransform(fitTransform)
      setPcbInitialized(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [
    circuitJson,
    pcbSvg,
    pcbSvgDivRef,
    pcbContainerRef,
    pcbInitialized,
    pcbHookResult,
  ])

  // Track previous values to detect changes
  const prevCircuitJson = useRef(circuitJson)
  const prevIsSideBySide = useRef(isSideBySide)
  const prevSvgToPreview = useRef(svgToPreview)

  // Reset initialization when circuit or view mode changes
  useEffect(() => {
    const circuitChanged = prevCircuitJson.current !== circuitJson
    const viewModeChanged = prevIsSideBySide.current !== isSideBySide
    // When switching between single views (lbrn <-> pcb), the container size changes
    // so we need to recompute the fit transform for the newly active view
    const singleViewChanged =
      !isSideBySide && prevSvgToPreview.current !== svgToPreview

    if (circuitChanged || viewModeChanged) {
      setLbrnInitialized(false)
      setPcbInitialized(false)
    }
    // When switching single views, reset the view we're switching TO
    if (singleViewChanged) {
      if (svgToPreview === "lbrn") {
        setLbrnInitialized(false)
      } else {
        setPcbInitialized(false)
      }
    }

    prevCircuitJson.current = circuitJson
    prevIsSideBySide.current = isSideBySide
    prevSvgToPreview.current = svgToPreview
  })

  // Apply transforms from the mouse hook directly
  useLayoutEffect(() => {
    if (lbrnSvgDivRef.current && lbrnHookResult.transform) {
      lbrnSvgDivRef.current.style.transform = transformToString(
        lbrnHookResult.transform,
      )
    }
    if (pcbSvgDivRef.current && pcbHookResult.transform) {
      pcbSvgDivRef.current.style.transform = transformToString(
        pcbHookResult.transform,
      )
    }
  }, [
    lbrnHookResult.transform,
    pcbHookResult.transform,
    lbrnSvgDivRef,
    pcbSvgDivRef,
  ])

  const scaleMatrix = useCallback(
    (matrix: Matrix, factor: number, centerX: number, centerY: number) => {
      return compose(
        compose(
          translate(centerX, centerY),
          compose(scale(factor, factor), translate(-centerX, -centerY)),
        ),
        matrix,
      )
    },
    [],
  )

  const zoomIn = useCallback(() => {
    const factor = 1.2
    if (viewMode === "both") {
      const lbrnRect = lbrnContainerRef.current?.getBoundingClientRect()
      if (lbrnRect) {
        const centerX = lbrnRect.width / 2
        const centerY = lbrnRect.height / 2
        const newLbrn = scaleMatrix(
          lbrnHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        lbrnHookResult.setTransform(newLbrn)
      }
      const pcbRect = pcbContainerRef.current?.getBoundingClientRect()
      if (pcbRect) {
        const centerX = pcbRect.width / 2
        const centerY = pcbRect.height / 2
        const newPcb = scaleMatrix(
          pcbHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        pcbHookResult.setTransform(newPcb)
      }
    } else if (svgToPreview === "lbrn") {
      const rect = lbrnContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const newTransform = scaleMatrix(
          lbrnHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        lbrnHookResult.setTransform(newTransform)
      }
    } else {
      const rect = pcbContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const newTransform = scaleMatrix(
          pcbHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        pcbHookResult.setTransform(newTransform)
      }
    }
  }, [
    viewMode,
    svgToPreview,
    lbrnHookResult,
    pcbHookResult,
    scaleMatrix,
    lbrnContainerRef,
    pcbContainerRef,
  ])

  const zoomOut = useCallback(() => {
    const factor = 1 / 1.2
    if (viewMode === "both") {
      const lbrnRect = lbrnContainerRef.current?.getBoundingClientRect()
      if (lbrnRect) {
        const centerX = lbrnRect.width / 2
        const centerY = lbrnRect.height / 2
        const newLbrn = scaleMatrix(
          lbrnHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        lbrnHookResult.setTransform(newLbrn)
      }
      const pcbRect = pcbContainerRef.current?.getBoundingClientRect()
      if (pcbRect) {
        const centerX = pcbRect.width / 2
        const centerY = pcbRect.height / 2
        const newPcb = scaleMatrix(
          pcbHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        pcbHookResult.setTransform(newPcb)
      }
    } else if (svgToPreview === "lbrn") {
      const rect = lbrnContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const newTransform = scaleMatrix(
          lbrnHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        lbrnHookResult.setTransform(newTransform)
      }
    } else {
      const rect = pcbContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const newTransform = scaleMatrix(
          pcbHookResult.transform,
          factor,
          centerX,
          centerY,
        )
        pcbHookResult.setTransform(newTransform)
      }
    }
  }, [
    viewMode,
    svgToPreview,
    lbrnHookResult,
    pcbHookResult,
    scaleMatrix,
    lbrnContainerRef,
    pcbContainerRef,
  ])

  const fitToScreen = useCallback(() => {
    if (viewMode === "both" || svgToPreview === "lbrn") {
      const svgDiv = lbrnSvgDivRef.current
      const container = lbrnContainerRef.current
      if (svgDiv && container) {
        const svgElement = svgDiv.querySelector("svg")
        if (svgElement) {
          const fitTransform = computeFitTransform(svgElement, container)
          lbrnHookResult.setTransform(fitTransform)
          setLbrnInitialTransform(fitTransform)
        }
      }
    }
    if (viewMode === "both" || svgToPreview === "pcb") {
      const svgDiv = pcbSvgDivRef.current
      const container = pcbContainerRef.current
      if (svgDiv && container) {
        const svgElement = svgDiv.querySelector("svg")
        if (svgElement) {
          const fitTransform = computeFitTransform(svgElement, container)
          pcbHookResult.setTransform(fitTransform)
          setPcbInitialTransform(fitTransform)
        }
      }
    }
  }, [
    viewMode,
    svgToPreview,
    lbrnSvgDivRef,
    lbrnContainerRef,
    pcbSvgDivRef,
    pcbContainerRef,
    lbrnHookResult,
    pcbHookResult,
  ])

  return {
    ref: svgToPreview === "lbrn" ? lbrnHookResult.ref : pcbHookResult.ref,
    lbrnRef: lbrnHookResult.ref,
    pcbRef: pcbHookResult.ref,
    zoomIn,
    zoomOut,
    fitToScreen,
  }
}
