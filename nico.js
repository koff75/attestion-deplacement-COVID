'use strict';
const express = require('express');
const app = express();
const https = require('https');
const puppeteer = require('puppeteer');
const moment = require('moment');
var bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

moment.locale('fr')
let hour_delay = 0;
let PDF_File = "";
let user = {
    firstname: "",
    lastname: "",
    birthday: "",
    placeofbirth: "",
    address: "",
    city: "",
    zipcode: ""
}

/* Recursively remove all file into the pdf dir */
function deletePDF() {
    const directory = './pdf/';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
};

/* Optional : list all files if needed */
const listDirectory = () => {
    // joining path of directory 
    const directoryPath = path.join(__dirname, './');
    // passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        // handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        // listing all files using forEach
        files.forEach(function (file) {
            console.log(file);
        });
    });

}

/* Emulate Chromium to fill informations and download the official attestation */
async function browser_emulator() {
    deletePDF();

    const heure = moment().subtract(hour_delay, 'minutes').format('HH:mm');
    let date = moment().format("YYYY-MM-DD");
    PDF_File = `attestation-${moment().format("YYYY-MM-DD")}_${moment().format('HH-mm')}.pdf`
    // Format modification because of the browser input beside
    date = moment().format("DD/MM/YYYY");
    console.log(date);


    const browser = await puppeteer.launch();
    const page = await browser.newPage()

    await page.goto('https://media.interieur.gouv.fr/deplacement-covid-19/')

    await page.setViewport({
        width: 1440,
        height: 798
    })
    
    await page.type('.wrapper > #form-profile #field-firstname', user.firstname)

    await page.type('.wrapper > #form-profile #field-lastname', user.lastname)

    await page.type('.wrapper > #form-profile #field-birthday', user.birthday)

    await page.type('.wrapper > #form-profile #field-placeofbirth', user.placeofbirth)

    await page.type('.wrapper > #form-profile #field-address', user.address)

    await page.type('.wrapper > #form-profile #field-city', user.city)

    await page.type('.wrapper > #form-profile #field-zipcode', user.zipcode)

    await page.type('.wrapper > #form-profile #field-datesortie', date)

    await page.type('.wrapper > #form-profile #field-heuresortie', heure)

    await page.waitForSelector('.wrapper > #form-profile > #reason-fieldset #checkbox-sport_animaux')
    await page.click('.wrapper > #form-profile > #reason-fieldset #checkbox-sport_animaux')

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './pdf/'
    });

    //   await page.waitForSelector('body #generate-btn')
    //   await page.click('body #generate-btn')

    //   await page.waitForSelector('body > a')
    //   await page.click('body > a')



    await page.click('#generate-btn')
    await page.waitFor(5000);

    await browser.close()

    // listDirectory();
};


// ------------- EXPRESS SERVER -----------------
// Create an Express server on localhost and listening on port 3000
https.createServer({
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.cert')
    }, app)
    .listen(3000, function () {
        console.log('Listening on port 3000! Go to https://localhost:3000/')
    })



app.use(require('morgan')('dev'));
app.use('./static', express.static('public'));
app.use(express.static('static'));


app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
    res.render(__dirname + '/index.html');
});

app.get('/file', function (req, res) {
    res.download(__dirname + `/pdf/${PDF_File}`, PDF_File);
});

app.get('/broken', function (req, res) {
    var options = {
        method: 'GET',
        host: 'localhost',
        port: port,
        path: '/file'
    };

    var request = http.request(options, function (response) {
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', function () {
            console.log('requested content length: ', response.headers['content-length']);
            console.log('parsed content length: ', data.length);
            res.send(data);
        });
    });

    request.end();
});

/* GET THE GEOLOCATION ADDRESS FROM THE API */
/* Get the actual position in the city (obj with full address) */
app.use(bodyParser.json()); // Process application/json

app.post('/address', function (req, res) {
    //now req.body will be populated with the object you sent
    console.log(req.body.address);
    // If to check the diff: 11 rue des Arts VS Marché rue des Arts
    if (req.body.address.house_number === undefined) {
        constant.user.address = req.body.address.house_number + " " + req.body.address.road;
    } else {
        constant.user.address = req.body.address.house_number + " " + req.body.address.address29;
    }
    constant.user.zipcode = req.body.address.postcode;
    constant.user.city = req.body.address.city;
    console.log(`Ecrasement de l'adresse actuelle: ${constant.user.address}...`);
});
/* END */
/* GET THE USER TIME DELAY & START BROWSER EMULATOR */
app.use(bodyParser.json());
app.post('/userInfo', function (req, res) {
    console.log(JSON.stringify(req.body));
    console.log(req.body);
    if (req.body.geolocation === true) {
        // We're okay because it's already set by the previous method below
    } else {
        // We need to parse the address...sniff
    }
    // Set the delay
    hour_delay = req.body.timeDelay;
    // Okay, we have all data set, we can get the fill the input & generate the pdf

    console.log("Informations recap:");
    console.log(`User: ${JSON.stringify(user)}`);
    console.log(`Time delay: ${hour_delay}`);
    console.log(`GeoLoc: ${req.body.geolocation}`);

    browser_emulator();
});
/* END */
/* GET THE USER INFORMATIONS FROM LOCALSTORAGE */
app.post('/userLocalStorage', function (req, res) {
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.birthday = req.body.birthday;
    user.placeofbirth = req.body.placeofbirth;
    user.address = req.body.address;
    user.city = req.body.city;
    user.zipcode = req.body.zipcode;
    console.log("User information received from localStorage to backend");
});
app.get('/download', function (req, res) {
    var options = {
        method: 'GET',
        host: 'localhost',
        port: port,
        path: '/file'
    };

    var request = http.request(options, function (response) {
        var data = [];

        response.on('data', function (chunk) {
            data.push(chunk);
        });

        response.on('end', function () {
            data = Buffer.concat(data);
            console.log('requested content length: ', response.headers['content-length']);
            console.log('parsed content length: ', data.length);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=working-test.pdf',
                'Content-Length': data.length
            });
            res.end(data);
        });
    });

    request.end();
});