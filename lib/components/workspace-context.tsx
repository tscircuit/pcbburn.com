import { createContext, useContext, useState, type ReactNode } from "react"

interface CircuitData {
  json: any
  fileName: string
}

interface LbrnData {
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
  circuitData: CircuitData | null
  lbrnData: LbrnData | null
  lbrnOptions: LbrnOptions
  isConverting: boolean
  error: string | null
}

interface WorkspaceContextType extends WorkspaceState {
  setCircuitData: (data: CircuitData | null) => void
  setLbrnData: (data: LbrnData | null) => void
  setLbrnOptions: (options: Partial<LbrnOptions>) => void
  setIsConverting: (converting: boolean) => void
  setError: (error: string | null) => void
  convertToLbrn: (options?: any) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [circuitData, setCircuitData] = useState<CircuitData | null>(null)
  const [lbrnData, setLbrnData] = useState<LbrnData | null>(null)
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
    if (!circuitData) return

    setIsConverting(true)
    setError(null)

    try {
      const { convertCircuitJsonToLbrn } = await import("circuit-json-to-lbrn")

      const finalOptions = { ...lbrnOptions, ...options }

      const xml = convertCircuitJsonToLbrn(circuitData.json, finalOptions)

      setLbrnData({
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
    circuitData,
    lbrnData,
    lbrnOptions,
    isConverting,
    error,
    setCircuitData,
    setLbrnData,
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
