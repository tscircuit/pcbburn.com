import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./LandingPage"
import { WorkspaceLayout } from "./workspace-layout"
import DemoPage from "./DemoPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspaceLayout />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </Router>
  )
}

export default App
