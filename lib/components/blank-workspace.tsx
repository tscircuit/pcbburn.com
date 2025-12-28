import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileUp, Zap, ArrowRight, CircuitBoard } from "lucide-react"
import { useWorkspace } from "./workspace-context"

export function BlankWorkspace() {
  const { setCircuitJson } = useWorkspace()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("Please upload a JSON file")
      return
    }

    try {
      const text = await file.text()
      const CircuitJson = JSON.parse(text)
      setCircuitJson(CircuitJson)
    } catch (err) {
      alert("Invalid JSON file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-8 bg-muted/10">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full bg-primary/10 border border-primary text-sm text-primary">
            <Zap className="size-3.5" />
            <span className="font-medium">Circuit to LBRN Converter</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Convert Your Circuit
            <span className="block text-primary">to Laser-Ready Files</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your Circuit JSON or KiCad file to start converting it into
            LBRN format for precise PCB laser cutting. Supports Circuit JSON
            from tscircuit and KiCad files.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg transition-all duration-200 ${
              isDragOver
                ? "bg-primary/5 border-primary/50 scale-[1.02]"
                : "bg-card"
            }`}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="blank-workspace-file"
            />

            <label
              htmlFor="blank-workspace-file"
              className="cursor-pointer block"
            >
              <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="size-8 text-primary" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">
                    {isDragOver
                      ? "Drop your Circuit JSON here"
                      : "Upload Circuit JSON"}
                  </h3>
                  <p className="text-muted-foreground">
                    Drag & drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .json files from tscircuit and KiCad
                  </p>
                </div>

                <Button size="lg" className="gap-2">
                  <FileUp className="size-4" />
                  Choose File
                </Button>
              </div>
            </label>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <FileUp className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Upload JSON</h3>
            <p className="text-sm text-muted-foreground">
              Import your circuit designs from tscircuit or export Circuit JSON
              from KiCad.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <CircuitBoard className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Convert to LBRN</h3>
            <p className="text-sm text-muted-foreground">
              Automatically convert traces, pads, and solder mask into
              LightBurn-ready format.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Laser Cut</h3>
            <p className="text-sm text-muted-foreground">
              Export LBRN files for laser PCB fabrication ablation.
            </p>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ArrowRight className="size-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Getting Started</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Export Circuit JSON from your tscircuit project</li>
                <li>• Or convert KiCad designs to Circuit JSON format</li>
                <li>
                  • Upload here to generate laser-cutting ready LBRN files
                </li>
                <li>• Fine-tune settings and export for your laser cutter</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Supported Formats */}
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="gap-1.5">
            tscircuit JSON
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            KiCad Circuit JSON
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            LBRN Export
          </Badge>
        </div>
      </div>
    </div>
  )
}
