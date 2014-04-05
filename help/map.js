var geocoder;
var map;


function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

    // Try HTML5 geolocation
    if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

            var infowindow = new google.maps.InfoWindow({
            map: map,
            position: pos
            });

            map.setCenter(pos);
          });
      } else {
    // Browser doesn't support Geolocation
    
        handleNoGeolocation(false);
      }
function handleNoGeolocation(errorFlag) {

      var options = {
        map: map,
        position: new google.maps.LatLng(geoplugin_latitude(), geoplugin_longitude())
      };

      var infowindow = new google.maps.InfoWindow(options);
      map.setCenter(options.position);
    }


    var markers = [
      { lat: -33.85, lng: 151.05, name: "marker 1" },
      { lat: -33.90, lng: 151.10, name: "marker 2" },
      { lat: -33.95, lng: 151.15, name: "marker 3" },
      { lat: -33.85, lng: 151.15, name: "marker 4" }
    ];

    // Create the markers ad infowindows.
    for (index in markers) addMarker(markers[index]);
    function addMarker(data) {
      // Create the marker
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.name
      });
    
      // Create the infowindow with two DIV placeholders
      // One for a text string, the other for the StreetView panorama.
      var content = document.createElement("DIV");
      var title = document.createElement("DIV");
      title.innerHTML = data.name;
      content.appendChild(title);
      var streetview = document.createElement("DIV");
      streetview.style.width = "200px";
      streetview.style.height = "200px";
      streetview.innerHTML = "<a href='google.com'><img src='http://upload.wikimedia.org/wikipedia/commons/4/41/Place_de_la_concorde.jpg' style='width:91px;margin-top:-14px;'></a>";
      content.appendChild(streetview);
      var infowindow = new google.maps.InfoWindow({
        content: content
      });

      // Open the infowindow on marker click
      google.maps.event.addListener(marker, "click", function() {
        infowindow.open(map, marker);
      });
    }

    // Zoom and center the map to fit the markers
    // This logic could be conbined with the marker creation.
    // Just keeping it separate for code clarity.
    var bounds = new google.maps.LatLngBounds();
    for (index in markers) {
      var data = markers[index];
      bounds.extend(new google.maps.LatLng(data.lat, data.lng));
    }
    map.fitBounds(bounds);
  

var input = /** @type {HTMLInputElement} */(document.getElementById('address'));
var input1 = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
var types = document.getElementById('type-selector');
map.controls[google.maps.ControlPosition.TOP_LEFT].push(input1);
map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

var autocomplete = new google.maps.places.Autocomplete(input);
var autocomplete = new google.maps.places.Autocomplete(input1);


autocomplete.bindTo('bounds', map);

var infowindow = new google.maps.InfoWindow();
var marker1 = new google.maps.Marker({
     map: map
      });

google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker1.setVisible(false);
    input.className = '';
    var place = autocomplete.getPlace();
    
    if (!place.geometry) {
      // Inform the user that the place was not found and return.
      input.className = 'notfound';
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.

    }
    marker1.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    marker1.setPosition(place.geometry.location);
    marker1.setVisible(true);


    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div style="z-index:111;"><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker1);
  });

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    google.maps.event.addDomListener(radioButton, 'click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);
}


function codeAddress() {
    var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var lat = (results[0].geometry.location).lat();
        var longi = (results[0].geometry.location).lng();
        document.getElementById('lati').value = lat;
         document.getElementById('longi').value = longi;
         document.getElementById("close").disabled = false;
      } 
    });
  }


google.maps.event.addDomListener(window, 'load', initialize);