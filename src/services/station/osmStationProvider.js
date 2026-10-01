/**
 * OpenStreetMap / Overpass EV Charging Station Provider
 *
 * Purpose:
 * - Discover real EV charging stations from OpenStreetMap
 * - Search around user's GPS location
 * - Support nodes, ways and relations
 * - Support multiple OSM charging tags
 * - Calculate distance
 * - Normalize external stations for our application
 *
 * IMPORTANT:
 * OpenStreetMap is discovery data.
 * It does NOT provide guaranteed live availability,
 * live pricing, or booking capability.
 */

const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const DEFAULT_RADIUS_METERS = 200000; // 200 km
const MAX_RADIUS_METERS = 200000;

const REQUEST_TIMEOUT_MS = 60000;

/**
 * Calculate distance between two GPS coordinates.
 * Returns distance in kilometers.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/**
 * Safely convert a value into a number.
 */
function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

/**
 * Validate latitude.
 */
function isValidLatitude(value) {
  const lat = Number(value);

  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude.
 */
function isValidLongitude(value) {
  const lon = Number(value);

  return Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

/**
 * Get the coordinates of an Overpass element.
 *
 * Node:
 *   element.lat
 *   element.lon
 *
 * Way/relation:
 *   element.center.lat
 *   element.center.lon
 */
function getElementCoordinates(element) {
  if (!element) {
    return null;
  }

  if (
    element.type === "node" &&
    isValidLatitude(element.lat) &&
    isValidLongitude(element.lon)
  ) {
    return {
      latitude: Number(element.lat),
      longitude: Number(element.lon),
    };
  }

  if (
    element.center &&
    isValidLatitude(element.center.lat) &&
    isValidLongitude(element.center.lon)
  ) {
    return {
      latitude: Number(element.center.lat),
      longitude: Number(element.center.lon),
    };
  }

  return null;
}

/**
 * Extract all connector types from OSM tags.
 */
function extractConnectors(tags = {}) {
  const connectors = new Set();

  const connectorKeys = [
    "socket:type1",
    "socket:type2",
    "socket:ccs",
    "socket:chademo",
    "socket:tesla_supercharger",
    "socket:tesla_destination",
    "socket:schuko",
    "socket:cee_blue",
    "socket:cee_red",
    "socket:bs1363",
    "socket:gb_t",
    "socket:other",

    "connector:type1",
    "connector:type2",
    "connector:ccs",
    "connector:chademo",
    "connector:tesla",
    "connector:tesla_supercharger",
    "connector:gb_t",
    "connector:other",

    "socket",
    "connector",
    "charging_station:connector",
  ];

  for (const key of connectorKeys) {
    const value = tags[key];

    if (!value) {
      continue;
    }

    if (typeof value === "string") {
      value
        .split(/[;,|]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => connectors.add(item));
    }
  }

  /**
   * Also inspect any tag whose key contains
   * "socket" or "connector".
   */
  for (const [key, value] of Object.entries(tags)) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("socket") ||
      lowerKey.includes("connector")
    ) {
      if (typeof value === "string") {
        value
          .split(/[;,|]/)
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => connectors.add(item));
      }
    }
  }

  return Array.from(connectors);
}

/**
 * Extract charging power in kW.
 */
function extractPower(tags = {}) {
  const possibleKeys = [
    "capacity",
    "capacity:electrical",
    "charging_station:output",
    "charging_station:output:max",
    "output",
    "maxoutput",
    "power",
    "socket:output",
    "connector:output",
  ];

  for (const key of possibleKeys) {
    if (!tags[key]) {
      continue;
    }

    const value = String(tags[key]);

    /**
     * Examples:
     * 22
     * 22 kW
     * 150kW
     * 2x150 kW
     */
    const matches = value.match(/[\d.]+/g);

    if (!matches || matches.length === 0) {
      continue;
    }

    const numbers = matches
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));

    if (numbers.length > 0) {
      /**
       * If multiple values exist, use the highest.
       */
      return Math.max(...numbers);
    }
  }

  return null;
}

/**
 * Determine a friendly charger type.
 */
function determineChargerType(tags = {}, power = null, connectors = []) {
  const chargerValue =
    tags.charger ||
    tags["charging_station:type"] ||
    tags["charging_station:charging_type"] ||
    tags["charge_type"] ||
    "";

  const normalized = String(chargerValue).toLowerCase();

  if (
    normalized.includes("dc") ||
    normalized.includes("fast") ||
    normalized.includes("rapid")
  ) {
    return chargerValue || "DC Fast Charger";
  }

  if (
    normalized.includes("ac") ||
    normalized.includes("slow")
  ) {
    return chargerValue || "AC Charger";
  }

  if (power !== null) {
    if (power >= 100) {
      return "Ultra Fast Charger";
    }

    if (power >= 50) {
      return "DC Fast Charger";
    }

    if (power >= 20) {
      return "AC Charger";
    }
  }

  if (connectors.length > 0) {
    return "EV Charger";
  }

  return "EV Charging Station";
}

/**
 * Extract a readable location.
 */
function extractLocation(tags = {}, latitude, longitude) {
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }

  if (tags.address) {
    return tags.address;
  }

  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/**
 * Extract station name.
 */
function extractName(tags = {}, element) {
  return (
    tags.name ||
    tags["name:en"] ||
    tags.operator ||
    tags.brand ||
    `OSM Charging Station ${element.id}`
  );
}

/**
 * Extract availability information.
 *
 * IMPORTANT:
 * OSM does not guarantee real-time availability.
 */
function extractAvailability(tags = {}) {
  const status =
    tags.status ||
    tags["charging_station:status"] ||
    tags.availability ||
    null;

  if (!status) {
    return null;
  }

  const normalized = String(status).toLowerCase();

  if (
    normalized.includes("available") ||
    normalized === "yes" ||
    normalized === "open"
  ) {
    return true;
  }

  if (
    normalized.includes("unavailable") ||
    normalized.includes("closed") ||
    normalized === "no"
  ) {
    return false;
  }

  return null;
}

/**
 * Extract OSM fee information.
 */
function extractFee(tags = {}) {
  return (
    tags.fee ||
    tags.charge ||
    tags["charging_station:fee"] ||
    null
  );
}

/**
 * Extract capacity / number of charging points.
 */
function extractCapacity(tags = {}) {
  const possibleKeys = [
    "capacity",
    "charging_station:capacity",
    "capacity:charging",
  ];

  for (const key of possibleKeys) {
    if (tags[key] !== undefined) {
      const value = toNumber(tags[key]);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Normalize one Overpass element.
 */
function normalizeStation(element, userLatitude, userLongitude) {
  const coordinates = getElementCoordinates(element);

  if (!coordinates) {
    return null;
  }

  const tags = element.tags || {};

  const latitude = coordinates.latitude;
  const longitude = coordinates.longitude;

  const distanceKm = haversineDistanceKm(
    userLatitude,
    userLongitude,
    latitude,
    longitude
  );

  const connectors = extractConnectors(tags);

  const power = extractPower(tags);

  const charger = determineChargerType(
    tags,
    power,
    connectors
  );

  const availability = extractAvailability(tags);

  const name = extractName(tags, element);

  const location = extractLocation(
    tags,
    latitude,
    longitude
  );

  const externalId = `osm_${element.type}_${element.id}`;

  return {
    /**
     * Identity
     */
    id: externalId,
    external_id: externalId,

    osm_id: element.id,
    osm_type: element.type,

    /**
     * Source
     */
    source: "OpenStreetMap",
    source_type: "osm",

    /**
     * Basic information
     */
    name,
    location,

    /**
     * Coordinates
     */
    latitude,
    longitude,

    /**
     * Charging information
     */
    charger,
    charger_type: charger,
    connectors,

    power,

    /**
     * OSM availability is NOT necessarily live.
     */
    available: availability,
    live_availability: false,

    /**
     * Pricing
     *
     * OSM may contain a fee description,
     * but not a reliable numeric price/kWh.
     */
    price: null,
    fee: extractFee(tags),

    /**
     * Other information
     */
    operator: tags.operator || null,
    brand: tags.brand || null,
    network:
      tags.network ||
      tags["operator:type"] ||
      null,

    capacity: extractCapacity(tags),

    opening_hours:
      tags.opening_hours ||
      tags["opening_hours:charging"] ||
      null,

    access:
      tags.access ||
      tags["access:charging"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    /**
     * Distance from user.
     */
    distance_km: Number(distanceKm.toFixed(2)),

    /**
     * OSM stations cannot be booked
     * through our PostgreSQL booking system.
     */
    bookable: false,

    /**
     * Keep original tags for future AI processing.
     */
    raw_tags: tags,
  };
}

/**
 * Build the Overpass query.
 *
 * We search:
 *
 * 1. amenity=charging_station
 * 2. charging_station=*
 *
 * We also search:
 *
 * - node
 * - way
 * - relation
 *
 * `out center tags` gives coordinates for ways/relations.
 */
function buildOverpassQuery(
  latitude,
  longitude,
  radiusMeters
) {
  return `
[out:json][timeout:60];

(
  nwr[
    "amenity"="charging_station"
  ](
    around:${radiusMeters},
    ${latitude},
    ${longitude}
  );

  nwr[
    "charging_station"
  ](
    around:${radiusMeters},
    ${latitude},
    ${longitude}
  );
);

out center tags;
`;
}

/**
 * Fetch from one Overpass endpoint.
 *
 * GET is attempted first.
 * POST is used as fallback.
 */
async function requestOverpass(endpoint, query) {
  const headers = {
    Accept: "application/json",
    "User-Agent":
      "EV-Charging-App/1.0 (OpenStreetMap station discovery)",
  };

  /**
   * ----------------------------------------
   * Attempt 1: GET
   * ----------------------------------------
   */
  try {
    const encodedQuery = encodeURIComponent(query);

    const url = `${endpoint}?data=${encodedQuery}`;

    console.log(
      `🌍 Overpass GET: ${endpoint}`
    );

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log(
        `🌍 Overpass GET status: ${response.status}`
      );

      if (response.ok) {
        const data = await response.json();

        return data;
      }

      const errorText = await response
        .text()
        .catch(() => "");

      console.warn(
        `⚠️ Overpass GET failed: ${response.status} ${errorText.slice(
          0,
          200
        )}`
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.warn(
      `⚠️ Overpass GET error: ${error.message}`
    );
  }

  /**
   * ----------------------------------------
   * Attempt 2: POST
   * ----------------------------------------
   */
  try {
    console.log(
      `🌍 Overpass POST: ${endpoint}`
    );

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log(
        `🌍 Overpass POST status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "");

        throw new Error(
          `HTTP ${response.status}: ${errorText.slice(
            0,
            300
          )}`
        );
      }

      const data = await response.json();

      return data;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.warn(
      `⚠️ Overpass POST error: ${error.message}`
    );

    throw error;
  }
}

/**
 * Search OpenStreetMap charging stations.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusMeters
 *
 * @returns {Promise<Array>}
 */
async function searchNearbyStations(
  latitude,
  longitude,
  radiusMeters = DEFAULT_RADIUS_METERS
) {
  latitude = toNumber(latitude);
  longitude = toNumber(longitude);

  radiusMeters = toNumber(
    radiusMeters,
    DEFAULT_RADIUS_METERS
  );

  /**
   * Validate GPS coordinates.
   */
  if (!isValidLatitude(latitude)) {
    throw new Error(
      "Invalid latitude supplied to OSM station provider."
    );
  }

  if (!isValidLongitude(longitude)) {
    throw new Error(
      "Invalid longitude supplied to OSM station provider."
    );
  }

  /**
   * Keep radius within safe limits.
   */
  radiusMeters = Math.max(
    1000,
    Math.min(radiusMeters, MAX_RADIUS_METERS)
  );

  console.log(
    `🌍 Searching OSM charging stations within ${(
      radiusMeters / 1000
    ).toFixed(0)} km`
  );

  const query = buildOverpassQuery(
    latitude,
    longitude,
    radiusMeters
  );

  let data = null;

  /**
   * Try each Overpass server.
   */
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      data = await requestOverpass(
        endpoint,
        query
      );

      if (data) {
        console.log(
          `✅ Overpass response received from ${endpoint}`
        );

        break;
      }
    } catch (error) {
      console.warn(
        `❌ Overpass endpoint failed: ${endpoint}`
      );

      console.warn(error.message);
    }
  }

  /**
   * No endpoint worked.
   */
  if (!data) {
    throw new Error(
      "All OpenStreetMap Overpass endpoints failed."
    );
  }

  /**
   * Make sure the response contains elements.
   */
  const elements = Array.isArray(data.elements)
    ? data.elements
    : [];

  console.log(
    `📍 OSM returned ${elements.length} raw elements`
  );

  /**
   * Normalize stations.
   */
  const normalizedStations = elements
    .map((element) =>
      normalizeStation(
        element,
        latitude,
        longitude
      )
    )
    .filter(Boolean);

  /**
   * Remove duplicates.
   *
   * The same location may match both:
   *
   * amenity=charging_station
   *
   * and
   *
   * charging_station=*
   */
  const uniqueStations = [];

  const seen = new Set();

  for (const station of normalizedStations) {
    const key = `${station.osm_type}_${station.osm_id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    uniqueStations.push(station);
  }

  /**
   * Sort by distance.
   */
  uniqueStations.sort(
    (a, b) =>
      a.distance_km - b.distance_km
  );

  console.log(
    `⚡ Normalized ${uniqueStations.length} unique OSM charging stations`
  );

  if (uniqueStations.length > 0) {
    console.log(
      "📍 Nearest OSM station:",
      uniqueStations[0].name,
      `${uniqueStations[0].distance_km} km`
    );
  }

  return uniqueStations;
}

module.exports = {
  searchNearbyStations,
  haversineDistanceKm,
};