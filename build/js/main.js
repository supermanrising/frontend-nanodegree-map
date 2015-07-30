function initialize(e,o){$("#splash").fadeOut(),$("#app").css({display:"inline"}),mapLocation=new google.maps.LatLng(e,o);var t={center:mapLocation,zoom:12,zoomControlOptions:{position:google.maps.ControlPosition.LEFT_BOTTOM},panControlOptions:{position:google.maps.ControlPosition.LEFT_BOTTOM}};map=new google.maps.Map(document.getElementById("map-canvas"),t),requestMapMarkers(e,o)}function requestMapMarkers(e,o){$.ajax({type:"GET",url:"php/request.php?lat="+e+"&lng="+o,success:function(e){if(dataObject=JSON.parse(e),dataObject.hasOwnProperty("error")){var o={location:mapLocation,radius:"20000",types:["amusement_park","church","zoo","stadium","park","museum","campground","hindu_temple"]},t=new google.maps.places.PlacesService(map);t.nearbySearch(o,a);var a=function(e,o){if(o==google.maps.places.PlacesServiceStatus.OK){var t,a=e.length;for(t=0;a>t;t++)vm.mapLocations.push(new googlePlacesLocation(e[t]));vm.mapLocations.sort(function(e,o){return e.title()==o.title()?0:e.title()<o.title()?-1:1}),createMapMarkers()}}}else{var n,i=dataObject.businesses.length;for(n=0;i>n;n++)vm.mapLocations.push(new googleMapLocation(dataObject.businesses[n]));vm.mapLocations.sort(function(e,o){return e.title()==o.title()?0:e.title()<o.title()?-1:1}),createMapMarkers()}}})}function createMapMarkers(){function e(e){a={value:e.title(),data:e},vm.searchLocations.push(a);var o;if("beaches"===e.category()?i.url="img/icons/beach.png":"hiking"===e.category()?i.url="img/icons/hiking.png":"lakes"===e.category()?i.url="img/icons/lake.png":"museums"===e.category()?i.url="img/icons/museum.png":"resorts"===e.category()?i.url="img/icons/resort.png":null===e.category()?(i.url="img/icons/standard.png",i.size=new google.maps.Size(22,40),i.origin=new google.maps.Point(0,0),i.anchor=new google.maps.Point(11,40),r={coords:[10,40,10,35,8,29,0,15,0,7,6,0,16,0,22,6,22,16,15,27,12,36,12,40,10,40],type:"poly"}):i.url="img/icons/default.png",e.hasOwnProperty("latitude"))e.coordinates=new google.maps.LatLng(e.latitude,e.longitude),o=new google.maps.Marker({map:map,animation:google.maps.Animation.DROP,position:e.coordinates,icon:i,shape:r}),e.marker(o),createEventListener(e),bounds.extend(e.coordinates);else if(e.location.hasOwnProperty("coordinate"))e.coordinates=new google.maps.LatLng(e.location.coordinate.latitude,e.location.coordinate.longitude),o=new google.maps.Marker({map:map,animation:google.maps.Animation.DROP,position:e.coordinates,icon:i,shape:r}),e.marker(o),createEventListener(e),bounds.extend(e.coordinates);else{var t={location:mapLocation,radius:"20000",query:e.title()},n=new google.maps.places.PlacesService(map);n.textSearch(t,s);var s=function(t,a){if(a==google.maps.places.PlacesServiceStatus.OK){var n=[];for(var s in t[0].geometry.location)t[0].geometry.location.hasOwnProperty(s)&&n.push(t[0].geometry.location[s]);e.coordinates=new google.maps.LatLng(n[0],n[1]),o=new google.maps.Marker({map:map,animation:google.maps.Animation.DROP,position:e.coordinates,icon:i,shape:r}),e.marker(o),createEventListener(e),bounds.extend(e.coordinates)}}}}var o,t,a,n=vm.mapLocations().length,i={url:"",size:new google.maps.Size(35,41),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(17.5,41)},r={coords:[10,1,25,1,34,12,34,24,19,40,15,40,1,24,1,11,10,1],type:"poly"};for(o=0;n>o;o++)t=vm.mapLocations()[o],e(t);fitMapToBounds(),$("#autocomplete").autocomplete({lookup:vm.searchLocations,onSelect:function(e){vm.openInfoWindow(e.data)},onHint:function(e){vm.autocompleteHint(e)}})}function fitMapToBounds(){map.fitBounds(bounds)}function createEventListener(e){google.maps.event.addListener(e.marker(),"click",function(){vm.openInfoWindow(e)})}function viewModel(){var e=this;e.searchLocations=[],e.autocompleteHint=ko.observable(""),e.mapLocations=ko.observableArray([]),e.locationSearch=ko.observable(""),e.checkLocation=function(){e.mapLocations.removeAll(),e.searchLocations.length=0,bounds=new google.maps.LatLngBounds,geocoder=new google.maps.Geocoder,geocoder.geocode({address:e.locationSearch()},function(e,o){if(o==google.maps.GeocoderStatus.OK){var t=[];for(var a in e[0].geometry.location)e[0].geometry.location.hasOwnProperty(a)&&t.push(e[0].geometry.location[a]);initialize(t[0],t[1])}})},e.toggleList=function(){$("#list-view").animate({width:"toggle"}),$(".relative").animate("260px"===$(".relative").css("left")?{left:"0"}:{left:"260px"})},e.showList=function(){"none"===$("#list-view").css("display")&&$("#list-view").animate({width:"toggle"}),$(".relative").animate({left:"260px"})},e.hideList=function(){"none"!==$("#list-view").css("display")&&$("#list-view").animate({width:"toggle"}),$(".relative").animate({left:"0"})},e.toggleBgHover=function(e){document.getElementById(e).style.backgroundColor="#f3f3f3"},e.toggleBgLeave=function(e){document.getElementById(e).style.backgroundColor="#fff"},e.searchTerm=ko.observable(""),e.updateLocations=function(){""!==e.infoWindow()&&e.infoWindow().close(),e.mapLocations().forEach(function(o){o.title().toLowerCase().indexOf(e.searchTerm().toLowerCase())>=0||o.category().indexOf(e.searchTerm().toLowerCase())>=0||""===e.searchTerm()?(o._destroy(!1),o.marker().setVisible(!0)):(o._destroy(!0),o.marker().setVisible(!1))})};var o,t,a,n,r,s="65450f0c27544afaa1a64a11b40d0611";e.currentMapMarker=ko.observable(),e.infoWindow=ko.observable(""),e.openInfoWindow=function(n){e.hideList(),e.currentMapMarker(n),""!==e.infoWindow()&&e.infoWindow().close(),e.infoWindow(new google.maps.InfoWindow({content:$("#info-window-template").html(),maxWidth:800,disableAutoPan:!0})),e.infoWindow().open(map,e.currentMapMarker().marker()),e.currentMapMarker().marker().setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){e.currentMapMarker().marker().setAnimation(google.maps.Animation["null"])},2100),geocoder=new google.maps.Geocoder,geocoder.geocode({location:e.currentMapMarker().coordinates},function(o,t){e.currentMapMarker().address(t==google.maps.GeocoderStatus.OK?o[0].formatted_address:"unknown address")}),o=e.currentMapMarker().marker().position.G,t=e.currentMapMarker().marker().position.K,a="https://api.instagram.com/v1/media/search?lat="+o+"&lng="+t+"&distance=500&client_id="+s;var i=setTimeout(function(){$(".instagram_error").css("display","inline")},8e3);$.ajax({type:"GET",dataType:"jsonp",url:a,success:function(o){e.displayInstaPhotos(o.data),clearTimeout(i)}})},e.displayInstaPhotos=function(o){for(photoSwipeItems.length=0,e.currentMapMarker().photos([]),o.sort(function(e,o){return o.likes.count-e.likes.count}),n=o.slice(0,8),r=n.length,i=0;i<r;i++)e.currentMapMarker().photos.push(n[i]),photoSwipeItems.push(new galleryPhoto(n[i]));e.infoWindow().setContent($("#info-window-template").html());var t,a=$("#info-window-template").height(),s=window.innerWidth;t=400>=s?140:s>400&&650>s?220:280,map.setCenterWithOffset(e.currentMapMarker().coordinates,0,-1*(a-t))},e.openGallery=function(e){psOptions={index:parseInt($(e).attr("id")),bgOpacity:".7",shareEl:!1,getThumbBoundsFn:function(e){var o=document.querySelectorAll(".gallery-thumb")[e],t=window.pageYOffset||document.documentElement.scrollTop,a=o.getBoundingClientRect();return{x:a.left,y:a.top+t,w:a.width}},addCaptionHTMLFn:function(e,o,t){return e.title?(o.children[0].innerHTML=e.title+'<br><small>Photographer: <a href="http://instagram.com/'+e.username+'" target="_blank" class="caption-link">'+e.username+"</a></small>",!0):(o.children[0].innerHTML="",!1)}};var o=new PhotoSwipe(pswpElement,PhotoSwipeUI_Default,photoSwipeItems,psOptions);o.init()}}var map,geocoder,mapLocation,bounds=new google.maps.LatLngBounds,photoSwipeItems=[],pswpElement=document.querySelectorAll(".pswp")[0],psOptions;google.maps.Map.prototype.setCenterWithOffset=function(e,o,t){var a=this,n=new google.maps.OverlayView;n.onAdd=function(){var n=this.getProjection(),i=n.fromLatLngToContainerPixel(e);i.x=i.x+o,i.y=i.y+t,a.panTo(n.fromContainerPixelToLatLng(i))},n.draw=function(){},n.setMap(this)};var googleMapLocation=function(e){this.title=ko.observable(e.name),this.location=e.location,this.address=ko.observable(),this.photos=ko.observableArray(),this.marker=ko.observable(),this.review=ko.observable(e.snippet_text),this.stars=ko.observable(e.rating_img_url),this.reviewCount=ko.observable(e.review_count),this.yelpLink=ko.observable(e.url),this.category=ko.observable(e.categories[0][1]),this._destroy=ko.observable(!1)},googlePlacesLocation=function(e){this.title=ko.observable(e.name),this.locCoors=[];for(var o in e.geometry.location)e.geometry.location.hasOwnProperty(o)&&this.locCoors.push(e.geometry.location[o]);this.latitude=this.locCoors[0],this.longitude=this.locCoors[1],this.address=ko.observable(e.vicinity),this.photos=ko.observableArray(),this.marker=ko.observable(),this.review=ko.observable(),this.stars=ko.observable(),this.reviewCount=ko.observable(),this.yelpLink=ko.observable(),this.category=ko.observable(null),this._destroy=ko.observable(!1)},galleryPhoto=function(e){this.src=e.images.standard_resolution.url,this.w=e.images.standard_resolution.width,this.h=e.images.standard_resolution.height,null!==e.caption&&(this.title=e.caption.text),this.username=e.user.username};window.vm=new viewModel,ko.applyBindings(vm);