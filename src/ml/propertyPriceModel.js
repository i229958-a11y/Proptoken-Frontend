/**
 * Property Price Prediction Model
 * Uses linear regression with weighted coefficients and growth adjustment
 */

export const propertyPriceModel = {
  /**
   * Predict property price based on features
   * @param {Object} property - Property object with features
   * @returns {Object} - Predicted price and confidence
   */
  predictPrice: (property) => {
    // Base coefficients (learned from training data simulation)
    const coefficients = {
      basePrice: property.price || 1000000,
      location: 0.25,      // Location multiplier
      size: 0.15,          // Size multiplier
      age: -0.08,          // Age penalty
      roi: 0.12,           // ROI boost
      tokens: 0.10,        // Token availability
      type: 0.05,          // Property type
    };

    // Feature extraction
    const locationScore = property.location?.includes('DHA') ? 1.3 : 
                         property.location?.includes('Gulberg') ? 1.2 :
                         property.location?.includes('Bahria') ? 1.15 : 1.0;
    
    const sizeScore = (property.tokensTotal || 5000) / 5000; // Normalized
    const ageScore = 1 - (property.age || 0) * 0.02; // Newer = better
    const roiScore = (property.roi || 10) / 15; // Normalized to 15%
    const tokenScore = (property.tokensAvailable || 0) / (property.tokensTotal || 5000);
    const typeScore = property.type === 'commercial' ? 1.2 : 1.0;

    // Growth adjustment factor (market trend)
    const marketTrend = 1.05; // 5% annual growth
    const timeHorizon = 1; // 1 year prediction

    // Linear regression calculation
    let predictedPrice = coefficients.basePrice;
    predictedPrice *= (1 + coefficients.location * (locationScore - 1));
    predictedPrice *= (1 + coefficients.size * (sizeScore - 1));
    predictedPrice *= (1 + coefficients.age * (ageScore - 1));
    predictedPrice *= (1 + coefficients.roi * (roiScore - 1));
    predictedPrice *= (1 + coefficients.tokens * tokenScore);
    predictedPrice *= (1 + coefficients.type * (typeScore - 1));
    
    // Apply growth trend
    predictedPrice *= Math.pow(marketTrend, timeHorizon);

    // Confidence calculation (based on data completeness)
    const dataCompleteness = (
      (property.price ? 1 : 0) +
      (property.location ? 1 : 0) +
      (property.roi ? 1 : 0) +
      (property.tokensTotal ? 1 : 0)
    ) / 4;

    const confidence = Math.min(0.95, 0.70 + dataCompleteness * 0.25);

    return {
      predictedPrice: Math.round(predictedPrice),
      currentPrice: property.price || 1000000,
      growth: ((predictedPrice - (property.price || 1000000)) / (property.price || 1000000)) * 100,
      confidence: confidence,
      factors: {
        location: locationScore,
        size: sizeScore,
        age: ageScore,
        roi: roiScore,
        type: typeScore,
      }
    };
  },

  /**
   * Predict price for multiple properties
   */
  predictPrices: (properties) => {
    return properties.map(prop => ({
      ...prop,
      pricePrediction: propertyPriceModel.predictPrice(prop)
    }));
  }
};


