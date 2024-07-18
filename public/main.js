$(document).ready(function () {
  fetchApiKey();

  $('#showSanDiego').on('click', function() {
    fetchTopSpots(map, 'data.json', false);
  });

  $('#showCapybara').on('click', function() {
    fetchTopSpots(map, 'capy.json', true);
  });
});

let map;

function fetchApiKey() {
  $.getJSON('/api-key', function (data) {
    const apiKey = data.apiKey;
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
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10, // Adjust zoom level as needed
    center: { lat: 32.7157, lng: -117.1611 } // Center map on San Diego
  });
  fetchTopSpots(map, 'data.json', false); // Load San Diego data by default
}

function fetchTopSpots(map, dataFile, isCapybaraLocation) {
  $.getJSON(dataFile, function (data) {
    const tableBody = $("#top-spots-table tbody");
    tableBody.empty(); // Clear existing rows
    if (data && data.length > 0) {
      const limitedData = data.slice(0, 30);
      limitedData.forEach((spot) => addSpotToTable(spot, map, tableBody, isCapybaraLocation));
      sortTableByDistance();
    } else {
      console.error("No data found");
    }
  }).fail(function (jqxhr, textStatus, error) {
    console.error("Error fetching data:", textStatus, error);
  });
}

function addSpotToTable(spot, map, tableBody, isCapybaraLocation) {
  const spotLatLng = new google.maps.LatLng(spot.location[0], spot.location[1]);
  const userLatLng = new google.maps.LatLng(32.7157, -117.1611); // San Diego's coordinates for distance calculation
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

  addMarker(spot, spotLatLng, map, isCapybaraLocation);
}

function addMarker(spot, spotLatLng, map, isCapybaraLocation) {
  const icon = isCapybaraLocation ? {
    url: 'assets/CapybarapinRMVD.png', // Path to your capybara icon
    scaledSize: new google.maps.Size(50, 50), // Initial size of the icon
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 50) // Anchor the icon at the bottom center
  } : null;

  const marker = new google.maps.Marker({
    position: spotLatLng,
    map: map,
    title: spot.name,
    icon: icon
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
  $("#toggleDistance").text(isKm ? "Miles" : "Kilometers");
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

// Capybara Fun Facts
const capybaraFacts = [
  "Capybaras are the largest rodents in the world!",
  "Capybaras are social animals and live in groups.",
  "Capybaras can stay underwater for up to five minutes.",
  "Capybaras' teeth grow continuously throughout their life.",
  "Capybaras are excellent swimmers and can sleep in water."
];

function generateRandomFact() {
  const randomIndex = Math.floor(Math.random() * capybaraFacts.length);
  document.getElementById("capybara-fact").textContent = capybaraFacts[randomIndex];
}