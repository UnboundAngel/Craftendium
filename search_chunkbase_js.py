import requests
import re

def search_js():
    base_url = "https://www.chunkbase.com"
    html_url = base_url + "/apps/seed-map"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    r = requests.get(html_url, headers=headers)
    js_paths = re.findall(r'src="(/_astro/[^"]+\.js)"', r.text)
    
    for path in js_paths:
        url = base_url + path
        print(f"Searching {url}...")
        js_text = requests.get(url, headers=headers).text
        
        # Look for image patterns
        matches = re.findall(r'/[^"]+\.png', js_text)
        for m in matches:
            if "village" in m or "poi" in m:
                print(f"  FOUND MATCH: {m}")
                
if __name__ == "__main__":
    search_js()
