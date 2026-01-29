import requests

def probe():
    base_urls = [
        "https://www.chunkbase.com/img/poi",
        "https://www.chunkbase.com/img/icons",
        "https://www.chunkbase.com/images/poi",
        "https://www.chunkbase.com/images/icons",
        "https://www.chunkbase.com/apps/seed-map/images",
        "https://www.chunkbase.com/lib/leaflet/images"
    ]
    
    test_files = ["village.png", "village.jpg", "marker-icon.png", "poi.png"]
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    print("Probing Chunkbase URLs...")
    
    for base in base_urls:
        for f in test_files:
            url = f"{base}/{f}"
            try:
                r = requests.head(url, headers=headers, timeout=2)
                if r.status_code == 200:
                    print(f"FOUND! {url}")
                else:
                    # print(f"  {r.status_code} - {url}")
                    pass
            except:
                pass

if __name__ == "__main__":
    probe()
