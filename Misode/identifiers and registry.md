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
Identifiers and Registry
Relevant source files
This page documents the identifier system and registry pattern in Deepslate. These core components provide a standardized way to name, store, and access game objects throughout the codebase. For information about specific registry types such as block states, see BlockState.

Identifiers
Identifiers provide a namespaced naming system for game objects. Each identifier consists of a namespace and path separated by a colon character.












The Identifier class provides:

A standard format for naming game objects (namespace:path)
Default "minecraft" namespace when not specified
Utility methods for creating, parsing, and comparing identifiers
Structure and Format
An identifier follows this pattern:

namespace:path
For example:

minecraft:stone
minecraft:worldgen/biome/forest
deepslate:custom_block
If the namespace is omitted, "minecraft" is used as the default:

// These are equivalent:
Identifier.parse("stone")
Identifier.parse("minecraft:stone")
Sources: 
src/core/Identifier.ts
1-45

Common Usage
Identifiers serve as keys in registries and provide a standardized way to reference game objects:








Sources: 
src/core/Identifier.ts
1-45
 
src/core/ItemStack.ts
5
 
src/worldgen/WorldgenRegistries.ts
1-3

Registry System
The Registry system provides a centralized storage mechanism for game objects, allowing them to be referenced by identifiers.

The Registry system has several key features:

Self-registration: A root registry (Registry.REGISTRY) stores all other registries
Lazy loading: Values can be stored as functions and evaluated when needed
Builtin values: Special values that persist when registry is cleared
Serialization/deserialization: Optional parsers for converting between JSON and objects
Sources: 
src/core/Registry.ts
1-115
 
src/core/Holder.ts
1-43

Creating and Using Registries
Registries are typically created using the static method createAndRegister:








Examples from the codebase include:

// World generation registries
export const NOISE = Registry.createAndRegister('worldgen/noise', NoiseParameters.fromJson)
export const DENSITY_FUNCTION = Registry.createAndRegister('worldgen/density_function', obj => DensityFunction.fromJson(obj))
Sources: 
src/worldgen/WorldgenRegistries.ts
8-11
 
src/core/Registry.ts
17-21

Holder Pattern
The Holder interface provides an abstraction layer for accessing registry entries. Instead of directly referencing values, code can use holders which may contain either:

Direct values: Values stored directly in the holder
Registry references: References to values stored in a registry










The Holder pattern provides several benefits:

Unified interface for direct values and registry references
Lazy loading of registry entries
Ability to reference registry entries before they're defined
Sources: 
src/core/Holder.ts
1-43

Creating and Using Holders
Holders can be created in two ways:

// Direct holder (contains the value directly)
const directHolder = Holder.direct(myValue);

// Reference holder (references a registry entry)
const refHolder = Holder.reference(myRegistry, myIdentifier);
To access the value in a holder:

const value = holder.value();
const id = holder.key(); // May be undefined for direct holders
Sources: 
src/core/Holder.ts
20-42

Registry Usage Examples
The Registry pattern is used extensively throughout Deepslate. Here are some examples:

1. World Generation Registries










The world generation system uses multiple registries to store different components:

export const NOISE = Registry.createAndRegister('worldgen/noise', NoiseParameters.fromJson)
export const DENSITY_FUNCTION = Registry.createAndRegister('worldgen/density_function', obj => DensityFunction.fromJson(obj))
export const NOISE_SETTINGS = Registry.createAndRegister('worldgen/noise_settings', NoiseGeneratorSettings.fromJson)
export const BIOME = Registry.createAndRegister<{}>('worldgen/biome')
Sources: 
src/worldgen/WorldgenRegistries.ts
1-19

2. Item Components
The ItemStack class uses identifiers for components:

export class ItemStack {
    constructor(
        public id: Identifier,
        public count: number,
        public components: Map<string, NbtTag> = new Map(),
    ) {}
    
    public getComponent<T>(key: string | Identifier, baseComponents: ItemComponentsProvider | undefined): NbtTag | undefined {
        if (typeof key === 'string') {
            key = Identifier.parse(key)
        }
        // ...
    }
    // ...
}
Sources: 
src/core/ItemStack.ts
11-34

Best Practices
When working with the Identifier and Registry systems:

Use Identifier objects instead of raw strings for type safety and consistency
Access registry entries through Holders when possible for better abstraction
Register objects early in the initialization process
Provide parsers when creating registries to enable serialization/deserialization
Use the builtin flag for registry entries that should survive registry clearing
Summary
The Identifier and Registry pattern forms the foundation of Deepslate's data model. This standardized approach to naming and storing game objects enables:

Consistent referencing of game objects across the codebase
Centralized storage with efficient lookup
Serialization and deserialization via the NBT system
Lazy loading of values for improved performance
Understanding these components is essential for working with other parts of the Deepslate library, including the BlockState system (BlockState), ItemStack system (ItemStack), and world generation components.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Identifiers and Registry
Identifiers
Structure and Format
Common Usage
Registry System
Creating and Using Registries
Holder Pattern
Creating and Using Holders
Registry Usage Examples
1. World Generation Registries
2. Item Components
Best Practices
Summary


Ask Devin about misode/deepslate

Fast

Identifiers and Registry | misode/deepslate | DeepWiki
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2

