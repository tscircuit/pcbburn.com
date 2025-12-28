import "../src/index.css"
import React from "react"
import {
  WorkspaceProvider,
  useWorkspace,
} from "../lib/components/workspace-context"
import { WorkspaceContent } from "../lib/components/workspace-layout"

// Load the sample LGA interconnect circuit JSON
import lgaInterconnectCircuitJson from "./assets/lga-interconnect.circuit.json"
import type { CircuitJson as CircuitJsonType } from "circuit-json"

// Component that initializes with sample circuit data
const WorkspaceWithSampleCircuit = () => {
  const { setCircuitJson, circuitJson } = useWorkspace()

  React.useEffect(() => {
    setCircuitJson(lgaInterconnectCircuitJson as CircuitJsonType)
  }, [setCircuitJson])

  return <WorkspaceContent sidebarOpen={true} setSidebarOpen={() => {}} />
}

// Main fixture component with provider
const WorkspaceFixture = () => (
  <WorkspaceProvider>
    <WorkspaceWithSampleCircuit />
  </WorkspaceProvider>
)

export default <WorkspaceFixture />
