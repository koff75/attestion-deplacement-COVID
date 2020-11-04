const API_KEY = "";

let userInfo = {
    timeDelay: 0,
    address_manual: "",
    geolocation: false,
};
let user = {
    firstname: "",
    lastname: "",
    birthday: "",
    placeofbirth: "",
    address: "",
    city: "",
    zipcode: "",
};


/* Get the information from the local storage */
(function () {
    var data = localStorage.getItem("userCOVID");
    // User data found, manage the button status
    if (data != null) {
        console.log("LocalStorage found!");
        const userObj = JSON.parse(data);
        console.log(userObj);
        document.getElementById('btn_addMe').innerHTML = userObj.firstname;
        document.getElementById("btn_addMe").disabled = true;
        document.getElementById("btn_removeMe").disabled = false;
        document.getElementById("generate_btn").disabled = false;

        // Send localStorage to the backend
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/userLocalStorage", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(userObj));

    } else {
        console.log("LocalStorage not found!");
    }
})();

/* Green button to show the popup window */
function btn_addMe_fct() {
    $('.ui.modal')
        .modal('show');
}
/* Delete the user storage */
function btn_removeMe_fct() {
    localStorage.clear();
    console.log("LocalStorage cleared");
    document.getElementById('btn_addMe').innerHTML = "Add me"
    document.getElementById("btn_addMe").disabled = false;
    document.getElementById("generate_btn").disabled = true;
    document.getElementById("btn_removeMe").disabled = true;

}
/* Green button clicked on the window modal popup */
function UserDone_btn_fct() {
    user.firstname = document.getElementById("firstname").value;
    user.lastname = document.getElementById("lastname").value;
    user.birthday = document.getElementById("birthday").value;
    user.placeofbirth = document.getElementById("placeofbirth").value;
    user.address = document.getElementById("address").value;
    user.city = document.getElementById("city").value;
    user.zipcode = document.getElementById("zipcode").value;
    // Set the user to the local storage
    localStorage.setItem("userCOVID", JSON.stringify(user));
    console.log("Saved into localStorage");
    // Disable the button
    console.log(user.firstname);
    document.getElementById('btn_addMe').innerHTML = user.firstname;
    document.getElementById("btn_addMe").disabled = true;
    document.getElementById("generate_btn").disabled = false;
    document.getElementById("btn_removeMe").disabled = false;

    // Send info to backend
    // Send localStorage to the backend
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/userLocalStorage", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(user));

}

/* Get information from the user */
document.getElementById('btn_now').addEventListener('click', function () {
    userInfo.timeDelay = 0;
});
document.getElementById('btn_15').addEventListener('click', function () {
    userInfo.timeDelay = 15;
});
document.getElementById('btn_30').addEventListener('click', function () {
    userInfo.timeDelay = 30;
});

/* Function called when the Generate PDF button is clicked */
function generate_btn_fct() {
    var x = document.getElementById("btn_now").value;
    console.log(userInfo.timeDelay);
    console.log(userInfo.address_manual);

    userInfo.address_manual = document.getElementById("autocomplete").value;
    // We wait 1sec to be sure that the download is completed
    setTimeout(waitForDownload, 1000);
    // Then we can show up the download button
    function waitForDownload() {
        document.getElementById('result').style.display = "block";
    };

    // Send user info to the backend
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/userInfo", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(userInfo));

}

/* Geolocation methods */
(function () {
    console.log('APP.JS');
    var locatorSection = document.getElementById("locator-input-section")
    var input = document.getElementById("autocomplete");


    function init() {
        console.log('INIT');
        var locatorButton = document.getElementById("locator-button");
        locatorButton.addEventListener("click", locatorButtonPressed)

    }

    function locatorButtonPressed() {
        console.log('locatorButtonPressed');
        locatorSection.classList.add("loading");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    console.log("navigator géoloc OK");
                    getUserAddressBy(position.coords.latitude, position.coords.longitude)
                },
                function (error) {
                    locatorSection.classList.remove("loading")
                    alert("The Locator was denied :( Please add your address manually")
                })
        } else {
            // x.innerHTML="Geolocation is not supported by this browser.";
            console.log("Erreur geoloc");
        }
    }


    function getUserAddressBy(lat, long) {
        console.log(`Coord: lat=>${lat} long=>${long}`);

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var address = JSON.parse(this.responseText)
                console.log(address);
                setAddress(address)
            }
        };
        xhttp.open("GET", "https://eu1.locationiq.com/v1/reverse.php?key=" + API_KEY + "&lat=" + lat + "&lon=" + long + "&accept-language=fr&format=json", true);
        xhttp.send();
    }

    /* Set the JSON response to the input field and also send the object to the backend */
    function setAddress(address) {
        input.value = address.display_name
        userInfo.address_manual = address.display_name
        userInfo.geolocation = true
        locatorSection.classList.remove("loading")
        // Send to backend
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/address", true);
        // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.setRequestHeader("Content-type", "application/json");
        // var sendString = JSON.stringify(address);
        xhttp.send(JSON.stringify(address));
    }

    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(45.4215296, -75.6971931),
    );

    var options = {
        bounds: defaultBounds
    };
    var autocomplete = new google.maps.places.Autocomplete(input, options);

    init()

})();