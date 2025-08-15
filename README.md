# X4 Foundations Blueprint Builder

[![Deploy to GitHub Pages](https://github.com/DanielGRasmussen/x4-reindexer/actions/workflows/deploy.yml/badge.svg)](https://github.com/DanielGRasmussen/x4-reindexer/actions)

A React-based web application for reordering and modifying X4 Foundations station blueprints.

## Features

### Blueprint Management

- **Drag-and-drop file upload** for X4 blueprint XML files
- **Rename blueprints** directly in the interface
- **Create new blueprint IDs** to avoid overwriting originals
- **Real-time module visualization** organized by type

### Module Priority Ordering

- **Visual priority builder** with drag-and-drop reordering
- **Partial module selection** - build specific quantities of each module type
- **Segment support** - split module groups into multiple build phases
- **Overusage detection** - warnings when segments conflict
- **Filter** by type

### Module Modifications

- **Coordinate adjustment** - move modules by X/Y/Z offsets
- **Module duplication** - create copies with configurable spacing
- **Type-based operations** - apply changes to specific module categories or types

### Module Classification

- Categorization (inspired by [this station calculator](http://www.x4-game.com/#/station-calculator)):
  - Refined Goods
  - High Tech Goods
  - Ship Technology
  - Recycling
  - Agricultural Goods L1
  - Agricultural Goods L2
  - Pharmaceutical Goods
  - Habitation
  - Dock Area
  - Pier
  - Build Module
  - Storage
  - Defense
  - Connection
  - Other (Observation decks, radar, and welfare modules)

### Export Options

- **Download** modified blueprint as XML
- **Copy to clipboard** for quick sharing
- **Preview** XML in browser
- Automatic file naming based on blueprint name

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/x4-blueprint-reindexer.git
   cd x4-blueprint-reindexer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Blueprint**: Drag and drop your X4 blueprint XML file onto the upload area
2. **Edit Name**: Click the blueprint name to rename it
3. **Set Build Order**:
   - Click modules in the "Available Modules" list to add them to the build order
   - Click priority items to show quantity sliders
   - Drag priority numbers to reorder
   - Use "Add All Remaining" for quick setup
4. **Apply Modifications** (optional):
   - Duplicate modules with custom spacing
   - Adjust module coordinates
5. **Export**: Download or copy your modified blueprint
6. **Install**: Place the exported file in: `Documents\Egosoft\X4\[YourSteamID]\constructionplans\`

## Customization

### Adding Display Names

Edit `src/utils/moduleTypeClassifier.ts` and add entries to `DISPLAY_NAME_OVERRIDES`:

```typescript
private static readonly MODULE_DICTIONARY: Record<string, ModuleDefinition> = {
	"hab_arg_s_01_macro": { displayName: "Argon S Habitat", type: ModuleType.Habitation },
	"hab_arg_m_01_macro": { displayName: "Argon M Habitat", type: ModuleType.Habitation },
	"hab_arg_l_01_macro": { displayName: "Argon L Habitat", type: ModuleType.Habitation },
	"hab_pir_s_01_macro": { displayName: "Argon S Dormitory", type: ModuleType.Habitation },
	"hab_pir_m_01_macro": { displayName: "Argon M Dormitory", type: ModuleType.Habitation },
	"hab_pir_l_01_macro": { displayName: "Argon L Dormitory", type: ModuleType.Habitation },
};
```

## Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
