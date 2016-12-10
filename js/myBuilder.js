//Total Locations
var locations = [
    {title: 'kailash giri', location: {lat: 17.7492, lng: 83.3422}},
    {title: 'simhachalam', location: {lat: 17.7665, lng: 83.2506}},
    {title: 'Indira Gandhi zoological park', location: {lat: 17.7686, lng: 83.3445}},
    {title: 'visakha museum', location: {lat: 17.7206, lng: 83.3342}},
    {title: 'sivaji park', location: {lat: 17.7374, lng: 83.3312}},
    {title: 'rushikonda beach', location: {lat: 17.7820, lng: 83.3853}},
    {title: 'ramakrishna beach', location: {lat: 17.7115, lng: 83.3195}},
    {title: 'hotel daspalla', location: {lat: 17.7106556, lng: 83.3004312}},
    {title: 'Vizag steel', location: {lat: 17.6333889, lng: 83.1706543}}
];
//Array to hold current locations
var myObservableArray = [];
//map variable
var map;
//map marker
var marker;
//markers array
var markers = [];
//info window to show the details of clicked location
var largeInfowindow;
//map bounds
var bounds;
//string for filtering
var filterTitle;
//wikipedia links for the clicked location
var chosenLocation;
//var wikiLinks = {url: 'dummy.com'};
var wikiLink = function(title_, URL_) {
    this.title = title_;
    this.url = URL_;
};
var wikiLinksArray = [];
var wikiLinksArrayKO = [];

//to hide the map markers
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
//initialize the map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 17.6868, lng: 83.2185},
        zoom: 13
    });
    addMarkers();
}
//to add the map markers
function addMarkers() {
    hideListings();
    markers = [];
    bounds = new google.maps.LatLngBounds();
    largeInfowindow = new google.maps.InfoWindow();
    for (i = 0; i < myObservableArray().length; i++) {
        marker = new google.maps.Marker({
            map: map,
            position: myObservableArray()[i].location,
            title: myObservableArray()[i].title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
//Knockout main function
var viewModal = function () {
    self = this;
    //Adding all locations to the ko array and ordered list
    myObservableArray = ko.observableArray(locations);
    wikiLinksArrayKO = ko.observableArray([]);
    //self.wikiLinks = ko.observableArray([]);
    filterTitle = ko.observable();
    self.populatePlaceTitles = function () {
        myObservableArray([]);
        for (var k = 0; k < locations.length; k++) {
            var n = locations[k].title.search(filterTitle());
            if (n >= 0) {
                myObservableArray.push(locations[k]);
            }
        }
        addMarkers();
    };

    self.showInfoWindow = function (chosenLoc) {
        chosenLocation = chosenLoc;
        marker = new google.maps.Marker({
            map: map,
            position: chosenLocation.location,
            title: chosenLocation.title,
            animation: google.maps.Animation.HIGHLIGHT
        });
        populateInfoWindow(marker, largeInfowindow);
        //to show the related wikipedia links(as third party API)
        //var wikiLinksReturned = 
        //showWikiLinks(chosenLocation.title);
        self.wikiLinks = ko.observableArray([]);
        self.bool1 = ko.computed(function () {
            if (!(chosenLocation === undefined)) {
                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + chosenLocation.title + '&format=json&callback=wikicallback';
                var wikiRequestTimeout = setTimeout(function () {
                    alert("failed to get the wikipedia resources");
                    //$wikiElem.text("failed to get the wikipedia resources");
                }, 80000);
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    success: function (response) {
                        wikiLinksArray = [];
                        var articleList = response[1];
                        for (var i = 0; i < articleList.length; i++) {
                            articleStr = articleList[i];
                            var urlLocation = 'http://en.wikipedia.org/wiki/' + articleStr;
                            var newWikiLink = new wikiLink(articleStr, urlLocation);
                            wikiLinksArray.push(newWikiLink);
                        }
                        wikiLinksArrayKO([]);
                        wikiLinksArrayKO(wikiLinksArray);
                        clearTimeout(wikiRequestTimeout);
                    }
                });
                return false;
            }
        }, this);
    };
    //for opening wikilink    
    self.openURL = function (chosenLoc) {
        window.open(chosenLoc.url, '_blank');
    };
};
//applying main ko function
ko.applyBindings(new viewModal());
//populating info window based on marker
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
    }
}