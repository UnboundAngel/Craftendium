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
Noise Functions
Relevant source files
Noise functions are a fundamental component of the Deepslate library's procedural generation system. They provide the mathematical foundation for creating natural-looking terrain, biomes, and other world features. This page details the various noise function implementations, their mathematical foundations, and how they're used in the world generation pipeline.

For information about how these noise functions are applied to create specific terrain shapes, see Density Functions.

Noise Function Types
Deepslate implements several types of noise algorithms, each with specific characteristics and use cases:



































Sources: 
src/math/noise/PerlinNoise.ts
1-85
 
src/math/noise/ImprovedNoise.ts
1-76
 
src/math/noise/SimplexNoise.ts
1-167
 
src/math/noise/NormalNoise.ts
1-54
 
src/math/noise/BlendedNoise.ts
1-76

PerlinNoise
PerlinNoise is a gradient noise function that produces natural-looking patterns by combining multiple "octaves" of noise at different frequencies and amplitudes. It's the primary noise type used throughout the terrain generation system.

Key properties:

noiseLevels: Array of ImprovedNoise instances for each octave
amplitudes: The strength of each octave's contribution
lowestFreqInputFactor and lowestFreqValueFactor: Scaling factors for frequency and value
// Sample usage
const perlinNoise = new PerlinNoise(random, firstOctave, amplitudes);
const value = perlinNoise.sample(x, y, z);
Sources: 
src/math/noise/PerlinNoise.ts
6-85

ImprovedNoise
ImprovedNoise implements a single octave of Perlin noise. It uses a permutation table to create pseudo-random gradients and performs interpolation between grid points.

Key aspects:

Initialized with a random seed to create a permutation table
Provides 3D noise sampling with optional Y-axis adjustments
Uses smoothstep interpolation for natural transitions
Sources: 
src/math/noise/ImprovedNoise.ts
5-75

SimplexNoise
SimplexNoise is an alternative noise algorithm that produces patterns similar to Perlin noise but with faster computation and fewer directional artifacts. It supports both 2D and 3D sampling.

Key differences from Perlin noise:

Uses a simplicial grid rather than a rectangular grid
Generally produces more natural-looking results
Has better performance characteristics for higher dimensions
Sources: 
src/math/noise/SimplexNoise.ts
4-166

NormalNoise
NormalNoise combines two PerlinNoise instances to create a noise function with a more normalized distribution. This is especially useful for climate and biome generation where statistical properties are important.

// Construction
new NormalNoise(random, { firstOctave, amplitudes });
Sources: 
src/math/noise/NormalNoise.ts
5-36

BlendedNoise
BlendedNoise is a specialized noise implementation that blends multiple PerlinNoise instances to create smooth, complex terrain. It uses three noise sources:

minLimitNoise: Sets the lower bounds for terrain
maxLimitNoise: Sets the upper bounds for terrain
mainNoise: Controls the primary terrain shape
This blending creates natural-looking transitions between different terrain features.

Sources: 
src/math/noise/BlendedNoise.ts
6-76

Mathematical Foundations
Noise functions rely on several key mathematical techniques to produce natural-looking patterns:












Sources: 
src/math/Util.ts
8-142
 
src/math/noise/ImprovedNoise.ts
28-70

Interpolation Functions
The library implements several interpolation functions to create smooth transitions between values:

lerp(a, b, c): Linear interpolation between b and c using factor a
lerp2 and lerp3: 2D and 3D interpolation (bilinear and trilinear)
smoothstep(x): Creates a smooth S-curve for more natural transitions
Example of the smoothstep function:

export function smoothstep(x: number): number {
    return x * x * x * (x * (x * 6 - 15) + 10)
}
Sources: 
src/math/Util.ts
16-62

Noise Sampling
The core of noise generation is the sampling function that converts coordinates into noise values:

Calculate grid cell coordinates for the input point
Generate gradient vectors at grid points
Calculate dot products between gradient vectors and distance vectors
Interpolate between the dot products using smoothstep
Return the interpolated value
For PerlinNoise, multiple octaves of noise are combined with decreasing influence:

// Simplified sampling from PerlinNoise
public sample(x, y, z) {
    let value = 0
    let inputF = this.lowestFreqInputFactor
    let valueF = this.lowestFreqValueFactor
    for (let i = 0; i < this.noiseLevels.length; i += 1) {
        const noise = this.noiseLevels[i]
        if (noise) {
            value += this.amplitudes[i] * valueF * noise.sample(
                PerlinNoise.wrap(x * inputF),
                PerlinNoise.wrap(y * inputF),
                PerlinNoise.wrap(z * inputF)
            )
        }
        inputF *= 2
        valueF /= 2
    }
    return value
}
Sources: 
src/math/noise/PerlinNoise.ts
45-64
 
src/math/noise/ImprovedNoise.ts
28-46

Noise Usage in World Generation
Noise functions form the foundation of Deepslate's world generation system. Here's how they flow through the generation pipeline:










Sources: 
src/worldgen/RandomState.ts
10-116

Integration with RandomState
The RandomState class serves as the central manager for all noise functions in world generation:

It initializes various noise functions with appropriate seeds
Creates a cache of noise functions for reuse
Maps noise functions to density functions
Provides the NoiseRouter with configured noise inputs
// RandomState handles noise creation and caching
public getOrCreateNoise(id: Identifier) {
    const noises = Registry.REGISTRY.getOrThrow(Identifier.create('worldgen/noise'));
    return computeIfAbsent(this.noiseCache, id.toString(), key =>
        new NormalNoise(this.random.fromHashOf(key), noises.getOrThrow(id))
    )
}
Sources: 
src/worldgen/RandomState.ts
104-109

From Noise to Terrain
The process from noise to terrain follows these steps:

Noise functions generate raw values based on coordinates
These values feed into density functions that define terrain shapes
The NoiseRouter directs these density values to appropriate world features
The NoiseChunkGenerator uses the router to create chunks with proper terrain
Noise is also used for other world generation aspects like:

Climate parameters (temperature, humidity)
Biome distribution
Feature placement decisions
Cave and structure generation
Sources: 
src/worldgen/RandomState.ts
31-34

Advanced Features
Splines
The CubicSpline system provides advanced interpolation capabilities for world generation:


















The spline system allows for smooth interpolation between points with control over derivatives, enabling complex terrain transitions.

Sources: 
src/math/CubicSpline.ts
1-201
 
test/math/Spline.test.ts
1-43

Implementation Notes
Seeding and Randomness
Noise functions are deterministic based on their seed. The library supports two types of random number generators:

LegacyRandom: Compatibility with Minecraft's legacy RNG
XoroshiroRandom: A modern, high-quality RNG
When creating noise, the appropriate random generator is chosen based on settings:

// RandomState initialization with proper seeding
this.random = (settings.legacyRandomSource ? 
    new LegacyRandom(seed) : 
    XoroshiroRandom.create(seed)).forkPositional()
Sources: 
src/worldgen/RandomState.ts
28

Performance Optimizations
Several optimizations are used in the noise implementation:

Caching of noise functions by identifier
Wrapping of input coordinates to avoid overflow
Efficient interpolation using precomputed tables
Reuse of noise instances where possible
Sources: 
src/math/noise/PerlinNoise.ts
82-84
 
src/worldgen/RandomState.ts
11-12
 
src/math/noise/ImprovedNoise.ts
15-26

Summary
Noise functions are the mathematical foundation of Deepslate's procedural generation system. Through a combination of different noise types (Perlin, Simplex, Normal, Blended) and mathematical techniques (interpolation, octaves, gradients), they enable the creation of natural-looking terrain and world features.

The integration of these noise functions into the world generation pipeline through RandomState, DensityFunctions, and NoiseRouter allows for complex, varied, and deterministic world generation.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Noise Functions
Noise Function Types
PerlinNoise
ImprovedNoise
SimplexNoise
NormalNoise
BlendedNoise
Mathematical Foundations
Interpolation Functions
Noise Sampling
Noise Usage in World Generation
Integration with RandomState
From Noise to Terrain
Advanced Features
Splines
Implementation Notes
Seeding and Randomness
Performance Optimizations
Summary


Ask Devin about misode/deepslate

Fast

Noise Functions | misode/deepslate | DeepWiki
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2

