/**
 * AI-Powered Property Recommendation Engine
 * Local algorithm-based scoring (NOT LLM API)
 */

/**
 * Calculate recommendation score for a property based on user profile
 * @param {Object} property - Property object
 * @param {Object} userProfile - User profile with preferences and history
 * @returns {number} Score from 0-100
 */
export const calculateRecommendationScore = (property, userProfile) => {
  let score = 0;
  const weights = {
    budget: 0.20,
    roi: 0.25,
    location: 0.20,
    risk: 0.15,
    history: 0.10,
    type: 0.10,
  };

  // Budget match (0-20 points)
  if (userProfile.budgetRange) {
    const [minBudget, maxBudget] = userProfile.budgetRange;
    const propertyPrice = property.price;
    if (propertyPrice >= minBudget && propertyPrice <= maxBudget) {
      score += weights.budget * 100;
    } else if (propertyPrice < minBudget) {
      // Slightly below budget is acceptable
      score += weights.budget * 80;
    } else if (propertyPrice <= maxBudget * 1.2) {
      // Slightly above budget is acceptable
      score += weights.budget * 60;
    }
  } else {
    score += weights.budget * 50; // Neutral if no budget preference
  }

  // ROI match (0-25 points)
  if (userProfile.preferredROI) {
    const roiDiff = Math.abs(property.roi - userProfile.preferredROI);
    if (roiDiff <= 2) {
      score += weights.roi * 100; // Perfect match
    } else if (roiDiff <= 5) {
      score += weights.roi * 75; // Good match
    } else if (roiDiff <= 10) {
      score += weights.roi * 50; // Acceptable
    } else {
      score += weights.roi * 25; // Poor match
    }
  } else {
    // Higher ROI is generally better
    score += (property.roi / 20) * weights.roi * 100; // Normalize to 20% max ROI
  }

  // Location match (0-20 points)
  if (userProfile.preferredCities && userProfile.preferredCities.length > 0) {
    const propertyCity = property.location.split(',')[0].trim();
    if (userProfile.preferredCities.some(city => 
      propertyCity.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(propertyCity.toLowerCase())
    )) {
      score += weights.location * 100;
    } else {
      score += weights.location * 30; // Partial match
    }
  } else {
    score += weights.location * 50; // Neutral
  }

  // Risk tolerance match (0-15 points)
  const propertyRisk = calculatePropertyRisk(property);
  if (userProfile.riskTolerance) {
    const riskMatch = {
      low: { low: 100, medium: 60, high: 20 },
      medium: { low: 70, medium: 100, high: 60 },
      high: { low: 30, medium: 70, high: 100 },
    };
    const match = riskMatch[userProfile.riskTolerance]?.[propertyRisk] || 50;
    score += (match / 100) * weights.risk * 100;
  } else {
    score += weights.risk * 50; // Neutral
  }

  // Investment history match (0-10 points)
  if (userProfile.viewingHistory) {
    const similarProperties = userProfile.viewingHistory.filter(h => 
      h.type === property.type || 
      h.location.includes(property.location.split(',')[0])
    );
    if (similarProperties.length > 0) {
      score += weights.history * 100;
    } else {
      score += weights.history * 30;
    }
  } else {
    score += weights.history * 50;
  }

  // Property type preference (0-10 points)
  if (userProfile.preferredTypes && userProfile.preferredTypes.length > 0) {
    if (userProfile.preferredTypes.includes(property.type)) {
      score += weights.type * 100;
    } else {
      score += weights.type * 20;
    }
  } else {
    score += weights.type * 50;
  }

  // Bonus: Token availability (if low, it's more exclusive)
  if (property.tokensAvailable < property.tokensTotal * 0.3) {
    score += 5; // Bonus for limited availability
  }

  // Bonus: High ROI properties
  if (property.roi > 15) {
    score += 3;
  }

  return Math.min(100, Math.round(score));
};

/**
 * Calculate property risk level
 * @param {Object} property - Property object
 * @returns {string} 'low', 'medium', or 'high'
 */
export const calculatePropertyRisk = (property) => {
  let riskScore = 0;

  // ROI-based risk (higher ROI = higher risk typically)
  if (property.roi > 18) riskScore += 3;
  else if (property.roi > 12) riskScore += 2;
  else riskScore += 1;

  // Price-based risk (very expensive = higher risk)
  if (property.price > 5000000) riskScore += 2;
  else if (property.price > 2000000) riskScore += 1;

  // Type-based risk
  if (property.type === 'commercial') riskScore += 1;

  // Token availability (low availability = lower risk perception)
  const availabilityRatio = property.tokensAvailable / property.tokensTotal;
  if (availabilityRatio < 0.2) riskScore -= 1;

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
};

/**
 * Get top recommended properties
 * @param {Array} properties - All properties
 * @param {Object} userProfile - User profile
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} Sorted array of properties with scores
 */
export const getTopRecommendations = (properties, userProfile, limit = 10) => {
  const scoredProperties = properties
    .filter(p => p.visible !== false)
    .map(property => ({
      ...property,
      aiScore: calculateRecommendationScore(property, userProfile),
      riskLevel: calculatePropertyRisk(property),
    }))
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, limit);

  return scoredProperties;
};

/**
 * Generate AI insights based on user profile
 * @param {Object} userProfile - User profile
 * @param {Array} investments - User investments
 * @param {Array} viewingHistory - User viewing history
 * @returns {Object} AI insights
 */
export const generateAIInsights = (userProfile, investments = [], viewingHistory = []) => {
  const insights = {
    investmentStyle: 'Balanced',
    frequentlyViewed: 'Mixed',
    suggestedAction: 'Explore new opportunities',
    riskProfile: 'Medium',
  };

  // Determine investment style
  if (investments.length === 0) {
    insights.investmentStyle = 'New Investor';
    insights.suggestedAction = 'Start with low-risk properties';
  } else {
    const avgROI = investments.reduce((sum, inv) => sum + (inv.roi || 0), 0) / investments.length;
    if (avgROI < 10) {
      insights.investmentStyle = 'Conservative';
    } else if (avgROI > 15) {
      insights.investmentStyle = 'Aggressive';
    } else {
      insights.investmentStyle = 'Balanced';
    }
  }

  // Determine frequently viewed types
  if (viewingHistory.length > 0) {
    const typeCounts = {};
    viewingHistory.forEach(h => {
      typeCounts[h.type] = (typeCounts[h.type] || 0) + 1;
    });
    const mostViewed = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    );
    insights.frequentlyViewed = mostViewed ? 
      `${mostViewed.charAt(0).toUpperCase() + mostViewed.slice(1)} properties` : 
      'Mixed properties';
  }

  // Risk profile
  if (userProfile.riskTolerance) {
    insights.riskProfile = userProfile.riskTolerance.charAt(0).toUpperCase() + 
      userProfile.riskTolerance.slice(1);
  }

  // Suggested action
  if (investments.length > 0) {
    const types = [...new Set(investments.map(inv => inv.type))];
    if (types.length === 1) {
      insights.suggestedAction = 'Increase portfolio diversity';
    } else if (investments.length < 3) {
      insights.suggestedAction = 'Consider adding more properties';
    } else {
      insights.suggestedAction = 'Your portfolio looks well-diversified';
    }
  }

  return insights;
};

/**
 * Get recommended filter defaults based on user profile
 * @param {Object} userProfile - User profile
 * @returns {Object} Filter defaults
 */
export const getRecommendedFilters = (userProfile) => {
  return {
    budgetMin: userProfile.budgetRange?.[0] || 0,
    budgetMax: userProfile.budgetRange?.[1] || 10000000,
    roiMin: Math.max(0, (userProfile.preferredROI || 10) - 3),
    roiMax: (userProfile.preferredROI || 10) + 5,
    location: userProfile.preferredCities?.[0] || '',
    type: userProfile.preferredTypes?.[0] || '',
    risk: userProfile.riskTolerance || '',
  };
};

