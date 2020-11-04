
# Usage

Checkout the **video** for a quick example:
https://youtu.be/vbKlCVfm-9U

## Features:
All information are set in the browser local memory, nothing on server :)

When the website start, it fetch the local storage automaticaly.
If you want for some reason change the local information, just click on the red "Remove" button !

<img src="/Example%201.png" width="450">

If it's the first time, you juste have to click on the green "Add" button, and fill the informations:

<img src="/Example%202.png" width="350">

Your information are set, but you just want to change de location, it's easy, click on right input button, and the browser ask you to use location detection:

<img src="/Example%203.png" width="350">

Then, the input is set with your current location, but feel free to change if you need !

<img src="/Example%204.png" width="350">

Note: the delay button is used to reduce the time by 15 minutes, 30 minutes or nothing :)!

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


