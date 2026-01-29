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
Random Number Generation
Relevant source files
This page documents the random number generation systems in Deepslate, which are critical components for procedural content generation, such as world terrain, structures, and other game elements. The random number generators (RNGs) in Deepslate provide deterministic, reproducible sequences of pseudo-random numbers based on specified seeds.

For information about the math utilities that complement these random number generators, see Math Utilities.

Overview of Random Number Generation System
Deepslate implements two main random number generator classes that follow the same interface but use different algorithms:

XoroshiroRandom - A modern, high-quality RNG implementing the Xoroshiro128++ algorithm
LegacyRandom - A classical linear congruential generator (LCG) that matches the behavior of Java's Random class
Both generators provide consistent random number generation across different platforms and allow for deterministic world generation from the same seed.

Sources: 
src/math/random/Random.ts
1-15
 
src/math/random/XoroshiroRandom.ts
5-146
 
src/math/random/LegacyRandom.ts
5-86

Random Interface
The Random interface provides the core functionality for all random number generators in Deepslate:
















Sources: 
src/math/random/Random.ts
1-9

This interface provides methods to:

Generate random numbers of various types (integers, longs, floats, doubles)
Skip ahead in the random sequence without calculating intermediate values
Create derivative random generators that extend from the current state
Positional Random Interface
The PositionalRandom interface extends random number generation to be position-dependent, which is essential for world generation:








Sources: 
src/math/random/Random.ts
11-15

This interface is crucial for terrain generation because it allows for consistent randomness at specific world coordinates. For example, a tree at coordinates (100, 64, 200) will always generate the same way given the same world seed.

XoroshiroRandom Implementation
The XoroshiroRandom class implements the Xoroshiro128++ algorithm, which is a modern, high-quality pseudorandom number generator known for its speed and statistical properties.

Seed Initialization






Sources: 
src/math/random/XoroshiroRandom.ts
34-51

When creating a new XoroshiroRandom instance, the input seed is upgraded from a 64-bit number to a 128-bit state using mathematical constants and mixing functions:

The seed is XOR'd with the silver ratio constant (7640891576956012809)
A second seed component is calculated by adding the golden ratio constant (-7046029254386353131)
Both components are mixed using the Stafford13 mixing function
The result is a 128-bit state consisting of two 64-bit values
Random Number Generation Process





Sources: 
src/math/random/XoroshiroRandom.ts
69-81

The core next() method generates a 64-bit random number and updates the internal state:

Calculate a new value by manipulating the current state components
Update the state using bit rotation and XOR operations
Return the calculated value
This base method is then used by the other methods (nextInt, nextFloat, etc.) to generate different types of random numbers.

Positional Random Generation











Sources: 
src/math/random/XoroshiroRandom.ts
148-170

The XoroshiroPositionalRandom class provides position-dependent randomness by:

Taking a base seed from the parent random generator
For coordinate-based randomness:
Converting (x, y, z) coordinates into a single seed value
XORing this with the base seed
Creating a new random generator with the derived seed
For name-based randomness:
Generating an MD5 hash of the provided name
Converting the hash to two 64-bit values
XORing with the base seeds
Creating a new random generator with the derived seed
LegacyRandom Implementation
The LegacyRandom class implements a linear congruential generator (LCG) that matches the behavior of Java's Random class, which is used in vanilla Minecraft.

Core Algorithm


















Sources: 
src/math/random/LegacyRandom.ts
5-86

The key constants used in the LCG algorithm are:

MULTIPLIER: 25214903917
INCREMENT: 11
MODULUS_MASK: 281474976710655 (2^48-1)
Each call to advance() updates the internal state using the formula:

seed = (seed * MULTIPLIER + INCREMENT) & MODULUS_MASK
Special Methods for World Generation
The LegacyRandom class also includes special methods specifically designed for world generation:









Sources: 
src/math/random/LegacyRandom.ts
19-31

These methods create deterministic random generators for specific world features based on:

The world seed
Chunk coordinates (x, z)
An optional salt value (for differentiating between feature types)
LegacyPositionalRandom
Similar to XoroshiroPositionalRandom, the LegacyPositionalRandom class provides position-dependent randomness:





Sources: 
src/math/random/LegacyRandom.ts
88-107

The implementation is similar but simpler since it only needs to manage a single 64-bit seed instead of the 128-bit state used by XoroshiroRandom.

Usage Patterns
Random number generators in Deepslate are typically used in the following ways:

Direct Random Number Generation
// Create a new random with a specific seed
const random = XoroshiroRandom.create(BigInt(12345));

// Generate random numbers
const randomInt = random.nextInt(100);  // Integer between 0-99
const randomFloat = random.nextFloat(); // Float between 0-1
const randomLong = random.nextLong();   // 64-bit integer
Positional Randomness for World Generation
// Create a positional random source from a world seed
const worldSeed = BigInt(12345);
const random = XoroshiroRandom.create(worldSeed);
const positionalRandom = random.forkPositional();

// Get consistent randomness at specific coordinates
const treeRandom = positionalRandom.at(100, 64, 200);
const shouldPlaceTree = treeRandom.nextFloat() < 0.1; // 10% chance

// Get consistent randomness for named features
const biomeRandom = positionalRandom.fromHashOf("oak_forest");
Skipping Values
// Skip ahead in the random sequence
random.consume(1000); // Skip 1000 values
Conclusion
Deepslate's random number generation system provides a flexible, deterministic foundation for procedural world generation. The dual implementation approach with XoroshiroRandom and LegacyRandom allows for both modern performance and compatibility with existing Minecraft algorithms.

The positional random capabilities are especially important for terrain generation, ensuring that the same features appear at the same coordinates given the same world seed, which is essential for a consistent world experience.

Sources: 
src/math/random/Random.ts
1-15
 
src/math/random/XoroshiroRandom.ts
5-170
 
src/math/random/LegacyRandom.ts
5-107

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Random Number Generation
Overview of Random Number Generation System
Random Interface
Positional Random Interface
XoroshiroRandom Implementation
Seed Initialization
Random Number Generation Process
Positional Random Generation
LegacyRandom Implementation
Core Algorithm
Special Methods for World Generation
LegacyPositionalRandom
Usage Patterns
Direct Random Number Generation
Positional Randomness for World Generation
Skipping Values
Conclusion


Ask Devin about misode/deepslate

Fast

Random Number Generation | misode/deepslate | DeepWiki
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

