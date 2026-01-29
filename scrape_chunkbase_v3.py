import requests
import re

def scrape_images():
    url = "https://www.chunkbase.com/apps/seed-map"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    
    # Broad regex for any image-like URL
    pattern = r'https?://[^\s"\'<>]+(?:\.png|\.svg|\.jpg|\.webp|gif)'
    urls = re.findall(pattern, r.text)
    
    # Also look for relative paths
    rel_pattern = r'["\'](/[^"\']+(?:\.png|\.svg|\.jpg|\.webp|gif))["\']'
    rel_urls = re.findall(rel_pattern, r.text)
    
    print("Unique Image URLs found:")
    for u in sorted(list(set(urls + rel_urls))):
        if "village" in u or "poi" in u or "outpost" in u or "mansion" in u:
            print(f"MATCH: {u}")
        else:
            # print(u)
            pass

if __name__ == "__main__":
    scrape_images()

