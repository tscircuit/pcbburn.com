import "../src/index.css"
import React from "react"
import {
  WorkspaceProvider,
  useWorkspace,
} from "../lib/components/workspace-context"
import { WorkspaceContent } from "../lib/components/workspace-layout"

// Load the sample LGA interconnect circuit JSON
import lgaInterconnectCircuitJson from "./assets/lga-interconnect.circuit.json"

// Component that initializes with sample circuit data
const WorkspaceWithSampleCircuit = () => {
  const { setCircuitData, circuitData } = useWorkspace()

  React.useEffect(() => {
    setCircuitData({
      json: lgaInterconnectCircuitJson,
      fileName: "lga-interconnect.circuit.json",
    })
  }, [setCircuitData])

  return <WorkspaceContent sidebarOpen={true} setSidebarOpen={() => {}} />
}

// Main fixture component with provider
const WorkspaceFixture = () => (
  <WorkspaceProvider>
    <WorkspaceWithSampleCircuit />
  </WorkspaceProvider>
)

export default <WorkspaceFixture />
