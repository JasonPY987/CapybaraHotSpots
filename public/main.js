$(document).ready(function () {
  fetchApiKey();
});

function fetchApiKey() {
  $.getJSON('/api-key', function (data) {
    const apiKey = data.apiKey;
    console.log("API Key:", apiKey); // Add this line to debug
    loadGoogleMapsApi(apiKey);
  }).fail(function (jqxhr, textStatus, error) {
    console.error("Error fetching API key:", textStatus, error);
  });
}

function loadGoogleMapsApi(apiKey) {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initializeMap&async=1`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initializeMap() {
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: 32.7157, lng: -117.1611 }, // Center map on San Diego
  });
  console.log("Map Initialized"); // Add this line to debug
  fetchTopSpots(map);
}

function fetchTopSpots(map) {
  $.getJSON("data.json", function (data) {
    console.log("Data Fetched:", data); // Add this line to debug
    const tableBody = $("#top-spots-table tbody");
    tableBody.find('.hidden').remove(); // Remove the placeholder row
    if (data && data.length > 0) {
      data.forEach((spot) => addSpotToTable(spot, map, tableBody));
      sortTableByDistance();
    } else {
      console.error("No data found");
    }
  }).fail(function (jqxhr, textStatus, error) {
    console.error("Error fetching data:", textStatus, error);
  });
}


function addSpotToTable(spot, map, tableBody) {
  const spotLatLng = new google.maps.LatLng(spot.location[0], spot.location[1]);
  const userLatLng = new google.maps.LatLng(32.7157, -117.1611); // San Diego's coordinates
  const distanceKm =
    google.maps.geometry.spherical.computeDistanceBetween(
      userLatLng,
      spotLatLng
    ) / 1000;
  const distanceMi = distanceKm / 1.609;
  const formattedDistance = `${distanceKm.toFixed(2)} km`;

  const row = $("<tr></tr>");
  row.append(`<td>${spot.name}</td>`);
  row.append(`<td>${spot.description}</td>`);
  row.append(
    `<td><a href='https://www.google.com/maps?q=${spot.location[0]},${spot.location[1]}' target='_blank'>Open in Google Maps</a></td>`
  );
  row.append(`<td data-km="${distanceKm.toFixed(2)}" data-mi="${distanceMi.toFixed(2)}">${formattedDistance}</td>`);
  tableBody.append(row);

  console.log("Row Added:", row); // Add this line to debug

  addMarker(spot, spotLatLng, map);
}

function addMarker(spot, spotLatLng, map) {
  const marker = new google.maps.Marker({
    position: spotLatLng,
    map: map,
    title: spot.name,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: spot.description,
  });

  marker.addListener("mouseover", () => infoWindow.open(map, marker));
  marker.addListener("mouseout", () => infoWindow.close());

  console.log("Marker Added:", marker); // Add this line to debug
}
function addMarker(spot, spotLatLng, map) {
  const marker = new google.maps.Marker({
    position: spotLatLng,
    map: map,
    title: spot.name,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: spot.description,
  });

  marker.addListener("mouseover", () => infoWindow.open(map, marker));
  marker.addListener("mouseout", () => infoWindow.close());
}

function sortTableByDistance() {
  var rows = $("#top-spots-table tbody tr").get();
  rows.sort(
    (a, b) =>
      parseFloat($(a).find("td:last").data(currentUnit)) -
      parseFloat($(b).find("td:last").data(currentUnit))
  );
  rows.forEach((row) => $("#top-spots-table tbody").append(row));
}

function toggleDistanceUnit() {
  const isKm = currentUnit === "km";
  $("#toggleDistance").text(isKm ? "Show in Miles" : "Show in Kilometers");
  $("#distance-header").text(isKm ? "Distance (mi)" : "Distance (km)");
  currentUnit = isKm ? "mi" : "km";
  $("#top-spots-table tbody tr").each(function () {
    const distanceCell = $(this).find("td").eq(3);
    const distance = distanceCell.data(currentUnit);
    distanceCell.text(`${distance} ${currentUnit}`);
  });
  sortTableByDistance();
}

var currentUnit = "km"; // Default unit
//script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCFtR8QPPiSS0X82DF0R6Zm1iCS8c4PN_A&libraries=geometry&callback=initializeMap";
