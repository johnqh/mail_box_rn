const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Path to the local di_rn package
const diRnPath = path.resolve(__dirname, '../di_rn');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [diRnPath],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    extraNodeModules: {
      '@sudobility/di_rn': diRnPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
