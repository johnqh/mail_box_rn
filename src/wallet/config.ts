/**
 * Wallet configuration for React Native
 */

// WalletConnect Project ID - get from https://cloud.walletconnect.com/
// In React Native, environment variables are accessed via react-native-config
export const WALLETCONNECT_PROJECT_ID = '';

// App metadata for WalletConnect
export const APP_METADATA = {
  name: 'Signa Email',
  description: 'Web3 Email Client',
  url: 'https://signa.email',
  icons: ['https://signa.email/icon.png'],
};

// Supported chains
export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon.llamarpc.com',
    explorer: 'https://polygonscan.com',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
  },
};

// Solana configuration
export const SOLANA_CONFIG = {
  network: 'mainnet-beta' as const,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
};

// Wallet deep links for mobile
export const WALLET_DEEP_LINKS = {
  metamask: {
    ios: 'metamask://',
    android: 'metamask://',
    universal: 'https://metamask.app.link',
  },
  phantom: {
    ios: 'phantom://',
    android: 'phantom://',
    universal: 'https://phantom.app/ul',
  },
  rainbow: {
    ios: 'rainbow://',
    android: 'rainbow://',
    universal: 'https://rnbwapp.com',
  },
  coinbase: {
    ios: 'cbwallet://',
    android: 'cbwallet://',
    universal: 'https://go.cb-w.com',
  },
};

export type ChainType = 'evm' | 'solana';
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'solflare';

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  chainType: ChainType;
  deepLink?: typeof WALLET_DEEP_LINKS[keyof typeof WALLET_DEEP_LINKS];
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    type: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    chainType: 'evm',
    deepLink: WALLET_DEEP_LINKS.metamask,
  },
  {
    type: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    chainType: 'evm',
  },
  {
    type: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💰',
    chainType: 'evm',
    deepLink: WALLET_DEEP_LINKS.coinbase,
  },
  {
    type: 'phantom',
    name: 'Phantom',
    icon: '👻',
    chainType: 'solana',
    deepLink: WALLET_DEEP_LINKS.phantom,
  },
  {
    type: 'solflare',
    name: 'Solflare',
    icon: '☀️',
    chainType: 'solana',
  },
];
