import webbrowser
import time

# Base URL for the file view
BASE_URL = "https://github.com/toolbox4minecraft/amidst/blob/d146cb47bf94b8697a899f4336c2d22fc587b941/src/main/resources/amidst/icon/profileicons"

# List of files we know are there (from your previous copy-paste)
FILES = [
    "Bedrock.png", "Bookshelf.png", "Brick.png", "Cake.png", 
    "Carved_Pumpkin.png", "Chest.png", "Clay.png", "Coal_Block.png",
    "Coal_Ore.png", "Cobblestone.png", "Crafting_Table.png", "Creeper_Head.png",
    "Diamond_Block.png", "Diamond_Ore.png", "Dirt.png", "Dirt_Podzol.png",
    "Dirt_Snow.png", "Emerald_Block.png", "Emerald_Ore.png", "Enchanting_Table.png",
    "End_Stone.png", "Farmland.png", "Furnace.png", "Furnace_On.png",
    "Glass.png", "Glazed_Terracotta_Light_Blue.png", "Glazed_Terracotta_Orange.png",
    "Glazed_Terracotta_White.png", "Glowstone.png", "Gold_Block.png", "Gold_Ore.png",
    "Grass.png", "Gravel.png", "Hardened_Clay.png", "Ice_Packed.png",
    "Iron_Block.png", "Iron_Ore.png", "Lapis_Ore.png", "Leaves_Birch.png",
    "Leaves_Jungle.png", "Leaves_Oak.png", "Leaves_Spruce.png", "Lectern_Book.png",
    "Log_Acacia.png", "Log_Birch.png", "Log_DarkOak.png", "Log_Jungle.png",
    "Log_Oak.png", "Log_Spruce.png", "Mycelium.png", "Nether_Brick.png",
    "Netherrack.png", "Obsidian.png", "Planks_Acacia.png", "Planks_Birch.png",
    "Planks_DarkOak.png", "Planks_Jungle.png", "Planks_Oak.png", "Planks_Spruce.png",
    "Quartz_Ore.png", "Red_Sand.png", "Red_Sandstone.png", "Redstone_Block.png",
    "Redstone_Ore.png", "Sand.png", "Sandstone.png", "Skeleton_Skull.png",
    "Snow.png", "Soul_Sand.png", "Stone.png", "Stone_Andesite.png",
    "Stone_Diorite.png", "Stone_Granite.png", "TNT.png", "Water.png", "Wool.png"
]

print(f"Opening {len(FILES)} tabs in your browser...")
print("Press Enter to start opening them (5 at a time)...")
input()

chunk_size = 5
for i in range(0, len(FILES), chunk_size):
    chunk = FILES[i:i + chunk_size]
    for filename in chunk:
        url = f"{BASE_URL}/{filename}"
        print(f"Opening {filename}...")
        webbrowser.open(url)
    
    if i + chunk_size < len(FILES):
        print("\nPress Enter to open the next 5...")
        input()
        
print("Done!")
