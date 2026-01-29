import requests

def test_amidst():
    # Amidst usually puts images in src/main/resources
    paths = [
        "src/main/resources/images/village.png",
        "src/main/resources/images/icons/village.png",
        "src/main/resources/images/map/village.png"
    ]
    
    branches = ["master", "main"]
    
    print("Testing Amidst URL patterns...")
    
    for branch in branches:
        for p in paths:
            url = f"https://raw.githubusercontent.com/toolbox4minecraft/amidst/{branch}/{p}"
            try:
                r = requests.head(url, timeout=5)
                print(f"[{r.status_code}] {url}")
                if r.status_code == 200:
                    print(">>> SUCCESS!")
                    return
            except:
                pass

if __name__ == "__main__":
    test_amidst()
