import os
import requests
import re

# Define the target directory
TARGET_DIR = os.path.join("images", "structures")

if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# Correct Amidst URL
REPO_URL = "https://github.com/toolbox4minecraft/amidst/tree/master/src/main/resources/amidst/icon"
RAW_BASE_URL = "https://raw.githubusercontent.com/toolbox4minecraft/amidst/master/src/main/resources/amidst/icon"

# Mapping: Local Name -> Keywords to look for in file list
# Amidst file naming seems to be like "village_plains_icon.png" or "temple_icon.png"
MATCH_RULES = {
    "village": ["village", "Village"],
    "desert_pyramid": ["desert_temple", "pyramid", "Desert"],
    "jungle_temple": ["jungle_temple", "Jungle"],
    "swamp_hut": ["witch_hut", "Swamp"],
    "igloo": ["igloo", "Igloo"],
    "ocean_monument": ["monument", "Monument"],
    "mansion": ["mansion", "Mansion"],
    "outpost": ["pillager_outpost", "Outpost"],
    "shipwreck": ["shipwreck", "Shipwreck"],
    "fortress": ["fortress", "Fortress"],
    "bastion": ["bastion", "Bastion"],
    "end_city": ["end_city", "EndCity"],
    "ruined_portal": ["portal", "Portal"],
    "ocean_ruin": ["ocean_ruin", "Ruin"],
    "buried_treasure": ["treasure", "Treasure"],
    "stronghold": ["stronghold", "Stronghold"],
    "mineshaft": ["mineshaft", "Mineshaft"]
}

def get_repo_filenames():
    print(f"Fetching file list from {REPO_URL}...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(REPO_URL, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"Failed to access repo: {response.status_code}")
            return []
        
        # Regex to find .png files in the href links
        # Looking for hrefs ending in .png inside the repo page
        filenames = re.findall(r'href="[^"]+/([^"].png)"', response.text)
        
        filenames = list(set(filenames))
        print(f"Found {len(filenames)} .png files.")
        # print(filenames) # Debug
        return filenames
    except Exception as e:
        print(f"Error fetching repo list: {e}")
        return []

def download_image(repo_filename, local_name):
    url = f"{RAW_BASE_URL}/{repo_filename}"
    try:
        response = requests.get(url, stream=True, timeout=5)
        if response.status_code == 200:
            filepath = os.path.join(TARGET_DIR, f"{local_name}.png")
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"✓ Downloaded {local_name}.png (found {repo_filename})")
            return True
        else:
            print(f"✗ Failed to download {repo_filename}: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    return False

def main():
    repo_files = get_repo_filenames()
    
    if not repo_files:
        print("Could not retrieve file list. Exiting.")
        return

    success_count = 0
    
    for local_name, keywords in MATCH_RULES.items():
        best_match = None
        
        # Prioritize exact matches containing "icon"
        for kw in keywords:
            # 1. Look for "{kw}_icon.png"
            for f in repo_files:
                if f.lower() == f"{kw}_icon.png" or f.lower() == f"icon_{kw}.png":
                    best_match = f
                    break
            if best_match: break
            
            # 2. Look for any file containing kw
            for f in repo_files:
                if kw.lower() in f.lower():
                    best_match = f
                    break
            if best_match: break
            
        if best_match:
            if download_image(best_match, local_name):
                success_count += 1
        else:
            print(f"⚠ No matching file found for '{local_name}'")

    print(f"\nFinished! Downloaded {success_count}/{len(MATCH_RULES)} icons.")

if __name__ == "__main__":
    main()
