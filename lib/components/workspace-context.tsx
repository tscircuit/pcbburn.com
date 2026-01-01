import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import type { CircuitJson } from "circuit-json"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"
import { KicadToCircuitJsonConverter } from "kicad-to-circuit-json"
interface LbrnFileContent {
  xml: string | any
  options: any
}

interface WorkspaceState {
  circuitJson: CircuitJson | null
  lbrnFileContent: LbrnFileContent | null
  lbrnOptions: ConvertCircuitJsonToLbrnOptions
  isConverting: boolean
  error: string | null
}

interface WorkspaceContextType extends WorkspaceState {
  setCircuitJson: (data: CircuitJson | null) => void
  setLbrnFileContent: (data: LbrnFileContent | null) => void
  setLbrnOptions: (options: Partial<ConvertCircuitJsonToLbrnOptions>) => void
  setIsConverting: (converting: boolean) => void
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
      includeSoldermask: false,
      includeSilkscreen: false,
      includeLayers: ["top", "bottom"],
      laserSpotSize: 0.005,
      traceMargin: 0,
      origin: { x: 0, y: 0 },
    })
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setCircuitJson = (data: CircuitJson | null) => {
    setCircuitJsonState(data)
    setLbrnFileContent(null) // Reset LBRN content when new circuit is loaded
  }

  const setLbrnOptions = (
    options: Partial<ConvertCircuitJsonToLbrnOptions>,
  ) => {
    setLbrnOptionsState((prev) => ({ ...prev, ...options }))
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

    if (fileName.endsWith(".json")) {
      // Handle Circuit JSON files
      try {
        const text = await file.text()
        const circuitJsonData = JSON.parse(text)
        setCircuitJson(circuitJsonData)
      } catch (err) {
        alert("Invalid JSON file")
      }
    } else if (fileName.endsWith(".kicad_pcb")) {
      // Handle KiCad PCB files
      try {
        const text = await file.text()
        await loadKicadPcbFile(text)
      } catch (err) {
        alert(`Failed to convert KiCad file: ${err}`)
      }
    } else {
      alert("Please upload a .json or .kicad_pcb file")
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
          alert("No .kicad_pcb file found in the dropped folder")
          return
        }
      }
    }

    // Handle file drops (existing behavior)
    const files = dataTransfer.files
    if (files.length > 0) {
      await processCircuitFile(files[0])
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

      const xml = convertCircuitJsonToLbrn(circuitJson, finalOptions)

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
    error,
    setCircuitJson,
    setLbrnFileContent,
    setLbrnOptions,
    setIsConverting,
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

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
