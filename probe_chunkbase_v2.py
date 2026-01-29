import requests

def probe():
    headers = {'User-Agent': 'Mozilla/5.0'}
    paths = [
        "/img/poi/village.png",
        "/img/poi/village.png?v=1",
        "/img/poi/village.png?v=2",
        "/apps/seed-map/i/poi/village.png",
        "/apps/seed-map/img/poi/village.png",
        "/img/icons/village.png",
        "/img/poi/village_plains.png"
    ]
    
    for p in paths:
        url = "https://www.chunkbase.com" + p
        try:
            r = requests.head(url, headers=headers, timeout=5)
            print(f"{r.status_code} - {url}")
        except:
            pass

if __name__ == "__main__":
    probe()
