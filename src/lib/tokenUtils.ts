/**
 * Token utilities for handling different token decimals and conversions
 */

export interface TokenInfo {
  symbol: string;
  decimals: number;
  address?: string;
}

/**
 * Common token configurations for Arbitrum
 */
export const ARBITRUM_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: 'ETH',
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  WETH: {
    symbol: 'WETH',
    decimals: 18,
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  ARB: {
    symbol: 'ARB',
    decimals: 18,
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  },
};

/**
 * Get token info by symbol
 */
export function getTokenInfo(symbol: string): TokenInfo {
  const upperSymbol = symbol.toUpperCase();
  return ARBITRUM_TOKENS[upperSymbol] || { symbol: upperSymbol, decimals: 18 };
}

/**
 * Format token amount for display (from wei/smallest unit to human readable)
 */
export function formatTokenAmount(amount: string | bigint, decimals: number): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${wholePart}.${fractionalStr}`;
}

/**
 * Parse token amount from human readable to wei/smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [wholePart = '0', fractionalPart = ''] = amount.split('.');
  
  // Pad or truncate fractional part to match token decimals
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  
  const wholeBigInt = BigInt(wholePart) * (BigInt(10) ** BigInt(decimals));
  const fractionalBigInt = BigInt(paddedFractional);
  
  return wholeBigInt + fractionalBigInt;
}

/**
 * Validate if an amount string is valid for a token
 */
export function isValidTokenAmount(amount: string, decimals: number): boolean {
  try {
    const [wholePart, fractionalPart] = amount.split('.');
    
    // Check if wholePart is a valid number
    if (!/^\d+$/.test(wholePart)) return false;
    
    // Check fractional part if it exists
    if (fractionalPart !== undefined) {
      if (!/^\d+$/.test(fractionalPart)) return false;
      if (fractionalPart.length > decimals) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Format transaction data amounts for proper display
 */
export interface TransactionData {
  tokenName: string;
  amount: string;
  action: string;
  chainId: string;
  txPlan: Array<{
    to: string;
    data: string;
    value: string;
    chainId: string;
  }>;
}

export function formatTransactionData(data: TransactionData): TransactionData {
  const tokenInfo = getTokenInfo(data.tokenName);
  
  // If the amount looks like it's already in wei/smallest units, convert it
  let formattedAmount = data.amount;
  
  // Check if amount is a large number that might be in wei/smallest units
  const numericAmount = parseFloat(data.amount);
  if (numericAmount > 1000000) {
    // Likely in wei/smallest units, convert to human readable
    formattedAmount = formatTokenAmount(BigInt(data.amount.split('.')[0]), tokenInfo.decimals);
  }
  
  return {
    ...data,
    amount: formattedAmount,
  };
}

/**
 * Helper to create a readable transaction summary
 */
export function createTransactionSummary(data: TransactionData): string {
  const tokenInfo = getTokenInfo(data.tokenName);
  const formattedData = formatTransactionData(data);
  
  return `${formattedData.action.charAt(0).toUpperCase() + formattedData.action.slice(1)} ${formattedData.amount} ${tokenInfo.symbol}`;
}
