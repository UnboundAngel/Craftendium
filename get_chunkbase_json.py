import requests
import re

def get_json_urls():
    url = "https://www.chunkbase.com/apps/seed-map"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    
    # Find all .json files
    json_files = re.findall(r'href="([^"]+\.json)"', r.text)
    json_files += re.findall(r'src="([^"]+\.json)"', r.text)
    
    print("JSON Files found:")
    for f in json_files:
        print(f)

if __name__ == "__main__":
    get_json_urls()
