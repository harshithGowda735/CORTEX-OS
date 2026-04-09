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

module.exports = { findNearbyHospitals };
