import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import type { CircuitJson } from "circuit-json"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"
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
