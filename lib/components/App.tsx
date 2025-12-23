function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-3xl px-6 py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          PCB Burn
        </h1>
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          Design and burn PCBs using tscircuit - the TypeScript framework for
          hardware. Write circuits in code, visualize instantly, and manufacture
          with confidence.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Code-Driven Design
            </h3>
            <p className="text-gray-600">
              Write PCB layouts in TypeScript with tscircuit's intuitive API
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Preview
            </h3>
            <p className="text-gray-600">
              See your circuit come to life with live PCB and schematic previews
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy Manufacturing
            </h3>
            <p className="text-gray-600">
              Export to industry-standard formats for seamless fabrication
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Powered by tscircuit • Built with React & TypeScript
        </p>
      </div>
    </div>
  )
}

export default App
