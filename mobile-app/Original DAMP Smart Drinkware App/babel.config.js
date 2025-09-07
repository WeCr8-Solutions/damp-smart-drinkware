/**
 * DAMP Smart Drinkware - Babel Configuration
 * Simplified Expo configuration for web builds
 */

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: []
  };
};