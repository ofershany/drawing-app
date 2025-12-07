# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple, kid-friendly drawing app designed for a 6-year-old child. The app is built as a single-file HTML application with no dependencies or build process - it runs by simply opening `index.html` in a browser.

## Key Design Decisions

**Technology Choice:** Pure HTML/CSS/JavaScript (no Node.js, no build tools, no frameworks)
- Chosen for simplicity: just double-click the HTML file to run
- Zero setup required on Windows
- Easy to port to Android later (already has touch event support)

**Target Audience:** 6-year-old children
- Large, colorful buttons (60px x 60px for tools, 50px for size controls)
- Simple, intuitive interface
- Visual feedback with hover effects and golden glow for active tools
- Comic Sans MS font for kid-friendly appearance

## How to Run

Simply double-click `index.html` - no server, no installation, no dependencies needed.

## Architecture

The application is split into two main files in the `docs/` directory:

1. **docs/index.html**: HTML structure with inline CSS styling
   - All styling in `<style>` tag
   - Toolbar with tool buttons, color palette, size controls, and shape dropdown menu
   - Canvas element for drawing

2. **docs/script.js**: JavaScript implementation
   - Stamp templates with SVG definitions
   - Canvas drawing logic
   - Event handlers for mouse and touch interaction

### State Management

All application state is managed with simple JavaScript variables (lines 226-230):
- `isDrawing`: Boolean for tracking active drawing
- `currentTool`: String ('pen', 'eraser', 'circle', 'square', 'star')
- `currentColor`: Hex color string
- `brushSize`: Number (4 = small, 8 = medium, 16 = large)

### Drawing System

The app uses HTML5 Canvas API with two drawing modes:

1. **Continuous drawing** (pen/eraser): Uses path-based drawing with `beginPath()`, `moveTo()`, and `lineTo()`
2. **Stamp system**: Single-click or continuous stamping for shapes and images
   - SVG-based stamps stored in `stampTemplates` object with `MAIN_COLOR` placeholder for dynamic coloring
   - Stamps are pre-rendered as images with the current color using Data URLs
   - All stamps support brush size scaling
   - Most stamps sourced from OpenMoji (open-source emoji library, CC BY-SA 4.0)

**Important implementation details:**
- Eraser works by drawing white strokes at 2x the brush size
- Canvas resizes dynamically with window
- Touch events already implemented for mobile support
- Stamps support continuous stamping mode for repeated placement while dragging

### Tool Button System

All interactive elements use data attributes for configuration:
- Tools: `data-tool="pen|eraser"`
- Shapes/Stamps: `data-shape="circle|square|star|bunny|butterfly|cat|car|flower|thumbsup|thumbsdown|menorah|starofdavid|candle|gift"`
- Colors: `data-color="#RRGGBB"`
- Sizes: `data-size="4|8|16"`

Active states are managed by toggling `.active` class, which applies golden border and glow effect.

## Current Features

- **Drawing tools:** Pen (freehand), Eraser
- **Stamps:**
  - Basic shapes: Circle, Square, Star
  - Animals: Bunny, Butterfly, Cat (OpenMoji)
  - Objects: Car, Flower (OpenMoji)
  - Reactions: Thumbs Up, Thumbs Down (custom design)
  - Hanukkah: Menorah, Star of David, Candle, Gift (OpenMoji)
- **Colors:** 8 colors (Red, Orange, Yellow, Green, Blue, Purple, Pink, Black)
- **Brush sizes:** Small (4px), Medium (8px - default), Large (16px)
- **Continuous stamping:** Hold and drag to repeatedly stamp shapes
- **Clear canvas button**
- **Touch support** for tablets/phones (Android-ready)

## Planned Enhancements

Per README.md, future features to consider:
- Save/load drawings
- More stamps (seasonal themes, additional animals, etc.)
- Undo/Redo functionality
- Background colors/patterns

## Stamp System

Stamps use SVG templates with a color replacement system:
- Each stamp has an SVG definition in the `stampTemplates` object
- SVG uses `MAIN_COLOR` placeholder which gets replaced with the current color
- Stamps are converted to Image objects for fast rendering on canvas
- Sources: OpenMoji (CC BY-SA 4.0) for most stamps, custom designs for thumbs

## Styling Conventions

- Primary purple gradient background: `#667eea` to `#764ba2`
- Active tool highlight: Golden border (`#ffd700`) with glow effect
- Button hover: Scale transform (1.1x-1.15x) with shadow
- All borders: 3px solid, rounded corners (12px for rectangles, 50% for circles)

## When Adding New Features

- Maintain large button sizes (minimum 50x50px) for child usability
- HTML goes in `docs/index.html`, JavaScript in `docs/script.js`
- Use data attributes for tool/color/size/shape configuration
- Ensure touch event support for any new interactive elements
- Test that features work without any server or build process
- When adding new stamps:
  - Add SVG template to `stampTemplates` object in script.js
  - Add button with SVG preview to shape menu in index.html
  - Add case to `createShapeCursor()` and `drawShape()` switch statements
  - Use `MAIN_COLOR` placeholder in SVG for elements that should be colorable
  - Consider using OpenMoji for consistency when appropriate
