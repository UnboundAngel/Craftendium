DeepWiki
misode/deepslate


Index your code with
Devin
Edit Wiki

Share

Last indexed: 28 April 2025 (2f7f4a)
Overview
Getting Started
Architecture Overview
Core Data Model
Identifiers and Registry
BlockState
ItemStack
Structure
Rendering System
Block Rendering
Item Rendering
Structure Rendering
Block and Item Colors
World Generation
Noise Functions
Density Functions
Chunk Generation
Biomes and Climate
Structures
NBT System
Utilities and Helpers
Random Number Generation
Math Utilities
Biomes and Climate
Relevant source files
This document explains the biome generation system in Deepslate and how climate parameters determine biome selection in the world generation process. The biome and climate systems are responsible for determining which biome should be generated at any given location in the world.

For information about terrain generation, see Chunk Generation. For information about density functions that affect climate, see Density Functions.

Climate Parameters
The climate system operates on six primary parameters that define environmental conditions at any location:

Parameter	Description
Temperature	Determines general biome type (hot/cold)
Humidity	Controls moisture level (dry/wet)
Continentalness	Represents distance from ocean (coast/inland)
Erosion	Affects terrain roughness
Depth	Vertical position relative to surface
Weirdness	Creates terrain variations
These parameters form a multi-dimensional space where biomes are defined and selected.

Sources: 
src/worldgen/biome/Climate.ts
6-141

Climate Data Model
Sources: 
src/worldgen/biome/Climate.ts
6-293

Climate Target vs Parameter Points
The climate system employs two primary point types:

TargetPoint: Represents exact climate values at a specific world location with direct numerical values for each parameter.
ParamPoint: Represents a biome's climate definition with ranges (min/max values) for each parameter.
The Param class provides range operations for climate parameters:

export class Param {
    constructor(
        public readonly min: number,
        public readonly max: number,
    ) {}
    
    // Calculates distance to another parameter value or range
    public distance(param: Param | number) {
        const diffMax = (typeof param === 'number' ? param : param.min) - this.max
        const diffMin = this.min - (typeof param === 'number' ? param : param.max)
        if (diffMax > 0) {
            return diffMax
        }
        return Math.max(diffMin, 0)
    }
}
Sources: 
src/worldgen/biome/Climate.ts
24-51

Climate Sampler
The Climate.Sampler obtains climate parameters at specific world coordinates using density functions:

export class Sampler {
    constructor(
        public readonly temperature: DensityFunction,
        public readonly humidity: DensityFunction,
        public readonly continentalness: DensityFunction,
        public readonly erosion: DensityFunction,
        public readonly depth: DensityFunction,
        public readonly weirdness: DensityFunction,
    ) {}
    
    sample(x: number, y: number, z: number) {
        const context = DensityFunction.context(x << 2, y << 2, z << 2)
        return Climate.target(
            this.temperature.compute(context),
            this.humidity.compute(context),
            this.continentalness.compute(context),
            this.erosion.compute(context),
            this.depth.compute(context),
            this.weirdness.compute(context)
        )
    }
}
The sampler is typically created from a NoiseRouter:

public static fromRouter(router: NoiseRouter) {
    return new Climate.Sampler(
        router.temperature, 
        router.vegetation, 
        router.continents, 
        router.erosion, 
        router.depth, 
        router.ridges
    )
}
Sources: 
src/worldgen/biome/Climate.ts
123-141

BiomeSource System
The BiomeSource interface defines how biomes are selected based on coordinates and climate parameters:

Sources: 
src/worldgen/biome/BiomeSource.ts
10-13
 
src/worldgen/biome/index.ts
1-5

BiomeSource Implementations
Deepslate includes several BiomeSource implementations:

MultiNoiseBiomeSource
The most complex implementation that uses climate parameters to select biomes:

export class MultiNoiseBiomeSource implements BiomeSource {
    private readonly parameters: Climate.Parameters<Identifier>

    constructor(entries: Array<[Climate.ParamPoint, () => Identifier]>) {
        this.parameters = new Climate.Parameters(entries)
    }

    public getBiome(x: number, y: number, z: number, climateSampler: Climate.Sampler) {
        const target = climateSampler.sample(x, y, z)
        return this.parameters.find(target)
    }
}
This implementation samples climate at the requested coordinates, then uses a spatial lookup to find the most appropriate biome.

Sources: 
src/worldgen/biome/MultiNoiseBiomeSource.ts
6-27

FixedBiomeSource
Always returns the same biome, regardless of coordinates or climate:

export class FixedBiomeSource implements BiomeSource {
    constructor(private readonly biome: Identifier) {}

    public getBiome() {
        return this.biome
    }
}
Sources: 
src/worldgen/biome/FixedBiomeSource.ts
5-19

CheckerboardBiomeSource
Creates a checkerboard pattern of biomes based on x and z coordinates:

export class CheckerboardBiomeSource implements BiomeSource {
    constructor(
        private readonly shift: number,
        private readonly biomes: Identifier[],
    ) {
        this.n = biomes.length
    }

    public getBiome(x: number, y: number, z: number) {
        const i = (((x >> this.shift) + (z >> this.shift)) % this.n + this.n) % this.n
        return Identifier.parse(this.biomes[i].toString())
    }
}
Sources: 
src/worldgen/biome/CheckerboardBiomeSource.ts
5-36

TheEndBiomeSource
Special biome source for The End dimension, with biome selection based on distance from center and erosion values:

export class TheEndBiomeSource implements BiomeSource {
    public getBiome(x: number, y: number, z: number, climateSampler: Climate.Sampler) {
        // Center island check
        if (sectionX * sectionX + sectionZ * sectionZ <= 4096) {
            return TheEndBiomeSource.END
        }
        
        // Outer islands biome selection based on erosion
        const erosion = climateSampler.erosion.compute(context)
        if (erosion > 0.25) {
            return TheEndBiomeSource.HIGHLANDS
        } else if (erosion >= -0.0625) {
            return TheEndBiomeSource.MIDLANDS
        } else if (erosion >= -0.21875) {
            return TheEndBiomeSource.BARRENS
        } else {
            return TheEndBiomeSource.ISLANDS
        }
    }
}
Sources: 
src/worldgen/biome/TheEndBiomeSource.ts
6-41

Climate to Biome Lookup
The climate-to-biome lookup system efficiently finds the closest matching biome for a given set of climate parameters using a specialized spatial data structure.

Biome Selection Process










Sources: 
src/worldgen/biome/Climate.ts
111-292
 
src/worldgen/biome/MultiNoiseBiomeSource.ts
6-27

RTree Spatial Lookup
The MultiNoiseBiomeSource uses an RTree to efficiently find biomes:

export class Parameters<T> {
    private readonly index: RTree<T>

    constructor(public readonly things: [ParamPoint, () => T][]) {
        this.index = new RTree(things)
    }

    public find(target: TargetPoint) {
        return this.index.search(target.toArray(), this.last_leaf, 
            (node, values) => node.distance(values))
    }
}
The RTree organizes biomes hierarchically based on their climate parameters. Each node contains a range of parameter values, and searching traverses the tree to find the closest match.

The distance between climate points is calculated using squared Euclidean distance in the 6-dimensional parameter space, plus an optional offset:

public fittness(point: ParamPoint | TargetPoint) {
    return square(this.temperature.distance(point.temperature))
        + square(this.humidity.distance(point.humidity))
        + square(this.continentalness.distance(point.continentalness))
        + square(this.erosion.distance(point.erosion))
        + square(this.depth.distance(point.depth))
        + square(this.weirdness.distance(point.weirdness))
        + square(this.offset - point.offset)
}
Sources: 
src/worldgen/biome/Climate.ts
53-72
 
src/worldgen/biome/Climate.ts
111-122
 
src/worldgen/biome/Climate.ts
143-292

Usage Example
Here's an example of how the Nether biomes are configured using the MultiNoiseBiomeSource:

const netherBiomes: [Climate.ParamPoint, () => Identifier][] = [
    [Climate.parameters(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0), 
        () => Identifier.create('nether_wastes')],
    [Climate.parameters(0.0, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0), 
        () => Identifier.create('soul_sand_valley')],
    [Climate.parameters(0.4, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0), 
        () => Identifier.create('crimson_forest')],
    [Climate.parameters(0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.375), 
        () => Identifier.create('warped_forest')],
    [Climate.parameters(-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.175), 
        () => Identifier.create('basalt_deltas')],
]
const nether = new MultiNoiseBiomeSource(netherBiomes)
This example shows how each Nether biome is defined with specific climate parameters, and these biomes are organized into a MultiNoiseBiomeSource for biome selection.

Sources: 
test/worldgen/biome/MultiNoiseBiomeSource.test.ts
13-20

Performance Considerations
The climate and biome system is optimized for performance:

The RTree spatial index accelerates biome lookups
A caching mechanism stores the last matched leaf node for optimization
The system uses bit shifting operations to convert between block and chunk coordinates
For large biome sets (like those in vanilla Minecraft or data packs like Terralith), benchmarks measure lookup performance to ensure efficiency:

b.suite('MultiNoiseBiomeSource',
    b.add('getBiome Vanilla', async () => {
        const biome_source_json = (await (await fetch(`${MC_META}data/minecraft/dimension/overworld.json`)).json()).generator.biome_source
        const biome_source = MultiNoiseBiomeSource.fromJson(biome_source_json)
        var sampler = new DemoSampler()
        biome_source.getBiome(0,0,0, sampler)

        return () => {
            biome_source.getBiome(0, 0, 0, sampler)
        }
    }),
    //...more benchmarks
)
Sources: 
benchmarks/worldgen/MultiNoiseBiomeSource.ts
37-60

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Biomes and Climate
Climate Parameters
Climate Data Model
Climate Target vs Parameter Points
Climate Sampler
BiomeSource System
BiomeSource Implementations
MultiNoiseBiomeSource
FixedBiomeSource
CheckerboardBiomeSource
TheEndBiomeSource
Climate to Biome Lookup
Biome Selection Process
RTree Spatial Lookup
Usage Example
Performance Considerations


Ask Devin about misode/deepslate

Fast

Biomes and Climate | misode/deepslate | DeepWiki
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2

