const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Monorepo root
const monorepoRoot = path.resolve(__dirname, '..');

// Map @sudobility packages to local directories
const sudobilityPackages = {
  '@sudobility/lib': path.resolve(monorepoRoot, 'mail_box_lib'),
  '@sudobility/types': path.resolve(monorepoRoot, 'types'),
  '@sudobility/di': path.resolve(monorepoRoot, 'di'),
  '@sudobility/di_rn': path.resolve(monorepoRoot, 'di_rn'),
  '@sudobility/design': path.resolve(monorepoRoot, 'design_system'),
  '@sudobility/components-rn': path.resolve(monorepoRoot, 'mail_box_components_rn'),
  '@sudobility/wildduck_client': path.resolve(monorepoRoot, 'wildduck_client'),
  '@sudobility/indexer_client': path.resolve(monorepoRoot, 'mail_box_indexer_client'),
};

const config = {
  // Watch all directories in the monorepo
  watchFolders: [
    monorepoRoot,
    ...Object.values(sudobilityPackages),
  ],

  resolver: {
    // Tell Metro where to find node_modules
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],

    // Map @sudobility packages to local directories
    extraNodeModules: {
      ...sudobilityPackages,
      // Ensure core packages resolve from the RN app's node_modules
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      '@react-navigation/native': path.resolve(__dirname, 'node_modules/@react-navigation/native'),
      '@react-navigation/native-stack': path.resolve(__dirname, 'node_modules/@react-navigation/native-stack'),
      '@react-navigation/bottom-tabs': path.resolve(__dirname, 'node_modules/@react-navigation/bottom-tabs'),
      '@react-navigation/elements': path.resolve(__dirname, 'node_modules/@react-navigation/elements'),
      'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
      'react-native-safe-area-context': path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
      'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
      'react-native-config': path.resolve(__dirname, 'node_modules/react-native-config'),
      'i18next': path.resolve(__dirname, 'node_modules/i18next'),
      'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next'),
    },

    // Block list for files/folders Metro should ignore
    blockList: [
      // Exclude other apps' node_modules to avoid duplicates
      /mail_box\/node_modules\/.*/,
      /di_web\/node_modules\/.*/,
    ],

    // Source extensions
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],

    // Asset extensions
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'woff', 'woff2'],
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
