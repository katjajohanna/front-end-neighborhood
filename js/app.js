var map;

var markers = [
    {
        "id": "marker1",
        "position": {lat: 41.894894, lng: 12.471262},
        "title": "This is where I lived, nice apartment",
        "search_word": "Piazza Farnese"
    },
    {
        "id": "marker2",
        "position": {lat: 41.895754, lng: 12.482556},
        "title": "Piazza Venezia, amazing palace",
        "search_word": "Piazza Venezia"
    },
    {
        "id": "marker3",
        "position": {lat: 41.898560, lng: 12.476902},
        "title": "Pantheon, a church",
        "search_word": "Pantheon"
    },
    {
        "id": "marker4",
        "position": {lat: 41.890206, lng: 12.492244},
        "title": "Colosseum, fighting arena",
        "search_word": "Colosseum"
    },
    {
        "id": "marker5",
        "position": {lat: 41.890621, lng: 12.477717},
        "title": "Island in the middle of the river Tiber",
        "search_word": "Isola Tiberina"
    },
];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.8946146, lng: 12.4823304},
        zoom: 15
    });

    markers.forEach(function(marker_data) {
        var newMarker = new google.maps.Marker({
            position: marker_data.position,
            map: map,
            title: marker_data.title,
            animation: google.maps.Animation.DROP,
        });

        var infowindow = new google.maps.InfoWindow({
            content: "<div id=" + marker_data.id + "></div>"
        });


        newMarker.addListener('click', function() {
            toggleBounce(newMarker);
        });
        newMarker.addListener('click', function() {
            infowindow.open(map, newMarker);
        });
        newMarker.addListener('click', function() {
            getWikipediaInfo(marker_data.id, marker_data.search_word);
        });

    });
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
       marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function getWikipediaInfo(element_id, search_word) {
    var wikiElem = $("#" + element_id);
    var wikipediaUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+search_word+"&format=json";

    var wikiRequestTimeout = setTimeout(function() {
        wikiElem.text("Failed to get Wikipedia links");
    }, 4000);

    $.ajax({
        url: wikipediaUrl,
        dataType: "jsonp",
        success: function(data) {
            for (var i = 0; i < data[2].length; i++) {
                var url = data[3][i];
                var text = data[2][i];

                wikiElem.append('<li><a href="'+url+'">'+text+'</a></li>');
            }

            clearTimeout(wikiRequestTimeout);
        }
    });
}

var Marker = function(data) {
    this.position = ko.observable(data.position);
    this.title = ko.observable(data.title);
    this.shouldShow = ko.observable(true);
};

var ViewModel = function() {
    var selfie = this;

    this.markerList = ko.observableArray([]);

    markers.forEach(function(marker_data) {
        selfie.markerList.push(new Marker(marker_data));
    });

    this.bounce = function() {
        toggleBounce(selfie); //todo: not working, "selfie" is not Google marker
    }

    this.doFiltering = function() {
        this.shouldShow = ko.observable(false); //todo: this is not working either
    }
};

ko.applyBindings(new ViewModel());