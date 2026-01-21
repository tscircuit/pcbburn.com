import "../src/index.css"
import React from "react"
import { MemoryRouter as Router } from "react-router-dom"
import {
  WorkspaceProvider,
  useWorkspace,
} from "../lib/components/workspace-context"
import { WorkspaceContent } from "../lib/components/workspace-layout"

import type { CircuitJson as CircuitJsonType } from "circuit-json"
// Load the sample LGA interconnect circuit JSON
import lgaInterconnectCircuitJson from "./assets/lga-interconnect.circuit.json"

// Component that initializes with sample circuit data
const WorkspaceWithSampleCircuit = () => {
  const { setCircuitJson, circuitJson } = useWorkspace()

  React.useEffect(() => {
    setCircuitJson(lgaInterconnectCircuitJson as CircuitJsonType)
  }, [])

  return <WorkspaceContent sidebarOpen={true} setSidebarOpen={() => {}} />
}

// Main fixture component with provider
const WorkspaceFixture = () => (
  <Router>
    <WorkspaceProvider>
      <WorkspaceWithSampleCircuit />
    </WorkspaceProvider>
  </Router>
)

export default <WorkspaceFixture />
