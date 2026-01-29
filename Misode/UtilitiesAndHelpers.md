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
Utilities and Helpers
Relevant source files
The Deepslate library contains a collection of utility functions and helper classes that provide essential mathematical operations, random number generation, interpolation methods, and noise generation algorithms. These utilities serve as the foundation for more complex systems such as world generation, block rendering, and structure manipulation.

This page documents the primary utility functions and helper classes available in Deepslate. For information about specific world generation mathematics, see World Generation.

Math Utilities
The core math utilities provide fundamental operations used throughout the codebase, including interpolation functions, clamping, rounding, and binary search.



































Sources: 
src/math/Util.ts
8-125

Basic Operations
The library provides fundamental mathematical operations like square() for squaring a number and clamp() for restricting a value to a specific range.

// Squares a number (x * x)
function square(x: number): number

// Restricts a value between min and max
function clamp(x: number, min: number, max: number): number
Sources: 
src/math/Util.ts
8-14

Interpolation Functions
A rich set of interpolation functions forms the core of many rendering and generation algorithms:

Function	Description
lerp(a, b, c)	Linear interpolation from b to c using factor a
floatLerp(a, b, c)	Same as lerp but ensures float precision
lerp2(a, b, c, d, e, f)	Bilinear interpolation (2D)
lerp3(a, b, c, d, e, f, g, h, i, j, k)	Trilinear interpolation (3D)
lazyLerp(a, b, c)	Lazy evaluation of lerp where b and c are functions
clampedLerp(a, b, c)	Lerp with c clamped between 0 and 1
inverseLerp(a, b, c)	Calculates where a falls between b and c, as a factor
smoothstep(x)	Hermite interpolation for smooth transitions
map(a, b, c, d, e)	Maps a value from one range to another
These interpolation functions are extensively used in terrain generation, coloring, and transition effects.

Sources: 
src/math/Util.ts
16-70

Rounding and Integer Operations
Functions for converting floating-point values to integers while respecting platform limits:

// Floor a number and clamp it to valid integer range
function intFloor(a: number): number

// Floor a number and clamp it to valid long integer range
function longFloor(a: number): number
Sources: 
src/math/Util.ts
72-78

Search Utilities
The binarySearch() function provides an efficient algorithm for finding values in sorted collections:

// Binary search with a custom predicate function
function binarySearch(n: number, n2: number, predicate: (value: number) => boolean): number
This is used in various parts of the system, including spline interpolation for terrain features.

Sources: 
src/math/Util.ts
80-93
 
src/math/CubicSpline.ts
81

Bit Manipulation
Utility functions for bit-level operations:

// Checks if x is a power of two
function isPowerOfTwo(x: number): boolean

// Rounds up to the next power of two
function upperPowerOfTwo(x: number): number
Sources: 
src/math/Util.ts
112-125

Random Number Generation
The random number generation system provides deterministic pseudo-random number sequences essential for world generation.











































Sources: 
src/math/random/Random.ts
 
src/math/random/LegacyRandom.ts
 
src/math/random/XoroshiroRandom.ts

Random Interface
The system defines a common interface for all random number generators, enabling interchangeable implementations:

interface Random {
    consume(count: number): void
    nextInt(max?: number): number
    nextLong(): bigint
    nextFloat(): number
    nextDouble(): number
    fork(): Random
    forkPositional(): PositionalRandom
}
Sources: 
src/math/random/Random.ts
1-9

Positional Random
A specialized interface for generating random instances based on coordinates or string identifiers:

interface PositionalRandom {
    at(x: number, y: number, z: number): Random
    fromHashOf(name: string): Random
    seedKey(): [bigint, bigint]
}
This is crucial for world generation where different world features require consistent randomness at specific coordinates.

Sources: 
src/math/random/Random.ts
11-15

Random Implementations
Deepslate provides two primary implementations of the Random interface:

LegacyRandom: Uses a linear congruential generator algorithm compatible with older Minecraft versions.

XoroshiroRandom: Implements the modern Xoroshiro128++ algorithm, offering improved statistical properties and performance.

Each implementation has a corresponding positional variant that allows for position-based deterministic random number generation.

Sources: 
src/math/random/LegacyRandom.ts
 
src/math/random/XoroshiroRandom.ts

Random Utility Functions
In addition to the random generators themselves, the utilities include functions that leverage random objects:

// Generate random integer between min and max (inclusive)
function randomBetweenInclusive(random: Random, min: number, max: number): number

// Generate random integer between min and max
function nextInt(random: Random, min: number, max: number): number

// Randomly shuffle an array in place
function shuffle(array: unknown[], random: Random): void
Sources: 
src/math/Util.ts
128-143

Noise Generation
The noise generation system provides implementations of various noise algorithms used extensively in world generation.

Sources: 
src/math/noise/PerlinNoise.ts
 
src/math/noise/SimplexNoise.ts
 
src/math/noise/ImprovedNoise.ts

Perlin Noise
The PerlinNoise class provides an implementation of the Perlin noise algorithm, which generates coherent noise through octave-based summation:

class PerlinNoise {
    public readonly noiseLevels: ImprovedNoise[]
    public readonly amplitudes: number[]
    
    constructor(random: Random, firstOctave: number, amplitudes: number[])
    
    public sample(x: number, y: number, z: number, yScale?: number, yLimit?: number, fixY?: boolean): number
    public getOctaveNoise(i: number): ImprovedNoise | undefined
    public edgeValue(x: number): number
}
The Perlin noise generator creates multiple "octaves" of noise at different frequencies and amplitudes, then combines them to create complex, natural-looking patterns.

Sources: 
src/math/noise/PerlinNoise.ts

Simplex and Improved Noise
The library includes both SimplexNoise and ImprovedNoise implementations to provide different noise characteristics:

class SimplexNoise {
    constructor(random: Random)
    public sample(x: number, y: number, z: number): number
    public sample2D(d: number, d2: number): number
}

class ImprovedNoise {
    constructor(random: Random)
    public sample(x: number, y: number, z: number, yScale?: number, yLimit?: number): number
}
Both noise implementations are seeded with random generators for deterministic but varied output.

Sources: 
src/math/noise/SimplexNoise.ts
 
src/math/noise/ImprovedNoise.ts

Cubic Splines
The cubic spline system provides smooth interpolation for complex functions, particularly useful in terrain and climate modeling.
































Sources: 
src/math/CubicSpline.ts
 
test/math/Spline.test.ts

Spline Interfaces
The system defines interfaces for numerical functions and splines:

interface NumberFunction<C> {
    compute(c: C): number
}

interface MinMaxNumberFunction<C> extends NumberFunction<C> {
    minValue(): number
    maxValue(): number
}

interface CubicSpline<C> extends NumberFunction<C> {
    min(): number
    max(): number
    mapAll(visitor: CoordinateVisitor<C>): CubicSpline<C>
    calculateMinMax(): void
}
Sources: 
src/math/CubicSpline.ts
4-24

Spline Implementations
Two primary implementations of cubic splines are provided:

Constant: A simple implementation that always returns the same value.

MultiPoint: A complex implementation that handles interpolation between multiple control points with specified derivatives.

// From CubicSpline.ts
class MultiPoint<C> implements CubicSpline<C> {
    constructor(
        public coordinate: NumberFunction<C>,
        public locations: number[] = [],
        public values: CubicSpline<C>[] = [],
        public derivatives: number[] = [],
    )
    
    public compute(c: C): number
    public addPoint(location: number, value: number | CubicSpline<C>, derivative = 0)
}
The MultiPoint spline allows for nested splines, enabling complex multi-dimensional interpolation functions.

Sources: 
src/math/CubicSpline.ts
68-200
 
test/math/Spline.test.ts
34-42

Relationship to Other Systems
The utilities and helpers documented here serve as the foundation for more complex systems in Deepslate.

Sources: 
src/math/Util.ts
 
src/math/noise/PerlinNoise.ts
 
src/math/CubicSpline.ts

The utility functions and algorithms documented on this page serve as the mathematical foundation for Deepslate's more advanced systems. For more specific information about world generation mathematics, see World Generation, and for random number generation applications, see Random Number Generation.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Utilities and Helpers
Math Utilities
Basic Operations
Interpolation Functions
Rounding and Integer Operations
Search Utilities
Bit Manipulation
Random Number Generation
Random Interface
Positional Random
Random Implementations
Random Utility Functions
Noise Generation
Perlin Noise
Simplex and Improved Noise
Cubic Splines
Spline Interfaces
Spline Implementations
Relationship to Other Systems


Ask Devin about misode/deepslate

Fast

Utilities and Helpers | misode/deepslate | DeepWiki
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

