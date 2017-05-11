var app = angular.module('RoutingMap', ['nemLogging', 'ui-leaflet']);

app.controller('RoutingCtrl', RoutingCtrlFunc);

RoutingCtrlFunc.$inject = ['$scope', 'leafletData'];
function RoutingCtrlFunc($scope, leafletData) {
    $scope.markers = [];
    $scope.selectedMarker = {};

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 8
        },
        defaults: {
            tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            maxZoom: 14
        },
        events: {
            map: {
                enable: ['click'],
                logic: 'emit'
            }
        }
    });

    leafletData.getMap('first').then(function(map) {
        L.GeoIP.centerMapOnPosition(map, 15);
    });

    $scope.$on("leafletDirectiveMap.first.click", function(event, args){
        var leafEvent = args.leafletEvent;

        $scope.markers.push({
            lat: leafEvent.latlng.lat,
            lng: leafEvent.latlng.lng,
            message: $scope.markers.length ? 'Point #' + ($scope.markers.length + 1): 'Point #' + 1
        });
    });

    $scope.$on('leafletDirectiveMarker.first.click', function(event, args){
        $scope.selectedMarker = $scope.markers.find(function(marker) {
            return marker.lat === args.model.lat && marker.lng === args.model.lng;
        });
    });

    L.GeoIP = L.extend({

        getPosition: function (ip) {
            var url = "http://freegeoip.net/json/";
            var result = L.latLng(0, 0);

            if (ip !== undefined) {
                url = url + ip;
            } else {
                //lookup our own ip address
            }

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.onload = function () {
                var status = xhr.status;
                if (status == 200) {
                    var geoip_response = JSON.parse(xhr.responseText);
                    result.lat = geoip_response.latitude;
                    result.lng = geoip_response.longitude;
                } else {
                    console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + xhr.status);
                }
            };
            xhr.send();
            return result;
        },

        centerMapOnPosition: function (map, zoom, ip) {
            var position = L.GeoIP.getPosition(ip);
            map.setView(position, zoom);
        }
    });


}