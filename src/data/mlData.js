/**
 * Mock ML Data - Simulated ML Model Outputs
 * This file contains realistic ML predictions and analytics data
 */

// Generate growth curve data points (30 days forecast)
const generateGrowthCurve = (baseValue = 250, days = 30, filters = {}) => {
  const points = [];
  let currentValue = baseValue;
  const trend = 0.015; // 1.5% daily trend
  const volatility = 0.02; // 2% volatility
  
  // Adjust trend based on filters
  let adjustedTrend = trend;
  if (filters.propertyType && filters.propertyType !== 'All') {
    adjustedTrend *= 1.1; // Slight boost for filtered properties
  }
  if (filters.riskLevel && filters.riskLevel !== 'All') {
    if (filters.riskLevel === 'Low' || filters.riskLevel === 'Medium-Low') {
      adjustedTrend *= 0.9; // Lower growth for low risk
    } else {
      adjustedTrend *= 1.2; // Higher growth for high risk
    }
  }
  
  for (let i = 0; i < days; i++) {
    const randomFactor = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + adjustedTrend + randomFactor);
    
    points.push({
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(currentValue * 100) / 100,
      confidence: 0.85 + Math.random() * 0.1,
    });
  }
  
  return points;
};

// Generate token trend curve data points
const generateTokenTrendCurve = (basePrice = 250, days = 30, filters = {}) => {
  const points = [];
  let currentPrice = basePrice;
  const trend = 0.012; // 1.2% daily trend
  
  // Adjust trend based on filters
  let adjustedTrend = trend;
  if (filters.minROI) {
    adjustedTrend *= (1 + filters.minROI / 100);
  }
  
  for (let i = 0; i < days; i++) {
    const seasonalFactor = Math.sin((i / 7) * 2 * Math.PI) * 0.01;
    const randomFactor = (Math.random() - 0.5) * 0.015;
    currentPrice = currentPrice * (1 + adjustedTrend + seasonalFactor + randomFactor);
    
    points.push({
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.round((50000 + Math.random() * 20000) * 100) / 100,
    });
  }
  
  return points;
};

// Generate risk heatmap data (5x5 grid)
const generateRiskHeatmap = (filters = {}) => {
  const properties = [];
  const riskLevels = ['low', 'medium-low', 'medium', 'high', 'very-high'];
  const riskLevelMap = {
    'Low': 'low',
    'Medium-Low': 'medium-low',
    'Medium': 'medium',
    'High': 'high',
    'Very High': 'very-high',
  };
  const colors = {
    'low': '#10b981',
    'medium-low': '#84cc16',
    'medium': '#f59e0b',
    'high': '#f97316',
    'very-high': '#ef4444',
  };
  
  // Generate more properties to ensure we have enough after filtering
  const totalProperties = 50;
  
  for (let i = 0; i < totalProperties; i++) {
    let riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    // Apply risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      riskLevel = riskLevelMap[filters.riskLevel] || riskLevel;
    }
    
    const roi = Math.round((8 + Math.random() * 12) * 10) / 10;
    const price = Math.round((100000 + Math.random() * 400000) / 1000) * 1000;
    const propertyType = ['Residential', 'Commercial', 'Industrial', 'Mixed'][Math.floor(Math.random() * 4)];
    
    // Apply ROI filter
    if (filters.minROI && roi < filters.minROI) continue;
    if (filters.maxROI && roi > filters.maxROI) continue;
    
    // Apply price filter
    if (filters.minPrice && price < filters.minPrice) continue;
    if (filters.maxPrice && price > filters.maxPrice) continue;
    
    // Apply property type filter
    if (filters.propertyType && filters.propertyType !== 'All' && propertyType !== filters.propertyType) {
      continue;
    }
    
    properties.push({
      id: i + 1,
      name: `Property ${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
      riskScore: riskLevel === 'low' ? 0.1 + Math.random() * 0.2 :
                 riskLevel === 'medium-low' ? 0.3 + Math.random() * 0.2 :
                 riskLevel === 'medium' ? 0.5 + Math.random() * 0.2 :
                 riskLevel === 'high' ? 0.7 + Math.random() * 0.2 :
                 0.85 + Math.random() * 0.15,
      riskLevel,
      color: colors[riskLevel],
      roi,
      price,
      propertyType,
    });
  }
  
  // Limit to 25 for display (5x5 grid)
  return properties.slice(0, 25);
};

// Generate investor cluster data
const generateInvestorClusters = (filters = {}) => {
  const baseClusters = [
    { name: 'Whale Investors', value: 15, color: '#FF7A00', avgInvestment: 500000 },
    { name: 'Conservative', value: 28, color: '#10b981', avgInvestment: 75000 },
    { name: 'Aggressive', value: 22, color: '#ef4444', avgInvestment: 150000 },
    { name: 'Regular', value: 25, color: '#3b82f6', avgInvestment: 50000 },
    { name: 'New Investors', value: 10, color: '#8b5cf6', avgInvestment: 25000 },
  ];
  
  // Adjust values based on filters (simulate filter impact)
  return baseClusters.map(cluster => {
    let adjustedValue = cluster.value;
    
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      if (filters.riskLevel === 'Low' && cluster.name === 'Conservative') {
        adjustedValue *= 1.2;
      } else if (filters.riskLevel === 'High' && cluster.name === 'Aggressive') {
        adjustedValue *= 1.2;
      }
    }
    
    return {
      ...cluster,
      value: Math.round(adjustedValue * 10) / 10,
    };
  });
};

// Generate fraud alerts
const generateFraudAlerts = () => {
  return [
    {
      id: 1,
      type: 'suspicious_activity',
      severity: 'high',
      title: 'Unusual Transaction Pattern Detected',
      description: 'Multiple rapid transactions from single address detected. Pattern matches known fraud signatures.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      confidence: 0.92,
    },
    {
      id: 2,
      type: 'kyc_mismatch',
      severity: 'medium',
      title: 'KYC Document Verification Issue',
      description: 'Document authenticity score below threshold. Manual review recommended.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      confidence: 0.78,
    },
    {
      id: 3,
      type: 'behavioral_anomaly',
      severity: 'low',
      title: 'Behavioral Pattern Deviation',
      description: 'User behavior deviates from cluster profile. Monitoring recommended.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      confidence: 0.65,
    },
  ];
};

// Generate behavioral predictions
const generateBehavioralPredictions = () => {
  return [
    {
      id: 1,
      type: 'investment_likelihood',
      title: 'High Investment Probability',
      description: 'User profile indicates 87% probability of investment within 7 days based on viewing patterns.',
      confidence: 0.87,
      timeframe: '7 days',
    },
    {
      id: 2,
      type: 'churn_risk',
      title: 'Low Churn Risk',
      description: 'User engagement metrics suggest low churn probability (12%) over next 30 days.',
      confidence: 0.88,
      timeframe: '30 days',
    },
    {
      id: 3,
      type: 'preference_shift',
      title: 'Preference Shift Detected',
      description: 'ML model detects shift toward commercial properties. Recommendation engine updated.',
      confidence: 0.73,
      timeframe: '14 days',
    },
  ];
};

// Generate ML insights
const generateInsights = () => {
  return [
    {
      id: 1,
      icon: 'trending',
      title: 'Market Momentum Building',
      text: 'Property demand forecast shows 23% increase over next quarter. Token price expected to rise accordingly.',
      category: 'market',
    },
    {
      id: 2,
      icon: 'risk',
      title: 'Risk Diversification Opportunity',
      text: 'Portfolio analysis suggests adding 2-3 low-risk properties to optimize risk-return ratio.',
      category: 'portfolio',
    },
    {
      id: 3,
      icon: 'roi',
      title: 'ROI Optimization Alert',
      text: 'Three properties in your watchlist show predicted ROI above 18%. Consider early investment.',
      category: 'investment',
    },
    {
      id: 4,
      icon: 'cluster',
      title: 'Investor Behavior Shift',
      text: 'Whale investor activity increased 34% this week. Market sentiment turning bullish.',
      category: 'sentiment',
    },
  ];
};

// Main ML Data Export - Functions that accept filters
export const getMLData = (filters = {}) => {
  const timeRange = filters.timeRange || 30;
  
  // Calculate filtered metrics based on filters
  let filteredTotalProperties = 247;
  let filteredAvgROI = 14.8;
  let filteredAvgPrice = 625000;
  let filteredGrowthRate = 12.5;
  
  // Adjust metrics based on filters
  if (filters.propertyType && filters.propertyType !== 'All') {
    filteredTotalProperties = Math.floor(filteredTotalProperties * 0.6);
    filteredGrowthRate *= 1.1;
  }
  
  if (filters.riskLevel && filters.riskLevel !== 'All') {
    if (filters.riskLevel === 'Low' || filters.riskLevel === 'Medium-Low') {
      filteredAvgROI = 10.5;
      filteredGrowthRate *= 0.9;
    } else if (filters.riskLevel === 'High' || filters.riskLevel === 'Very High') {
      filteredAvgROI = 18.2;
      filteredGrowthRate *= 1.2;
    }
  }
  
  if (filters.minROI || filters.maxROI) {
    const minROI = filters.minROI || 0;
    const maxROI = filters.maxROI || 25;
    filteredAvgROI = (minROI + maxROI) / 2;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    const minPrice = filters.minPrice || 0;
    const maxPrice = filters.maxPrice || 5000000;
    filteredAvgPrice = (minPrice + maxPrice) / 2;
    filteredTotalProperties = Math.floor(filteredTotalProperties * 0.7);
  }
  
  return {
    // Property Overview Metrics (filtered)
    propertyOverview: {
      totalProperties: filteredTotalProperties,
      activeListings: Math.floor(filteredTotalProperties * 0.75),
      totalValue: filteredTotalProperties * filteredAvgPrice,
      avgROI: filteredAvgROI,
      avgPrice: filteredAvgPrice,
      growthRate: filteredGrowthRate,
    },
    
    // User Overview Metrics
    userOverview: {
      totalUsers: 3421,
      activeInvestors: 2156,
      totalInvestments: 87500000,
      avgInvestment: 40500,
      newUsersThisMonth: 234,
      retentionRate: 87.3,
    },
    
    // Growth Forecast (filtered)
    growthCurve: generateGrowthCurve(250, timeRange, filters),
    
    // Token Trend (filtered)
    tokenTrendCurve: generateTokenTrendCurve(250, timeRange, filters),
    
    // Risk Heatmap (filtered)
    riskHeatmap: generateRiskHeatmap(filters),
    
    // Investor Segmentation (filtered)
    investorClusters: generateInvestorClusters(filters),
    
    // Predicted ROI
    predictedROI: 16.4,
    
    // Demand Forecast
    demandForecast: {
      current: 0.72,
      predicted: 0.89,
      trend: 'increasing',
      confidence: 0.85,
    },
    
    // Risk Score
    riskScore: 0.34,
    
    // Fraud Alerts
    fraudAlerts: generateFraudAlerts(),
    
    // Behavioral Predictions
    behavioralPredictions: generateBehavioralPredictions(),
    
    // ML Insights
    insights: generateInsights(),
  };
};

// Default export for backward compatibility
export const mlData = getMLData();

export default mlData;

