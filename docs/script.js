const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#FF0000';
let brushSize = 12; // Medium is the default
let currentShape = 'star';

// Rainbow colors
const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
let currentRainbowColor = rainbowColors[0];
let rainbowStrokeLength = 0;
const rainbowColorChangeDistance = 50; // Change color every 50 pixels of drawing

function getRandomRainbowColor() {
    return rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
}

function getNextRainbowColor() {
    let newColor;
    do {
        newColor = getRandomRainbowColor();
    } while (newColor === currentRainbowColor); // Ensure we get a different color
    return newColor;
}

function createRainbowGradient(x, y, size) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    rainbowColors.forEach((color, index) => {
        gradient.addColorStop(index / (rainbowColors.length - 1), color);
    });
    return gradient;
}

function createRainbowLinearGradient(x, y, size) {
    const gradient = ctx.createLinearGradient(x, y - size, x, y + size);
    rainbowColors.forEach((color, index) => {
        gradient.addColorStop(index / (rainbowColors.length - 1), color);
    });
    return gradient;
}

// Create dynamic cursor based on brush size
function createPenCursor(size, color) {
    // Use actual brush size for cursor
    const cursorSize = Math.max(size * 4, 32); // Ensure minimum visible size
    const center = cursorSize / 2;
    const radius = size / 2; // Half brush size for radius

    // For rainbow, use a multi-color circle
    const fillColor = color === 'rainbow' ? 'none' : color;
    const strokeColor = color === 'rainbow' ? 'url(#rainbowGrad)' : color;

    const rainbowGradient = color === 'rainbow' ?
        `<defs>
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF0000"/>
                <stop offset="16%" style="stop-color:#FF7F00"/>
                <stop offset="33%" style="stop-color:#FFFF00"/>
                <stop offset="50%" style="stop-color:#00FF00"/>
                <stop offset="66%" style="stop-color:#0000FF"/>
                <stop offset="83%" style="stop-color:#4B0082"/>
                <stop offset="100%" style="stop-color:#9400D3"/>
            </linearGradient>
        </defs>` : '';

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}' viewBox='0 0 ${cursorSize} ${cursorSize}'>
        ${rainbowGradient}
        <circle cx='${center}' cy='${center}' r='${radius}' fill='${fillColor}' stroke='${strokeColor}' stroke-width='${Math.max(1, size / 6)}'/>
    </svg>`;
    const encoded = encodeURIComponent(svg);
    return `url("data:image/svg+xml,${encoded}") ${center} ${center}, crosshair`;
}

function createEraserCursor(size) {
    // Eraser is 2x brush size
    const eraserSize = size * 2;
    const cursorSize = Math.max(eraserSize * 2, 32); // Ensure minimum visible size
    const center = cursorSize / 2;
    const radius = eraserSize / 2; // Half eraser size for radius

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}' viewBox='0 0 ${cursorSize} ${cursorSize}'>
        <circle cx='${center}' cy='${center}' r='${radius}' fill='white' fill-opacity='0.5' stroke='black' stroke-width='2'/>
    </svg>`;
    const encoded = encodeURIComponent(svg);
    return `url("data:image/svg+xml,${encoded}") ${center} ${center}, crosshair`;
}

function createShapeCursor(shape) {
    const cursorSize = 32; // Fixed reasonable size for all stamps
    const center = cursorSize / 2;
    let shapeContent = '';

    switch(shape) {
        case 'circle':
            shapeContent = `<circle cx='${center}' cy='${center}' r='10' fill='#FF6B00' stroke='#000' stroke-width='1.5'/>`;
            break;
        case 'square':
            shapeContent = `<rect x='6' y='6' width='20' height='20' fill='#0080FF' stroke='#000' stroke-width='1.5'/>`;
            break;
        case 'star':
            shapeContent = `<path d='M16 4l3.5 10.5H30l-9 6.5 3.5 10.5-8.5-6-8.5 6 3.5-10.5-9-6.5h10.5z' fill='#FFD700' stroke='#000' stroke-width='1'/>`;
            break;
        case 'heart':
            shapeContent = `<path d='M16 28s-10-6-10-14c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 8-10 14-10 14z' fill='#FF69B4' stroke='#000' stroke-width='1'/>`;
            break;
        case 'smiley':
            shapeContent = `<circle cx='${center}' cy='${center}' r='12' fill='#FFD700' stroke='#000' stroke-width='1.5'/>
                <circle cx='12' cy='13' r='2' fill='#000'/>
                <circle cx='20' cy='13' r='2' fill='#000'/>
                <path d='M10 19 Q16 23 22 19' stroke='#000' stroke-width='1.5' fill='none' stroke-linecap='round'/>`;
            break;
        case 'hexagon':
            shapeContent = `<path d='M16 4l8 4.5v9L16 22l-8-4.5v-9z' fill='#A020F0' stroke='#000' stroke-width='1.5'/>`;
            break;
        case 'bunny':
            shapeContent = `<circle cx='16' cy='18' r='8' fill='#FFF' stroke='#000' stroke-width='1'/>
                <ellipse cx='12' cy='8' rx='3' ry='7' fill='#FFF' stroke='#000' stroke-width='1'/>
                <ellipse cx='20' cy='8' rx='3' ry='7' fill='#FFF' stroke='#000' stroke-width='1'/>
                <circle cx='13' cy='17' r='1.5' fill='#000'/>
                <circle cx='19' cy='17' r='1.5' fill='#000'/>
                <circle cx='16' cy='20' r='1' fill='#FF69B4'/>
                <path d='M16 20 Q14 22 12 21 M16 20 Q18 22 20 21' stroke='#000' stroke-width='1' fill='none' stroke-linecap='round'/>`;
            break;
        default:
            shapeContent = `<circle cx='${center}' cy='${center}' r='10' fill='#FF6B00' stroke='#000' stroke-width='1.5'/>`;
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}' viewBox='0 0 ${cursorSize} ${cursorSize}'>
        ${shapeContent}
    </svg>`;
    const encoded = encodeURIComponent(svg);
    return `url("data:image/svg+xml,${encoded}") ${center} ${center}, crosshair`;
}

function updateCursor() {
    if (currentTool === 'pen') {
        canvas.style.cursor = createPenCursor(brushSize, currentColor);
    } else if (currentTool === 'eraser') {
        canvas.style.cursor = createEraserCursor(brushSize);
    } else if (currentTool === 'shape') {
        canvas.style.cursor = createShapeCursor(currentShape);
    } else {
        canvas.style.cursor = 'pointer';
    }
}

// Tool buttons
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        shapeToggle.classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
        updateCursor();
    });
});

// Color buttons
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
        // Update cursor to reflect new color
        updateCursor();
    });
});

// Size dropdown
const sizeToggle = document.getElementById('sizeToggle');
const sizeMenu = document.getElementById('sizeMenu');
const currentSizePreview = document.getElementById('currentSizePreview');

sizeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sizeMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    sizeMenu.classList.remove('show');
});

sizeMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Size option selection
document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        brushSize = parseInt(option.dataset.size);

        // Update the current size preview
        const previewSize = Math.min(brushSize * 1.5, 26);
        currentSizePreview.innerHTML = `<div class="size-current-preview-dot" style="width: ${previewSize}px; height: ${previewSize}px;"></div>`;

        // Update cursor to reflect new size
        updateCursor();

        sizeMenu.classList.remove('show');
    });
});

// Shape dropdown
const shapeToggle = document.getElementById('shapeToggle');
const shapeMenu = document.getElementById('shapeMenu');
const currentShapeIcon = document.getElementById('currentShapeIcon');

shapeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    shapeMenu.classList.toggle('show');
    shapeToggle.classList.add('active');
    currentTool = 'shape';
    updateCursor();
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    shapeMenu.classList.remove('show');
});

shapeMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Shape option selection
document.querySelectorAll('.shape-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.shape-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        currentShape = option.dataset.shape;
        currentTool = 'shape';

        // Update the current shape icon
        currentShapeIcon.innerHTML = option.querySelector('svg').innerHTML;

        // Mark shape button as active
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        shapeToggle.classList.add('active');

        // Update cursor to show the selected shape
        updateCursor();

        shapeMenu.classList.remove('show');
    });
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Drawing functions
function startDrawing(e) {
    const pos = getMousePos(e);

    if (currentTool === 'pen' || currentTool === 'eraser') {
        isDrawing = true;
        // Reset rainbow tracking for new stroke
        if (currentColor === 'rainbow') {
            rainbowStrokeLength = 0;
            currentRainbowColor = getRandomRainbowColor();
        }
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        // Draw a dot at the click position for single clicks
        if (currentTool === 'pen') {
            ctx.strokeStyle = currentColor === 'rainbow' ? currentRainbowColor : currentColor;
            ctx.lineWidth = brushSize;
        } else if (currentTool === 'eraser') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = brushSize * 2;
        }
        ctx.lineCap = 'round';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        lastPos = {x: pos.x, y: pos.y};
    } else if (currentTool === 'shape') {
        drawShape(pos.x, pos.y, currentShape);
    }
}

let lastPos = null;

function draw(e) {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
        // Handle rainbow mode
        if (currentColor === 'rainbow') {
            // Calculate distance traveled
            if (lastPos) {
                const dx = pos.x - lastPos.x;
                const dy = pos.y - lastPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                rainbowStrokeLength += distance;

                // Change color if we've traveled enough distance
                if (rainbowStrokeLength >= rainbowColorChangeDistance) {
                    rainbowStrokeLength = 0;
                    currentRainbowColor = getNextRainbowColor();
                    // Start new path with new color
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(lastPos.x, lastPos.y);
                }
            }
            ctx.strokeStyle = currentRainbowColor;
        } else {
            ctx.strokeStyle = currentColor;
        }

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastPos = {x: pos.x, y: pos.y};
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
}

function stopDrawing() {
    isDrawing = false;
    lastPos = null;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.type.startsWith('touch') ? e.touches[0] : e;
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function drawShape(x, y, shape) {
    // Calculate scale factor based on brush size
    // Medium (12) is the base size (scale = 1.0)
    const sizeScale = brushSize / 12;

    ctx.beginPath();

    switch(shape) {
        case 'circle':
            // Circle uses radial gradient
            const circleRadius = 40 * sizeScale;
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x, y, circleRadius + 10);
            } else {
                ctx.fillStyle = currentColor;
            }
            ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
            break;
        case 'square':
            // Square uses linear gradient (top to bottom)
            const squareSize = 40 * sizeScale;
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowLinearGradient(x, y, squareSize);
            } else {
                ctx.fillStyle = currentColor;
            }
            ctx.fillRect(x - squareSize, y - squareSize, squareSize * 2, squareSize * 2);
            return;
        case 'star':
            // Star uses linear gradient (top to bottom)
            const starOuter = 45 * sizeScale;
            const starInner = 20 * sizeScale;
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowLinearGradient(x, y, starOuter);
            } else {
                ctx.fillStyle = currentColor;
            }
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? starOuter : starInner;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            break;
        case 'heart':
            // Heart uses radial gradient (center outward) - converted from SVG path
            // SVG: "M16 28s-10-6-10-14c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 8-10 14-10 14z"
            // Base scale for SVG (3.5 is medium size) multiplied by size scale
            const scale = 3.5 * sizeScale;
            const heartGradientSize = 50 * sizeScale;

            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x, y, heartGradientSize);
            } else {
                ctx.fillStyle = currentColor;
            }

            // Translate SVG coordinates (viewBox 0-32) to canvas centered at x,y
            // Original SVG center is around (16, 18), we want to center it at (x, y)
            const offsetX = x - 16 * scale;
            const offsetY = y - 18 * scale;

            // Start at bottom point: M16 28
            ctx.moveTo(offsetX + 16 * scale, offsetY + 28 * scale);

            // Smooth curve: s-10-6-10-14 (smooth bezier, relative)
            // This curves from bottom up to left side
            // Control point is relative to previous end point
            const cp1x = offsetX + (16 - 10) * scale;
            const cp1y = offsetY + (28 - 6) * scale;
            const p1x = offsetX + (16 - 10) * scale;
            const p1y = offsetY + (28 - 14) * scale;
            ctx.quadraticCurveTo(cp1x, cp1y, p1x, p1y);

            // Cubic bezier: c0-3 2-5 5-5 (left heart bump curve)
            const cp2x = p1x + 0;
            const cp2y = p1y - 3 * scale;
            const cp3x = p1x + 2 * scale;
            const cp3y = p1y - 5 * scale;
            const p2x = p1x + 5 * scale;
            const p2y = p1y - 5 * scale;
            ctx.bezierCurveTo(cp2x, cp2y, cp3x, cp3y, p2x, p2y);

            // Cubic bezier: 2 0 4 1 5 3 (curve to center top)
            const cp4x = p2x + 2 * scale;
            const cp4y = p2y + 0;
            const cp5x = p2x + 4 * scale;
            const cp5y = p2y + 1 * scale;
            const p3x = p2x + 5 * scale;
            const p3y = p2y + 3 * scale;
            ctx.bezierCurveTo(cp4x, cp4y, cp5x, cp5y, p3x, p3y);

            // Cubic bezier: 1-2 3-3 5-3 (curve to right bump top)
            const cp6x = p3x + 1 * scale;
            const cp6y = p3y - 2 * scale;
            const cp7x = p3x + 3 * scale;
            const cp7y = p3y - 3 * scale;
            const p4x = p3x + 5 * scale;
            const p4y = p3y - 3 * scale;
            ctx.bezierCurveTo(cp6x, cp6y, cp7x, cp7y, p4x, p4y);

            // Cubic bezier: 3 0 5 2 5 5 (right bump curve down)
            const cp8x = p4x + 3 * scale;
            const cp8y = p4y + 0;
            const cp9x = p4x + 5 * scale;
            const cp9y = p4y + 2 * scale;
            const p5x = p4x + 5 * scale;
            const p5y = p4y + 5 * scale;
            ctx.bezierCurveTo(cp8x, cp8y, cp9x, cp9y, p5x, p5y);

            // Cubic bezier: 0 8-10 14-10 14 (curve back to bottom)
            const cp10x = p5x + 0;
            const cp10y = p5y + 8 * scale;
            const cp11x = p5x - 10 * scale;
            const cp11y = p5y + 14 * scale;
            const p6x = p5x - 10 * scale;
            const p6y = p5y + 14 * scale;
            ctx.bezierCurveTo(cp10x, cp10y, cp11x, cp11y, p6x, p6y);

            // z (close path)
            ctx.closePath();
            break;
        case 'smiley':
            // Face - scales with brush size
            const faceRadius = 40 * sizeScale;
            const eyeOffset = 12 * sizeScale;
            const eyeY = 8 * sizeScale;
            const eyeSize = 4 * sizeScale;
            const smileRadius = 20 * sizeScale;

            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x, y, faceRadius + 10);
            } else {
                ctx.fillStyle = currentColor;
            }
            ctx.arc(x, y, faceRadius, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - eyeOffset, y - eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y - eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3 * sizeScale;
            ctx.beginPath();
            ctx.arc(x, y, smileRadius, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
            return;
        case 'hexagon':
            // Hexagon uses linear gradient (top to bottom)
            const hexSize = 35 * sizeScale;
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowLinearGradient(x, y, hexSize);
            } else {
                ctx.fillStyle = currentColor;
            }
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const px = x + hexSize * Math.cos(angle);
                const py = y + hexSize * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            break;
        case 'bunny':
            // Bunny uses radial gradient for head
            const bunnyScale = 2.5 * sizeScale;
            const headRadius = 8 * bunnyScale;
            const headY = 18 * bunnyScale;

            // Determine bunny color - use white if black is selected, otherwise use selected color
            const bunnyColor = currentColor === '#000000' ? '#FFFFFF' : currentColor;

            // Head
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x, y + headY - 18 * bunnyScale, headRadius);
            } else {
                ctx.fillStyle = bunnyColor;
            }
            ctx.beginPath();
            ctx.arc(x, y + headY - 18 * bunnyScale, headRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5 * bunnyScale;
            ctx.stroke();

            // Left ear
            ctx.beginPath();
            ctx.ellipse(x - 4 * bunnyScale, y + 8 * bunnyScale - 18 * bunnyScale, 3 * bunnyScale, 7 * bunnyScale, 0, 0, Math.PI * 2);
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x - 4 * bunnyScale, y + 8 * bunnyScale - 18 * bunnyScale, 7 * bunnyScale);
            } else {
                ctx.fillStyle = bunnyColor;
            }
            ctx.fill();
            ctx.stroke();

            // Right ear
            ctx.beginPath();
            ctx.ellipse(x + 4 * bunnyScale, y + 8 * bunnyScale - 18 * bunnyScale, 3 * bunnyScale, 7 * bunnyScale, 0, 0, Math.PI * 2);
            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x + 4 * bunnyScale, y + 8 * bunnyScale - 18 * bunnyScale, 7 * bunnyScale);
            } else {
                ctx.fillStyle = bunnyColor;
            }
            ctx.fill();
            ctx.stroke();

            // Left eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - 3 * bunnyScale, y + 17 * bunnyScale - 18 * bunnyScale, 1.5 * bunnyScale, 0, Math.PI * 2);
            ctx.fill();

            // Right eye
            ctx.beginPath();
            ctx.arc(x + 3 * bunnyScale, y + 17 * bunnyScale - 18 * bunnyScale, 1.5 * bunnyScale, 0, Math.PI * 2);
            ctx.fill();

            // Nose
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.arc(x, y + 20 * bunnyScale - 18 * bunnyScale, 1 * bunnyScale, 0, Math.PI * 2);
            ctx.fill();

            // Mouth (two curves)
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1 * bunnyScale;
            ctx.beginPath();
            ctx.moveTo(x, y + 20 * bunnyScale - 18 * bunnyScale);
            ctx.quadraticCurveTo(x - 2 * bunnyScale, y + 22 * bunnyScale - 18 * bunnyScale, x - 4 * bunnyScale, y + 21 * bunnyScale - 18 * bunnyScale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + 20 * bunnyScale - 18 * bunnyScale);
            ctx.quadraticCurveTo(x + 2 * bunnyScale, y + 22 * bunnyScale - 18 * bunnyScale, x + 4 * bunnyScale, y + 21 * bunnyScale - 18 * bunnyScale);
            ctx.stroke();
            return;
    }
    ctx.fill();
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch events for future mobile support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
});

// Initialize cursor on page load
updateCursor();
