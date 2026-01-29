import { MapRenderer } from './renderer';
import { loadState, saveState, AppState, Marker } from './state';

// --- Global State ---
let state: AppState = loadState();
let renderer: MapRenderer;
let isEngineReady = false;
let renderRequested = false;

// --- Worker Pool Setup ---
const numWorkers = 4;
const workers: Worker[] = [];
let readyWorkers = 0;

for (let i = 0; i < numWorkers; i++) {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e) => {
        if (e.data.type === 'ready') {
            readyWorkers++;
            if (readyWorkers === numWorkers) {
                isEngineReady = true;
                warningBanner.textContent = "✅ REAL MINECRAFT 1.21 WORLDGEN – Parallel Powered";
                warningBanner.className = "warning-banner success";
                requestRender();
                updateInfo();
            }
        }
    };
    workers.push(w);
}

// Simple round-robin for workers
let workerIdx = 0;
function getWorker() {
    const w = workers[workerIdx];
    workerIdx = (workerIdx + 1) % workers.length;
    return w;
}

// --- DOM Elements ---
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const seedInput = document.getElementById('seedInput') as HTMLInputElement;
const displaySeed = document.getElementById('displaySeed')!;
const displayPos = document.getElementById('displayPos')!;
const displayZoom = document.getElementById('displayZoom')!;
const tooltip = document.getElementById('tooltip')!;
const tooltipBlock = document.getElementById('tooltipBlock')!;
const tooltipBiome = document.getElementById('tooltipBiome')!;
const warningBanner = document.getElementById('warningBanner')!;
const markerList = document.getElementById('markerList')!;

// --- Helper for throttled rendering ---
function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    requestAnimationFrame(() => {
        if (readyWorkers > 0) renderer.render(state);
        renderRequested = false;
    });
}

// --- Initialization ---
async function init() {
    // Pass a "facade" worker that routes messages to the pool
    const poolFacade = {
        postMessage: (msg: any) => getWorker().postMessage(msg),
        addEventListener: (type: string, cb: any) => {
            workers.forEach(w => w.addEventListener(type, cb));
        }
    } as Worker;

    renderer = new MapRenderer(canvas, poolFacade, requestRender);
    
    window.addEventListener('resize', resize);
    resize();
    
    seedInput.value = state.seed;
    (document.getElementById('showBiomes') as HTMLInputElement).checked = state.showBiomes;
    (document.getElementById('showSlimeChunks') as HTMLInputElement).checked = state.showSlimeChunks;
    (document.getElementById('showStructures') as HTMLInputElement).checked = state.showStructures;

    updateMarkerListUI();
    setupInteractions();

    worker.onmessage = (e) => {
        if (e.data.type === 'ready') {
            isEngineReady = true;
            requestRender();
            updateInfo();
        }
    };

    await generate();
}

function resize() {
    canvas.width = window.innerWidth - 280;
    canvas.height = window.innerHeight;
    requestRender();
}

async function generate() {
    isEngineReady = false;
    readyWorkers = 0;

    const input = seedInput.value.trim();
    let seedBig: bigint;
    if (/^-?\d+$/.test(input)) {
        seedBig = BigInt(input);
    } else {
        seedBig = BigInt(stringHash(input));
    }

    state.seed = input;
    saveState(state);
    displaySeed.textContent = seedBig.toString();

    renderer.clearCache();
    workers.forEach(w => w.postMessage({ type: 'init', payload: { seed: seedBig.toString() } }));
}

function setupInteractions() {
    // Layer Toggles
    document.getElementById('showBiomes')!.onchange = (e) => {
        state.showBiomes = (e.target as HTMLInputElement).checked;
        saveState(state);
        requestRender();
    };
    document.getElementById('showSlimeChunks')!.onchange = (e) => {
        state.showSlimeChunks = (e.target as HTMLInputElement).checked;
        saveState(state);
        requestRender();
    };
    document.getElementById('showStructures')!.onchange = (e) => {
        state.showStructures = (e.target as HTMLInputElement).checked;
        saveState(state);
        requestRender();
    };

    document.getElementById('zoomInBtn')!.onclick = () => zoom(1.5);
    document.getElementById('zoomOutBtn')!.onclick = () => zoom(1 / 1.5);
    document.getElementById('generateBtn')!.onclick = generate;
    document.getElementById('randomBtn')!.onclick = () => {
        seedInput.value = Math.floor(Math.random() * 2147483647).toString();
        generate();
    };

    document.getElementById('clearMarkersBtn')!.onclick = () => {
        if(confirm("Clear all markers?")) {
            state.markers = [];
            saveState(state);
            updateMarkerListUI();
            requestRender();
        }
    };

    document.getElementById('jumpBtn')!.onclick = () => {
        const jx = parseInt((document.getElementById('jumpX') as HTMLInputElement).value);
        const jz = parseInt((document.getElementById('jumpZ') as HTMLInputElement).value);
        if (!isNaN(jx) && !isNaN(jz)) {
            state.camera.x = jx;
            state.camera.z = jz;
            saveState(state);
            requestRender();
            updateInfo();
        }
    };

    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', e => {
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', e => {
        if (isDragging && e.shiftKey) addMarkerAtMouse(e);
        if (isDragging) {
            isDragging = false;
            saveState(state);
            requestRender();
        }
    });

    canvas.addEventListener('mousemove', e => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            state.camera.x -= dx / state.camera.zoom;
            state.camera.z -= dy / state.camera.zoom;
            lastMouse = { x: e.clientX, y: e.clientY };
            requestRender();
            updateInfo();
        }
        updateTooltip(e);
    });

    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        zoom(factor);
    }, { passive: false });
}

function zoom(factor: number) {
    state.camera.zoom *= factor;
    state.camera.zoom = Math.max(0.1, Math.min(20, state.camera.zoom));
    requestRender();
    updateInfo();
}

function updateInfo() {
    displayPos.textContent = `X: ${Math.round(state.camera.x)}, Z: ${Math.round(state.camera.z)}`;
    displayZoom.textContent = `${state.camera.zoom.toFixed(2)}x`;
}

function updateTooltip(e: MouseEvent) {
    if (readyWorkers === 0) return;
    
    // Page coords are absolute, matching the tooltip's top-level position
    const mx = e.pageX;
    const my = e.pageY;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const blockX = Math.floor((canvasX - canvas.width / 2) / state.camera.zoom + state.camera.x);
    const blockZ = Math.floor((canvasY - canvas.height / 2) / state.camera.zoom + state.camera.z);
    
    tooltip.style.left = `${mx + 15}px`;
    tooltip.style.top = `${my + 15}px`;
    tooltip.classList.add('visible');
    tooltipBlock.textContent = `${blockX}, ${blockZ}`;
    
    tooltipBiome.textContent = renderer.getBiomeAt(blockX, blockZ);
}

function addMarkerAtMouse(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const blockX = Math.round((canvasX - canvas.width / 2) / state.camera.zoom + state.camera.x);
    const blockZ = Math.round((canvasY - canvas.height / 2) / state.camera.zoom + state.camera.z);

    const name = prompt("Marker Name:", "Point of Interest");
    if (name) {
        const marker: Marker = {
            id: Date.now().toString(),
            x: blockX,
            z: blockZ,
            label: name,
            color: '#ff0055',
            timestamp: Date.now()
        };
        state.markers.push(marker);
        saveState(state);
        updateMarkerListUI();
        requestRender();
    }
}

function updateMarkerListUI() {
    if (state.markers.length === 0) {
        markerList.innerHTML = '<div class="empty-state">No markers<br>(Shift+Click map to add)</div>';
        return;
    }
    markerList.innerHTML = '';
    state.markers.forEach(marker => {
        const el = document.createElement('div');
        el.className = 'marker-item';
        el.innerHTML = `<div><div class="marker-name">${marker.label}</div><div class="marker-coords">${marker.x}, ${marker.z}</div></div><div class="marker-actions"><button class="marker-btn goto-btn">Go</button><button class="marker-btn del-btn">×</button></div>`;
        el.querySelector('.goto-btn')!.addEventListener('click', () => {
            state.camera.x = marker.x;
            state.camera.z = marker.z;
            saveState(state);
            requestRender();
            updateInfo();
        });
        el.querySelector('.del-btn')!.addEventListener('click', () => {
            state.markers = state.markers.filter(m => m.id !== marker.id);
            saveState(state);
            updateMarkerListUI();
            requestRender();
        });
        markerList.appendChild(el);
    });
}

function stringHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
}

init();