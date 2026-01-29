import type { CircuitJson } from "circuit-json"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"
import { KicadToCircuitJsonConverter } from "kicad-to-circuit-json"
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

const isValidCircuitJson = (data: unknown): data is CircuitJson => {
  if (!Array.isArray(data) || data.length === 0) {
    return false
  }
  // Simple validation: check that all elements are objects with a type property
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.type === "string",
  )
}
interface LbrnFileContent {
  xml: string | any
  options: any
}

interface WorkspaceState {
  circuitJson: CircuitJson | null
  lbrnFileContent: LbrnFileContent | null
  lbrnOptions: ConvertCircuitJsonToLbrnOptions
  isConverting: boolean
  isProcessingFile: boolean
  error: string | null
}

interface WorkspaceContextType extends WorkspaceState {
  setCircuitJson: (data: CircuitJson | null) => void
  setLbrnFileContent: (data: LbrnFileContent | null) => void
  setLbrnOptions: (options: Partial<ConvertCircuitJsonToLbrnOptions>) => void
  setIsConverting: (converting: boolean) => void
  setIsProcessingFile: (processing: boolean) => void
  setError: (error: string | null) => void
  convertToLbrn: (options?: any) => Promise<void>
  loadKicadPcbFile: (pcbContent: string) => Promise<void>
  processCircuitFile: (file: File) => Promise<void>
  findKicadPcbInDirectory: (
    entry: FileSystemDirectoryEntry,
  ) => Promise<File | null>
  processCircuitDrop: (dataTransfer: DataTransfer) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [circuitJson, setCircuitJsonState] = useState<CircuitJson | null>(null)
  const [lbrnFileContent, setLbrnFileContent] =
    useState<LbrnFileContent | null>(null)
  const [lbrnOptions, setLbrnOptionsState] =
    useState<ConvertCircuitJsonToLbrnOptions>({
      includeCopper: true,
      includeSoldermask: true,
      includeSilkscreen: true,
      includeCopperCutFill: true,
      includeOxidationCleaningLayer: true,
      includeSoldermaskCure: true,
      includeLayers: ["top"],
      laserSpotSize: 0.005,
      traceMargin: 0,
      copperCutFillMargin: 0,
      globalCopperSoldermaskMarginAdjustment: 0,
      solderMaskMarginPercent: 0,
      origin: { x: 0, y: 0 },
    })
  const [isConverting, setIsConverting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setCircuitJson = (data: CircuitJson | null) => {
    setCircuitJsonState(data)
    setLbrnFileContent(null) // Reset LBRN content when new circuit is loaded
  }

  const setLbrnOptions = (
    options: Partial<ConvertCircuitJsonToLbrnOptions>,
  ) => {
    setLbrnOptionsState((prev) => ({
      ...prev,
      ...options,
      includeCopper: true,
      includeSoldermask: true,
      includeSilkscreen: true,
      includeCopperCutFill: true,
      includeOxidationCleaningLayer: true,
      includeSoldermaskCure: true,
      includeLayers: ["top"],
    }))
  }

  // Auto-convert to LBRN when circuit is loaded
  React.useEffect(() => {
    if (circuitJson && !lbrnFileContent && !isConverting) {
      convertToLbrn()
    }
  }, [circuitJson, lbrnFileContent, isConverting])

  const loadKicadPcbFile = async (pcbContent: string) => {
    setIsConverting(true)
    setError(null)

    try {
      const converter = new KicadToCircuitJsonConverter()
      converter.addFile("circuit.kicad_pcb", pcbContent)
      converter.runUntilFinished()
      const circuitJsonOutput = converter.getOutput()
      const warnings = converter.getWarnings()
      const stats = converter.getStats()

      if (warnings.length > 0) {
        console.warn("KiCad conversion warnings:", warnings)
      }
      console.log("KiCad conversion stats:", stats)

      setCircuitJson(circuitJsonOutput)
    } catch (err) {
      console.error("Failed to convert KiCad file:", err)
      setError(err instanceof Error ? err.message : "KiCad conversion failed")
      throw err
    } finally {
      setIsConverting(false)
    }
  }

  const processCircuitFile = async (file: File) => {
    const fileName = file.name.toLowerCase()
    setError(null)

    try {
      if (fileName.endsWith(".json")) {
        // Handle Circuit JSON files
        const text = await file.text()
        let circuitJsonData: CircuitJson
        try {
          circuitJsonData = JSON.parse(text)
        } catch (err) {
          setError(
            `Invalid JSON file: ${err instanceof Error ? err.message : "parse error"}`,
          )
          return
        }
        if (!isValidCircuitJson(circuitJsonData)) {
          setError("Invalid circuit JSON: expected array of circuit elements")
          return
        }
        setCircuitJson(circuitJsonData)
      } else if (fileName.endsWith(".kicad_pcb")) {
        // Handle KiCad PCB files
        const text = await file.text()
        await loadKicadPcbFile(text)
      } else {
        setError("Please upload a .json or .kicad_pcb file")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
    }
  }

  const findKicadPcbInDirectory = async (
    entry: FileSystemDirectoryEntry,
  ): Promise<File | null> => {
    return new Promise((resolve) => {
      const reader = entry.createReader()
      reader.readEntries(async (entries) => {
        for (const entry of entries) {
          if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry
            if (fileEntry.name.toLowerCase().endsWith(".kicad_pcb")) {
              fileEntry.file((file) => resolve(file))
              return
            }
          } else if (entry.isDirectory) {
            // Recursively search subdirectories
            const subResult = await findKicadPcbInDirectory(
              entry as FileSystemDirectoryEntry,
            )
            if (subResult) {
              resolve(subResult)
              return
            }
          }
        }
        resolve(null)
      })
    })
  }

  const processCircuitDrop = async (dataTransfer: DataTransfer) => {
    const items = dataTransfer.items
    if (items.length === 0) return

    try {
      setIsProcessingFile(true)

      // Check if it's a directory drop
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const entry = item.webkitGetAsEntry?.()

        if (entry?.isDirectory) {
          // Handle folder drop - look for .kicad_pcb file
          const kicadFile = await findKicadPcbInDirectory(
            entry as FileSystemDirectoryEntry,
          )
          if (kicadFile) {
            await processCircuitFile(kicadFile)
            return
          } else {
            setError("No .kicad_pcb file found in the dropped folder")
            return
          }
        }
      }

      // Handle file drops (existing behavior)
      const files = dataTransfer.files
      if (files.length > 0) {
        await processCircuitFile(files[0])
      }
    } finally {
      setIsProcessingFile(false)
    }
  }

  const convertToLbrn = async (
    options?: Partial<ConvertCircuitJsonToLbrnOptions>,
  ) => {
    if (!circuitJson) return

    setIsConverting(true)
    setError(null)

    try {
      const { convertCircuitJsonToLbrn } = await import("circuit-json-to-lbrn")

      const finalOptions = { ...lbrnOptions, ...options }

      const rawXml = await convertCircuitJsonToLbrn(circuitJson, finalOptions)
      const xml = formatLbrnXml(rawXml)

      setLbrnFileContent({
        xml,
        options: finalOptions,
      })
    } catch (err) {
      console.error("Conversion error:", err)
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setIsConverting(false)
    }
  }

  const value: WorkspaceContextType = {
    circuitJson,
    lbrnFileContent,
    lbrnOptions,
    isConverting,
    isProcessingFile,
    error,
    setCircuitJson,
    setLbrnFileContent,
    setLbrnOptions,
    setIsConverting,
    setIsProcessingFile,
    setError,
    convertToLbrn,
    loadKicadPcbFile,
    processCircuitFile,
    findKicadPcbInDirectory,
    processCircuitDrop,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

const formatLbrnXml = (value: unknown): string => {
  if (typeof value === "string") {
    return value
  }

  if (value && typeof value === "object") {
    const candidate = value as { xml?: unknown; outerHTML?: unknown }
    if (typeof candidate.xml === "string") {
      return candidate.xml
    }
    if (typeof candidate.outerHTML === "string") {
      return candidate.outerHTML
    }
  }

  if (typeof window !== "undefined" && value instanceof XMLDocument) {
    return new XMLSerializer().serializeToString(value)
  }

  if (typeof window !== "undefined" && value instanceof Element) {
    return new XMLSerializer().serializeToString(value)
  }

  if (Array.isArray(value)) {
    return value.map(formatLbrnXml).join("")
  }

  const fallback = String(value)
  if (fallback.startsWith("[object ") && fallback.endsWith("]")) {
    const inner = fallback.slice(8, -1)
    if (inner.trim().startsWith("<?xml")) {
      return inner
    }
  }

  return fallback
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
