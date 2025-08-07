/**
 * DAMP Smart Drinkware - Babel Configuration
 * Minimal Babel setup for Jest testing
 */

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};