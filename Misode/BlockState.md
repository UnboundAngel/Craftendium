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
BlockState
Relevant source files
The BlockState system in Deepslate represents the type and state of individual blocks in the Minecraft world. It combines a block identifier with a set of properties that define the block's specific configuration, such as orientation, color, or active state.

Purpose and Scope
This document details the BlockState system used throughout Deepslate to represent different block types and their properties. For information about how blocks are organized in a 3D space, see Structure. For information about block rendering, see Block Rendering.

Sources: 
src/core/index.ts
2
 
test/core/BlockState.test.ts
2-3

Core Concepts
A BlockState consists of two essential components:

A name (Identifier) - The unique block type (e.g., "minecraft:stone", "minecraft:piston")
Properties - Optional key-value pairs of string attributes (e.g., facing="north", extended="false")
This combination allows representing any block variation in the Minecraft world, from simple blocks like stone to complex blocks like pistons with multiple states.














Sources: 
test/core/BlockState.test.ts
5-92

Construction and Basic Usage
Creating a BlockState
BlockStates can be created directly using the constructor. The name can be provided as a string (which gets converted to an Identifier) or as an Identifier object. Properties are optional.










Sources: 
test/core/BlockState.test.ts
6-9
 
test/core/BlockState.test.ts
32-33

Core API Methods
BlockState provides several methods to access its information and compare with other block states:

Method	Description	Example Output
getName()	Returns the Identifier of the block	Identifier { namespace: 'minecraft', path: 'piston' }
getProperties()	Returns all properties as an object	{ extended: 'false', facing: 'up' }
getProperty(key)	Returns the value of a specific property	'up' (for key='facing')
equals(otherState)	Compares two BlockStates for equality	true or false
toString()	Returns string representation	'minecraft:piston[extended=false,facing=up]'
Sources: 
test/core/BlockState.test.ts
11-46

Serialization and Deserialization
BlockState supports conversion to and from different formats, enabling interoperability with various parts of the system.

From/To NBT
BlockStates can be created from NBT (Named Binary Tag) data structures, which is the format used by Minecraft for serialization.







Sources: 
test/core/BlockState.test.ts
48-67

From/To JSON
BlockStates can also be created from JSON objects with a similar structure to NBT.







Sources: 
test/core/BlockState.test.ts
69-91

Integration with Other Systems
BlockState is a foundational component used across multiple systems in Deepslate.

Usage in Structure
The Structure class uses BlockState objects to represent the blocks within a 3D space. It maintains a palette of unique BlockStates to efficiently store multiple instances of the same block type.











Sources: 
src/core/Structure.ts
3-4
 
src/core/Structure.ts
22-23
 
src/core/Structure.ts
37-49
 
src/core/Structure.ts
63-73

Position in Overall Architecture
BlockState plays a central role in the core data model of Deepslate, connecting block identifiers with structural components.










Sources: 
src/core/Structure.ts
4
 
src/core/StructureProvider.ts
3
 
src/render/index.ts
2-3

Examples of BlockState Usage
Basic Block
A simple block with no properties:

const stoneBlock = new BlockState('stone');
// Results in: minecraft:stone
Complex Block with Properties
A block with multiple properties:

const pistonBlock = new BlockState('piston', { 
    extended: 'false', 
    facing: 'up' 
});
// Results in: minecraft:piston[extended=false,facing=up]
Comparison Between BlockStates
const pistonA = new BlockState('piston', { extended: 'false', facing: 'up' });
const pistonB = new BlockState('piston', { extended: 'false', facing: 'up' });
const pistonC = new BlockState('piston', { extended: 'false', facing: 'down' });

pistonA.equals(pistonB); // true - same block type and properties
pistonA.equals(pistonC); // false - different facing property
Sources: 
test/core/BlockState.test.ts
32-41

Summary
The BlockState system provides a flexible and efficient way to represent block types and their properties in Deepslate. It serves as a critical foundation for the Structure, Chunk, and Rendering systems by encapsulating all the information needed to uniquely identify and render each block in the game world.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
BlockState
Purpose and Scope
Core Concepts
Construction and Basic Usage
Creating a BlockState
Core API Methods
Serialization and Deserialization
From/To NBT
From/To JSON
Integration with Other Systems
Usage in Structure
Position in Overall Architecture
Examples of BlockState Usage
Basic Block
Complex Block with Properties
Comparison Between BlockStates
Summary


Ask Devin about misode/deepslate

Fast

BlockState | misode/deepslate | DeepWiki
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

