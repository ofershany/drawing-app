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

The entire application is contained in a single `index.html` file with three sections:

1. **CSS Styles** (lines 7-163): All styling inline in `<style>` tag
2. **HTML Structure** (lines 165-209): Toolbar and canvas elements
3. **JavaScript Logic** (lines 211-381): Canvas drawing implementation

### State Management

All application state is managed with simple JavaScript variables (lines 226-230):
- `isDrawing`: Boolean for tracking active drawing
- `currentTool`: String ('pen', 'eraser', 'circle', 'square', 'star')
- `currentColor`: Hex color string
- `brushSize`: Number (4 = small, 8 = medium, 16 = large)

### Drawing System

The app uses HTML5 Canvas API with two drawing modes:

1. **Continuous drawing** (pen/eraser): Uses path-based drawing with `beginPath()`, `moveTo()`, and `lineTo()`
2. **Shape stamping** (circle/square/star): Single-click placement using fill methods

**Important implementation details:**
- Eraser works by drawing white strokes at 2x the brush size (line 304)
- Canvas resizes dynamically with window (lines 216-224)
- Touch events already implemented for mobile support (lines 369-380)

### Tool Button System

All interactive elements use data attributes for configuration:
- Tools: `data-tool="pen|eraser|circle|square|star"`
- Colors: `data-color="#RRGGBB"`
- Sizes: `data-size="4|8|16"`

Active states are managed by toggling `.active` class, which applies golden border and glow effect.

## Current Features

- **Drawing tools:** Pen (freehand), Eraser
- **Shapes:** Circle (40px radius), Square (80px), Star (5-pointed, 45px outer radius)
- **Colors:** 8 colors (Red, Orange, Yellow, Green, Blue, Purple, Pink, Black)
- **Brush sizes:** Small (4px), Medium (8px - default), Large (16px)
- **Clear canvas button**
- **Touch support** for tablets/phones (Android-ready)

## Planned Enhancements

Per README.md, future features to consider:
- Save/load drawings
- More shapes (triangle, heart)
- Undo/Redo functionality
- Background colors/patterns

## Styling Conventions

- Primary purple gradient background: `#667eea` to `#764ba2`
- Active tool highlight: Golden border (`#ffd700`) with glow effect
- Button hover: Scale transform (1.1x-1.15x) with shadow
- All borders: 3px solid, rounded corners (12px for rectangles, 50% for circles)

## When Adding New Features

- Maintain large button sizes (minimum 50x50px) for child usability
- Keep all code in the single `index.html` file unless complexity requires separation
- Use data attributes for tool/color/size configuration
- Ensure touch event support for any new interactive elements
- Test that features work without any server or build process
