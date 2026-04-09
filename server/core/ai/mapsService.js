/**
 * Google Maps/Places API Service
 * Handles real-world location lookups for medical facilities
 */

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const API_URL = 'https://places.googleapis.com/v1/places:searchNearby';

/**
 * Find nearby hospitals using Google Places API (New)
 */
const findNearbyHospitals = async (lat, lng) => {
  if (!API_KEY) {
    console.warn("⚠️ GOOGLE_MAPS_API_KEY is missing. Returning mock hospital data.");
    return getMockHospitals(lat, lng);
  }

  const requestBody = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000, // 5km radius
      },
    },
    includedTypes: ['hospital'],
    maxResultCount: 3,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Maps API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
        return getMockHospitals(lat, lng);
    }

    // Standardize the response
    return data.places.map(p => ({
        name: p.displayName.text,
        address: p.formattedAddress,
        location: p.location,
        rating: p.rating || 0,
        source: 'Google Maps'
    }));

  } catch (error) {
    console.error("❌ [MAPS SERVICE] Search failed:", error.message);
    return getMockHospitals(lat, lng);
  }
};

/**
 * Fallback/Mock data if API is missing or fails
 */
const getMockHospitals = (lat, lng) => {
    return [
        {
            name: "CORTEX City Care Hospital",
            address: "Main Sector, Bengaluru",
            location: { latitude: 12.8914, longitude: 77.5965 },
            rating: 4.8,
            source: 'Database'
        },
        {
            name: "CORTEX Satellite Branch A",
            address: "HSR Layout, Bengaluru",
            location: { latitude: 12.9141, longitude: 77.6413 },
            rating: 4.5,
            source: 'Simulation'
        }
    ];
};

/**
 * Get real-time traffic and distance data using Distance Matrix API
 */
const getTrafficData = async (origin, destination) => {
  if (!API_KEY) {
    console.warn("⚠️ API Key missing for traffic lookup.");
    return null;
  }

  // Format: "lat,lng" for both
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&departure_time=now&mode=driving&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      throw new Error(`Traffic API Error: ${data.status}`);
    }

    const element = data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
        throw new Error(`Traffic Element Error: ${element.status}`);
    }

    const duration = element.duration.value; // seconds
    const durationInTraffic = element.duration_in_traffic?.value || duration; // seconds
    const distanceMeters = element.distance.value;

    // Calculate Congestion Level
    const congestionFactor = durationInTraffic / duration;
    let trafficLevel = 'Light';
    if (congestionFactor > 1.4) trafficLevel = 'Heavy';
    else if (congestionFactor > 1.15) trafficLevel = 'Moderate';

    return {
      distance: (distanceMeters / 1000).toFixed(1) + ' km',
      duration: Math.round(duration / 60) + ' mins',
      durationInTraffic: Math.round(durationInTraffic / 60) + ' mins',
      trafficLevel,
      congestionFactor
    };

  } catch (error) {
    console.error("❌ [MAPS SERVICE] Traffic lookup failed:", error.message);
    return null;
  }
};

module.exports = { findNearbyHospitals, getTrafficData };
