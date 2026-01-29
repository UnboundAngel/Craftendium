import os
import requests

# Target directory
TARGET_DIR = os.path.join("images", "structures")
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# The base URL from the folder you found
BASE_URL = "https://raw.githubusercontent.com/toolbox4minecraft/amidst/master/src/main/resources/amidst/icon"

# These are the files confirmed from your list
BLOCK_ICONS = {
    "buried_treasure": "Chest.png",
    "stronghold": "Stone_Brick.png", # Most tools use stone bricks for strongholds
    "mineshaft": "Oak_Fence.png",    # Or Planks
    "end_city": "End_Stone.png",
    "fortress": "Nether_Brick.png",
    "bastion": "Gilded_Blackstone.png"
}

# These are the "Structure" icons usually found in this folder (properly capitalized)
STRUCTURE_ICONS = {
    "village": "Village.png",
    "outpost": "Pillager_Outpost.png",
    "mansion": "Mansion.png",
    "monument": "Monument.png",
    "desert_pyramid": "Desert_Pyramid.png",
    "jungle_temple": "Jungle_Pyramid.png",
    "swamp_hut": "Witch_Hut.png",
    "shipwreck": "Shipwreck.png",
    "ruined_portal": "Ruined_Portal.png",
    "igloo": "Igloo.png"
}

def download(local_name, remote_name):
    url = f"{BASE_URL}/{remote_name}"
    try:
        # We must use proper capitalization as shown in your GitHub list!
        r = requests.get(url, stream=True, timeout=5)
        if r.status_code == 200:
            with open(os.path.join(TARGET_DIR, f"{local_name}.png"), 'wb') as f:
                for chunk in r.iter_content(65536):
                    f.write(chunk)
            print(f"✓ Downloaded {local_name}.png ({remote_name})")
            return True
        else:
            # Try a lowercase fallback just in case
            r = requests.get(url.lower(), stream=True, timeout=5)
            if r.status_code == 200:
                with open(os.path.join(TARGET_DIR, f"{local_name}.png"), 'wb') as f:
                    for chunk in r.iter_content(65536):
                        f.write(chunk)
                print(f"✓ Downloaded {local_name}.png (lowercase fallback)")
                return True
    except:
        pass
    print(f"✗ Failed: {remote_name}")
    return False

def main():
    print("Downloading icons from Amidst resources...")
    # Merge both lists
    all_to_download = {**BLOCK_ICONS, **STRUCTURE_ICONS}
    for local, remote in all_to_download.items():
        download(local, remote)

if __name__ == "__main__":
    main()
