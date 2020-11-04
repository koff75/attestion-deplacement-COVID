
# Usage

Checkout the **video** for a quick example:
https://youtu.be/vbKlCVfm-9U
![enter image description here](d)
## Step 1
Go to register on https://locationiq.com/ and get your **API KEY**
Then open ./static/app.js file and fill the first line : `const API_KEY = "YOUR_API_KEY";`
## Step 2
Execute npm install to install the **node_modules**
## Step 3
Because your need to be **https** to run the geolocalization, you have to generate your own certificates:

    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./server.key -out server.cert

## Step 4
Install pm2 by executing `npm -g i pm2` (or with favorite tool, brew, etc.)
Then your can start the program by 2 ways:
--> `node nico.js`
or
--> `pm2 start nico.js`
Big advantage for pm2 because it's on the background task, and your can monitor the logs by the command : `pm2 monit`
## Step 5
Open your browser: **`https://localhost:3000`**
Then if you want to allow the access from everywhere, register on https://www.noip.com/ and use the free tier service to set a custom url **"whatyouwant.ddns.net"**.
Then you can use port forwarding on your router (NAT) on this specific port 3000, from the authorize local IP.

ENJOY ! :)


