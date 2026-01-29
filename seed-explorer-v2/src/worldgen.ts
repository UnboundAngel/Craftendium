import { 
    RandomState, 
    MultiNoiseBiomeSource, 
    NoiseGeneratorSettings, 
    Identifier,
    NoiseParameters,
    DensityFunction,
    Registry
} from 'deepslate';

export class DeepslateEngine {
    private randomState: RandomState | null = null;
    private biomeSource: MultiNoiseBiomeSource | null = null;
    private seed: bigint = 0n;
    private isLoaded: boolean = false;

    private biomeCache = new Map<number, string>();

    async init(seed: bigint) {
        this.seed = seed;
        this.biomeCache.clear();
        
        if (!this.isLoaded) {
            console.log("[Deepslate] First time setup: Fetching 1.21 Worldgen Data...");
            await this.loadAllData();
            this.isLoaded = true;
        }

        console.log("[Deepslate] Initializing Engine for seed:", seed.toString());

        try {
            // 1. Fetch Noise Settings
            const noiseSettingsRes = await fetch('https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/noise_settings/overworld.json');
            const noiseSettingsJson = await noiseSettingsRes.json();
            const settings = NoiseGeneratorSettings.fromJson(noiseSettingsJson);
            this.randomState = new RandomState(settings, seed);

            // 2. Fetch the expanded multi-noise parameters for the overworld
            // We use Arcensoth/mcdata because misode/mcmeta uses a preset reference that deepslate can't expand yet.
            const biomeSourceRes = await fetch('https://raw.githubusercontent.com/Arcensoth/mcdata/master/generated/reports/biome_parameters/minecraft/overworld.json');
            const biomeSourceJson = await biomeSourceRes.json();
            
            this.biomeSource = MultiNoiseBiomeSource.fromJson(biomeSourceJson);
            
            console.log("[Deepslate] Engine Ready.");
        } catch (e) {
            console.error("[Deepslate] Initialization Error:", e);
            throw e;
        }
    }

    private async loadAllData() {
        await Promise.all([
            this.loadNoiseParameters(),
            this.loadDensityFunctions(),
            this.loadBiomes()
        ]);
    }

    private async loadBiomes() {
        const biomes = [
            "badlands", "bamboo_jungle", "basalt_deltas", "beach", "birch_forest", "cherry_grove", 
            "cold_ocean", "crimson_forest", "dark_forest", "deep_cold_ocean", "deep_dark", 
            "deep_frozen_ocean", "deep_lukewarm_ocean", "deep_ocean", "desert", "dripstone_caves", 
            "end_barrens", "end_highlands", "end_midlands", "eroded_badlands", "flower_forest", 
            "forest", "frozen_ocean", "frozen_peaks", "frozen_river", "grove", "ice_spikes", 
            "jagged_peaks", "jungle", "lukewarm_ocean", "lush_caves", "mangrove_swamp", "meadow", 
            "mushroom_fields", "nether_wastes", "ocean", "old_growth_birch_forest", 
            "old_growth_pine_taiga", "old_growth_spruce_taiga", "pale_garden", "plains", "river", 
            "savanna", "savanna_plateau", "small_end_islands", "snowy_beach", "snowy_plains", 
            "snowy_slopes", "snowy_taiga", "soul_sand_valley", "sparse_jungle", "stony_peaks", 
            "stony_shore", "sunflower_plains", "swamp", "taiga", "the_end", "the_void", "warm_ocean", 
            "warped_forest", "windswept_forest", "windswept_gravelly_hills", "windswept_hills", 
            "windswept_savanna", "wooded_badlands"
        ];

        const biomeRegistry = this.getRegistry('worldgen/biome');

        const fetchPromises = biomes.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/biome/${id}.json`;
            const ident = Identifier.create(id);

            if (biomeRegistry?.has(ident)) return;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const json = await res.json();
                // We don't need to parse the full biome, just register the object so it exists
                biomeRegistry?.register(ident, json);
            } catch (e) {
                console.warn(`[Deepslate] Failed to load biome ${id}, using dummy.`);
                biomeRegistry?.register(ident, {});
            }
        });

        await Promise.all(fetchPromises);
    }

    private getRegistry(path: string) {
        // @ts-ignore - accessing internal keys if needed or iterating
        const keys = Array.from(Registry.REGISTRY.keys()); 
        const key = keys.find(k => k.path === path);
        if (!key) {
            console.error(`[Deepslate] Could not find registry for ${path}`);
            throw new Error(`Registry not found: ${path}`);
        }
        return Registry.REGISTRY.get(key);
    }

    private async loadNoiseParameters() {
        const requiredNoises = [
            "aquifer_barrier", "aquifer_fluid_level_floodedness", "aquifer_fluid_level_spread", "aquifer_lava",
            "badlands_pillar", "badlands_pillar_roof", "badlands_surface", 
            "cave_cheese", "cave_entrance", "cave_layer", "clay_bands_offset", "continentalness", 
            "erosion", "gravel", "gravel_layer", "ice", "iceberg_pillar", "iceberg_pillar_roof", 
            "iceberg_surface", "jagged", "noodle", "noodle_ridge_a", "noodle_ridge_b", "noodle_thickness", 
            "offset", "ore_gap", "ore_vein_a", "ore_vein_b", "ore_veininess", "packed_ice", "patch", 
            "pillar", "pillar_rareness", "pillar_thickness", "powder_snow", "ridge", "soul_sand_layer", 
            "spaghetti_2d", "spaghetti_2d_elevation", "spaghetti_2d_modulator", "spaghetti_2d_thickness", 
            "spaghetti_3d_1", "spaghetti_3d_2", "spaghetti_3d_rarity", "spaghetti_3d_thickness", 
            "spaghetti_roughness", "spaghetti_roughness_modulator", "surface", "surface_secondary", 
            "surface_swamp", "temperature", "vegetation"
        ];

        const noiseRegistry = this.getRegistry('worldgen/noise');

        const fetchPromises = requiredNoises.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/noise/${id}.json`;
            const ident = Identifier.create(id);

            if (noiseRegistry?.has(ident)) return; 

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const json = await res.json();
                noiseRegistry?.register(ident, NoiseParameters.fromJson(json));
            } catch (e) {
                console.warn(`[Deepslate] Failed to load noise ${id}, using fallback.`);
                noiseRegistry?.register(ident, NoiseParameters.create(-7, [1.0]));
            }
        });

        await Promise.all(fetchPromises);
    }

    private async loadDensityFunctions() {
        const requiredFunctions = [
            "overworld/base_3d_noise",
            "overworld/caves/entrances",
            "overworld/caves/noodle",
            "overworld/caves/pillars",
            "overworld/caves/spaghetti_2d",
            "overworld/caves/spaghetti_2d_thickness_modulator",
            "overworld/caves/spaghetti_roughness_function",
            "overworld/continents",
            "overworld/depth",
            "overworld/erosion",
            "overworld/factor",
            "overworld/jaggedness",
            "overworld/offset",
            "overworld/ridges",
            "overworld/ridges_folded",
            "overworld/sloped_cheese",
            "y",
            "shift_x",
            "shift_z"
        ];

        const dfRegistry = this.getRegistry('worldgen/density_function');

        const fetchPromises = requiredFunctions.map(async (id) => {
            const url = `https://raw.githubusercontent.com/misode/mcmeta/data-json/data/minecraft/worldgen/density_function/${id}.json`;
            const ident = Identifier.create(id);

            if (dfRegistry?.has(ident)) return;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const json = await res.json();
                dfRegistry?.register(ident, DensityFunction.fromJson(json));
            } catch (e) {
                console.warn(`[Deepslate] Failed to load DF ${id}, using fallback.`);
                // Fallback: Constant Zero
                dfRegistry?.register(ident, new DensityFunction.Constant(0));
            }
        });

        await Promise.all(fetchPromises);
    }

    getBiome(x: number, y: number, z: number): string {
        // Minecraft biomes are sampled in 4x4x4 blocks (quarter-resolution)
        const bx = x >> 2;
        const by = y >> 2;
        const bz = z >> 2;
        
        // Fast numeric hash for the cache key (works for coords up to +/- 10M)
        const key = ((bx + 10000000) * 20000000) + (bz + 10000000);
        
        const cached = this.biomeCache.get(key);
        if (cached) return cached;

        if (!this.randomState || !this.biomeSource) return "minecraft:plains";

        const sampler = this.randomState.sampler;
        const result = this.biomeSource.getBiome(bx, by, bz, sampler);
        
        let biome: string;
        if (typeof result === 'function') {
            biome = (result as any)().toString();
        } else {
            biome = (result as any).toString();
        }

        // Limit cache size to prevent memory leaks (approx 10MB of strings)
        if (this.biomeCache.size > 100000) {
            this.biomeCache.clear();
        }
        this.biomeCache.set(key, biome);
        return biome;
    }
}
