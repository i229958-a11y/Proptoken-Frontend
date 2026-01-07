/**
 * Property Risk Classification Model
 * Uses logistic scoring, volatility measurement, and hazard factors
 */

export const riskModel = {
  /**
   * Classify risk level for a property
   * @param {Object} property - Property object
   * @returns {Object} - Risk classification
   */
  classifyRisk: (property) => {
    // Risk factors
    const factors = {
      locationStability: property.location?.includes('DHA') ? 0.1 :
                       property.location?.includes('Gulberg') ? 0.15 :
                       property.location?.includes('Bahria') ? 0.12 : 0.25,
      roiVolatility: property.roi ? Math.abs(property.roi - 12) / 12 : 0.2, // Deviation from average
      priceVolatility: 0.15, // Market volatility
      tokenLiquidity: 1 - ((property.tokensAvailable || 0) / (property.tokensTotal || 5000)), // Low liquidity = high risk
      propertyAge: (property.age || 5) / 50, // Older = slightly riskier
      typeRisk: property.type === 'commercial' ? 0.12 : 0.08, // Commercial slightly riskier
    };

    // Weights for logistic regression
    const weights = {
      locationStability: 0.25,
      roiVolatility: 0.20,
      priceVolatility: 0.15,
      tokenLiquidity: 0.15,
      propertyAge: 0.10,
      typeRisk: 0.15,
    };

    // Calculate weighted risk score
    let riskScore = 0;
    riskScore += factors.locationStability * weights.locationStability;
    riskScore += factors.roiVolatility * weights.roiVolatility;
    riskScore += factors.priceVolatility * weights.priceVolatility;
    riskScore += factors.tokenLiquidity * weights.tokenLiquidity;
    riskScore += factors.propertyAge * weights.propertyAge;
    riskScore += factors.typeRisk * weights.typeRisk;

    // Logistic function to normalize (0-1)
    const logisticScore = 1 / (1 + Math.exp(-5 * (riskScore - 0.5)));

    // Classify risk level
    let riskLevel, riskLabel, riskColor;
    if (logisticScore < 0.3) {
      riskLevel = 'low';
      riskLabel = 'Low Risk';
      riskColor = '#10b981'; // Green
    } else if (logisticScore < 0.5) {
      riskLevel = 'medium-low';
      riskLabel = 'Medium-Low Risk';
      riskColor = '#84cc16'; // Lime
    } else if (logisticScore < 0.7) {
      riskLevel = 'medium';
      riskLabel = 'Medium Risk';
      riskColor = '#f59e0b'; // Orange
    } else if (logisticScore < 0.85) {
      riskLevel = 'high';
      riskLabel = 'High Risk';
      riskColor = '#ef4444'; // Red
    } else {
      riskLevel = 'very-high';
      riskLabel = 'Very High Risk';
      riskColor = '#dc2626'; // Dark red
    }

    return {
      riskScore: parseFloat(logisticScore.toFixed(3)),
      riskLevel,
      riskLabel,
      riskColor,
      factors: {
        locationStability: parseFloat((1 - factors.locationStability).toFixed(3)),
        roiVolatility: parseFloat(factors.roiVolatility.toFixed(3)),
        priceVolatility: parseFloat(factors.priceVolatility.toFixed(3)),
        tokenLiquidity: parseFloat(factors.tokenLiquidity.toFixed(3)),
        propertyAge: parseFloat(factors.propertyAge.toFixed(3)),
        typeRisk: parseFloat(factors.typeRisk.toFixed(3)),
      },
      recommendations: riskLevel === 'high' || riskLevel === 'very-high' 
        ? ['Consider diversifying investment', 'Monitor market trends closely', 'Review property documentation']
        : riskLevel === 'medium'
        ? ['Standard monitoring recommended', 'Regular portfolio review']
        : ['Low risk investment', 'Suitable for conservative investors']
    };
  }
};

