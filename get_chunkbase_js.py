import requests
import re

def get_js_urls():
    url = "https://www.chunkbase.com/apps/seed-map"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    
    # Find all .js files
    js_files = re.findall(r'src="([^"]+\.js)"', r.text)
    print("JS Files found:")
    for f in js_files:
        print(f)

if __name__ == "__main__":
    get_js_urls()
