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
Chunk Generation
Relevant source files
Chunk generation is the core process of creating terrain blocks in Deepslate. It transforms mathematical noise functions into three-dimensional landscapes by filling chunks with appropriate block states based on density values. This page explains how chunks are generated from noise and configured through various settings.

For information about noise functions themselves, see Noise Functions. For information about density functions used to shape terrain, see Density Functions.

Sources: 
src/worldgen/NoiseChunkGenerator.ts
1-145
 
src/worldgen/index.ts
1-16

Overview
The chunk generation system converts abstract mathematical functions into concrete block data organized in chunks. It's responsible for:

Dividing the world into cells for efficient noise sampling
Converting density values to block states
Placing appropriate blocks at each position
Building terrain surfaces according to biomes
The primary class responsible for this process is NoiseChunkGenerator, which works alongside NoiseChunk to fill chunks with appropriate blocks.

Sources: 
src/worldgen/NoiseChunkGenerator.ts
13-145

Key Components
Chunk Generation Architecture
Sources: 
src/worldgen/NoiseChunkGenerator.ts
13-145
 
src/worldgen/NoiseSettings.ts
1-68
 
src/worldgen/NoiseGeneratorSettings.ts
1-52

NoiseChunkGenerator
The NoiseChunkGenerator is the primary class responsible for generating chunks. It:

Maintains a cache of NoiseChunk objects for efficiency
Determines block states at each position based on noise values
Fills chunks with appropriate blocks
Applies surface rules to create varied terrain
Sources: 
src/worldgen/NoiseChunkGenerator.ts
13-145

NoiseSettings
NoiseSettings defines the parameters for noise sampling and terrain dimensionality:

Property	Description
minY	Minimum Y level of the world
height	Total height of the world
xzSize	Horizontal scaling factor (affects cell width)
ySize	Vertical scaling factor (affects cell height)
The settings also include utility methods:

cellHeight(): Returns the vertical size of each noise cell (typically ySize * 4)
cellWidth(): Returns the horizontal size of each noise cell (typically xzSize * 4)
Sources: 
src/worldgen/NoiseSettings.ts
4-45

NoiseGeneratorSettings
NoiseGeneratorSettings provides broader configuration for terrain generation:

Property	Description
noise	The NoiseSettings for terrain dimensions
defaultBlock	The default solid block (typically stone)
defaultFluid	The default fluid block (typically water)
seaLevel	Y-level of the sea
aquifersEnabled	Whether aquifers are generated
surfaceRule	Rules for surface block placement
noiseRouter	Configuration of density functions
Sources: 
src/worldgen/NoiseGeneratorSettings.ts
7-52

Chunk Generation Process
Cell-Based Generation Model












Sources: 
src/worldgen/NoiseChunkGenerator.ts
75-116
 
src/worldgen/NoiseSettings.ts
31-45

Generation Steps
The chunk generation process follows these steps:

Initialization: A NoiseChunkGenerator is created with a biome source and settings.

Cell Division: The chunk is divided into cells based on cellWidth and cellHeight from the noise settings.

Noise Chunk Creation: A NoiseChunk is created or retrieved from cache for the current chunk coordinates.

Cell Processing: For each cell in the chunk:

The cell is processed block by block
For each block position, NoiseChunk.getFinalState() is called to determine the appropriate block
The block state is set in the chunk
Surface Building (optional): Surface rules are applied to create appropriate top layers based on biomes.

Sources: 
src/worldgen/NoiseChunkGenerator.ts
75-116
 
src/worldgen/NoiseChunkGenerator.ts
118-122

Block Placement Algorithm
The core of chunk generation happens in the fill method, which:

Calculates cell dimensions based on noise settings
Divides the chunk into a grid of cells
Iterates through each cell in 3D space
Gets the final block state for each position
Sets the block in the appropriate chunk section
Here's a simplified diagram of the block placement process:
















Sources: 
src/worldgen/NoiseChunkGenerator.ts
75-116

Optimization Techniques
NoiseChunk Caching
The NoiseChunkGenerator maintains a cache of previously generated NoiseChunk objects, which saves computational resources when accessing the same chunk multiple times:










The cache uses the chunk's long position (encoded X and Z) as the key.

Sources: 
src/worldgen/NoiseChunkGenerator.ts
14
 
src/worldgen/NoiseChunkGenerator.ts
128-144

Cell-Based Processing
Rather than calculating noise for every block individually, the system uses a cell-based approach where:

Each cell covers multiple blocks (determined by cellWidth and cellHeight)
Noise is sampled at cell corners
Block states within cells are determined by interpolating between corner values
This significantly reduces the number of expensive noise function calculations required.

Sources: 
src/worldgen/NoiseSettings.ts
31-45
 
src/worldgen/NoiseChunkGenerator.ts
79-84

Usage Example
The following example demonstrates how to create and use a NoiseChunkGenerator:

// Create a biome source
const biomeSource = new FixedBiomeSource(Identifier.create('plains'));

// Create noise generator settings
const settings = NoiseGeneratorSettings.create({
  noise: {
    minY: 0,
    height: 64,
    xzSize: 1,
    ySize: 1,
  },
  defaultBlock: BlockState.STONE,
  defaultFluid: BlockState.WATER,
  seaLevel: 32,
});

// Create the noise chunk generator
const generator = new NoiseChunkGenerator(biomeSource, settings);

// Create a random state
const randomState = new RandomState(settings, BigInt(12345));

// Create an empty chunk
const chunk = new Chunk(0, 64, ChunkPos.create(0, 0));

// Fill the chunk with blocks
generator.fill(randomState, chunk);

// Apply surface rules
generator.buildSurface(randomState, chunk);
Sources: 
test/worldgen/NoiseChunkGenerator.test.ts
8-27
 
test/worldgen/NoiseChunkGenerator.test.ts
35-41

Integration with Other Systems


















The chunk generation system connects to several other systems in Deepslate:

Noise System: Provides the mathematical functions to shape terrain
Biome System: Determines what biomes exist at different locations
Surface System: Applies rules for surface block placement
Aquifer System: Handles fluid placement in caves and underground
Sources: 
src/worldgen/NoiseChunkGenerator.ts
1-10
 
src/worldgen/NoiseChunkGenerator.ts
17-21
 
src/worldgen/NoiseChunkGenerator.ts
118-122
 
src/worldgen/NoiseGeneratorSettings.ts
1-18

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Chunk Generation
Overview
Key Components
Chunk Generation Architecture
NoiseChunkGenerator
NoiseSettings
NoiseGeneratorSettings
Chunk Generation Process
Cell-Based Generation Model
Generation Steps
Block Placement Algorithm
Optimization Techniques
NoiseChunk Caching
Cell-Based Processing
Usage Example
Integration with Other Systems


Ask Devin about misode/deepslate

Fast

Chunk Generation | misode/deepslate | DeepWiki
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

