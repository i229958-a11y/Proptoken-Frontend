/**
 * Token Value Prediction Model (Crypto-Financial Forecast)
 * Uses moving averages, weighted on-chain activity, investor count, and liquidity score
 */

export const tokenPriceModel = {
  /**
   * Predict token price
   * @param {Object} marketData - Market data including historical prices
   * @returns {Object} - Price prediction
   */
  predictTokenPrice: (marketData = {}) => {
    const historicalPrices = marketData.historicalPrices || [250, 252, 248, 255, 250, 253, 251];
    const currentPrice = historicalPrices[historicalPrices.length - 1] || 250;
    const investorCount = marketData.investorCount || 100;
    const totalTokens = marketData.totalTokens || 100000;
    const circulatingTokens = marketData.circulatingTokens || 50000;
    const transactionVolume = marketData.transactionVolume || 10000;
    const liquidity = marketData.liquidity || 500000;

    // Moving averages
    const sma7 = historicalPrices.slice(-7).reduce((sum, p) => sum + p, 0) / 7;
    const sma30 = historicalPrices.length >= 30 
      ? historicalPrices.slice(-30).reduce((sum, p) => sum + p, 0) / 30
      : sma7;

    // Exponential moving average (more weight to recent prices)
    let ema = historicalPrices[0] || currentPrice;
    const alpha = 0.3; // Smoothing factor
    historicalPrices.forEach(price => {
      ema = alpha * price + (1 - alpha) * ema;
    });

    // On-chain activity score (weighted)
    const activityScore = (
      (investorCount / 200) * 0.3 + // Normalized to 200 investors
      (transactionVolume / 50000) * 0.3 + // Normalized to 50k volume
      (circulatingTokens / totalTokens) * 0.2 + // Circulation ratio
      (liquidity / 1000000) * 0.2 // Normalized to 1M liquidity
    );

    // Price momentum
    const priceChange = currentPrice - historicalPrices[0];
    const momentum = priceChange / historicalPrices[0];

    // Trend analysis
    const recentTrend = historicalPrices.slice(-5);
    const trendSlope = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;

    // Volatility calculation
    const returns = [];
    for (let i = 1; i < historicalPrices.length; i++) {
      returns.push((historicalPrices[i] - historicalPrices[i - 1]) / historicalPrices[i - 1]);
    }
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Prediction formula
    const basePrice = (sma7 + ema) / 2; // Average of SMA and EMA
    const activityAdjustment = (activityScore - 0.5) * 20; // ±20 price adjustment
    const momentumAdjustment = momentum * 10; // Momentum factor
    const trendAdjustment = trendSlope * 5; // Trend factor

    const predictedPrice = basePrice + activityAdjustment + momentumAdjustment + trendAdjustment;

    // Confidence calculation
    const dataQuality = Math.min(1, historicalPrices.length / 30); // More data = higher confidence
    const volatilityPenalty = Math.max(0, 1 - volatility * 10); // High volatility = lower confidence
    const confidence = (dataQuality * 0.6 + volatilityPenalty * 0.4);

    return {
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      predictedPrice: Math.max(200, Math.min(300, parseFloat(predictedPrice.toFixed(2)))),
      change: parseFloat((predictedPrice - currentPrice).toFixed(2)),
      changePercent: parseFloat(((predictedPrice - currentPrice) / currentPrice * 100).toFixed(2)),
      confidence: parseFloat(confidence.toFixed(3)),
      indicators: {
        sma7: parseFloat(sma7.toFixed(2)),
        sma30: parseFloat(sma30.toFixed(2)),
        ema: parseFloat(ema.toFixed(2)),
        momentum: parseFloat(momentum.toFixed(4)),
        volatility: parseFloat(volatility.toFixed(4)),
        activityScore: parseFloat(activityScore.toFixed(3)),
      },
      trend: trendSlope > 0.1 ? 'bullish' : trendSlope < -0.1 ? 'bearish' : 'neutral',
    };
  },

  /**
   * Forecast token price trend over time
   * @param {Object} marketData - Market data
   * @param {Number} days - Number of days to forecast
   * @returns {Array} - Price forecast curve
   */
  forecastTokenTrend: (marketData = {}, days = 30) => {
    const prediction = tokenPriceModel.predictTokenPrice(marketData);
    const curve = [];
    let currentPrice = prediction.currentPrice;
    const dailyChange = prediction.change / days;
    const volatility = prediction.indicators.volatility;

    for (let i = 0; i < days; i++) {
      // Apply trend
      currentPrice += dailyChange;

      // Add random walk (volatility)
      const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
      currentPrice *= randomFactor;

      // Clamp values
      currentPrice = Math.max(200, Math.min(300, currentPrice));

      curve.push({
        day: i + 1,
        price: parseFloat(currentPrice.toFixed(2)),
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return curve;
  }
};

