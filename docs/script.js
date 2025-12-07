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

// Mobile color panel toggle
const colorToggle = document.getElementById('colorToggle');
const colorPanel = document.getElementById('colorPanel');

if (colorToggle) {
    colorToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        colorPanel.classList.toggle('show');
        colorToggle.classList.toggle('active');
    });

    // Close color panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!colorPanel.contains(e.target) && e.target !== colorToggle) {
            colorPanel.classList.remove('show');
            colorToggle.classList.remove('active');
        }
    });

    colorPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Drawing state
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#FF0000';
let brushSize = 12; // Medium is the default
let currentShape = 'star';

// OpenMoji stamp SVG templates (original colors)
const stampTemplates = {
    bunny: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="m30.921,28.0021s3.8009-4.523,10.1088.4052l-.6097,11.5103,3.9176,6.0845s4.5833,5.503,4.8333,6.2515,1.75,7.9151,1.5833,8.2485c-.1667.3333-4.5149,5.4097-4.5149,5.4097h-20.1851l-3.3-4.8928.5833-11.1003,5.5833-5.1667,2.8333-7-.8332-9.7499Z"/><path fill="#3f3f3f" d="m39.7544,27.7521s-4.8333,14.8333,4.6667,21.6667c0,0,8.3333,7.6667.1667,17l5.5334-1.4188,3.2271-2.5623c.5819-.462,1.0198-1.0805,1.2624-1.7828l1.2097-3.503c.1869-.5412.2771-1.1073.2651-1.6798-.0244-1.166-.1073-3.1664-.3878-3.9766-1.6508-4.7696-5.7766-8.5767-5.7766-8.5767,0,0-2.8333-2.8333.1667-5.5l5.4319-6.7592c.3966-.4935.7615-1.0116,1.0926-1.5513l4.3088-7.0229,2.0447-7.2442.2096-8.0482-3.0876-1.041-5.6667,1-5.8333,5-4,6.1667-2.6667,6.3333-2.1668,3.4999Z"/><path fill="#3f3f3f" d="m32.1082,27.7521s4.8333,14.8333-4.6667,21.6667c0,0-8.3333,7.6667-.1667,17l-4.8289-1.4382c-.6515-.194-1.2579-.5161-1.7835-.9472l-2.0427-1.6754c-.388-.3182-.6961-.7228-.8997-1.1815l-1.4937-3.3652c-.3046-.6863-.4222-1.438-.3412-2.1845.1361-1.2547.3649-3.1969.5584-4.0234.5508-2.3521,5.4979-8.6846,5.4979-8.6846,0,0,2.8333-2.8333-.1667-5.5l-6.1002-7.0634-4.7331-8.2699-2.0964-7.1858-.9278-8.1831,3.8575-.9644,5.6465,1.0693,5.8535,4.9307,4,6.1667,2.6667,6.3333,2.1668,3.4999Z"/><polyline fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="41.0298 50.553 35.8398 53.9543 30.5638 50.553"/><polyline fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="31.3767 61.0191 35.7968 58.9868 40.4201 61.0191"/><line x1="35.8398" x2="35.7968" y1="53.9543" y2="58.9868" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><ellipse cx="45.1214" cy="39.9176" rx="1.6461" ry="2.8119"/><ellipse cx="26.8786" cy="39.9176" rx="1.6461" ry="2.8119"/></svg>',
        mainColor: '#fff'
    },
    butterfly: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="m35.892 22.845c-1.1677-0.75117-2.3515-1.5127-4.2562-2.536-1.9047-1.0233-4.5628-2.3295-7.3719-3.0366-2.8091-0.70712-5.7684-0.81539-8.9995-0.92767-3.2311-0.11228-6.7338-0.22857-8.7991 0.71011s-2.694 2.9321-0.63572 6.7601 6.8063 9.4959 11.128 11.07 8.2242-0.93837 11.039-2.5076c2.8152-1.5692 4.5425-2.1943 6.2711-2.8198"/><path fill="MAIN_COLOR" d="m32.103 44.066c-0.75813 3.7545-1.516 7.5079-3.6638 9.4562-2.1478 1.9483-5.6846 2.0927-7.9036-0.93857-2.219-3.0312-3.1212-9.2385-2.4695-12.725 0.65167-3.4868 2.8607-4.2531 5.602-5.4795 2.7413-1.2264 6.0204-2.9151 9.3011-4.6046z"/><path fill="MAIN_COLOR" d="m36.108 22.845c1.1677-0.75117 2.3515-1.5127 4.2562-2.536 1.9047-1.0233 4.5628-2.3295 7.3719-3.0366 2.8091-0.70712 5.7684-0.81539 8.9995-0.92767 3.2311-0.11228 6.7338-0.22857 8.7992 0.71041 2.0654 0.93898 2.6939 2.9319 0.63551 6.76-2.0584 3.8281-6.8031 9.492-11.126 11.068-4.3233 1.576-8.226-0.93668-11.041-2.5058-2.815-1.5691-4.5423-2.1941-6.2708-2.8196"/><path fill="MAIN_COLOR" d="m39.897 44.066c0.75813 3.7545 1.516 7.5079 3.6638 9.4562 2.1478 1.9483 5.6846 2.0927 7.9036-0.93857 2.219-3.0312 3.1212-9.2385 2.4697-12.725-0.65148-3.4867-2.8579-4.2521-5.6008-5.4791-2.7429-1.227-6.022-2.9157-9.3024-4.605 z"/><ellipse cx="35.807" cy="17.922" rx="3.5601" ry="2.6701" fill="#9B9B9A"/><ellipse cx="35.819" cy="23.563" rx="3.353" ry="2.7346" fill="#3F3F3F"/><path fill="#9B9B9A" d="m35.394 26.812c-6.3212 0.67634 0.6061 20.481 0.6061 20.481s7.8636-21.387-0.6061-20.481z"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m32.103 44.066c-0.75813 3.7545-1.516 7.5079-3.6638 9.4562-2.1478 1.9483-5.6846 2.0927-7.9036-0.93857-2.219-3.0312-3.1212-9.2385-2.4695-12.725 0.65167-3.4868 2.8581-4.2522 5.0655-5.0179"/><ellipse cx="36" cy="17.922" rx="3.5601" ry="2.6701" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><ellipse cx="36" cy="23.563" rx="3.353" ry="2.7346" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m35.392 26.812c-6.3212 0.67634 0.60836 20.481 0.60836 20.481s7.8614-21.387-0.60836-20.481z"/><line x1="37.968" x2="39.452" y1="14.845" y2="11.582" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="34.032" x2="32.548" y1="14.845" y2="11.582" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
        mainColor: '#92D3F5'
    },
    cat: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="m58.2673,11.3469s-10.4076,2.3754-15.5743,6.7088c0,0-9-2.5-13.8333.1667,0,0-9.6549-6.7318-15.6549-6.7318,0,0-5.0326,3.75.3216,21.0651,0,0-2.6667,10.6667,1.6667,16.3333.7823,1.023,1.6026,1.9862,2.4217,2.8779,3.4268,3.7306,7.5912,6.7046,12.1937,8.8205l1.696.7797c1.5277.7023,3.1777,1.1,4.8576,1.1707h0c.9304.0392,1.8573-.1359,2.7093-.5118l4.5429-2.0042c3.8082-1.6801,7.2734-4.0872,10.0486-7.1894,1.1585-1.295,2.2135-2.71,2.8635-4.11,4.4736-10.6191,1.5314-16.2624,1.5314-16.2624l1.2356-7.1292c.8094-3.1482.8268-6.4477.0506-9.6043l-1.0768-4.3796Z"/><path fill="#fff" d="m30.8377,47.3355s-7.3487,2.8338-1.0987,9.3338c0,0-1.6971,4.2984,3.5271,4.6285.6823.0431,2.7339.0635,2.7339.0635l1.5797.0367c.4833.0112.9656-.0228,1.4424-.1026,1.8709-.3132,3.9279-.7821,3.181-4.5878,0,0,7.5513-6.3722-1.3654-9.3722l-4.875,2-5.125-1.9999Z"/><ellipse cx="45.0854" cy="38.1033" rx="1.6461" ry="2.8119"/><ellipse cx="26.8427" cy="38.1033" rx="1.6461" ry="2.8119"/><polyline fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="31.9328 47.2287 36.037 50.0204 39.8495 47.2287"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m36.037,50.0204v4.2708s-1.1042,3.6875-5.5417,2.875"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m35.8911,49.8767v4.2708s1.1042,3.6875,5.5417,2.875"/></svg>',
        mainColor: '#f4aa41'
    },
    car: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="M64.8,44l-1.1-0.6c-0.4-0.2-0.6-0.6-0.5-1c0.3-1.9,0.5-8.5-9.7-11.5c-0.2-0.1-0.4-0.1-0.6-0.1l-19.6,0.1 c-0.4,0-0.8,0.1-1.1,0.3l-10.3,6.9c-0.2,0.1-0.4,0.2-0.6,0.2c-1.9-0.1-3.7,0.1-5.6,0.4c-5.4,1.1-7.6,4-8.4,5.5 c-0.2,0.3-0.2,0.7-0.2,1c0.1,2.4-1.5,5.1,0.9,7.3l19.4-0.1l20.4-0.5l16.1-0.2c0.9-0.1001,2.4-1.4,2.8-2.2001 C68.4,46.8,65,44.1,64.8,44z"/><path fill="#9b9b9a" d="M17.3,46.4c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4s4-1.8,4-4C21.3,48.2,19.5,46.4,17.3,46.4z"/><path fill="#9b9b9a" d="M57.1,46.4c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C61.1,48.2,59.3,46.4,57.1,46.4z"/><path fill="#92d3f5" d="M56.1,39.3V35c0-0.9-0.8-1.7-1.7-1.7l0,0H33.2c-0.1,0-0.2,0-0.2,0.1l-8,5.7c-0.2,0.1-0.2,0.4-0.1,0.6 c0.1,0.1,0.2,0.2,0.3,0.2c5.6,0,27.2-0.2,30.4-0.1C55.9,39.8,56.1,39.6,56.1,39.3C56.1,39.4,56.1,39.4,56.1,39.3z"/><polygon fill="#fcea2b" points="8.9,40.5 12.9,42.1 10.8,45 5.8,45.1"/><line x1="47.6" x2="27" y1="51" y2="51.4" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><circle cx="17.3" cy="50.4" r="5" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><circle cx="57.1" cy="50.4" r="5" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
        mainColor: '#ea5a47'
    },
    flower: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="M53.1986,26.1283c-0.2578-0.3518-0.2578-0.8302,0-1.182l0.781-1.066 c1.7236-2.3562,1.2108-5.6636-1.1455-7.3873c-1.0641-0.7784-2.3808-1.1311-3.6915-0.9887l-1.313,0.143 c-0.4329,0.0447-0.8455-0.1936-1.023-0.591l-0.533-1.208c-1.1787-2.6708-4.2994-3.8805-6.9702-2.7018 c-1.206,0.5322-2.1696,1.4958-2.7018,2.7018l-0.533,1.209c-0.1785,0.3963-0.5906,0.6339-1.023,0.59l-1.313-0.143 c-2.9024-0.3146-5.5102,1.7833-5.8248,4.6857c-0.142,1.3104,0.2106,2.6265,0.9888,3.6903l0.781,1.066 c0.2578,0.3518,0.2578,0.8302,0,1.182l-0.78,1.066c-1.7242,2.3551-1.2128,5.6621,1.1423,7.3863 c1.0645,0.7794,2.3821,1.1324,3.6937,0.9897l1.313-0.143c0.4331-0.0472,0.8469,0.1915,1.023,0.59l0.533,1.208 c0.1352,0.2987,0.2972,0.5845,0.484,0.854c0.043,0.063,0.088,0.122,0.133,0.182c0.1707,0.2319,0.3604,0.4494,0.567,0.65 c0.019,0.019,0.037,0.039,0.056,0.057c0.5022,0.4685,1.0932,0.8316,1.738,1.068l0,0c0.5941,0.2236,1.2233,0.3394,1.858,0.342 c2.0993,0.0169,4.0045-1.2253,4.836-3.153l0.533-1.208c0.1757-0.3989,0.5896-0.638,1.023-0.591l1.313,0.143 c2.9023,0.3152,5.5106-1.7821,5.8258-4.6845c0.1423-1.3108-0.2103-2.6274-0.9888-3.6915L53.1986,26.1283z"/><path fill="#5C9E31" d="M10.0786,28.3983c-0.151,2.092-0.178,7.231,2.687,10.738s7.906,4.508,9.985,4.774 c0.151-2.092,0.178-7.232-2.687-10.738l0,0C17.1886,29.6553,12.1556,28.6643,10.0786,28.3983z"/><circle cx="41.4376" cy="25.5373" r="5" fill="#F1B31C" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.8366,32.5393 c3.992,4.886,2.805,12.462,2.805,12.462s-7.66-0.347-11.653-5.233s-2.805-12.462-2.805-12.462S16.8436,27.6533,20.8366,32.5393z"/></svg>',
        mainColor: '#FCEA2B'
    },
    thumbsup: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="M31 14c0-2.2 1.8-4 4-4s4 1.8 4 4v14h8c3.3 0 6 2.7 6 6v2c0 1.1-0.3 2.1-0.8 3l-4.2 8.4c-1 2-3 3.6-5 3.6H27c-2.2 0-4-1.8-4-4V32l8-18z"/><rect x="18" y="28" width="9" height="19" rx="2" fill="MAIN_COLOR"/><path fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M31 14c0-2.2 1.8-4 4-4s4 1.8 4 4v14h8c3.3 0 6 2.7 6 6v2c0 1.1-0.3 2.1-0.8 3l-4.2 8.4c-1 2-3 3.6-5 3.6H27c-2.2 0-4-1.8-4-4V32l8-18z"/><rect x="18" y="28" width="9" height="19" rx="2" fill="none" stroke="#000" stroke-width="2"/></svg>',
        mainColor: '#FFFFFF'
    },
    thumbsdown: {
        svg: '<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path fill="MAIN_COLOR" d="M41 58c0 2.2-1.8 4-4 4s-4-1.8-4-4V44h-8c-3.3 0-6-2.7-6-6v-2c0-1.1 0.3-2.1 0.8-3l4.2-8.4c1-2 3-3.6 5-3.6h16c2.2 0 4 1.8 4 4v15l-8 18z"/><rect x="45" y="25" width="9" height="19" rx="2" fill="MAIN_COLOR"/><path fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M41 58c0 2.2-1.8 4-4 4s-4-1.8-4-4V44h-8c-3.3 0-6-2.7-6-6v-2c0-1.1 0.3-2.1 0.8-3l4.2-8.4c1-2 3-3.6 5-3.6h16c2.2 0 4 1.8 4 4v15l-8 18z"/><rect x="45" y="25" width="9" height="19" rx="2" fill="none" stroke="#000" stroke-width="2"/></svg>',
        mainColor: '#FFFFFF'
    }
};

// Current colored stamp images
const stampImages = {};

// Generate colored stamp SVG
function getColoredStampSVG(stampName, color) {
    const template = stampTemplates[stampName];
    if (!template) return null;

    // If rainbow is selected, use original color (rainbow only works for continuous drawing)
    const fillColor = (color === 'rainbow') ? template.mainColor : color;

    return template.svg.replace(/MAIN_COLOR/g, fillColor);
}

// Load stamp image for a specific color
function loadStampImage(stampName, color) {
    const coloredSvg = getColoredStampSVG(stampName, color);
    if (!coloredSvg) return null;

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(coloredSvg);
    return img;
}

// Initialize stamps with current default color
function initializeStamps() {
    Object.keys(stampTemplates).forEach(key => {
        stampImages[key] = loadStampImage(key, currentColor);
    });
}

// Update all stamp images when color changes
function updateStampColors(color) {
    Object.keys(stampTemplates).forEach(key => {
        stampImages[key] = loadStampImage(key, color);
    });
}

// Initialize stamps on page load
initializeStamps();

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
        case 'butterfly':
        case 'cat':
        case 'car':
        case 'flower':
        case 'thumbsup':
        case 'thumbsdown':
            // For OpenMoji stamps, generate colored cursor SVG
            const cursorSvg = getColoredStampSVG(shape, currentColor);
            if (cursorSvg) {
                // Scale down the SVG content for cursor
                shapeContent = `<g transform='scale(0.44)'>${cursorSvg.match(/<svg[^>]*>(.*)<\/svg>/s)[1]}</g>`;
            } else {
                shapeContent = `<circle cx='${center}' cy='${center}' r='10' fill='#FF6B00' stroke='#000' stroke-width='1.5'/>`;
            }
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
        // Update stamp colors when color changes
        updateStampColors(currentColor);
        // Update cursor to reflect new color
        updateCursor();
        // Close color panel on mobile after selection
        if (colorPanel && colorToggle) {
            colorPanel.classList.remove('show');
            colorToggle.classList.remove('active');
        }
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
        const sourceSvg = option.querySelector('svg');
        currentShapeIcon.innerHTML = sourceSvg.innerHTML;
        // Update viewBox to match the source SVG so content fits properly
        currentShapeIcon.setAttribute('viewBox', sourceSvg.getAttribute('viewBox'));

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

// Info button and modal
const aboutModal = document.getElementById('aboutModal');
const modalClose = document.getElementById('modalClose');

document.getElementById('infoBtn').addEventListener('click', () => {
    aboutModal.classList.add('show');
});

// Close modal when clicking X
modalClose.addEventListener('click', () => {
    aboutModal.classList.remove('show');
});

// Close modal when clicking outside the modal content
aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.remove('show');
    }
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
        isDrawing = true;
        drawShape(pos.x, pos.y, currentShape);
        lastStampPos = {x: pos.x, y: pos.y};
    }
}

let lastPos = null;
let lastStampPos = null;

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
    } else if (currentTool === 'shape') {
        // Continuous stamping while dragging
        if (lastStampPos) {
            const dx = pos.x - lastStampPos.x;
            const dy = pos.y - lastStampPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate minimum spacing based on stamp size
            // Base stamp size is 60-80px scaled by brushSize/12
            const sizeScale = brushSize / 12;
            const stampSize = 80 * sizeScale; // Use largest dimension for spacing
            const minSpacing = stampSize * 0.8; // 80% of stamp size to prevent overlap

            // Only draw a new stamp if we've moved far enough
            if (distance >= minSpacing) {
                drawShape(pos.x, pos.y, currentShape);
                lastStampPos = {x: pos.x, y: pos.y};
            }
        }
    }
}

function stopDrawing() {
    isDrawing = false;
    lastPos = null;
    lastStampPos = null;
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

            // Determine smiley color - use white if black is selected, otherwise use selected color
            const smileyColor = currentColor === '#000000' ? '#FFFFFF' : currentColor;

            if (currentColor === 'rainbow') {
                ctx.fillStyle = createRainbowGradient(x, y, faceRadius + 10);
            } else {
                ctx.fillStyle = smileyColor;
            }
            ctx.arc(x, y, faceRadius, 0, Math.PI * 2);
            ctx.fill();
            // Add black outline to face
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2 * sizeScale;
            ctx.stroke();
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
        case 'butterfly':
        case 'cat':
        case 'car':
        case 'flower':
        case 'thumbsup':
        case 'thumbsdown':
            // OpenMoji stamps - drawn as images
            if (stampImages[shape] && stampImages[shape].complete) {
                const stampSize = 60 * sizeScale; // Base size scaled by brush size
                ctx.drawImage(stampImages[shape], x - stampSize / 2, y - stampSize / 2, stampSize, stampSize);
            }
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
