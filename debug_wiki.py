import requests

def test():
    url = "https://minecraft.wiki/w/File:Village_Map_Icon.png"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"Testing {url}...")
    r = requests.get(url, headers=headers)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Success! Page exists.")
        # Print a snippet to see if we can find the image
        print(r.text[:500])
    else:
        print("Failed.")

if __name__ == "__main__":
    test()
