/**
 * Investment Probability Model
 * Predicts probability a user will invest in a property
 */

export const investmentProbabilityModel = {
  /**
   * Predict user-property match probability
   * @param {Object} userProfile - User profile data
   * @param {Object} property - Property object
   * @returns {Object} - Investment probability and factors
   */
  predictUserPropertyMatch: (userProfile, property) => {
    // User preferences
    const userPrefs = {
      budget: userProfile.budget || 50000,
      riskTolerance: userProfile.riskTolerance || 0.5,
      preferredType: userProfile.preferredType || 'residential',
      preferredROI: userProfile.preferredROI || 12,
      preferredLocation: userProfile.preferredLocation || [],
    };

    // Property features
    const propertyFeatures = {
      price: property.tokenPrice * (property.tokensAvailable || 100), // Total cost
      roi: property.roi || 12,
      type: property.type || 'residential',
      location: property.location || '',
      risk: property.riskScore || 0.5,
    };

    // Match factors (0-1 scale)
    const factors = {
      budgetMatch: userPrefs.budget >= propertyFeatures.price 
        ? 1.0 
        : Math.max(0, 1 - (propertyFeatures.price - userPrefs.budget) / userPrefs.budget),
      roiMatch: 1 - Math.abs(propertyFeatures.roi - userPrefs.preferredROI) / 20, // Normalized to 20%
      typeMatch: propertyFeatures.type === userPrefs.preferredType ? 1.0 : 0.7,
      locationMatch: userPrefs.preferredLocation.length === 0 
        ? 0.8 // No preference = neutral
        : userPrefs.preferredLocation.some(loc => propertyFeatures.location.includes(loc)) 
          ? 1.0 
          : 0.5,
      riskMatch: 1 - Math.abs(propertyFeatures.risk - userPrefs.riskTolerance),
    };

    // Weights for each factor
    const weights = {
      budgetMatch: 0.30,
      roiMatch: 0.25,
      typeMatch: 0.15,
      locationMatch: 0.15,
      riskMatch: 0.15,
    };

    // Calculate weighted probability
    let probability = 0;
    probability += factors.budgetMatch * weights.budgetMatch;
    probability += factors.roiMatch * weights.roiMatch;
    probability += factors.typeMatch * weights.typeMatch;
    probability += factors.locationMatch * weights.locationMatch;
    probability += factors.riskMatch * weights.riskMatch;

    // Apply logistic function for final probability
    const logisticProbability = 1 / (1 + Math.exp(-5 * (probability - 0.5)));

    // Determine recommendation level
    let recommendation;
    if (logisticProbability >= 0.8) {
      recommendation = 'high';
    } else if (logisticProbability >= 0.6) {
      recommendation = 'medium';
    } else if (logisticProbability >= 0.4) {
      recommendation = 'low';
    } else {
      recommendation = 'very-low';
    }

    return {
      probability: parseFloat(logisticProbability.toFixed(3)),
      recommendation,
      factors: {
        budgetMatch: parseFloat(factors.budgetMatch.toFixed(3)),
        roiMatch: parseFloat(factors.roiMatch.toFixed(3)),
        typeMatch: parseFloat(factors.typeMatch.toFixed(3)),
        locationMatch: parseFloat(factors.locationMatch.toFixed(3)),
        riskMatch: parseFloat(factors.riskMatch.toFixed(3)),
      },
      insights: {
        strongMatch: factors.budgetMatch > 0.8 && factors.roiMatch > 0.7,
        weakMatch: factors.budgetMatch < 0.5 || factors.roiMatch < 0.5,
        recommendations: probability > 0.7 
          ? ['Strong match for your profile', 'Consider investing']
          : probability > 0.5
          ? ['Moderate match', 'Review property details']
          : ['Low match', 'Consider other properties']
      }
    };
  }
};

