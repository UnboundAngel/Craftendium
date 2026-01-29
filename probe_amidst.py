import requests

def probe_amidst_names():
    base = "https://raw.githubusercontent.com/toolbox4minecraft/amidst/master/src/main/resources/amidst/icon"
    
    candidates = [
        "village.png",
        "village_icon.png",
        "icon_village.png",
        "minecraft_village.png",
        "temple.png",
        "temple_icon.png",
        "jungle_temple.png"
    ]
    
    print("Probing Amidst naming convention...")
    for c in candidates:
        url = f"{base}/{c}"
        r = requests.head(url, timeout=3)
        if r.status_code == 200:
            print(f"FOUND: {c}")
        else:
            print(f"  {r.status_code} : {c}")

if __name__ == "__main__":
    probe_amidst_names()
