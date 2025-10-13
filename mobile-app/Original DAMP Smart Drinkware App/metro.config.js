const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Configure Metro to only watch the mobile app directory
config.watchFolders = [projectRoot];

// Reset the project root to this directory only
config.projectRoot = projectRoot;

// Exclude parent directories from being scanned
config.resolver.blockList = [
  // Ignore parent project files
  /^(?!.*node_modules).*\/\.\.\/\.\.\/.*/,
  // Ignore website directory
  new RegExp(`${workspaceRoot}/website/.*`),
  // Ignore root node_modules (use mobile app's node_modules only)
  new RegExp(`${workspaceRoot}/node_modules/.*`),
  // Ignore other mobile app directories
  new RegExp(`${workspaceRoot}/mobile-app/(?!Original DAMP Smart Drinkware App).*`),
];

// Only look for node_modules in the mobile app directory
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;

