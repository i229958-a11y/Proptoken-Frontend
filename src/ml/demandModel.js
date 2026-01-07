/**
 * Token Demand Prediction Model
 * Uses weighted scoring, past sales, investor behavior, and location popularity
 */

export const demandModel = {
  /**
   * Predict demand for a property's tokens
   * @param {Object} property - Property object
   * @param {Array} pastSales - Historical sales data
   * @param {Number} investorCount - Number of active investors
   * @returns {Object} - Demand prediction
   */
  predictDemand: (property, pastSales = [], investorCount = 100) => {
    // Base demand factors
    const factors = {
      roi: (property.roi || 12) / 15, // Normalized to 15%
      price: 1 - ((property.tokenPrice || 250) - 200) / 500, // Lower price = higher demand
      location: property.location?.includes('DHA') ? 1.3 :
                property.location?.includes('Gulberg') ? 1.2 :
                property.location?.includes('Bahria') ? 1.15 : 1.0,
      tokensAvailable: (property.tokensAvailable || 0) / (property.tokensTotal || 5000),
      type: property.type === 'commercial' ? 1.1 : 1.0,
    };

    // Past sales analysis
    const salesVelocity = pastSales.length > 0 
      ? pastSales.filter(s => s.date > Date.now() - 30 * 24 * 60 * 60 * 1000).length
      : 0;
    const avgSalesPerMonth = salesVelocity || 5; // Default if no data
    
    // Investor behavior factor
    const investorInterest = Math.min(1.5, investorCount / 100); // More investors = more demand
    
    // Weighted scoring
    const weights = {
      roi: 0.25,
      price: 0.20,
      location: 0.20,
      tokensAvailable: 0.15,
      type: 0.10,
      salesVelocity: 0.10,
    };

    let demandScore = 0;
    demandScore += factors.roi * weights.roi;
    demandScore += factors.price * weights.price;
    demandScore += (factors.location - 1) * weights.location + 1;
    demandScore += factors.tokensAvailable * weights.tokensAvailable;
    demandScore += (factors.type - 1) * weights.type + 1;
    demandScore += Math.min(1, avgSalesPerMonth / 20) * weights.salesVelocity;
    demandScore *= investorInterest;

    // Convert score to demand level
    const demandLevel = demandScore < 0.5 ? 'low' :
                       demandScore < 0.7 ? 'medium' :
                       demandScore < 0.9 ? 'high' : 'very-high';

    // Predict tokens to be sold
    const predictedTokens = Math.round(
      (property.tokensAvailable || 0) * demandScore * 0.8 // Conservative estimate
    );

    return {
      demandScore: parseFloat(demandScore.toFixed(3)),
      demandLevel,
      predictedTokensSold: predictedTokens,
      predictedTimeToSellout: predictedTokens > 0 
        ? Math.ceil((property.tokensAvailable || 0) / (predictedTokens / 12)) 
        : Infinity,
      factors: {
        roi: factors.roi,
        price: factors.price,
        location: factors.location,
        investorInterest: investorInterest,
        salesVelocity: avgSalesPerMonth
      }
    };
  },

  /**
   * Forecast demand curve over time
   * @param {Object} property - Property object
   * @param {Number} months - Number of months
   * @returns {Array} - Demand curve data
   */
  forecastDemandCurve: (property, months = 12) => {
    const prediction = demandModel.predictDemand(property);
    const curve = [];
    let remainingTokens = property.tokensAvailable || 0;
    
    for (let i = 0; i < months; i++) {
      // Demand decays over time (exponential decay)
      const timeDecay = Math.exp(-i * 0.1);
      const monthlyDemand = prediction.predictedTokensSold / 12 * timeDecay;
      
      remainingTokens = Math.max(0, remainingTokens - monthlyDemand);
      
      curve.push({
        month: i + 1,
        demand: parseFloat(monthlyDemand.toFixed(0)),
        remainingTokens: parseFloat(remainingTokens.toFixed(0)),
        demandScore: parseFloat((prediction.demandScore * timeDecay).toFixed(3)),
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return curve;
  }
};

