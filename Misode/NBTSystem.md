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
NBT System
Relevant source files
The NBT (Named Binary Tag) system provides serialization and deserialization capabilities for binary data in Deepslate. NBT is the primary data format used in Minecraft for storing structured data in binary form. This system allows reading and writing NBT files and provides data conversion between binary NBT format and in-memory data structures.

Overview
NBT serves as a foundation for both the Core Data Model and World Generation systems by enabling storage and retrieval of complex structured data. Similar to JSON or XML, NBT provides a hierarchical structure with various data types, but in a compact binary format.

Sources: 
README.md
14-26

NBT Tag Types
The NBT system defines a hierarchy of tag types that can represent different data values. All tags inherit from the base NbtTag class and implement type-specific serialization and deserialization methods.




























Sources: 
src/nbt/tags/NbtFloat.ts
 
src/nbt/tags/NbtDouble.ts

Common Tag Types
NBT supports various data types through specialized tag implementations:

Tag Type	ID	Purpose	Example
NbtEnd	0	Marks the end of a compound tag	N/A
NbtByte	1	8-bit signed integer	127, -128
NbtShort	2	16-bit signed integer	32767, -32768
NbtInt	3	32-bit signed integer	2147483647
NbtLong	4	64-bit signed integer	9223372036854775807
NbtFloat	5	32-bit floating point	3.14159f
NbtDouble	6	64-bit floating point	2.71828
NbtByteArray	7	Array of signed bytes	[1, 2, 3, 4]
NbtString	8	UTF-8 string	"Hello, world!"
NbtList	9	List of unnamed tags (same type)	[1, 2, 3, 4] or nested lists
NbtCompound	10	Collection of named tags	{"name": "value", ...}
NbtIntArray	11	Array of 32-bit integers	[1, 2, 3, 4]
NbtLongArray	12	Array of 64-bit integers	[1, 2, 3, 4]
Sources: 
src/nbt/tags/NbtFloat.ts
 
src/nbt/tags/NbtDouble.ts

Tag Implementation
Each NBT tag implements a common interface for serialization, deserialization, and conversion to other formats. For example, a NbtFloat represents a 32-bit floating point value:

// Simplified example of NbtFloat implementation
class NbtFloat extends NbtTag {
    private readonly value: number
    
    // Gets the tag's type ID
    public getId() {
        return NbtType.Float
    }
    
    // Serializes to binary format
    public toBytes(output: DataOutput) {
        output.writeFloat(this.value)
    }
    
    // Deserializes from binary format
    public static fromBytes(input: DataInput) {
        const value = input.readFloat()
        return new NbtFloat(value)
    }
    
    // String representation
    public toString() {
        return this.value.toString() + 'f'
    }
    
    // JSON conversion
    public toJson() {
        return this.value
    }
}
Sources: 
src/nbt/tags/NbtFloat.ts
7-58
 
src/nbt/tags/NbtDouble.ts
7-62

NBT File Format
An NBT file consists of a single named compound tag that serves as the root. This compound tag can contain any number of nested tags, creating a hierarchical structure.









The binary format of an NBT file includes:

Tag type (1 byte)
Name length (2 bytes) and name (UTF-8 string)
Tag payload (varies by type)
Sources: 
README.md
14-26

Reading and Writing NBT Files
The NbtFile class provides methods for reading and writing NBT data:

Example Usage
// Reading an NBT file
const file = NbtFile.read(binaryData);
const rootCompound = file.root;

// Accessing data
const name = rootCompound.get("name").getAsString();
const position = rootCompound.get("pos").getAsList();

// Modifying data
rootCompound.set("name", new NbtString("New Name"));

// Writing to binary
const newBinaryData = file.write();
Sources: 
README.md
14-26

Integration with Core Data Model
NBT data is used extensively in Deepslate to represent game objects:











Structure Serialization
Structures can be loaded from and saved to NBT files:

// Loading a structure from NBT
const file = NbtFile.read(binaryData);
const structure = Structure.fromNbt(file.root);

// Saving a structure to NBT
const nbtCompound = structure.toNbt();
const file = new NbtFile();
file.root = nbtCompound;
const binaryData = file.write();
Sources: 
README.md
14-26

Binary Format Handling
The NBT system handles the binary encoding and decoding through the DataInput and DataOutput interfaces:

Data Type	Binary Format	Size (bytes)
Byte	Signed byte	1
Short	Big-endian signed	2
Int	Big-endian signed	4
Long	Big-endian signed	8
Float	IEEE-754 single	4
Double	IEEE-754 double	8
String	UTF-8 with length	2 + length
List	Type ID + length + elements	5 + elements
Compound	Named tags + End tag	Variable
Sources: 
src/nbt/tags/NbtFloat.ts
43-57
 
src/nbt/tags/NbtDouble.ts
46-60

Conclusion
The NBT system in Deepslate provides a robust mechanism for serializing and deserializing Minecraft binary data. It supports all standard NBT tag types and integrates seamlessly with other components of the library, such as Structure rendering and World Generation.

For more information on how NBT interacts with other systems, see the Core Data Model and World Generation pages.

Dismiss
Refresh this wiki

Enter email to refresh
On this page
NBT System
Overview
NBT Tag Types
Common Tag Types
Tag Implementation
NBT File Format
Reading and Writing NBT Files
Example Usage
Integration with Core Data Model
Structure Serialization
Binary Format Handling
Conclusion


Ask Devin about misode/deepslate

Fast

NBT System | misode/deepslate | DeepWiki
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

