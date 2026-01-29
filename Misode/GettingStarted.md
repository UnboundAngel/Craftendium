Getting Started | misode/deepslate | DeepWiki
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
Getting Started
Relevant source files
This guide provides installation instructions and basic usage examples to help you start working with Deepslate, a JavaScript library for rendering and emulating parts of Minecraft. For a comprehensive architectural overview of the library, see Architecture Overview.

Installation
Deepslate can be installed via npm or included directly in your HTML via a CDN.

NPM Installation
npm install deepslate
You can then import the modules you need in your JavaScript/TypeScript code:

// Import specific modules
import { Structure, StructureRenderer } from 'deepslate';
// Or import from specific submodules
import { NbtFile } from 'deepslate/nbt';
CDN Usage
Alternatively, you can include Deepslate directly in your HTML:

<script src="https://unpkg.com/deepslate@0.23.6"></script>
This will expose a global Deepslate object that contains all the library's exports.

Sources: 
package.json
1-78
 
README.md
1-11

Library Structure
Deepslate is organized into several modules, each with a specific purpose:




















Each module can be imported separately to optimize bundle size:

// Import only what you need
import { Structure } from 'deepslate/core';
import { NbtFile } from 'deepslate/nbt';
import { StructureRenderer } from 'deepslate/render';
Sources: 
package.json
21-49

Basic Examples
Reading and Writing NBT Files
Named Binary Tag (NBT) is the binary format Minecraft uses for storing data. Deepslate provides utilities for reading and manipulating NBT data:

import { NbtFile, NbtString } from 'deepslate'

fetch('./example.nbt')
  .then(res => res.arrayBuffer())
  .then(data => {
    // Read an NBT file
    const file = NbtFile.read(new Uint8Array(data))
    
    // Modify NBT data
    file.root.set('Hello', new NbtString('World!'))
    
    // Write the modified data back to a binary format
    const newData = file.write()
    console.log(newData)
  })
For more detailed information about the NBT system, see NBT System.

Rendering a Structure
Deepslate can render Minecraft structures in a WebGL context:

import { Structure, StructureRenderer } from 'deepslate'
import { mat4 } from 'gl-matrix'

// Create a structure
const structure = new Structure([4, 3, 4])
structure.addBlock([0, 0, 3], "minecraft:stone")
structure.addBlock([0, 1, 3], "minecraft:cactus", { "age": "1" })

// Get WebGL context from a canvas element
const gl = canvas.getContext('webgl')

// Create a renderer (see resources setup below)
const renderer = new StructureRenderer(gl, structure, resources)

// Set up the view matrix
const view = mat4.create()
mat4.translate(view, view, [0, 0, -5])

// Render the structure
renderer.drawStructure(view)
For details on creating resource objects and advanced rendering, see Rendering System.

Sources: 
README.md
12-47

Setting Up Resources
To render blocks or items, you need to provide resource data such as block models and textures. Here's a simplified overview of the resources needed:














In practice, you would typically fetch these resources from a resource pack or a server. The Deepslate demo examples show how to set up resources in a web environment.

Working with Noise Functions
Deepslate includes implementations of various noise functions used in Minecraft world generation:

import { SimplexNoise, LegacyRandom } from 'deepslate'

// Create a noise generator with a seed
const noise = new SimplexNoise(new LegacyRandom(BigInt(12345)))

// Sample noise at coordinates
const value = noise.sample(x / 32, y / 32, 0)
Deepslate supports several noise types including:

Simplex Noise
Perlin Noise
Normal Noise
Blended Noise
Improved Noise
For deeper exploration of noise functions, see Noise Functions.

Sources: 
website/src/components/examples/Noise.tsx
1-76

Typical Workflow
A typical workflow when using Deepslate follows this pattern:






Dependencies
Deepslate has a few core dependencies:

Dependency	Purpose
gl-matrix	Matrix and vector operations for 3D rendering
md5	Hash generation for various internal operations
pako	Compression and decompression for NBT data
Sources: 
package.json
61-65

Next Steps
Now that you're familiar with Deepslate's basic usage, you might want to explore:

Core Data Model - Learn about fundamental data structures like BlockState and Structure
Rendering System - Dive deeper into rendering blocks, items, and structures
World Generation - Explore terrain generation with noise functions and biomes
NBT System - Master the Named Binary Tag format for data serialization
Explore the online examples to see Deepslate in action with structure rendering, noise visualization, and chunk generation.

Sources: 
README.md
49-68

Dismiss
Refresh this wiki

Enter email to refresh
On this page
Getting Started
Installation
NPM Installation
CDN Usage
Library Structure
Basic Examples
Reading and Writing NBT Files
Rendering a Structure
Setting Up Resources
Working with Noise Functions
Typical Workflow
Dependencies
Next Steps


Ask Devin about misode/deepslate

Fast

Syntax error in text
mermaid version 11.12.2

