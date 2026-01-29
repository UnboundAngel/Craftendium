import os
import requests
import re

# Target directory
TARGET_DIR = os.path.join("images", "structures")
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# The exact URL you provided
GITHUB_PAGE_URL = "https://github.com/toolbox4minecraft/amidst/tree/d146cb47bf94b8697a899f4336c2d22fc587b941/src/main/resources/amidst/icon/profileicons"
RAW_BASE_URL = "https://raw.githubusercontent.com/toolbox4minecraft/amidst/d146cb47bf94b8697a899f4336c2d22fc587b941/src/main/resources/amidst/icon/profileicons"

# Mapping Amidst profile icons to our structure names
# We'll download ALL of them, but also rename key ones for our app
MAPPING = {
    "Village.png": "village.png",
    "Desert_Pyramid.png": "desert_pyramid.png", # If it exists
    "Jungle_Pyramid.png": "jungle_temple.png",
    "Witch_Hut.png": "swamp_hut.png",
    "Igloo.png": "igloo.png",
    "Monument.png": "ocean_monument.png",
    "Mansion.png": "mansion.png",
    "Pillager_Outpost.png": "outpost.png",
    "Shipwreck.png": "shipwreck.png",
    "Fortress.png": "fortress.png",
    "Bastion.png": "bastion.png",
    "End_City.png": "end_city.png",
    "Ruined_Portal.png": "ruined_portal.png",
    "Chest.png": "buried_treasure.png", # Best fit
    "Bedrock.png": "bedrock.png"
}

def get_file_list():
    print(f"Fetching file list from {GITHUB_PAGE_URL}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(GITHUB_PAGE_URL, headers=headers)
        if r.status_code != 200:
            print(f"Failed to access page: {r.status_code}")
            return []
        
        # Regex to find .png files linked in the file list
        # GitHub file links in the file list usually look like: title="Filename.png"
        filenames = re.findall(r'title="([^"]+\.png)"', r.text)
        filenames = list(set(filenames))
        print(f"Found {len(filenames)} files.")
        return filenames
    except Exception as e:
        print(f"Error: {e}")
        return []

def download_file(filename):
    url = f"{RAW_BASE_URL}/{filename}"
    try:
        r = requests.get(url, stream=True)
        if r.status_code == 200:
            # Save original
            with open(os.path.join(TARGET_DIR, filename), 'wb') as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            
            # If mapped, copy to mapped name
            if filename in MAPPING:
                mapped_name = MAPPING[filename]
                with open(os.path.join(TARGET_DIR, mapped_name), 'wb') as f:
                    # Write to mapped file
                    pass 
                # Actually, simpler to just write it again
                with open(os.path.join(TARGET_DIR, mapped_name), 'wb') as f:
                    r.raw.decode_content = True
                    # Reset stream? No, easier to just re-request or write bytes
                    # Let's just write the bytes we already have? 
                    # Actually, requests stream is consumed. 
                    pass
            
            # Re-read to copy
            with open(os.path.join(TARGET_DIR, filename), 'rb') as f_src:
                content = f_src.read()
                if filename in MAPPING:
                    with open(os.path.join(TARGET_DIR, MAPPING[filename]), 'wb') as f_dst:
                        f_dst.write(content)
                        print(f"  -> Also saved as {MAPPING[filename]}")
            
            print(f"✓ Downloaded {filename}")
            return True
        else:
            print(f"✗ Failed {filename}: {r.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
    return False

def main():
    files = get_file_list()
    for f in files:
        download_file(f)

if __name__ == "__main__":
    main()
