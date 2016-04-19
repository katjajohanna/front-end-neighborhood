var map;

var markers = [
    {
        "id": "marker1",
        "position": {lat: 41.894894, lng: 12.471262},
        "title": "This is where I lived, nice apartment",
        "search_word": "Piazza Farnese",
        "googleMarker": null,
        "infoWindow": null
    },
    {
        "id": "marker2",
        "position": {lat: 41.895754, lng: 12.482556},
        "title": "Piazza Venezia, amazing palace",
        "search_word": "Piazza Venezia",
        "googleMarker": null,
        "infoWindow": null
    },
    {
        "id": "marker3",
        "position": {lat: 41.898560, lng: 12.476902},
        "title": "Pantheon, a church",
        "search_word": "Pantheon",
        "googleMarker": null,
        "infoWindow": null
    },
    {
        "id": "marker4",
        "position": {lat: 41.890206, lng: 12.492244},
        "title": "Colosseum, fighting arena",
        "search_word": "Colosseum",
        "googleMarker": null,
        "infoWindow": null
    },
    {
        "id": "marker5",
        "position": {lat: 41.890621, lng: 12.477717},
        "title": "Island in the middle of the river Tiber",
        "search_word": "Isola Tiberina",
        "googleMarker": null,
        "infoWindow": null
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

        marker_data.googleMarker = newMarker;
        marker_data.infoWindow = new google.maps.InfoWindow({
            content: "<div id=" + marker_data.id + "></div>"
        });

        newMarker.addListener('click', function() {
            toggleBounce(newMarker);
            openInfo(marker_data);
        });

    });

    ko.applyBindings(new ViewModel());
}

function openInfo(marker)
{
    marker.infoWindow.open(map, marker.googleMarker);

    getWikipediaInfo(marker.id, marker.search_word);
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
        dataType: "jsonp"
    }).done(function(data) {
        var textAppended = false;

        for (var i = 0; i < data[2].length; i++) {
            var url = data[3][i];
            var text = data[2][i];

            if (text.length > 0) {
                //See target=_blank security problem at https://mathiasbynens.github.io/rel-noopener/
                //Thus, rel=noopener
                wikiElem.append('<li><a href="'+url+'" target="_blank" rel="noopener">'+text+'</a></li>');
                textAppended = true;
            }
        }

        if (!textAppended) {
            wikiElem.append("Error fetching data from Wikipedia");
        } else {
            wikiElem.append("Data provided by Wikipedia");
        }

        clearTimeout(wikiRequestTimeout);
    });
}

var Marker = function(data) {
    this.data = data;
    this.id = ko.observable(data.id);
    this.position = ko.observable(data.position);
    this.title = ko.observable(data.title);
    this.search_word = ko.observable(data.search_word);
    this.googleMarker = data.googleMarker;
    this.infoWindow = data.infoWindow;
    this.shouldShow = ko.observable(true);
};

var ViewModel = function() {
    var selfie = this;

    this.markerList = ko.observableArray([]);

    markers.forEach(function(marker_data) {
        selfie.markerList.push(new Marker(marker_data));
    });

    this.animateMarker = function() {
        toggleBounce(this.googleMarker);
        //openInfo(this.googleMarker, this.id(), this.search_word());
        openInfo(this.data);
    };

    this.doFiltering = function() {
        var search = $("#filter_value").val();

        selfie.markerList().forEach(function(marker) {
            var markerSearchWord = marker.search_word().toLowerCase();
            var userSearchWord = search.toLowerCase();

            if (markerSearchWord.indexOf(userSearchWord) > -1 || search == "") {
                marker.shouldShow(true);
                marker.googleMarker.setMap(map);
            } else {
                marker.shouldShow(false);
                marker.googleMarker.setMap(null);
            }
        });
    };
};