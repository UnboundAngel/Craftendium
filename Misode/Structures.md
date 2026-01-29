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
Structures
Relevant source files
This document covers the structure generation system in Deepslate, which is responsible for generating predefined structures (like temples, villages, monuments, etc.) during world generation. For information about the Structure class that represents an arrangement of blocks in memory, see Structure.

1. Overview
The structure generation system determines where, when, and how structures are placed in the generated world. It uses a combination of:

Structure definitions that specify what to build
Placement rules that determine where structures can appear
Biome constraints that limit structures to appropriate environments
Random number generators to ensure deterministic but varied placement
The system works alongside the chunk generation process, deciding which structures should be present in each chunk and at what specific coordinates they should be placed.






















Sources: 
src/worldgen/structure/WorldgenStructure.ts
18-70
 
src/worldgen/structure/StructurePlacement.ts
11-67
 
src/worldgen/structure/StructureSet.ts
8-67

2. Structure System Components
The structure system consists of three primary components:

WorldgenStructure: The base class for all structure types that defines what to build and how
StructurePlacement: Controls where structures can appear in the world
StructureSet: Groups structures together and determines which one to generate based on weights

















Sources: 
src/worldgen/structure/WorldgenStructure.ts
18-70
 
src/worldgen/structure/StructurePlacement.ts
11-67
 
src/worldgen/structure/StructureSet.ts
8-81

3. WorldgenStructure
WorldgenStructure is the abstract base class that all structure types extend. It defines the common functionality for finding suitable generation locations and attempting to generate a structure.

3.1 Core Methods
Method	Purpose
findGenerationPoint	Abstract method that each structure type implements to find where in a chunk it can generate
tryGenerate	Uses the generation point and biome validation to determine if a structure can actually generate
onTopOfChunkCenter	Helper method for structures that generate on the surface of terrain
getLowestY	Helper method to find the lowest suitable Y-coordinate for a structure
3.2 Structure Types
Deepslate implements numerous structure types, each with specialized generation logic:

















Sources: 
src/worldgen/structure/WorldgenStructure.ts
108-149
 
src/worldgen/structure/WorldgenStructure.ts
258-395

3.3 JigsawStructure
The JigsawStructure deserves special mention as it's a more complex structure type that uses a pool of template pieces to build larger, varied structures like villages. It:

Uses a starting pool of structure templates
Finds a suitable height for generation
Selects a random template from the pool
Can map the structure to the terrain heightmap
Validates the structure fits within world height limits











Sources: 
src/worldgen/structure/WorldgenStructure.ts
154-233

3.4 Generation Context
The GenerationContext class provides structures with access to the information they need for generation:

WorldgenStructure.GenerationContext {
    seed: bigint                    // World seed
    biomeSource: BiomeSource        // Biome provider
    settings: NoiseGeneratorSettings // World generation settings
    levelHeight: LevelHeight        // Min/max height of the world
    randomState: RandomState        // Random number generators
    chunkGenerator: NoiseChunkGenerator // Chunk generation utilities
}
Sources: 
src/worldgen/structure/WorldgenStructure.ts
82-96

4. Structure Placement
StructurePlacement determines where structures can be generated in the world. The system supports different placement strategies and configurable frequency.

4.1 Placement Strategies







Sources: 
src/worldgen/structure/StructurePlacement.ts
11-67
 
src/worldgen/structure/StructurePlacement.ts
135-286

RandomSpread Placement
The most common placement strategy that creates a grid-like distribution of structures with controlled randomness:

Divides the world into regions of spacing × spacing chunks
Each region has a single potential structure location
The exact position is randomized within the region, but at least separation chunks from the region borders
The spreadType (linear or triangular) affects the distribution within the region
ConcentricRings Placement
Used for special structures like strongholds that generate in concentric rings around the origin:

Creates rings of potential structure locations at increasing distances from origin
Each ring contains a specified number of evenly spaced structures
Can prefer specific biomes, searching outward from the initial position
Used for important landmark structures like strongholds
4.2 Frequency Reduction
The frequency parameter (0.0-1.0) controls how often a structure actually generates at a potential location. The system supports several frequency reduction methods:

Method	Description
ProbabilityReducer	Default method, uses random number < frequency check
LegacyProbabilityReducerWithDouble	Similar to default but uses nextDouble() instead of nextFloat()
LegacyArbitrarySaltProbabilityReducer	Uses a fixed salt value for backward compatibility
LegacyPillagerOutpostReducer	Special method for pillager outposts with region-based checks
Sources: 
src/worldgen/structure/StructurePlacement.ts
70-104

4.3 Exclusion Zones
The ExclusionZone feature prevents structures from generating too close to other structure types:

References another StructureSet to avoid
Specifies a chunkCount radius to maintain as separation
Checks all potential structure locations from the other set to enforce spacing
Sources: 
src/worldgen/structure/StructurePlacement.ts
106-123

5. Structure Sets
StructureSet is the top-level component that brings together structures and placement rules. It's responsible for:

Grouping related structures together
Assigning weights to determine relative frequency
Using the placement strategy to determine if any structure should generate in a chunk
Selecting which specific structure to generate based on weights
5.1 Structure Selection Process
The structure selection works as follows:

Sources: 
src/worldgen/structure/StructureSet.ts
23-66

6. Structure Generation Process
The complete structure generation process involves these steps:

For each chunk, StructureSet.getStructureInChunk() is called to determine if a structure should generate
The placement strategy checks if the chunk is a valid candidate for structure generation
If valid, a specific structure is selected from the set (weighted random selection)
The selected structure's tryGenerate() method attempts to find a valid generation point
The generation point is validated against biome constraints
If successful, the structure ID and position are returned for actual structure building
6.1 Biome Constraints
Structures are constrained to generate only in specific biomes, defined in their StructureSettings:

// Example of structure settings with biome constraints
new StructureSettings(
    validBiomes: HolderSet<unknown> // Set of biomes where structure can generate
)
The tryGenerate method checks the biome at the potential generation point and only allows generation if it matches one of the valid biomes.

Sources: 
src/worldgen/structure/WorldgenStructure.ts
61-69
 
src/worldgen/structure/WorldgenStructure.ts
75-81

6.2 Random Seeds and Determinism
The structure generation system uses several random number generators to ensure deterministic but varied results:

LegacyRandom.fromLargeFeatureSeed() - Used for structure-specific randomization
RandomState from the generation context - Provides world-specific randomization
Various feature-specific seeds - Control specific aspects of structures
This ensures that:

The same world seed always produces the same structure placements
Different structure types have different random patterns
Structures can have varied internal layouts while maintaining consistent placement
Sources: 
src/worldgen/structure/WorldgenStructure.ts
62
 
src/worldgen/RandomState.ts
27-33

7. Registry and JSON Configuration
Structures, structure sets, and related components are registered in the registry system:












This allows structure definitions to be loaded from JSON configuration files, making the system highly extensible:

WorldgenStructure.fromJson() parses structure definitions
StructureSet.fromJson() parses structure set definitions
StructurePlacement.fromJson() parses placement strategy definitions
Sources: 
src/worldgen/structure/WorldgenStructure.ts
73
 
src/worldgen/structure/StructureSet.ts
9
 
src/worldgen/WorldgenRegistries.ts
7-12

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Structures
1. Overview
2. Structure System Components
3. WorldgenStructure
3.1 Core Methods
3.2 Structure Types
3.3 JigsawStructure
3.4 Generation Context
4. Structure Placement
4.1 Placement Strategies
RandomSpread Placement
ConcentricRings Placement
4.2 Frequency Reduction
4.3 Exclusion Zones
5. Structure Sets
5.1 Structure Selection Process
6. Structure Generation Process
6.1 Biome Constraints
6.2 Random Seeds and Determinism
7. Registry and JSON Configuration


Ask Devin about misode/deepslate

Fast

Structures | misode/deepslate | DeepWiki
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

