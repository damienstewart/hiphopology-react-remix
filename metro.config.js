const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watchman missed file changes in this environment; fall back to Node's file watcher.
config.resolver.useWatchman = false;

module.exports = config;
