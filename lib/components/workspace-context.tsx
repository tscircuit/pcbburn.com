import { createContext, useContext, useState, type ReactNode } from "react"
import type { CircuitJson } from "circuit-json"

interface LbrnFileContent {
  xml: string | any
  options: any
}

interface LbrnOptions {
  includeCopper: boolean
  includeSoldermask: boolean
  includeSilkscreen: boolean
  includeLayers: Array<"top" | "bottom">
  laserSpotSize: number
  traceMargin: number
  origin?: { x: number; y: number }
}

interface WorkspaceState {
  circuitJson: CircuitJson | null
  lbrnFileContent: LbrnFileContent | null
  lbrnOptions: LbrnOptions
  isConverting: boolean
  error: string | null
}

interface WorkspaceContextType extends WorkspaceState {
  setCircuitJson: (data: CircuitJson | null) => void
  setLbrnFileContent: (data: LbrnFileContent | null) => void
  setLbrnOptions: (options: Partial<LbrnOptions>) => void
  setIsConverting: (converting: boolean) => void
  setError: (error: string | null) => void
  convertToLbrn: (options?: any) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [circuitJson, setCircuitJson] = useState<CircuitJson | null>(null)
  const [lbrnFileContent, setLbrnFileContent] =
    useState<LbrnFileContent | null>(null)
  const [lbrnOptions, setLbrnOptionsState] = useState<LbrnOptions>({
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

  const setLbrnOptions = (options: Partial<LbrnOptions>) => {
    setLbrnOptionsState((prev) => ({ ...prev, ...options }))
  }

  const convertToLbrn = async (options?: Partial<LbrnOptions>) => {
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
