/* *****************************************************************************
 *          INITIALIZATION OF LOCATIONS TO DISPLAYED ON THE MAP
 * *****************************************************************************
 */
//The locations to be displayed on the map, being mentioned in the rubric that
//there should be atleast 5 locations, I have placed a total of 9 locations
//of the prominent places in my neighborhood.
var locations = [
    {title: 'Kailash Giri', cat: "Outing", location: {lat: 17.7492, lng: 83.3422}},
    {title: 'Simhachalam', cat: "Pilgrim Center", location: {lat: 17.7665, lng: 83.2506}},
    {title: 'Indira Gandhi Zoological Park', cat: "Outing", location: {lat: 17.7686, lng: 83.3445}},
    {title: 'Visakha Museum', cat: "Heritage", location: {lat: 17.7206, lng: 83.3342}},
    {title: 'Sivaji Park', cat: "Park", location: {lat: 17.7374, lng: 83.3312}},
    {title: 'Rushikonda Beach', cat: "Sun n Sand", location: {lat: 17.7820, lng: 83.3853}},
    {title: 'Ramakrishna Beach', cat: "Sun n Sand", location: {lat: 17.7115, lng: 83.3195}},
    {title: 'Hotel Daspalla', cat: "Hotel", location: {lat: 17.7106556, lng: 83.3004312}},
    {title: 'Vizag Steel Plant', cat: "Industry", location: {lat: 17.6333889, lng: 83.1706543}}
];
var LocationLatLng = function (lat_, lng_) {
    this.lat = lat_;
    this.lng = lng_;
};
var Location = function (title_, cat_, locationLatLng_) {
    this.title = title_;
    this.cat = cat_;
    this.location = locationLatLng_;
};

/* *****************************************************************************
 *                  INITIALIZATION OF ALL THE VARIABLES
 * *****************************************************************************
 */
//This array holds current locations
var myObservableArray = [];
//map variable
var map;
//map marker
var marker;
//markers array
var markers = [];
//info window to show the details of clicked location
var largeInfowindow;
//to display the color of the icon
var defaultIcon;
//map bounds
var bounds;
//string for filtering
var filterTitle;
//wikipedia links for the clicked location
var chosenLocation;
//
var errorMessage;
//var wikiLinks = {url: 'dummy.com'};
var wikiLink = function (title_, URL_) {
    this.title = title_;
    this.url = URL_;
};
//for wikipedia links
var wikiLinksArray = [];
var wikiLinksArrayKO = [];
/* *****************************************************************************
 *                         ALL FUNCTIONS
 * *****************************************************************************
 */

//to hide the map markers, while filtering the locations on the input box
//displayed beside the map
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//initialize the map on the start of the page
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

//to add the map markers to the page
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
}
/* *****************************************************************************
 *                THE VIEW MODEL WITH KNOCKOUT FRAMEWORK
 * *****************************************************************************
 */
//Controlling the ViewModal with the help of Knockout framework, the salient
//feature of using the Knockout framework is addressed below.
var viewModal = function () {
    self = this;
    //Adding all locations to the ko array and ordered list
    myObservableArray = ko.observableArray(locations);
    wikiLinksArrayKO = ko.observableArray([]);
    filterTitle = ko.observable();
    yourAddressTitle = ko.observable();
    yourAddress = ko.observable();
    yourCategory = ko.observable();
    errorMessage = ko.observable('No Errors');
    self.populatePlaceTitles = function () {
        myObservableArray([]);
        for (var k = 0; k < locations.length; k++) {
            var n = locations[k].title.toLowerCase().search(filterTitle().toLowerCase());
            if (n >= 0) {
                myObservableArray.push(locations[k]);
            }
        }
        addMarkers();
    };

    self.showInfoWindow = function (chosenLoc) {
        chosenLocation = chosenLoc;
        setMarker(chosenLocation);
        populateInfoWindow('vm', marker, largeInfowindow);
        //to show the related wikipedia links(as third party API)
        self.wikiLinks = ko.observableArray([]);
        self.bool1 = getWikiLinks(chosenLocation);
    };
    //for opening wikilink    
    self.openURL = function (chosenLoc) {
        window.open(chosenLoc.url, '_blank');
    };
    //to move to specific DOM element 
    self.moveTo = function (domElement) {
        $('html, body').animate({scrollTop: $(domElement).offset().top}, "slow");
    };
    //
    self.addYourddress = function () {
        formLocation(yourAddress(), yourAddressTitle(), yourCategory());
    };

};
//applying main ko function
ko.applyBindings(new viewModal());
$('html, body').animate({scrollTop: $('.container').offset().top}, 'slow');

function populateInfoWindow(mvm, marker, infowindow) {
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
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
                infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
        if (mvm === 'm') {
            for (var a = 0; a < myObservableArray().length; a++) {
                var latDiff = Math.abs(marker.getPosition().lat() - myObservableArray()[a].location.lat);
                var lngDiff = Math.abs(marker.getPosition().lng() - myObservableArray()[a].location.lng);
                if ((latDiff < 0.000001) && (lngDiff < 0.000001)) {
                    getWikiLinks(myObservableArray()[a]);
                    break;
                }
            }
        }
    }

}


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

function getWikiLinks(chosenLocation) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + chosenLocation.title + '&format=json&callback=wikicallback';
    var wikiRequestTimeout = setTimeout(function () {
        errorMessage('Failed to get the Wikipedia resources in reasonable time period');
        $('html, body').animate({scrollTop: $('#idMsg').offset().top}, 'slow');
    }, 8000);
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function (response) {
            wikiLinksArray = [];
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var urlLocation = 'https://en.wikipedia.org/wiki/' + articleStr;
                var newWikiLink = new wikiLink(articleStr, urlLocation);
                wikiLinksArray.push(newWikiLink);
            }
            wikiLinksArrayKO([]);
            wikiLinksArrayKO(wikiLinksArray);
            clearTimeout(wikiRequestTimeout);
        },
        error: function (returnval) {
            errorMessage('Error while retrieving Wikilinks. Return Value: "' + returnval + '", Kindly mail this info to gvsrohita@gmail.com');
            $('html, body').animate({scrollTop: $('#idMsg').offset().top}, 'slow');
        }
    });
    return true;
}

function formLocation(address_, title_, category_) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address_}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            var locationLatLng = new LocationLatLng(latitude, longitude);
            var location = new Location(title_, category_, locationLatLng);
            myObservableArray.push(location);
            bounds.extend(locationLatLng);
            map.fitBounds(bounds);
            setMarker(location);
            populateInfoWindow('vm', marker, largeInfowindow);
        }
    });
}

function setMarker(location) {
    marker = new google.maps.Marker({
        map: map,
        position: location.location,
        title: location.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon
    });
    markers.push(marker);
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
        populateInfoWindow('m', this, largeInfowindow);
    });
}