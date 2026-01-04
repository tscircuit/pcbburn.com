import { useEffect, useState } from "react"
import { WorkspaceProvider, useWorkspace } from "@/components/workspace-context"
import { WorkspaceContent } from "@/components/workspace-layout"
import type { CircuitJson } from "circuit-json"
import demoCircuit from "../../examples/assets/lga-interconnect.circuit.json"

function DemoLoader() {
  const { setCircuitJson } = useWorkspace()

  useEffect(() => {
    setCircuitJson(demoCircuit as CircuitJson)
  }, [])

  return null
}

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <WorkspaceProvider>
      <DemoLoader />
      <WorkspaceContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </WorkspaceProvider>
  )
}
