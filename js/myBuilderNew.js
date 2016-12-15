/* This file is the main and only Javascript file, which performs all the
 * functions of model and viewmodel for this project*/

//************************** Map related declarations **************************
//
//map variable
var map;
//map bounds
var bounds;
//map marker
var marker;
//array of map markers
var markers = [];
//The default icon for the marker
var defaultIcon;
//info window to show the details of clicked location
var largeInfowindow;
//*********************Location related declarations ***************************
//
//A sinble object containing latitude and longitude of a location
//Arguments:
//lat_ - latitude
//lng_ - longitude
var LocationLatLng = function (lat_, lng_) {
    this.lat = lat_;
    this.lng = lng_;
};
//A single object location
//Arguments:
//title_ - title of the place
//cat_ - category of the place
//locationLatLng_ - object of LocationLatLng
/************************************added idKey*******************************/
var Location = function (keyId_, title_, cat_, locationLatLng_) {
    this.keyId = keyId_;
    this.title = title_;
    this.cat = cat_;
    this.location = locationLatLng_;
};
//chosen location for showing wikipedia links
var chosenLocation;
//The locations to be displayed on the map. It is an array of objects. It is 
//mentioned in the rubric that there should be atleast 5 locations. I have 
//identified a total of 9 locations of varying interests of my neighborhood
//as can be seen here.
/********************added keyId for the markers*******************************/
var locations = [
    {keyId: 0, title: 'Kailash Giri', cat: 'Outing', location: {lat: 17.7492, lng: 83.3422}},
    {keyId: 1, title: 'Simhachalam', cat: 'Pilgrim Center', location: {lat: 17.7665, lng: 83.2506}},
    {keyId: 2, title: 'Indira Gandhi Zoological Park', cat: 'Outing', location: {lat: 17.7686, lng: 83.3445}},
    {keyId: 3, title: 'Visakha Museum', cat: 'Heritage', location: {lat: 17.7206, lng: 83.3342}},
    {keyId: 4, title: 'Sivaji Park', cat: 'Park', location: {lat: 17.7374, lng: 83.3312}},
    {keyId: 5, title: 'Rushikonda Beach', cat: 'Sun n Sand', location: {lat: 17.7820, lng: 83.3853}},
    {keyId: 6, title: 'MFC Restaurant', cat: 'Hotel', location: {lat: 17.7115, lng: 83.3195}},
    {keyId: 7, title: 'Hotel Daspalla', cat: 'Hotel', location: {lat: 17.7106556, lng: 83.3004312}},
    {keyId: 8, title: 'Vizag Steel Plant', cat: 'Industry', location: {lat: 17.6333889, lng: 83.1706543}}
];

var helpLines = [
    {helpline: 'What you see here is a map of my home town Visakhapatnam and the prominent places in and around it in the shape of markers'},
    {helpline: 'You can filter the places based on the part of name-string of the locations in the input box with the tag Filter places based on the name of location'},
    {helpline: 'By clicking on any of the list items filtered or any of the many markers that you see on the map, you can get information about that particular place, and also its Streetview, provided it is facilitated by Google'},
    {helpline: 'You can also get extra information about the place, you clicked, by further clicking on the Relavant Wikipedia links that get populated, provided they are available in wikipedia, in the box provided with the heading Wikipedia Links for the Chosen Location'},
    {helpline: 'You can visit my Map on any handy device available near you, be it Desktop/Laptop, iPad or Mobile'},
    {helpline: 'The fun part in this app is described below in detail'},
    {helpline: 'The Fun Part:'},
    {helpline: 'Enter the Address, Name and Category (Drop down Box) of your location in the three boxes visible at the bottom (If they are not visible on the screen, then either scroll down or click The Fun part!Click here to add your locations button)'},
    {helpline: 'Then Click the button to see your location added on my map'},
    {helpline: 'To start, enter Taj Mahal, Agra, India in Address, Taj Mahal in Name, Heritage in Category and then click the Button to add the geographical-marker for the symbol of the epitome of the most important emotion ever assembled by God, that is Love! . In addition, you can know a lot about it through innumerable wikipedia links that this website opens'},
    {helpline: 'Isn\'t it fun?!'}
];

//Array to hold the locations. To be bound in viewmodal
var myObservableArray = [];
//************************ Other declarations **********************************
//
//string for filtering the locations. To be bound in viewmodal
var filterTitle;
//for displaying the error message
var errorMessage;
//**********************Wikipedia related declarations *************************
//
//For the Wikipedia title and url
var WikiLink = function (title_, URL_) {
    this.title = title_;
    this.url = URL_;
};
//for wikipedia links
var wikiLinksArray = [];
//for wikipedia links to be bound in viewmodal
var wikiLinksArrayKO = [];
//**************************** Map Related Functions ***************************
//
//initialize the map at the start of the page
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 17.6868, lng: 83.2185},
        zoom: 13
    });
    //display the marker as a default icon while the map is initialized
    defaultIcon = makeMarkerIcon('0091ff');
    addMarkers();
}

//Making markerIcon
//Argument:
//markerColor - string of chosen color
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
    return markerImage;
}

//to create all map markers and extending the bounds of the map based on the
//identified locations
function addMarkers() {
    hideListings();
    markers = [];
    bounds = new google.maps.LatLngBounds();
    largeInfowindow = new google.maps.InfoWindow();
    for (i = 0; i < myObservableArray().length; i++) {
        setMarker(myObservableArray()[i]);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
    google.maps.event.addDomListener(window, 'resize', function () {
        map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    });
}

//to hide all the existing map markers. It is called before a totally new set of
//markers need to be displayed on the map.
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//To set the marker of the location
//Argument:
//location - the location object
function setMarker(location) {
    marker = new google.maps.Marker({
        map: map,
        position: location.location,
        title: location.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
    });
    //extending array of markers
    markers.push(marker);
    //event listeners for mouseover, mouseout and mouseclick
    marker.addListener('mouseover', function () {
        var highlightedIcon = makeMarkerIcon('FFFFFF');
        this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function () {
        this.setIcon(defaultIcon);
    });
    marker.addListener('click', function () {
        var clickedIcon = makeMarkerIcon('FFFF24');
        this.setIcon(clickedIcon);
        populateInfoWindow(this, largeInfowindow);
    });
}

//To populate information window
//Function arguments:
//marker - map marker
//infowindow - information window object
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then 
        // get a panorama from that and set the options
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                infowindow.setContent('<div class="marker-title">' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div class="marker-title">' + marker.title + '</div>' +
                        '<div class="marker-msg"><em>No Street View Found</em></div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
        var bool1 = getWikiLinks(marker.title);
    }

}

//************************ Knockout function for ViewModal *********************
//
//Controlling the ViewModal with the help of Knockout framework.
//Note: The code quality issue as suggested in first review comments addressed
var ViewModal = function () {
    self = this;
    //Initializing all the KO Variables (The ones that are bound to DOM
    //Elements)
    filterTitle = ko.observable();
    yourAddressTitle = ko.observable();
    yourAddress = ko.observable();
    yourCategory = ko.observable();
    errorMessage = ko.observable('');
    //Initializing all the KO Observable Arrays. (The ones that are bound 
    //to DOM Lists.
    myObservableArray = ko.observableArray([]);
    wikiLinksArrayKO = ko.observableArray([]);
    helpLinesKO = ko.observableArray(helpLines);
    for (var i = 0; i < locations.length; i++) {
        myObservableArray.push(locations[i]);
    }

    //KO Function for applying filtering of map locations 
    self.populatePlaceTitles = function () {
        myObservableArray([]);
        for (var k = 0; k < locations.length; k++) {
            var n = locations[k].title.toLowerCase().search(filterTitle().toLowerCase());
            if (n >= 0) {
                myObservableArray.push(locations[k]);
                //Note: Following REQUIRED issue raised in first review addressed ******
                //
                /*Filter function should show / hide markers instead of re-creating them.*/
                markers[k].setVisible(true);
            } else {
                markers[k].setVisible(false);
            }
        }
    };
    //KO Function for showing information window of the chosen location
    //Argument:
    //chosenLoc - chosenLocation object
    self.showInfoWindow = function (chosenLoc) {
        chosenLocation = chosenLoc;
        //Note: Following REQUIRED issue raised in first review addressed ******
        //
        /* Clicking on a location list is creating new marker - it shouldn't do so.         
         * App should look for the clicked location's associated marker to activate 
         * it instead of creating a new one.
         */
        marker = markers[chosenLoc.keyId];
        //Note: Following REQUIRED issue raised in first review addressed ******
        /*
         * The App Functionality rubric requires map markers to animate when it 
         * is clicked or when associated location in the list is clicked 
         * (eg. bouncing, changing colour) to indicate its active state. 
         * This hasn't been implemented. Please add this feature.
         */
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 2000);
        populateInfoWindow(marker, largeInfowindow);
    };
    //to move to specific DOM element
    //Argument:
    //domElement - DOM Element (It can be either id or class name or even tag)
    self.moveTo = function (domElement) {
        goToDomLocation(domElement, 'slow');
    };
    //to add your location to my map
    self.addYourddress = function () {
        formLocation(yourAddress(), yourAddressTitle(), yourCategory());
    };
};
//************************ Wikilinks related Functions *************************
//
//To get Wikipedia links (Third party API - A rubric requirement also)
//Argument:
//title_: String of the name of the location
function getWikiLinks(title_) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + title_ + '&format=json&callback=wikicallback';
    //8 seconds of timeout period given for populating wikilinks
    var wikiRequestTimeout = setTimeout(function () {
        composeErrorMsg('Failed to get the Wikipedia resources in reasonable time period');
    }, 8000);
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function (response) {
            wikiLinksArray = [];
            wikiLinksArrayKO([]);
            var articleList = response[1];
            //Note: The Sanity Check as suggested in first review comments addressed
            if (articleList.length === 0) {
                composeErrorMsg('No wikipedia links available for the chosen location');
            } else {
                composeErrorMsg('');
                goToDomLocation('.container', 'slow');
                for (var i = 0; i < articleList.length; i++) {
                    if (articleList[i] === '') {
                        composeErrorMsg('Wikipedia data is not available');
                    } else {
                        articleStr = articleList[i];
                        var urlLocation = 'https://en.wikipedia.org/wiki/' + articleStr;
                        var newWikiLink = new WikiLink(articleStr, urlLocation);
                        wikiLinksArray.push(newWikiLink);
                    }
                }
                wikiLinksArrayKO(wikiLinksArray);
                showDiv('#idDivWiki');
            }
            clearTimeout(wikiRequestTimeout);
        },
        //Graceful exit when encounters error with relevant message
        error: function (e, ts, et) {
            var err = 'ready state: ' + e.readyState + ', status: ' + e.status + ', status text: ' + e.statusText;
            //I would like to analyze the cause of error. That's why I am inviting users to send me a mail with the error return code
            composeErrorMsg('Error while retrieving Wikilinks. Return Value: e-"' + err + '", ts-"' + ts + '", et-"' + et + '"; Kindly mail this info to gvsrohita@gmail.com');
        }
    });
    return true;
}

//****************************The Fun part!*************************************
//
//Adding your location to my map
//Arguments:
//address_ - A string representing the address of the location
//title_ - A string representing the title of the location
//category_ - A string represening the category of the location
function formLocation(address_, title_, category_) {
    if ((address_ === undefined) || (title_ === undefined) || (category_ === undefined)) {
        composeErrorMsg('Enter Address, Name & Category, and then click the button');
    } else {
        //Using Google API to get the location latitude & longitude
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address_}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                errorMessage('');
                var keyId_ = locations.length;
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                var locationLatLng = new LocationLatLng(latitude, longitude);
                var location = new Location(keyId_, title_, category_, locationLatLng);
                //Pushing the location thus formed into the locations arrays
                locations.push(location);
                myObservableArray.push(location);
                //Extending map bounds
                bounds.extend(locationLatLng);
                map.fitBounds(bounds);
                //setting marker for the new location
                setMarker(location);
                //scroll to the map
                goToDomLocation('.container', 'slow');
                //populating info window of the newly added location
                populateInfoWindow(marker, largeInfowindow);
                //getting wikilinks for the newly formed location
                var bool1 = getWikiLinks(title_);
            } else {
                //composing error message when Google is not able to return the location details
                composeErrorMsg('Sorry, Google does not recognize this address. Try another one. Better Luck, next time!');
            }
        });
    }
}

//************************** Other miscellaneous functions *********************
//
//To display an error message to avoid inconvenience to users
function composeErrorMsg(errMsg_) {
    errorMessage(errMsg_);
    if (!(errorMessage() === '')) {
        goToDomLocation('#idMsg', 'slow');
    }
}

//To scroll to the identified DOM Element
function goToDomLocation(domLocation_, speed_) {
    $('html, body').animate({scrollTop: $(domLocation_).offset().top}, speed_);
}

//Note: The following REQUIRED issue raised in First review addressed 
//
/*The Asynchronous Data Usage also requires map to be also provided 
 * with a fallback error handling method*/
function googleErrorHandling() {
    composeErrorMsg('Error while loading Google maps, please check your Internet connection or mail the issue to me (gvsrohita@gmail.com)');
}

//********************** Function call at the beginning ************************
//
//applying the bindings using KO based viewmodal
/*************changed the name from viewModal to ViewModal, 13-12-16***********/
ko.applyBindings(new ViewModal());
/**********************************end 13-12-16********************************/

//To enforce a delay of about 3 seconds to scroll to page top. The delay is 
//necessitated for Google api takes some time to populate all the elements.
window.setTimeout(goToDomLocation('.container', 'slow'), 3000);
//14-12-16

var imgHelp = document.getElementById('idHelpIcon');
imgHelp.addEventListener('click', function () {
    toggleDiv('#idDivHelp', 400);
});

var imgWiki = document.getElementById('idWikiIcon');
imgWiki.addEventListener('click', function () {
    hideDiv('#idDivWiki');
});

function moveLeft(divId, width) {
    $(divId).animate({left: width}, 3000);
}

function moveRight(divId, width) {
    $(divId).animate({right: width}, 3000);
}

function toggleDiv(divId) {
    $(divId).animate({
        width: 'toggle'
    }, 3000);
}

function hideDiv(divId) {
    $(divId).removeClass('display-none');
    $(divId).removeClass('display-block');
    $(divId).addClass('display-none');
}

function showDiv(divId) {
    $(divId).removeClass('display-none');
    $(divId).removeClass('display-block');
    $(divId).addClass('display-block');
}


