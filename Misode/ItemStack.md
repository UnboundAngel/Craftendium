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
ItemStack
Relevant source files
The ItemStack system represents individual items and their quantities within the Deepslate library. It provides functionality to create, modify, compare, and serialize item stacks, complete with item properties and components.

For information about BlockState, which represents blocks in the world, see BlockState. For information about Structure, which uses collections of blocks, see Structure.

Overview
An ItemStack combines an item identifier, a count (quantity), and optional components that define the item's properties. It forms a fundamental part of Deepslate's core data model, providing a rich representation of items that closely matches Minecraft's item system.
























Sources: 
src/core/ItemStack.ts
11-180
 
src/core/Identifier.ts
1-45

Core Structure
The ItemStack class has three primary properties:

Property	Type	Description
id	Identifier	Uniquely identifies the item type
count	number	Quantity of items in the stack
components	Map<string, NbtTag>	Additional properties and data
The id property uses the Identifier class, which consists of a namespace (defaulting to "minecraft") and a path, typically in the format "namespace:path".

Sources: 
src/core/ItemStack.ts
12-16
 
src/core/Identifier.ts
1-45

Components System
ItemStack features a powerful component system that allows for flexible item customization. Components are stored as key-value pairs where:

Keys are strings, typically in Identifier format
Values are NbtTag instances containing the component data













Component Resolution
The component system supports two levels of components:

Instance-specific components: Stored directly in the ItemStack
Base components: Provided through an ItemComponentsProvider
When retrieving a component using getComponent(), the method first checks if the component exists in the ItemStack's components map. If not found, it will check the base components if a provider is available.

The component system also supports "negated components" with keys prefixed with "!" to explicitly indicate the absence of a component.

Sources: 
src/core/ItemStack.ts
18-50
 
src/core/ItemStack.ts
7-9

Creating and Manipulating ItemStacks
Creating ItemStacks
You can create an ItemStack in several ways:

Direct instantiation:
const item = new ItemStack(Identifier.parse("minecraft:diamond_sword"), 1);
From string representation:
const item = ItemStack.fromString("minecraft:diamond_sword[damage=5] 1");
From NBT data:
const item = ItemStack.fromNbt(nbtCompound);
Comparing ItemStacks
The ItemStack class provides several methods for comparison:

is(other): Checks if the ItemStack has the same identifier as another item
equals(other): Checks if the ItemStack has the same id, count, and components as another ItemStack
isSameItemSameComponents(other): Checks if the ItemStack has the same id and components as another ItemStack (ignoring count)
Cloning
The clone() method creates a new ItemStack with the same id, count, and components (the component values are not deeply cloned as they are assumed to be immutable).

Sources: 
src/core/ItemStack.ts
52-89
 
src/core/ItemStack.ts
104-179

Serialization and Deserialization
ItemStack supports serialization to and deserialization from both string and NBT formats.











String Format
The string representation follows this pattern:

Item identifier (namespace:path)
Optional components in square brackets as key-value pairs
Optional item count
Examples:

"minecraft:diamond_sword"
"minecraft:diamond_sword[damage=5]"
"minecraft:diamond_sword[damage=5,enchantments={...}] 1"
NBT Format
The NBT representation is a compound tag with these fields:

id: String tag with the item identifier
count: Int tag with the item count (omitted if 1)
components: Compound tag containing all components (omitted if empty)
Sources: 
src/core/ItemStack.ts
91-179

Usage Example
Here's a conceptual example of how ItemStack might be used in the Deepslate library:

Create an ItemStack representing a diamond sword with enchantments:
// Create the item
const sword = new ItemStack(
  Identifier.parse("minecraft:diamond_sword"), 
  1
);

// Add components (like enchantments)
const enchantments = createEnchantmentTag();  // Creates appropriate NBT data
sword.components.set("enchantments", enchantments);

// Check if it has a specific component
if (sword.hasComponent("damage", baseComponentProvider)) {
  // Handle damaged item
}

// Serialize for storage
const nbtData = sword.toNbt();
Using ItemStack with rendering:
// Retrieve an item for rendering
const itemStack = getItemFromInventory();

// Pass to renderer which might use the item's components
// to determine how to render it
itemRenderer.renderItem(itemStack);
Sources: 
src/core/ItemStack.ts
11-180

Integration with Other Systems
ItemStack integrates with other parts of the Deepslate library in several ways:

The Item Rendering system uses ItemStacks to determine how to visually display items
NBT serialization allows for persistence and data interchange
Components provide rich item customization similar to Minecraft's item tag system
Sources: 
src/core/ItemStack.ts
11-180

Dismiss
Refresh this wiki

Enter email to refresh
On this page
ItemStack
Overview
Core Structure
Components System
Component Resolution
Creating and Manipulating ItemStacks
Creating ItemStacks
Comparing ItemStacks
Cloning
Serialization and Deserialization
String Format
NBT Format
Usage Example
Integration with Other Systems


Ask Devin about misode/deepslate

Fast

ItemStack | misode/deepslate | DeepWiki
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

