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
Math Utilities
Relevant source files
This page documents the mathematical utility functions and classes provided by the Deepslate library. These utilities serve as the foundation for many core systems including world generation, noise creation, and spatial calculations.

For information about random number generation, see Random Number Generation.

Overview
The math utilities in Deepslate provide a collection of functions for performing common mathematical operations, interpolations, value constraints, and transformations. These utilities are primarily located in the Util.ts file within the math module and are used extensively throughout the codebase, particularly in noise generation and world creation systems.

















Sources: 
src/math/Util.ts
8-143
 
src/math/noise/PerlinNoise.ts
1-85
 
src/math/CubicSpline.ts
1-201

Basic Constants and Operations
The library defines several numeric constants for boundaries and provides basic mathematical operations.

Numeric Boundaries
MIN_INT = -2147483648
MAX_INT = 2147483647
MIN_LONG = -9223372036854776000
MAX_LONG = 9223372036854776000
Basic Operations
Function	Description	Parameters	Return Value
square(x)	Calculates the square of a number	x: number	The square of x
intFloor(a)	Floors a number and clamps to integer range	a: number	Floored and clamped integer
longFloor(a)	Floors a number and clamps to long range	a: number	Floored and clamped long
Sources: 
src/math/Util.ts
3-77

Interpolation Functions
Deepslate provides a comprehensive set of interpolation functions that are crucial for smooth transitions in noise generation and terrain creation.





















Sources: 
src/math/Util.ts
16-62

Linear Interpolation
Linear interpolation calculates a value between two points based on a parameter t.

Function	Description	Formula
lerp(a, b, c)	Linear interpolation between b and c based on a	b + a * (c - b)
floatLerp(a, b, c)	Linear interpolation with float precision using Math.fround	Math.fround(b + Math.fround(a * Math.fround(c - b)))
clampedLerp(a, b, c)	Linear interpolation with parameter c clamped between 0 and 1	Returns a if c < 0, b if c > 1, otherwise normal lerp
inverseLerp(a, b, c)	Calculates the parameter t that would produce a in a lerp between b and c	(a - b) / (c - b)
Sources: 
src/math/Util.ts
16-58

Multi-dimensional Interpolation
These functions handle interpolation across multiple dimensions:

Function	Description
lerp2(a, b, c, d, e, f)	Bilinear interpolation
lerp3(a, b, c, d, e, f, g, h, i, j, k)	Trilinear interpolation
lazyLerp(a, b, c)	Linear interpolation with lazy evaluation of endpoints
lazyLerp2(a, b, c, d, e, f)	Bilinear interpolation with lazy evaluation
lazyLerp3(a, b, c, d, e, f, g, h, i, j, k)	Trilinear interpolation with lazy evaluation
The lazyLerp functions are particularly useful for optimizing performance when the endpoint calculations are expensive and might not be needed (when a is 0 or 1).

Sources: 
src/math/Util.ts
24-44

Mapping Functions
These functions combine interpolation with range mapping:

Function	Description
map(a, b, c, d, e)	Maps a value from one range to another
clampedMap(a, b, c, d, e)	Maps a value from one range to another with clamping
Sources: 
src/math/Util.ts
64-70

Value Manipulation
Constraints and Smoothing
Function	Description
clamp(x, min, max)	Constrains a value between minimum and maximum values
smoothstep(x)	Implements the smoothstep function: x * x * x * (x * (x * 6 - 15) + 10)
Sources: 
src/math/Util.ts
12-14
 
src/math/Util.ts
60-62

Searching
Function	Description
binarySearch(n, n2, predicate)	Performs a binary search in the range <FileRef file-url="https://github.com/misode/deepslate/blob/2f7f4ace/n, n2) using the given predicate
Bit Manipulation
Function	Description
isPowerOfTwo(x)	Checks if a number is a power of 2 using bitwise AND
upperPowerOfTwo(x)	Calculates the next power of 2 greater than or equal to x
Sources: 
src/math/Util.ts
112-125

Seed and Value Generation
Function	Description
getSeed(x, y, z)	Generates a seed value from three coordinates
longfromBytes(a, b, c, d, e, f, g, h)	Creates a 64-bit integer from 8 bytes
Sources: 
src/math/Util.ts
95-110

Random Utilities
Function	Description
randomBetweenInclusive(random, min, max)	Generates a random integer between min and max (inclusive)
nextInt(random, min, max)	Generates a random integer between min and max, handling the case where min >= max
shuffle(array, random)	Shuffles an array in-place using the Fisher-Yates algorithm
Sources: 
src/math/Util.ts
128-143

Cubic Splines
The CubicSpline class provides cubic spline interpolation, which is a piecewise cubic polynomial that ensures smooth transitions between points.


































Sources: 
src/math/CubicSpline.ts
1-201

Cubic Spline Usage
The CubicSpline class provides two main implementations:

CubicSpline.Constant - Represents a constant value
CubicSpline.MultiPoint - Represents a spline with multiple control points
Example usage (from test):

const spline = new CubicSpline.MultiPoint<number>({ compute: f => f })
  .addPoint(0.0, 0.0178, 0.2)  // location, value, derivative
  .addPoint(0.3, 0.23, 0.7)
  .addPoint(0.46, 0.89, -0.03)
  .addPoint(0.6, 0.4, 0.0)
Splines can also be nested:

const spline = new CubicSpline.MultiPoint<number>({ compute: f => f })
  .addPoint(0, 0.23)
  .addPoint(0.2, new CubicSpline.MultiPoint<number>({ compute: f => f * f })
    .addPoint(-0.1, 0)
    .addPoint(1.2, 0.4))
  .addPoint(0.7, 0.7)
Sources: 
src/math/CubicSpline.ts
26-200
 
test/math/Spline.test.ts
1-43

Integration with Noise Generation
The math utilities are extensively used in noise generation, which is a cornerstone of procedural world generation in Deepslate.















Sources: 
src/math/noise/PerlinNoise.ts
1-85
 
src/math/noise/ImprovedNoise.ts
1-76
 
src/math/noise/SimplexNoise.ts
1-166
 
src/math/noise/NormalNoise.ts
1-54

Noise Function Examples
The noise generation utilities leverage the math utilities in various ways:

ImprovedNoise uses intFloor for grid position calculation, smoothstep for gradient blending, and lerp3 for trilinear interpolation.

PerlinNoise uses longFloor for wrapping noise coordinates and applies interpolation for smooth noise.

SimplexNoise uses intFloor for grid calculations and implements a unique gradient interpolation method.

NormalNoise combines multiple noise functions with specific input and value scaling factors.

Sources: 
src/math/noise/ImprovedNoise.ts
28-70
 
src/math/noise/PerlinNoise.ts
45-84
 
src/math/noise/SimplexNoise.ts
31-144
 
src/math/noise/NormalNoise.ts
14-36

Summary
The Math Utilities in Deepslate provide a comprehensive set of mathematical functions that serve as building blocks for more complex systems. From basic operations to sophisticated interpolation and noise generation, these utilities enable the creation of realistic procedural terrain and other world elements.

By combining simple mathematical operations with more complex algorithms, Deepslate can efficiently generate and manipulate 3D worlds that resemble the distinctive blocky style of Minecraft while maintaining optimal performance.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Math Utilities
Overview
Basic Constants and Operations
Numeric Boundaries
Basic Operations
Interpolation Functions
Linear Interpolation
Multi-dimensional Interpolation
Mapping Functions
Value Manipulation
Constraints and Smoothing
Searching
Bit Manipulation
Seed and Value Generation
Random Utilities
Cubic Splines
Cubic Spline Usage
Integration with Noise Generation
Noise Function Examples
Summary


Ask Devin about misode/deepslate

Fast

Math Utilities | misode/deepslate | DeepWiki
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

