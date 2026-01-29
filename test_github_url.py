import requests

def test_url_patterns():
    # The file we are looking for
    path = "icons/structures/village.png"
    
    patterns = [
        f"https://raw.githubusercontent.com/hube12/mc_icons/master/{path}",
        f"https://raw.githubusercontent.com/hube12/mc_icons/main/{path}",
        # Maybe it's directly in root?
        f"https://raw.githubusercontent.com/hube12/mc_icons/master/village.png",
        # Maybe capitalization?
        f"https://raw.githubusercontent.com/hube12/mc_icons/master/icons/structures/Village.png",
    ]

    print("Testing URL patterns for village.png...")
    
    for url in patterns:
        try:
            r = requests.head(url, timeout=5)
            print(f"[{r.status_code}] {url}")
            if r.status_code == 200:
                print(">>> SUCCESS! Using this pattern.")
                return url
        except Exception as e:
            print(f"[ERR] {url} : {e}")

    return None

if __name__ == "__main__":
    test_url_patterns()
