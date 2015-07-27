var map;
var geocoder;
var mapLocation;
var bounds = new google.maps.LatLngBounds();

function initialize(lat,lng) {
	$("#splash").fadeOut();
	$("#app").css({
  		display: "inline"
	});
	mapLocation = new google.maps.LatLng(lat,lng);
	var mapOptions = {
	    center: mapLocation,
	   	zoom: 12,
	   	zoomControlOptions: {
	        position: google.maps.ControlPosition.LEFT_BOTTOM
	    },
	    panControlOptions: {
	        position: google.maps.ControlPosition.LEFT_BOTTOM
	    }
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	requestMapMarkers(lat,lng);
}

/* This function offets the map based on the height of the infoWindow
 *  http://stackoverflow.com/questions/3473367/how-to-offset-the-center-of-a-google-maps-api-v3-in-pixels
 */

google.maps.Map.prototype.setCenterWithOffset= function(latlng, offsetX, offsetY) {
    var map = this;
    var ov = new google.maps.OverlayView();
    ov.onAdd = function() {
        var proj = this.getProjection();
        var aPoint = proj.fromLatLngToContainerPixel(latlng);
        aPoint.x = aPoint.x+offsetX;
        aPoint.y = aPoint.y+offsetY;
        map.panTo(proj.fromContainerPixelToLatLng(aPoint));
    }; 
    ov.draw = function() {}; 
    ov.setMap(this); 
};

function requestMapMarkers(lat,lng) {
	$.ajax({
        type: "GET",
        url: 'php/request.php?lat=' + lat + '&lng=' + lng,
        success: function(data){
        	dataObject = JSON.parse(data);
        	console.log(dataObject);
        	if (dataObject.hasOwnProperty('error')) {
        		//backup to google places search
        		var request = {
				    location: mapLocation,
				    radius: '20000',
				    types: ['amusement_park','church','zoo','stadium','park','museum','campground','hindu_temple']
				};
				var service = new google.maps.places.PlacesService(map);
				service.nearbySearch(request, callback);

				function callback(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
				    	console.log(results);
				    	var numberOfLocations = results.length;
	           			var i;
				    	for (i = 0; i < numberOfLocations; i++) {
			           		vm.mapLocations.push( new googlePlacesLocation(results[i]));
			           	}
			           	vm.mapLocations.sort(function(left, right) { 
			           		return left.title() == right.title() ? 0 : (left.title() < right.title() ? -1 : 1) 
			           	});
			           	createMapMarkers();
					} else {
						alert("Oops!  Looks like we couldn't find any photo walking areas in this location.\nTry a different location or get our there and explore for yourself!");
					}
				} 
        	} else {
	           	var numberOfLocations = dataObject.businesses.length;
	           	var i;
	           	for (i = 0; i < numberOfLocations; i++) {
	           		vm.mapLocations.push( new googleMapLocation(dataObject.businesses[i]));
	           	}
	           	vm.mapLocations.sort(function(left, right) { 
			        return left.title() == right.title() ? 0 : (left.title() < right.title() ? -1 : 1) 
			    });
	           	createMapMarkers();
	       	}
        }
    });
}

// Location Template
var googleMapLocation = function(data) {
	this.title = ko.observable(data.name),
	this.location = data.location,
	this.address = ko.observable(),
	this.photos = ko.observableArray(),
	this.marker = ko.observable(),
	this.review = ko.observable(data.snippet_text),
	this.stars = ko.observable(data.rating_img_url),
	this.reviewCount = ko.observable(data.review_count),
	this.yelpLink = ko.observable(data.url),
	this.category = ko.observable(data.categories[0][1]);
	this._destroy = ko.observable(false)
}

// Location Template Backup for Google Places
var googlePlacesLocation = function(data) {
	this.title = ko.observable(data.name),
	this.latitude = data.geometry.location.A,
	this.longitude = data.geometry.location.F,
	this.address = ko.observable(data.vicinity),
	this.photos = ko.observableArray(),
	this.marker = ko.observable(),
	this.review = ko.observable(),
	this.stars = ko.observable(),
	this.reviewCount = ko.observable(),
	this.yelpLink = ko.observable(),
	this._destroy = ko.observable(false)
}

function createMapMarkers() {
	var i;
	var numberOfLocations = vm.mapLocations().length;
	var currentMarker;
	var markerIcon = {
		url: "",
		// This marker is 20 pixels wide by 32 pixels tall.
		size: new google.maps.Size(35, 41),
		// The origin for this image is 0,0.
		origin: new google.maps.Point(0,0),
		// The anchor for this image is the base of the flagpole at 0,32.
		anchor: new google.maps.Point(17.5, 41)
	};
	var shape = {
      	coords: [10, 1, 25, 1, 34, 12, 34, 24, 19, 40, 15, 40, 1, 24, 1, 11, 10, 1],
      	type: 'poly'
  	};
	for (i = 0; i < numberOfLocations; i++) {
		currentMarker = vm.mapLocations()[i];
		// Do inside function so it sets scope on currentMarker variable
		setTheMarker(currentMarker,fitMapToBounds);
		
		function setTheMarker(currentMapMarker) {
			if (currentMapMarker.category() === "beaches") {
				markerIcon.url = "img/icons/beach.png";
			} else if (currentMapMarker.category() === "hiking") {
				markerIcon.url = "img/icons/hiking.png";
			} else if (currentMapMarker.category() === "lakes") {
				markerIcon.url = "img/icons/lake.png";
			} else if (currentMapMarker.category() === "museums") {
				markerIcon.url = "img/icons/museum.png";
			} else if (currentMapMarker.category() === "resorts") {
				markerIcon.url = "img/icons/resort.png";
			}
			if (currentMapMarker.hasOwnProperty("latitude")) {
				currentMapMarker.coordinates = new google.maps.LatLng(currentMapMarker.latitude,currentMapMarker.longitude);
				var marker = new google.maps.Marker({
				    map: map,
				    animation: google.maps.Animation.DROP,
				    position: currentMapMarker.coordinates,
				    icon: markerIcon,
				    shape: shape
				});
				currentMapMarker.marker(marker);
				createEventListener(currentMapMarker);
				bounds.extend(currentMapMarker.coordinates);
			} else if (currentMapMarker.location.hasOwnProperty("coordinate")) {
				currentMapMarker.coordinates = new google.maps.LatLng(currentMapMarker.location.coordinate.latitude,currentMapMarker.location.coordinate.longitude);
				var marker = new google.maps.Marker({
				    map: map,
				    animation: google.maps.Animation.DROP,
				    position: currentMapMarker.coordinates,
				    icon: markerIcon,
				    shape: shape
				});
				currentMapMarker.marker(marker);
				createEventListener(currentMapMarker);
				bounds.extend(currentMapMarker.coordinates);
			} else {
				var request = {
				    location: mapLocation,
				    radius: '20000',
				    query: currentMapMarker.title()
				};
				var service = new google.maps.places.PlacesService(map);
				service.textSearch(request, googleCallback);

				function googleCallback(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
				    	currentMapMarker.coordinates = new google.maps.LatLng(results[0].geometry.location.A,results[0].geometry.location.F);
				    	var marker = new google.maps.Marker({
						    map: map,
						    animation: google.maps.Animation.DROP,
						    position: currentMapMarker.coordinates
						});
						currentMapMarker.marker(marker);
						createEventListener(currentMapMarker);
						bounds.extend(currentMapMarker.coordinates);
					}
				}
			}
			
		}
	}
	fitMapToBounds();
}

function fitMapToBounds() {
	map.fitBounds(bounds);
}

function createEventListener(currentMarker) {
	google.maps.event.addListener(currentMarker.marker(), 'click', function() {
		vm.openInfoWindow(currentMarker);
	});
}

function viewModel() {
	var self = this;

	self.mapLocations = ko.observableArray([]);

	self.locationSearch = ko.observable('');

	self.checkLocation = function() {
		self.mapLocations.removeAll();
		bounds = new google.maps.LatLngBounds();
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': self.locationSearch()}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {
	       		var latitude = results[0].geometry.location.A;
	       		var longtitude = results[0].geometry.location.F;
	       		initialize(latitude, longtitude);
	       		//console.log(results);
	      	} else {
	        	alert("Sorry!  We didn't recognize that location.  Please try again!");
	      	}
	    });
	};

	self.toggleList = function() {
		$('#list-view').animate({width: 'toggle'});
		if ($('.relative').css('left') === '260px') {
			$('.relative').animate({left: '0'});
		} else {
			$('.relative').animate({left: '260px'});
		}
	};

	self.showList = function() {
		if ($('#list-view').css('display') === 'none') {
			$('#list-view').animate({width: 'toggle'});
		}
		$('.relative').animate({left: '260px'});
	};

	self.hideList = function() {
		if ($('#list-view').css('display') !== 'none') {
			$('#list-view').animate({width: 'toggle'});
		}
		$('.relative').animate({left: '0'});
	};

	self.toggleBgHover = function(currentListItem) {
		document.getElementById(currentListItem).style.backgroundColor = "#f3f3f3";
	};

	self.toggleBgLeave = function(currentListItem) {
		document.getElementById(currentListItem).style.backgroundColor = "#fff";
	};

	self.searchTerm = ko.observable('');

	self.updateLocations = function() {
		// Close current infoWindow
		if (self.infoWindow() != '') {
			self.infoWindow().close();
		}

		self.mapLocations().forEach(function(entry) {
			//console.log(entry.title().indexOf(self.searchTerm()));
			if (entry.title().toLowerCase().indexOf(self.searchTerm().toLowerCase()) >= 0 ||
				self.searchTerm() == '') {
				entry._destroy(false);
				entry.marker().setVisible(true);
			} else {
				entry._destroy(true);
				entry.marker().setVisible(false);
			}
			
		});
	};

	var lat,
		lng,
		formattedInstaURL,
		instagramPhotoArray,
		numberOfInstagramPhotos;

	var instaID = '65450f0c27544afaa1a64a11b40d0611';
	self.currentMapMarker = ko.observable();
	self.infoWindow = ko.observable('');

	self.openInfoWindow = function(mapMarker) {
		self.hideList();
		self.currentMapMarker(mapMarker);
		if (self.infoWindow() != '') {
			self.infoWindow().close();
		}

		self.infoWindow(
			new google.maps.InfoWindow({
				content: $('#info-window-template').html(),
				maxWidth: 800,
				disableAutoPan: true
			}));
		self.infoWindow().open(map, self.currentMapMarker().marker());
		self.currentMapMarker().marker().setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			self.currentMapMarker().marker().setAnimation(google.maps.Animation.null);
		}, 2100);

		
		// Get address based on yelp coordinates and set to currentMapMarker's address
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'location': self.currentMapMarker().coordinates}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	        self.currentMapMarker().address(results[0].formatted_address);
	      } else {
	        alert("Geocode was not successful for the following reason: " + status);
	      }
	    });

	    lat = self.currentMapMarker().marker().position.A;
	    lng = self.currentMapMarker().marker().position.F;
	    formattedInstaURL = 'https://api.instagram.com/v1/media/search?lat=' + lat + '&lng=' + lng + '&distance=500&client_id=' + instaID;
	    //console.log(lat + ', ' + lng);
	    
	    // Timeout for Instagram JSONP request
	    var instagramTimeout = setTimeout(function(){
	        $(".instagram_error").css("display","inline");
	    }, 8000);

	    $.ajax({
			type: "GET",
			dataType: "jsonp",
			url: formattedInstaURL,
			success: function(data) {
				self.displayInstaPhotos(data.data);
				clearTimeout(instagramTimeout);
			}
		});

	    
	};

	self.displayInstaPhotos = function(photos) {
		self.currentMapMarker().photos([]);
		photos.sort(function(a, b) {
			return b.likes.count - a.likes.count;
		});
		instagramPhotoArray = photos.slice(0,8);

		numberOfInstagramPhotos = instagramPhotoArray.length;
		for (i = 0; i < numberOfInstagramPhotos; i++) {
			self.currentMapMarker().photos.push(instagramPhotoArray[i]);
		}

		self.infoWindow().setContent($('#info-window-template').html());

		var infoWindowHeight = $('#info-window-template').height();
		var screenWidth = window.innerWidth;
		var offsetHeight;
		if (screenWidth <= 400) {
			offsetHeight = 140;
		} else if (screenWidth > 400 && screenWidth < 650) {
			offsetHeight = 220;
		} else if (screenWidth > 650) {
			offsetHeight = 280;
		}
		map.setCenterWithOffset(self.currentMapMarker().coordinates, 0, (infoWindowHeight - offsetHeight) * -1);
	};
}

window.vm = new viewModel();
ko.applyBindings(vm);