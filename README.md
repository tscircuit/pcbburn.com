# PCBBurn

PCBBurn is a web workspace for converting PCB designs into LightBurn-ready LBRN files. It accepts tscircuit Circuit JSON or KiCad `.kicad_pcb` files, previews the resulting geometry, lets you tune laser settings, and exports a downloadable `.lbrn` project for laser PCB ablation.

## What It Does

- Converts Circuit JSON or KiCad PCB files to LBRN via `circuit-json-to-lbrn`.
- Generates live SVG previews for both LBRN output and PCB geometry.
- Lets you adjust laser parameters, layer inclusion, margins, and origin offsets.
- Exports a LightBurn project you can load directly into LightBurn.

## How It Works

1. Upload a `.json` Circuit JSON file or a `.kicad_pcb` file in the workspace.
2. KiCad files are converted to Circuit JSON using `kicad-to-circuit-json`.
3. Circuit JSON is converted to LBRN XML using `circuit-json-to-lbrn`.
4. LBRN XML is parsed/rendered to SVG with `lbrnts` for preview.
5. Export the `.lbrn` file for LightBurn.

## Related tscircuit Repos

- `circuit-json-to-lbrn`: Converts Circuit JSON into LBRN XML with copper/soldermask options and laser settings.
- `lbrnts`: Type-safe library for parsing and generating LightBurn projects + SVG previews.

## Local Development

```bash
bun install
bun run dev
```

Then open `http://localhost:5173`.

## Scripts

- `bun run dev` - start Vite dev server
- `bun run build` - typecheck and build
- `bun run preview` - preview production build
- `bun run lint` - run Biome lint
- `bun run format` - format with Biome

## Settings Panel + LBRN Options

The workspace settings panel controls the options passed into `convertCircuitJsonToLbrn` and the laser profile metadata embedded in the exported `.lbrn` file.

**Core LBRN options**

- `includeCopper`: include copper traces/pads in the output.
- `includeSoldermask`: include soldermask openings for Kapton tape cutting.
- `includeCopperCutFill`: include a copper fill region for large-area ablation.
- `includeLayers`: choose `top`, `bottom`, or both layers.
- `laserSpotSize`: spot size used for raster/crosshatch spacing.
- `traceMargin`: clearance margin around traces (mm).
- `copperCutFillMargin`: extra margin for copper fill (mm).
- `globalCopperSoldermaskMarginAdjustment`: global offset for soldermask openings.
- `solderMaskMarginPercent`: percent-based adjustment for soldermask openings.
- `origin`: `{ x, y }` offsets to move the output origin.

**Laser profile settings**

Laser profiles map directly to LightBurn cut settings for copper and board passes. The panel exposes speed, passes, frequency, and pulse width for each pass type, and presets are defined in `lib/components/settings-panel.tsx`.

## Project Structure

- `src/main.tsx`: App entry wiring for Vite.
- `lib/components`: UI views (Landing, Workspace, Demo, etc.).
- `lib/components/workspace-context.tsx`: File ingestion + conversion state machine.
- `lib/components/settings-panel.tsx`: Laser defaults, upload UX, and LBRN option controls.
- `lib/hooks/preview-hooks.tsx`: LBRN + PCB SVG generation and view transforms.
- `examples/`: Demo circuit JSON used in the demo route.

## Notes

- The workspace auto-converts to LBRN when a valid circuit is loaded.
- LBRN previews are generated client-side; no server is required.
- Laser defaults live in `lib/components/settings-panel.tsx`.

