export interface Marker {
    id: string;
    x: number;
    z: number;
    label: string;
    color: string;
    timestamp: number;
}

export interface CameraState {
    x: number;
    z: number;
    zoom: number;
}

export interface AppState {
    seed: string;
    version: string;
    dimension: string;
    camera: CameraState;
    markers: Marker[];
    savedSeeds: { seed: string, label: string, timestamp: number }[];
    showBiomes: boolean;
    showSlimeChunks: boolean;
    showStructures: boolean;
}

const STORAGE_KEY = 'craftendium_seed_explorer_v2_state';

const DEFAULT_STATE: AppState = {
    seed: '12345',
    version: '1.21',
    dimension: 'overworld',
    camera: { x: 0, z: 0, zoom: 1.0 },
    markers: [],
    savedSeeds: [],
    showBiomes: true,
    showSlimeChunks: false,
    showStructures: true
};

export function saveState(state: AppState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state:", e);
    }
}

export function loadState(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STATE;
        
        const loaded = JSON.parse(raw);
        // Merge with default to ensure new fields exist
        return { ...DEFAULT_STATE, ...loaded };
    } catch (e) {
        console.error("Failed to load state:", e);
        return DEFAULT_STATE;
    }
}
