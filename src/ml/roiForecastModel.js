/**
 * ROI Forecast Forecasting Model
 * Uses moving averages, ARIMA-like structure, and time-series smoothing
 */

export const roiForecastModel = {
  /**
   * Predict ROI for a property
   * @param {Object} property - Property object
   * @returns {Object} - ROI predictions
   */
  predictROI: (property) => {
    const baseROI = property.roi || 12;
    const historicalROI = property.historicalROI || [baseROI, baseROI * 0.98, baseROI * 1.02];
    
    // Moving average calculation (3-period)
    const movingAvg = historicalROI.reduce((sum, val) => sum + val, 0) / historicalROI.length;
    
    // Trend calculation (slope)
    const trend = historicalROI.length > 1 
      ? (historicalROI[historicalROI.length - 1] - historicalROI[0]) / historicalROI.length
      : 0;
    
    // ARIMA-like autoregressive component
    const lag1 = historicalROI[historicalROI.length - 1] || baseROI;
    const lag2 = historicalROI[historicalROI.length - 2] || baseROI;
    const autoregressive = 0.6 * lag1 + 0.3 * lag2;
    
    // Seasonal adjustment (property type)
    const seasonalFactor = property.type === 'commercial' ? 1.05 : 1.0;
    
    // Market volatility
    const volatility = Math.abs(historicalROI[historicalROI.length - 1] - movingAvg) / movingAvg;
    const volatilityAdjustment = 1 - (volatility * 0.5);
    
    // Final prediction
    const predictedROI = (autoregressive + movingAvg) / 2 * seasonalFactor * volatilityAdjustment;
    
    return {
      currentROI: baseROI,
      predictedROI: Math.max(5, Math.min(25, predictedROI)), // Clamp between 5-25%
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      confidence: Math.max(0.7, 1 - volatility),
      volatility: volatility
    };
  },

  /**
   * Generate ROI curve over time
   * @param {Object} property - Property object
   * @param {Number} months - Number of months to forecast
   * @returns {Array} - ROI values over time
   */
  generateROICurve: (property, months = 12) => {
    const baseROI = property.roi || 12;
    const historicalROI = property.historicalROI || [baseROI];
    const prediction = roiForecastModel.predictROI(property);
    
    const curve = [];
    let currentROI = baseROI;
    const trendFactor = prediction.trend === 'increasing' ? 1.002 : 
                       prediction.trend === 'decreasing' ? 0.998 : 1.0;
    
    for (let i = 0; i < months; i++) {
      // Apply trend
      currentROI *= trendFactor;
      
      // Add some randomness (volatility)
      const randomFactor = 1 + (Math.random() - 0.5) * prediction.volatility * 0.1;
      currentROI *= randomFactor;
      
      // Clamp values
      currentROI = Math.max(5, Math.min(25, currentROI));
      
      curve.push({
        month: i + 1,
        roi: parseFloat(currentROI.toFixed(2)),
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return curve;
  }
};


