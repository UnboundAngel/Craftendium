import { 
    RandomState, 
    MultiNoiseBiomeSource, 
    NoiseGeneratorSettings, 
    Identifier,
    NoiseParameters,
    DensityFunction,
    Registry,
    StructurePlacement,
    XoroshiroRandom,
    LegacyRandom
} from 'deepslate';

const JSON_CACHE = new Map<string, any>();

// --- Structure Definitions ---
const STRUCTURE_SETS = [
    { id: 'village', salt: 10387312, spacing: 34, separation: 8 },
    { id: 'desert_pyramid', salt: 14357617, spacing: 32, separation: 8 },
    { id: 'jungle_temple', salt: 14357619, spacing: 32, separation: 8 },
    { id: 'igloo', salt: 14357618, spacing: 32, separation: 8 },
    { id: 'ocean_monument', salt: 10387313, spacing: 32, separation: 5 },
    { id: 'swamp_hut', salt: 14357620, spacing: 32, separation: 8 },
    { id: 'pillager_outpost', salt: 165745296, spacing: 32, separation: 8 },
    { id: 'mansion', salt: 10387319, spacing: 80, separation: 20 },
    { id: 'trail_ruins', salt: 83469867, spacing: 34, separation: 8 },
    { id: 'ancient_city', salt: 20083232, spacing: 24, separation: 8 }
];

class DeepslateEngine {
    private randomState: RandomState | null = null;
    private biomeSource: MultiNoiseBiomeSource | null = null;
    private isLoaded: boolean = false;
    private seed: bigint = 0n;

    async init(seed: bigint) {
        this.seed = seed;
        if (!this.isLoaded) {
            await this.loadAllData();
            this.isLoaded = true;
        }

        const noiseSettingsJson = await this.fetchJson('https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/noise_settings/overworld.json');
        const settings = NoiseGeneratorSettings.fromJson(noiseSettingsJson);
        this.randomState = new RandomState(settings, seed);

        const biomeSourceJson = await this.fetchJson('https://raw.githubusercontent.com/Arcensoth/mcdata/master/generated/reports/biome_parameters/minecraft/overworld.json');
        this.biomeSource = MultiNoiseBiomeSource.fromJson(biomeSourceJson);
    }

    private async fetchJson(url: string) {
        if (JSON_CACHE.has(url)) return JSON_CACHE.get(url);
        const res = await fetch(url);
        const json = await res.json();
        JSON_CACHE.set(url, json);
        return json;
    }

    private async loadAllData() {
        await Promise.all([
            this.loadNoiseParameters(),
            this.loadDensityFunctions(),
            this.loadBiomes()
        ]);
    }

    private getRegistry(path: string) {
        const keys = Array.from(Registry.REGISTRY.keys()); 
        const key = keys.find(k => k.path === path);
        return Registry.REGISTRY.get(key!);
    }

    private async loadNoiseParameters() {
        const requiredNoises = ["aquifer_barrier", "aquifer_fluid_level_floodedness", "aquifer_fluid_level_spread", "aquifer_lava", "badlands_pillar", "badlands_pillar_roof", "badlands_surface", "cave_cheese", "cave_entrance", "cave_layer", "clay_bands_offset", "continentalness", "erosion", "gravel", "gravel_layer", "ice", "iceberg_pillar", "iceberg_pillar_roof", "iceberg_surface", "jagged", "noodle", "noodle_ridge_a", "noodle_ridge_b", "noodle_thickness", "offset", "ore_gap", "ore_vein_a", "ore_vein_b", "ore_veininess", "packed_ice", "patch", "pillar", "pillar_rareness", "pillar_thickness", "powder_snow", "ridge", "soul_sand_layer", "spaghetti_2d", "spaghetti_2d_elevation", "spaghetti_2d_modulator", "spaghetti_2d_thickness", "spaghetti_3d_1", "spaghetti_3d_2", "spaghetti_3d_rarity", "spaghetti_3d_thickness", "spaghetti_roughness", "spaghetti_roughness_modulator", "surface", "surface_secondary", "surface_swamp", "temperature", "vegetation"];
        const registry = this.getRegistry('worldgen/noise');
        await Promise.all(requiredNoises.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/noise/${id}.json`;
            const json = await this.fetchJson(url);
            registry?.register(Identifier.create(id), NoiseParameters.fromJson(json));
        }));
    }

    private async loadDensityFunctions() {
        const requiredFunctions = ["overworld/base_3d_noise", "overworld/caves/entrances", "overworld/caves/noodle", "overworld/caves/pillars", "overworld/caves/spaghetti_2d", "overworld/caves/spaghetti_2d_thickness_modulator", "overworld/caves/spaghetti_roughness_function", "overworld/continents", "overworld/depth", "overworld/erosion", "overworld/factor", "overworld/jaggedness", "overworld/offset", "overworld/ridges", "overworld/ridges_folded", "overworld/sloped_cheese", "y", "shift_x", "shift_z"];
        const registry = this.getRegistry('worldgen/density_function');
        await Promise.all(requiredFunctions.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/density_function/${id}.json`;
            const json = await this.fetchJson(url);
            registry?.register(Identifier.create(id), DensityFunction.fromJson(json));
        }));
    }

    private async loadBiomes() {
        const biomes = ["badlands", "bamboo_jungle", "basalt_deltas", "beach", "birch_forest", "cherry_grove", "cold_ocean", "crimson_forest", "dark_forest", "deep_cold_ocean", "deep_dark", "deep_frozen_ocean", "deep_lukewarm_ocean", "deep_ocean", "desert", "dripstone_caves", "end_barrens", "end_highlands", "end_midlands", "eroded_badlands", "flower_forest", "forest", "frozen_ocean", "frozen_peaks", "frozen_river", "grove", "ice_spikes", "jagged_peaks", "jungle", "lukewarm_ocean", "lush_caves", "mangrove_swamp", "meadow", "mushroom_fields", "nether_wastes", "ocean", "old_growth_birch_forest", "old_growth_pine_taiga", "old_growth_spruce_taiga", "pale_garden", "plains", "river", "savanna", "savanna_plateau", "small_end_islands", "snowy_beach", "snowy_plains", "snowy_slopes", "snowy_taiga", "soul_sand_valley", "sparse_jungle", "stony_peaks", "stony_shore", "sunflower_plains", "swamp", "taiga", "the_end", "the_void", "warm_ocean", "warped_forest", "windswept_forest", "windswept_gravelly_hills", "windswept_hills", "windswept_savanna", "wooded_badlands"];
        const registry = this.getRegistry('worldgen/biome');
        await Promise.all(biomes.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/biome/${id}.json`;
            const json = await this.fetchJson(url);
            registry?.register(Identifier.create(id), json);
        }));
    }

    getBiome(x: number, y: number, z: number): string {
        if (!this.randomState || !this.biomeSource) return "minecraft:plains";
        const result = this.biomeSource.getBiome(x >> 2, y >> 2, z >> 2, this.randomState.sampler);
        return (typeof result === 'function' ? result() : result).toString();
    }

    getStructuresInTile(tx: number, tz: number, tileSize: number): any[] {
        const found: any[] = [];
        const minChunkX = (tx * tileSize) >> 4;
        const minChunkZ = (tz * tileSize) >> 4;
        const maxChunkX = ((tx + 1) * tileSize) >> 4;
        const maxChunkZ = ((tz + 1) * tileSize) >> 4;

        for (const set of STRUCTURE_SETS) {
            // Logic for RandomSpreadStructurePlacement
            for (let cx = Math.floor(minChunkX / set.spacing) * set.spacing; cx <= maxChunkX; cx += set.spacing) {
                for (let cz = Math.floor(minChunkZ / set.spacing) * set.spacing; cz <= maxChunkZ; cz += set.spacing) {
                    const pos = this.getPotentialStructureChunk(set, cx, cz);
                    if (pos.x >= minChunkX && pos.x < maxChunkX && pos.z >= minChunkZ && pos.z < maxChunkZ) {
                        found.push({
                            type: set.id,
                            x: pos.x * 16 + 8,
                            z: pos.z * 16 + 8
                        });
                    }
                }
            }
        }
        return found;
    }

    private getPotentialStructureChunk(set: any, gridX: number, gridZ: number) {
        // Linear spread logic
        const seed = this.seed;
        const salt = BigInt(set.salt);
        const gx = BigInt(gridX);
        const gz = BigInt(gridZ);
        
        const t = gx * 341873128712n + gz * 132897987541n + seed + salt;
        const rnd = XoroshiroRandom.create(t);
        
        const offX = Number(rnd.nextLong() % BigInt(set.spacing - set.separation));
        const offZ = Number(rnd.nextLong() % BigInt(set.spacing - set.separation));
        
        return {
            x: gridX + Math.abs(offX),
            z: gridZ + Math.abs(offZ)
        };
    }
}

const engine = new DeepslateEngine();

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'init') {
        await engine.init(BigInt(payload.seed));
        self.postMessage({ type: 'ready' });
    }

    if (type === 'generate-tile') {
        const { tx, tz, tileSize, biomeRgb } = payload;
        const buffer = new Uint8ClampedArray(tileSize * tileSize * 4);

        const startX = tx * tileSize;
        const startZ = tz * tileSize;

        for (let z = 0; z < tileSize; z += 4) {
            for (let x = 0; x < tileSize; x += 4) {
                const biome = engine.getBiome(startX + x, 64, startZ + z);
                const rgb = biomeRgb[biome] || [51, 51, 51];
                for (let bz = 0; bz < 4; bz++) {
                    for (let bx = 0; bx < 4; bx++) {
                        const i = ((z + bz) * tileSize + (x + bx)) * 4;
                        buffer[i] = rgb[0];
                        buffer[i + 1] = rgb[1];
                        buffer[i + 2] = rgb[2];
                        buffer[i + 3] = 255;
                    }
                }
            }
        }

        const structures = engine.getStructuresInTile(tx, tz, tileSize);

        self.postMessage({ 
            type: 'tile-ready', 
            payload: { tx, tz, buffer, structures } 
        }, [buffer.buffer] as any);
    }
};