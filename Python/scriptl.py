import sys
from PIL import Image
import requests
import base64

im = Image.open("w7.png")
im2 = Image.open("ice.png")
im.paste(im2, box=None, mask=im2)
im.save("w6.png")
with open("w6.png", "rb") as file:
    payload = {
        "key": "f4f213791cdfb57e8c35a1b1a67edbfd",
        "image": base64.b64encode(file.read()),
        "name": "c"
    }
    res = requests.post("https://api.imgbb.com/1/upload", payload)

print(res.json().get("data").get("url"))

sys.stdout.flush()