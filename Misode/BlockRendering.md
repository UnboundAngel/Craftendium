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
Block Rendering
Relevant source files
Purpose and Scope
The Block Rendering system transforms block data (BlockState objects) into 3D meshes that can be visualized on-screen. This page details the components involved in block rendering, how block models are defined and processed, and the pipeline that converts blocks from data to visual representation.

For information about rendering collections of blocks, see Structure Rendering. For details on how items are rendered, see Item Rendering.

Block Rendering Pipeline
The following diagram illustrates the high-level flow of block rendering in Deepslate:














Sources: 
src/render/BlockDefinition.ts
54-81
 
src/render/SpecialRenderer.ts
909-1040
 
src/render/ChunkBuilder.ts
57-83

Block Models
Block models define the 3D geometry, texture mapping, and visual appearance of blocks. The BlockModel class handles the creation of renderable meshes from model definitions.

Sources: 
src/render/BlockModel.ts
73-282

Model Elements
A block model consists of one or more cuboid elements defined by:

from: The start coordinates [x, y, z] (0-16 range)
to: The end coordinates [x, y, z] (0-16 range)
rotation: Optional rotation information
faces: Up to six faces (up, down, north, south, east, west)
Each face can specify:

texture: Reference to a texture (with # prefix for model textures)
uv: UV coordinates for texture mapping
cullface: Direction for face culling
rotation: Texture rotation (0, 90, 180, or 270 degrees)
tintindex: Index for applying color tinting
The process of converting an element to a mesh involves:

For each visible face, create a quad
Apply texture coordinates based on the face's UV and rotation
Apply tinting if specified
Apply transformations based on element rotation
Add the resulting quads to the mesh
Sources: 
src/render/BlockModel.ts
120-190

BlockDefinition System
The BlockDefinition class maps block states to their visual representation using either variants or multipart models:













Sources: 
src/render/BlockDefinition.ts
31-104

The BlockDefinition contains:

Variants: Maps property combinations (e.g., "facing=north") to model variants
Multipart: Provides conditional model application based on block properties
When rendering a block, the system:

Matches the block's properties against variants or multipart conditions
Selects the appropriate model variants
Loads the corresponding BlockModels
Applies rotations specified in the variant
Generates a mesh from the model
Sources: 
src/render/BlockDefinition.ts
41-52
 
src/render/BlockDefinition.ts
54-81

Special Renderers
Some blocks require custom rendering logic beyond standard block models. The SpecialRenderers namespace provides specialized rendering for these blocks:

















Special renderers handle blocks like:

Liquids (water, lava)
Containers (chests, shulker boxes)
Decorative blocks (heads, signs, banners)
Complex blocks (beds, bells, conduits)
Each special renderer creates a custom BlockModel with elements and faces specifically designed for that block type, often with transformations based on block properties.

Sources: 
src/render/SpecialRenderer.ts
13-1040

Chunk-Based Rendering
For efficient rendering of large structures, blocks are organized into chunks through the ChunkBuilder class:

Sources: 
src/render/ChunkBuilder.ts
7-147

The chunking process:

Divides the structure into 3D chunks of specified size
For each block in a chunk:
Determines which faces need culling
Gets the block's model through BlockDefinition or SpecialRenderer
Generates a mesh for the block
Transforms the mesh to the block's position
Separates opaque and transparent blocks for proper rendering order
Optimizes by only updating changed chunks
The needsCull method determines face visibility using these rules:

If no neighbor block exists, don't cull
If neighbor block is the same type and self-culling, cull
If neighbor block is opaque, cull (except for special cases like waterlogged blocks)
If both blocks are waterlogged, cull
Sources: 
src/render/ChunkBuilder.ts
108-122

WebGL Rendering
The final step is rendering the generated meshes to the screen using WebGL:











Sources: 
src/render/Renderer.ts
111-137
 
src/render/StructureRenderer.ts
211-218

The StructureRenderer class handles:

Creating and managing WebGL shaders and programs
Binding texture atlases
Setting up view and projection matrices
Drawing meshes with proper attributes (position, texture coordinates, colors, normals)
Managing different rendering modes (normal, colored, outline)
Sources: 
src/render/StructureRenderer.ts
84-239

Textures and UV Mapping
Block textures are stored in a texture atlas, and UV coordinates map portions of the atlas to block faces:









Sources: 
src/render/BlockModel.ts
135-149
 
src/render/BlockModel.ts
192-197

The texture resolution process:

Block models reference textures with #name syntax
These references are resolved through the model's texture map
The resolved texture name is converted to an Identifier
The TextureAtlasProvider returns UV coordinates for that texture
UV coordinates are adjusted based on face rotation
The final coordinates are applied to the mesh's quads
Coordinate System and Transformations
Block models use a specific coordinate system:

Block model coordinates range from 0 to 16
Meshes are scaled by 1/16 (0.0625) to convert to world coordinates
The origin (0,0,0) is at the bottom corner of a block
Various transformations are applied during rendering:

Model element rotations (in the model definition)
Block variant rotations (x and y rotations from BlockDefinition)
Special renderer transformations (for complex blocks)
Position transformations (to place blocks at the correct world position)
Sources: 
src/render/BlockModel.ts
177-190
 
src/render/BlockDefinition.ts
59-80
 
src/render/ChunkBuilder.ts
124-134

Integration Example
The demo code shows how block rendering integrates with other systems:










Sources: 
demo/main.ts
176-191

The integration process:

Load block definitions, models, and textures
Create a Structure with blocks
Initialize a StructureRenderer with the structure and resources
Set up user interaction (rotation, zooming)
Render the structure to a WebGL canvas
Summary
The Block Rendering system in Deepslate provides a flexible and efficient way to visualize blocks in 3D. It handles the complete pipeline from block data to visual representation, with support for complex blocks, optimized rendering, and interactive manipulation.

The system's modular design allows for extensibility and customization, while maintaining performance through techniques like face culling, chunking, and efficient mesh generation.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Block Rendering
Purpose and Scope
Block Rendering Pipeline
Block Models
Model Elements
BlockDefinition System
Special Renderers
Chunk-Based Rendering
WebGL Rendering
Textures and UV Mapping
Coordinate System and Transformations
Integration Example
Summary


Ask Devin about misode/deepslate

Fast

Block Rendering | misode/deepslate | DeepWiki
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

