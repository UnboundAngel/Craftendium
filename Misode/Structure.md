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
Structure
Relevant source files
The Structure class in Deepslate represents a three-dimensional arrangement of blocks with specific positions, states, and optional NBT data. It provides a efficient way to store, manipulate, and query collections of blocks used for rendering and world generation.

For information about structure generation in worlds, see World Generation Structures.

Core Components
The Structure class implements the StructureProvider interface and serves as a container for blocks arranged in 3D space. It uses a palette system to efficiently store block data by referencing block states through indices rather than storing complete data for each block.


























Sources: 
src/core/Structure.ts
13-31
 
src/core/StructureProvider.ts
5-9

Data Model
The Structure class maintains three primary data structures:

Size: A BlockPos defining the dimensions of the structure (x, y, z)
Palette: An array of BlockState objects representing unique block types in the structure
Blocks: An array of StoredBlock objects representing each block's position and palette index









Sources: 
src/core/Structure.ts
10-11
 
src/core/Structure.ts
16-29

Key Methods
Construction
The Structure constructor takes a size parameter (as a BlockPos) and optional palette and blocks arrays:

constructor(
    private readonly size: BlockPos,
    private readonly palette: BlockState[] = [],
    private readonly blocks: StoredBlock[] = []
)
The constructor also builds an internal blocksMap for efficient block retrieval by position. It validates that all provided blocks are within the structure's bounds.

Sources: 
src/core/Structure.ts
20-31

Adding Blocks
The addBlock method adds a block to the structure:

public addBlock(pos: BlockPos, name: Identifier | string, properties?: { [key: string]: string }, nbt?: NbtCompound)
This method:

Validates that the position is within bounds
Creates a BlockState from the name and properties
Checks if the block state already exists in the palette
If not, adds it to the palette
Stores the block with a reference to its palette index
Returns the structure for method chaining
Sources: 
src/core/Structure.ts
37-50

Retrieving Blocks
There are two methods for retrieving blocks:

public getBlocks(): PlacedBlock[]
public getBlock(pos: BlockPos): PlacedBlock | null
getBlocks() returns all blocks in the structure, converting from StoredBlock to PlacedBlock format
getBlock(pos) returns the block at a specific position (or null if no block exists there)
Sources: 
src/core/Structure.ts
52-61

Position Validation
The isInside method checks if a position is within the structure's bounds:

public isInside(pos: BlockPos): boolean
Sources: 
src/core/Structure.ts
75-79

Block Storage System
The structure uses an efficient palette system to avoid duplicating block state data:




















Sources: 
src/core/Structure.ts
37-73

NBT Serialization
The static fromNbt method creates a Structure from an NBT compound:

public static fromNbt(nbt: NbtCompound): Structure
The NBT format contains:

size: A list of three integers representing the structure dimensions
palette: A list of compound tags representing block states
blocks: A list of compound tags with position, state index, and optional NBT data
Sources: 
src/core/Structure.ts
81-91
 
test/core/Structure.test.ts
54-82

Position Transformation
The static transform method transforms a block position based on a rotation and pivot point:

public static transform(pos: BlockPos, rotation: Rotation, pivot: BlockPos): BlockPos
This is useful for rotating structures while preserving their relative block positions.

Sources: 
src/core/Structure.ts
93-104

Registry System
Structure instances can be registered in a global registry:

public static readonly REGISTRY = Registry.createAndRegister<Structure>('structures')
The registry allows for referencing structures by identifiers throughout the application.

Sources: 
src/core/Structure.ts
14

Example Usage
Creating a Structure
// Create a 3x2x1 structure
const structure = new Structure([3, 2, 1]);
Adding Blocks
// Add a stone block at position [0, 0, 0]
structure.addBlock([0, 0, 0], 'stone');

// Add a piston with properties 
structure.addBlock([1, 0, 0], 'piston', { extended: 'false', facing: 'up' });
Retrieving Blocks
// Get all blocks in the structure
const allBlocks = structure.getBlocks();

// Get a specific block
const block = structure.getBlock([0, 0, 0]);
if (block) {
  console.log(block.state.toString()); // "minecraft:stone"
}
Loading from NBT
const nbtData = /* NBT compound data */;
const structure = Structure.fromNbt(nbtData);
Sources: 
test/core/Structure.test.ts
5-82

Integration with Other Systems
The Structure class is a fundamental component in Deepslate, interacting with various other systems:









The Structure class provides the foundation for representing arrangements of blocks, which can then be:

Rendered using the Structure Rendering system
Serialized to/from NBT format for storage
Transformed and manipulated programmatically
Used in world generation
Sources: 
src/core/Structure.ts
1-7

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Structure
Core Components
Data Model
Key Methods
Construction
Adding Blocks
Retrieving Blocks
Position Validation
Block Storage System
NBT Serialization
Position Transformation
Registry System
Example Usage
Creating a Structure
Adding Blocks
Retrieving Blocks
Loading from NBT
Integration with Other Systems


Ask Devin about misode/deepslate

Fast

Structure | misode/deepslate | DeepWiki
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

