const axios = require('axios');
const supabase = require('../config/db');
const logger = require('../utils/logger');

const GEOCODING_PROVIDER = process.env.GEOCODING_PROVIDER || 'mapbox';

const GeocodingService = {
  async geocodeLocation(locationName) {
    try {
      // Check cache first
      const cacheKey = `geo-${locationName}`;
      const cached = await this._checkCache(cacheKey);
      if (cached) return cached;

      let coordinates;
      
      if (GEOCODING_PROVIDER === 'mapbox') {
        coordinates = await this._geocodeWithMapbox(locationName);
      } else if (GEOCODING_PROVIDER === 'google') {
        coordinates = await this._geocodeWithGoogle(locationName);
      } else {
        coordinates = await this._geocodeWithNominatim(locationName);
      }

      // Cache the result
      await this._cacheResult(cacheKey, coordinates, 86400); // 24h cache

      return coordinates;
    } catch (error) {
      logger.error(`Geocoding error for ${locationName}: ${error.message}`);
      throw error;
    }
  },

  async _geocodeWithMapbox(locationName) {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json`,
      {
        params: {
          access_token: accessToken,
          limit: 1
        }
      }
    );

    if (!response.data.features.length) {
      throw new Error('Location not found');
    }

    const [lon, lat] = response.data.features[0].center;
    return { lat, lon };
  },

  async _checkCache(key) {
    const { data, error } = await supabase
      .from('cache')
      .select('value')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data.value;
  },

  async _cacheResult(key, value, ttl) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttl);

    const { error } = await supabase
      .from('cache')
      .upsert({
        key,
        value,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;
  }
};

module.exports = GeocodingService;
