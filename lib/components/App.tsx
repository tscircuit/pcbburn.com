import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./LandingPage"
import { WorkspaceLayout } from "./workspace-layout"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspaceLayout />} />
      </Routes>
    </Router>
  )
}

export default App
