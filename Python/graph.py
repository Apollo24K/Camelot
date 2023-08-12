import sys
import matplotlib.pyplot as plt
import requests
import base64
import json

data = json.loads(sys.stdin.read())

x = [int(k) for k in data.keys()]
y = [v for v in data.values()]

plt.bar(x, y)
plt.xlabel('response time')
plt.ylabel('frequency')
plt.title(f'Normalized Response Time Distribution ({sys.argv[1]})')

# Save the plot as an image file
plt.savefig('response_time_plot.png')

# API tokens
tokens = ["ddecd222cd3fc3150f6404c0cc85a4e5", "f4f213791cdfb57e8c35a1b1a67edbfd", "89ce34cab24ea806cf774e5b270648fe", "29c12f5e482ecbf9eaa30e86763d11a2", "fdbfcc9e09cee0c5b47d78eaf2da5530"]
rot = 0

# Upload to imgBB
with open("response_time_plot.png", "rb") as file:
    url = "https://api.imgbb.com/1/upload"
    payload = {
        "key": tokens[rot % 5],
        "image": base64.b64encode(file.read()),
        "name": "graph"
    }
    res = requests.post(url, payload)

# Print the image URL
print(res.json().get("data").get("url"))

sys.stdout.flush()