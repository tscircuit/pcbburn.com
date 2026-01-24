import { ArrowRight, Code, Eye, FileUp, Flame, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { ImageWithSkeleton } from "./image-with-skeleton"
import { Button } from "./ui/button"
import { VideoWithLoader } from "./video-with-loader"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              PCBBurn
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="https://tscircuit.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              tscircuit
            </Link>
            <Link
              to="https://docs.tscircuit.com/category/intro"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              to="https://github.com/tscircuit/pcbburn.com"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Github
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              className="transition-all hover:opacity-80"
              size="sm"
              asChild
            >
              <Link to="/workspace">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between md:py-12 md:px-12 md:h-[77vh]">
        {/* Demo Video Section */}
        <section className="px-4 md:pr-12 md:w-[40%] py-12">
          <div className="relative mx-auto w-full aspect-video rounded-xl overflow-hidden shadow-xl">
            <VideoWithLoader
              src="/assets/laserVid.MP4"
              className="w-full h-full object-cover pointer-events-none"
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-label="Laser machining demonstration video"
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="flex md:pl-12 flex-col md:w-[60%] items-center md:items-start justify-center px-4 py-12 ">
          <div className="md:max-w-xl w-full space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Upload & Burn PCBs
              <span className="block text-primary mt-2">In Seconds</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Convert tscircuit Circuit JSON and KiCad files to LBRN format with
              precision. Preview layers, adjust laser parameters, and export
              ready-to-cut files for professional results. It’s open source.
            </p>
          </div>
        </section>
      </div>
      <div className="flex flex-col sm:flex-row px-16 sm:px-0 gap-4 pt-4 items-center  justify-center">
        <Button size="lg" asChild>
          <Link to="/workspace">
            Start Converting <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/demo">View Demo</Link>
        </Button>
        <a
          href="https://github.com/tscircuit/pcbburn.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt="GitHub stars"
            src="https://img.shields.io/github/stars/tscircuit/pcbburn.com?style=social"
          />
        </a>
      </div>
      {/* PCB board Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl mb-6 font-bold text-balance">
            PCB Board Example
          </h2>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8 md:w-full text-sm md:text-lg text-muted-foreground">
            <div className="flex items-center gap-2">
              <Code className="size-4" />
              <span>Designed in tscircuit</span>
            </div>
            <ArrowRight className="size-4 text-primary md:rotate-0 rotate-90" />
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <span>Converted with PCBBurn</span>
            </div>
            <ArrowRight className="size-4 text-primary md:rotate-0 rotate-90" />
            <div className="flex items-center gap-2">
              <Flame className="size-4" />
              <span>Laser-cut perfection</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This board is designed in tscircuit and routed as a single-layer PCB
            using tscircuit’s autorouter. The design was converted into LBRN
            format using PCBBurn, then laser-cut directly into copper with
            tolerances approaching 0.1 mm trace widths. Finally, kapton tape was
            applied as a mask layer, and the laser was used to ablate that tape
            to define a soldermask pattern for assembly.{" "}
          </p>
          <div className="relative mx-auto max-w-xl">
            <ImageWithSkeleton
              src="/assets/board.jpeg"
              alt="Completed PCB board laser-cut using converted LBRN files from tscircuit design"
              className="w-full h-auto rounded-lg shadow-lg"
              skeletonClassName="aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24 ">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileUp className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Drag & Drop Upload</h3>
            <p className="text-muted-foreground leading-relaxed">
              Support for Circuit JSON and KiCad formats. Simply drag your files
              or click to browse. Instant validation and preview.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-accent/50 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Eye className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Live Preview</h3>
            <p className="text-muted-foreground leading-relaxed">
              Interactive canvas with zoom, pan, and layer controls. See exactly
              how your PCB will burn before exporting.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Precision Control</h3>
            <p className="text-muted-foreground leading-relaxed">
              Fine-tune laser speed, power, passes, and margins. Save presets
              for consistent results across projects.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to start burning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto text-balance">
            Join makers and professionals using PCBBurn (powered by tscircuit)
            for precision laser cutting.
          </p>
          <Button className="transition-all hover:opacity-80" size="lg" asChild>
            <Link to="/workspace">
              Launch Workspace <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded bg-primary flex items-center justify-center">
                  <Zap className="size-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">PCBBurn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional PCB laser cutting conversion tool built with
                tscircuit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/changelog"
                    className="hover:text-foreground transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guides"
                    className="hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>Powered by tscircuit • Professional PCB laser cutting</p>
            <p>&copy; 2025 PCBBurn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
