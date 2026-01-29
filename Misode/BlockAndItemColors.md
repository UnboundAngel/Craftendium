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
Block and Item Colors
Relevant source files
This page documents the color systems for blocks and items in the Deepslate library. These systems provide the functionality to apply appropriate colors to blocks (like grass, leaves, and redstone) and items (like potions, dyed leather, and maps) during rendering.

For information about the general rendering system, see Rendering System.

Color Representation
In Deepslate, colors are represented as a tuple of three numbers (RGB) in the normalized range of 0-1.

export type Color = [number, number, number]
The Color namespace provides utilities for working with colors:

// Convert an integer RGB value to a normalized Color tuple
intToRgb(n: number): Color

// Parse a color from JSON (either as an array or integer)
fromJson(obj: unknown): Color | undefined

// Extract a color from NBT data
fromNbt(nbt: NbtTag): Color | undefined
Sources: 
src/util/Color.ts
1-30

Block Colors System
The BlockColors system provides a mapping of block IDs to color functions. These functions determine the tint color that should be applied to blocks during rendering.










Predefined Block Colors
Many blocks have predefined colors that are applied during rendering:

Block Type	Color Source	RGB Example
Grass-like	Fixed value	[124/255, 189/255, 107/255]
Spruce leaves	Integer value	Color.intToRgb(6396257)
Birch leaves	Integer value	Color.intToRgb(8431445)
Oak/Jungle leaves	Integer value	Color.intToRgb(4764952)
Water	Integer value	Color.intToRgb(4159204)
Dynamic Block Coloring
Some blocks have colors calculated dynamically based on their properties:

Redstone Wire: Color varies based on power level (0-15)

redstone = (power: number): Color => {
  const a = power / 15
  const r = a * 0.6 + (a > 0 ? 0.4 : 0.3)
  const g = clamp(a * a * 0.7 - 0.5, 0, 1)
  const b = clamp(a * a * 0.6 - 0.7, 0, 1)
  return [r, g, b]
}
Plant Stems: Color changes based on growth age (0-7)

stem = (age: number): Color => {
  return [age / 8, 1 - age / 32, age / 64]
}
The complete mapping is defined in the BlockColors object, which maps block IDs to their color functions.

Sources: 
src/render/BlockColors.ts
1-56

Item Tinting System
Item tinting is more complex and flexible than block coloring. It's handled through the ItemTint interface:

export interface ItemTint {
  getTint(item: ItemStack, resources: ItemComponentsProvider, 
          context: ItemRenderingContext): Color
}

















Tinting Strategy Classes
Deepslate implements several strategies for item tinting:

Constant: Uses a fixed color

export class Constant {
  constructor(public value: Color) {}
  public getTint(item: ItemStack): Color {
    return this.value
  }
}
Dye: Gets color from the dyed_color component

Grass: Provides grass-like coloring

Firework: Extracts color from firework explosion data

Potion: Determines color based on potion type

MapColor: Uses the map_color component

CustomModelData: Gets color from custom model data

Team: Uses team color from context

Sources: 
src/render/ItemTint.ts
1-159

Item Tint Application
Item tints are applied during mesh generation in the ItemModel.Model class:

public getMesh(item: ItemStack, resources: ItemRendererResources, context: ItemRenderingContext): Mesh {
  // ...
  const tint = (i: number): Color => {
    if (i < this.tints.length) {
      return this.tints[i].getTint(item, resources, context)
    } else {
      return [1, 1, 1] // Default white if no tint is specified
    }
  }
  
  const mesh = model.getMesh(resources, Cull.none(), tint) 
  // ...
  return mesh
}
Sources: 
src/render/ItemModel.ts
79-106

Color System Integration
Block Color Integration
When rendering blocks, the appropriate color function is looked up from the BlockColors map using the block ID. If a function is found, it's applied to the block mesh during rendering.

Item Tint Integration
For items, tints are defined as part of the item model JSON. When parsing an item model, tints are extracted and converted to ItemTint instances:

export function fromJson(obj: unknown): ItemModel {
  const root = Json.readObject(obj) ?? {}
  const type = Json.readString(root.type)?.replace(/^minecraft:/, '')
  switch (type) {
    // ...
    case 'model': return new Model(
      Identifier.parse(Json.readString(root.model) ?? ''),
      Json.readArray(root.tints, ItemTint.fromJson) ?? []
    )
    // ...
  }
}
Sources: 
src/render/ItemModel.ts
23-71

Special Models
Some special item models have their own tinting logic:

Banner: Applies patterns with colors
Bed: Uses bed textures with colors
Head: Different textures based on mob type
Decorated Pot: Custom rendering with design patterns
Sources: 
src/render/SpecialModel.ts
1-192

Example Color Definitions
Block Color Example
Here's how block colors are defined in the code:

export const BlockColors: {
  [key: string]: (props: { [key: string]: string }) => Color,
} = {
  grass_block: () => grass,
  spruce_leaves: () => spruce,
  water: () => water,
  redstone_wire: (props) => redstone(parseInt(props['power'] ?? '0')),
  melon_stem: (props) => stem(parseInt(props['age'] ?? '0')),
  // ...
}
Sources: 
src/render/BlockColors.ts
23-55

Item Tint Example
A JSON definition for an item model with tinting:

{
  "type": "model",
  "model": "item/potion",
  "tints": [
    {
      "type": "potion",
      "default": [0.5, 0.5, 0.5]
    }
  ]
}
This defines a potion item model that will be colored according to its potion content, with a default gray color if no potion content is found.

Sources: 
src/render/ItemTint.ts
12-47
 
test/render/ItemTint.test.ts
12-43

Usage in Tests
Test cases provide good examples of how the tinting systems are used:

it('Dye', () => {
  const dyeTint = new ItemTint.Dye(TEST_COLOR)
  expect(dyeTint.getTint(ItemStack.fromString('dummy:dummy'), resources)).toEqual(TEST_COLOR)
  expect(dyeTint.getTint(ItemStack.fromString('dummy:dummy[dyed_color=255]'), resources)).toEqual([0, 0, 1])
})

it('Potion', () => {
  const potionTint = new ItemTint.Potion(TEST_COLOR)
  expect(potionTint.getTint(ItemStack.fromString('dummy:dummy'), resources)).toEqual(TEST_COLOR)
  expect(potionTint.getTint(ItemStack.fromString('dummy:dummy[potion_contents={potion:"leaping"}]'), resources)).toEqual(Color.intToRgb(16646020))
})
Sources: 
test/render/ItemTint.test.ts
48-68

Summary
The Block and Item Colors systems in Deepslate provide a flexible framework for applying appropriate colors to blocks and items during rendering. Block colors are primarily determined by a mapping of block types to color functions, while item tints offer a more complex system with multiple strategies for determining colors based on item properties, components, and context.

These coloring systems integrate with the broader rendering pipeline to ensure that blocks and items display with the correct visual appearance, enhancing the realism and visual fidelity of rendered scenes.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Block and Item Colors
Color Representation
Block Colors System
Predefined Block Colors
Dynamic Block Coloring
Item Tinting System
Tinting Strategy Classes
Item Tint Application
Color System Integration
Block Color Integration
Item Tint Integration
Special Models
Example Color Definitions
Block Color Example
Item Tint Example
Usage in Tests
Summary


Ask Devin about misode/deepslate

Fast

Block and Item Colors | misode/deepslate | DeepWiki
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2
Syntax error in text
mermaid version 11.12.2

