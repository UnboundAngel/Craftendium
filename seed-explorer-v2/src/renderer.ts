import { AppState } from './state';
import { LegacyRandom } from 'deepslate';

// --- Configuration: Map Colors ---
const BIOME_COLORS: Record<string, string> = {
    'minecraft:ocean': '#000070', 'minecraft:deep_ocean': '#000030', 'minecraft:frozen_ocean': '#707090', 'minecraft:deep_frozen_ocean': '#404090', 'minecraft:cold_ocean': '#202070', 'minecraft:deep_cold_ocean': '#202030', 'minecraft:lukewarm_ocean': '#0000b0', 'minecraft:deep_lukewarm_ocean': '#000050', 'minecraft:warm_ocean': '#0000ff', 'minecraft:deep_warm_ocean': '#000090', 'minecraft:river': '#0000ff', 'minecraft:frozen_river': '#a0a0ff', 'minecraft:beach': '#fade55', 'minecraft:snowy_beach': '#fafad0', 'minecraft:stony_shore': '#a2a284', 'minecraft:windswept_hills': '#597d72', 'minecraft:windswept_gravelly_hills': '#789890', 'minecraft:windswept_forest': '#589c6c', 'minecraft:windswept_savanna': '#e5da87', 'minecraft:old_growth_pine_taiga': '#596651', 'minecraft:old_growth_spruce_taiga': '#818e79', 'minecraft:old_growth_birch_forest': '#307444', 'minecraft:plains': '#8db360', 'minecraft:sunflower_plains': '#b5db61', 'minecraft:snowy_plains': '#ffffff', 'minecraft:ice_spikes': '#b4dcdc', 'minecraft:desert': '#fa9418', 'minecraft:swamp': '#07f9b2', 'minecraft:mangrove_swamp': '#2c4028', 'minecraft:forest': '#056621', 'minecraft:flower_forest': '#2d8e49', 'minecraft:birch_forest': '#307444', 'minecraft:dark_forest': '#40511a', 'minecraft:taiga': '#0b4d2c', 'minecraft:snowy_taiga': '#31554a', 'minecraft:jungle': '#537b09', 'minecraft:sparse_jungle': '#628b17', 'minecraft:bamboo_jungle': '#768e14', 'minecraft:savanna': '#bdb25f', 'minecraft:pale_garden': '#2b3a2b', 'minecraft:savanna_plateau': '#a79d64', 'minecraft:badlands': '#d94515', 'minecraft:wooded_badlands': '#b09765', 'minecraft:eroded_badlands': '#ff6d3d', 'minecraft:meadow': '#68a55f', 'minecraft:cherry_grove': '#ffafe1', 'minecraft:grove': '#5a7068', 'minecraft:snowy_slopes': '#d0d0d0', 'minecraft:frozen_peaks': '#e0e0e0', 'minecraft:jagged_peaks': '#f0f0f0', 'minecraft:stony_peaks': '#82ac1e', 'minecraft:mushroom_fields': '#ff00ff', 'minecraft:dripstone_caves': '#49412e', 'minecraft:lush_caves': '#3b4407', 'minecraft:deep_dark': '#031319'
};

const BIOME_RGB: Record<string, [number, number, number]> = {};
const RGB_TO_BIOME: Record<string, string> = {};
for (const [id, hex] of Object.entries(BIOME_COLORS)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    BIOME_RGB[id] = [r, g, b];
    RGB_TO_BIOME[`${r},${g},${b}`] = id.replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const TILE_SIZE = 512;
const SAMPLE_RES = 4;

interface Structure {
    type: string;
    x: number;
    z: number;
}

interface TileData {
    canvas: HTMLCanvasElement;
    structures: Structure[];
}

const STRUCTURE_ICONS: Record<string, string> = {
    'village': '/images/structures/village.png',
    'desert_pyramid': '/images/structures/desert_pyramid.png',
    'jungle_temple': '/images/structures/jungle_temple.png',
    'igloo': '/images/structures/igloo.png',
    'ocean_monument': '/images/structures/ocean_monument.png',
    'swamp_hut': '/images/structures/swamp_hut.png',
    'pillager_outpost': '/images/structures/outpost.png',
    'mansion': '/images/structures/mansion.png',
    'ancient_city': '/images/structures/Bedrock.png'
};

export class MapRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private worker: any; // Using the pool facade
    private tileCache = new Map<string, TileData>();
    private pendingTiles = new Set<string>();
    private onRenderRequested: () => void;
    private icons = new Map<string, HTMLImageElement>();

    constructor(canvas: HTMLCanvasElement, worker: any, onRenderRequested: () => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false })!;
        this.worker = worker;
        this.onRenderRequested = onRenderRequested;

        this.loadIcons();

        this.worker.addEventListener('message', (e: any) => {
            if (e.data.type === 'tile-ready') {
                const { tx, tz, buffer, structures } = e.data.payload;
                this.createTileFromBuffer(tx, tz, buffer, structures);
                this.pendingTiles.delete(`${tx},${tz}`);
                this.onRenderRequested();
            }
        });
    }

    private async loadIcons() {
        for (const [id, url] of Object.entries(STRUCTURE_ICONS)) {
            const img = new Image();
            img.src = url;
            await img.decode();
            this.icons.set(id, img);
        }
        this.onRenderRequested();
    }

    private createTileFromBuffer(tx: number, tz: number, buffer: Uint8ClampedArray, structures: Structure[]) {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d', { alpha: false })!;
        const imgData = new ImageData(buffer, TILE_SIZE, TILE_SIZE);
        ctx.putImageData(imgData, 0, 0);
        this.tileCache.set(`${tx},${tz}`, { canvas, structures });
    }

    getBiomeAt(worldX: number, worldZ: number): string {
        const tx = Math.floor(worldX / TILE_SIZE);
        const tz = Math.floor(worldZ / TILE_SIZE);
        const tile = this.tileCache.get(`${tx},${tz}`);
        if (!tile) return "Loading...";

        const ctx = tile.canvas.getContext('2d', { willReadFrequently: true })!;
        const lx = Math.floor(((worldX % TILE_SIZE) + TILE_SIZE) % TILE_SIZE);
        const ly = Math.floor(((worldZ % TILE_SIZE) + TILE_SIZE) % TILE_SIZE);
        
        const [r, g, b] = ctx.getImageData(lx, ly, 1, 1).data;
        return RGB_TO_BIOME[`${r},${g},${b}`] || "Unknown";
    }

    clearCache() {
        this.tileCache.clear();
        this.pendingTiles.clear();
    }

    render(state: AppState) {
        const { width, height } = this.canvas;
        const { camera } = state;
        const ctx = this.ctx;

        ctx.fillStyle = '#05060a';
        ctx.fillRect(0, 0, width, height);

        const viewLeft = camera.x - (width / 2) / camera.zoom;
        const viewTop = camera.z - (height / 2) / camera.zoom;
        const viewRight = camera.x + (width / 2) / camera.zoom;
        const viewBottom = camera.z + (height / 2) / camera.zoom;

        const startTileX = Math.floor(viewLeft / TILE_SIZE);
        const startTileZ = Math.floor(viewTop / TILE_SIZE);
        const endTileX = Math.floor(viewRight / TILE_SIZE);
        const endTileZ = Math.floor(viewBottom / TILE_SIZE);

        // 1. Draw Biomes
        if (state.showBiomes) {
            for (let tz = startTileZ; tz <= endTileZ; tz++) {
                for (let tx = startTileX; tx <= endTileX; tx++) {
                    const key = `${tx},${tz}`;
                    const tile = this.tileCache.get(key);
                    const screenX = (tx * TILE_SIZE - camera.x) * camera.zoom + width / 2;
                    const screenY = (tz * TILE_SIZE - camera.z) * camera.zoom + height / 2;
                    const screenSize = TILE_SIZE * camera.zoom;

                    if (tile) {
                        ctx.imageSmoothingEnabled = camera.zoom < 1.0;
                        ctx.drawImage(tile.canvas, screenX, screenY, screenSize, screenSize);
                    } else if (!this.pendingTiles.has(key)) {
                        this.pendingTiles.add(key);
                        this.worker.postMessage({
                            type: 'generate-tile',
                            payload: { tx, tz, tileSize: TILE_SIZE, biomeRgb: BIOME_RGB }
                        });
                    }
                }
            }
        }

        // 2. Draw Slime Chunks
        if (state.showSlimeChunks) {
            this.drawSlimeChunks(state);
        }

        // 3. Draw Structures
        if (state.showStructures) {
            this.drawStructures(state);
        }

        // 4. Draw Markers
        this.drawMarkers(state);
    }

    private drawSlimeChunks(state: AppState) {
        const { width, height } = this.canvas;
        const { camera } = state;
        const ctx = this.ctx;
        const seed = BigInt(state.seed);

        const viewLeft = camera.x - (width / 2) / camera.zoom;
        const viewTop = camera.z - (height / 2) / camera.zoom;
        const viewRight = camera.x + (width / 2) / camera.zoom;
        const viewBottom = camera.z + (height / 2) / camera.zoom;

        const startCX = Math.floor(viewLeft / 16);
        const startCZ = Math.floor(viewTop / 16);
        const endCX = Math.floor(viewRight / 16);
        const endCZ = Math.floor(viewBottom / 16);

        ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;

        for (let cz = startCZ; cz <= endCZ; cz++) {
            for (let cx = startCX; cx <= endCX; cx++) {
                if (this.isSlimeChunk(seed, cx, cz)) {
                    const screenX = (cx * 16 - camera.x) * camera.zoom + width / 2;
                    const screenY = (cz * 16 - camera.z) * camera.zoom + height / 2;
                    const size = 16 * camera.zoom;
                    if (size < 1) continue;
                    ctx.fillRect(screenX, screenY, size, size);
                    if (camera.zoom > 2) ctx.strokeRect(screenX, screenY, size, size);
                }
            }
        }
    }

    private isSlimeChunk(seed: bigint, x: number, z: number): boolean {
        const rndSeed = seed +
            BigInt(x * x * 0x4c1906) +
            BigInt(x * 0x5ac0db) +
            BigInt(z * z) * 0x4307a7n +
            BigInt(z * 0x5f24f) ^ 0x3ad8025fn;
        return new LegacyRandom(rndSeed).nextInt(10) === 0;
    }

    private drawStructures(state: AppState) {
        const { width, height } = this.canvas;
        const { camera } = state;
        const ctx = this.ctx;

        const viewLeft = camera.x - (width / 2) / camera.zoom;
        const viewTop = camera.z - (height / 2) / camera.zoom;
        const viewRight = camera.x + (width / 2) / camera.zoom;
        const viewBottom = camera.z + (height / 2) / camera.zoom;

        const startTileX = Math.floor(viewLeft / TILE_SIZE);
        const startTileZ = Math.floor(viewTop / TILE_SIZE);
        const endTileX = Math.floor(viewRight / TILE_SIZE);
        const endTileZ = Math.floor(viewBottom / TILE_SIZE);

        for (let tz = startTileZ; tz <= endTileZ; tz++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const tile = this.tileCache.get(`${tx},${tz}`);
                if (!tile) continue;

                tile.structures.forEach(s => {
                    const screenX = (s.x - camera.x) * camera.zoom + width / 2;
                    const screenY = (s.z - camera.z) * camera.zoom + height / 2;
                    
                    const icon = this.icons.get(s.type);
                    if (icon) {
                        const size = 24;
                        ctx.drawImage(icon, screenX - size / 2, screenY - size / 2, size, size);
                    } else {
                        // Fallback dot
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
        }
    }

    private drawMarkers(state: AppState) {
        const { width, height } = this.canvas;
        const { camera, markers } = state;
        const ctx = this.ctx;

        markers.forEach(marker => {
            const screenX = (marker.x - camera.x) * camera.zoom + width / 2;
            const screenY = (marker.z - camera.z) * camera.zoom + height / 2;
            if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) return;

            ctx.fillStyle = marker.color || '#ff0055';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 15, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 8);
            ctx.lineTo(screenX, screenY);
            ctx.stroke();

            if (camera.zoom > 0.5) {
                ctx.font = '12px Inter';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(marker.label, screenX, screenY - 28);
                ctx.fillText(marker.label, screenX, screenY - 28);
            }
        });
    }
}