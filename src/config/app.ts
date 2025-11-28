/**
 * App configuration constants
 */

import Config from 'react-native-config';

// Brand and domain configuration
export const BRAND_NAME = 'signa';
export const EMAIL_DOMAIN = 'signa.email';

// API endpoints - use react-native-config for environment variables
export const WILDDUCK_API_URL =
  Config.WILDDUCK_API_URL || 'https://api.signa.email';
export const WILDDUCK_API_TOKEN = Config.WILDDUCK_API_TOKEN || '';

// Feature flags
// __DEV__ is a global variable in React Native
declare const __DEV__: boolean;
export const DEV_MODE = __DEV__ || false;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
