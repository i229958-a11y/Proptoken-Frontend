/**
 * ML System Orchestrator
 * Central hub for all machine learning models
 */

import { propertyPriceModel } from './propertyPriceModel';
import { roiForecastModel } from './roiForecastModel';
import { demandModel } from './demandModel';
import { riskModel } from './riskModel';
import { investorClusterModel } from './investorClusterModel';
import { investmentProbabilityModel } from './investmentProbabilityModel';
import { fraudDetectionModel } from './fraudDetectionModel';
import { kycValidationModel } from './kycValidationModel';
import { sentimentModel } from './sentimentModel';
import { tokenPriceModel } from './tokenPriceModel';
import { linearRegressionModel } from './linearRegressionModel';
import { xgboostModel } from './xgboostModel';

/**
 * Get comprehensive property analytics
 * @param {Object} property - Property object
 * @param {Array} pastSales - Historical sales data
 * @returns {Object} - Complete property analytics
 */
export const getPropertyAnalytics = (property, pastSales = []) => {
  const pricePrediction = propertyPriceModel.predictPrice(property);
  const roiForecast = roiForecastModel.predictROI(property);
  const roiCurve = roiForecastModel.generateROICurve(property, 12);
  const demandPrediction = demandModel.predictDemand(property, pastSales);
  const demandCurve = demandModel.forecastDemandCurve(property, 12);
  const riskClassification = riskModel.classifyRisk(property);

  return {
    pricePrediction,
    roiForecast,
    roiCurve,
    demandPrediction,
    demandCurve,
    riskClassification,
    overallScore: (
      pricePrediction.confidence * 0.2 +
      roiForecast.confidence * 0.2 +
      demandPrediction.demandScore * 0.2 +
      (1 - riskClassification.riskScore) * 0.2 +
      (property.roi || 12) / 20 * 0.2
    ),
    recommendations: [
      ...riskClassification.recommendations,
      demandPrediction.demandLevel === 'very-high' ? 'High demand - consider investing soon' : null,
      pricePrediction.growth > 10 ? 'Strong price growth potential' : null,
    ].filter(Boolean),
  };
};

/**
 * Get comprehensive user analytics
 * @param {Object} userData - User profile data
 * @param {Array} transactions - User transaction history
 * @returns {Object} - Complete user analytics
 */
export const getUserAnalytics = (userData, transactions = []) => {
  const cluster = investorClusterModel.clusterUser(userData);
  const fraudCheck = fraudDetectionModel.isSuspiciousUser({ transactions });
  const sentiment = userData.recentMessages 
    ? userData.recentMessages.map(msg => sentimentModel.analyzeSentiment(msg.text || ''))
    : [];

  return {
    cluster,
    fraudCheck,
    sentiment: sentiment.length > 0 
      ? {
          overall: sentiment.reduce((sum, s) => sum + s.score, 0) / sentiment.length,
          positive: sentiment.filter(s => s.sentiment === 'positive').length,
          negative: sentiment.filter(s => s.sentiment === 'negative').length,
          neutral: sentiment.filter(s => s.sentiment === 'neutral').length,
          requiresAttention: sentiment.some(s => s.insights.requiresAttention),
        }
      : null,
    investmentBehavior: {
      totalInvestments: userData.investmentCount || 0,
      totalValue: userData.totalInvestment || 0,
      avgInvestmentSize: (userData.totalInvestment || 0) / Math.max(1, userData.investmentCount || 1),
      preferredType: userData.preferredType || 'residential',
      riskTolerance: userData.riskTolerance || 0.5,
    },
    recommendations: [
      cluster.clusterLabel === 'New' ? 'Consider starting with low-risk properties' : null,
      fraudCheck.isSuspicious ? 'Account activity under review' : null,
      userData.riskTolerance > 0.7 ? 'High risk tolerance - consider aggressive investments' : null,
    ].filter(Boolean),
  };
};

/**
 * Get market predictions
 * @param {Array} properties - All properties
 * @param {Object} marketData - Market data
 * @returns {Object} - Market predictions
 */
export const getMarketPredictions = (properties = [], marketData = {}) => {
  const tokenPrice = tokenPriceModel.predictTokenPrice(marketData);
  const tokenTrend = tokenPriceModel.forecastTokenTrend(marketData, 30);
  
  const propertyPredictions = properties.map(prop => ({
    property: prop,
    analytics: getPropertyAnalytics(prop),
  }));

  const topPerformers = [...propertyPredictions]
    .sort((a, b) => b.analytics.overallScore - a.analytics.overallScore)
    .slice(0, 5);

  const highRiskProperties = propertyPredictions
    .filter(p => p.analytics.riskClassification.riskLevel === 'high' || 
                 p.analytics.riskClassification.riskLevel === 'very-high')
    .map(p => p.property);

  return {
    tokenPrice,
    tokenTrend,
    propertyPredictions,
    topPerformers,
    highRiskProperties,
    marketTrend: tokenPrice.trend,
    marketInsights: {
      totalProperties: properties.length,
      avgROI: properties.reduce((sum, p) => sum + (p.roi || 12), 0) / properties.length,
      totalTokens: properties.reduce((sum, p) => sum + (p.tokensTotal || 0), 0),
      availableTokens: properties.reduce((sum, p) => sum + (p.tokensAvailable || 0), 0),
    },
  };
};

/**
 * Get fraud signals
 * @param {Object} transaction - Transaction data
 * @param {Object} userHistory - User transaction history
 * @returns {Object} - Fraud detection results
 */
export const getFraudSignals = (transaction, userHistory = {}) => {
  const transactionRisk = fraudDetectionModel.evaluateTransactionRisk(transaction);
  const userSuspicion = fraudDetectionModel.isSuspiciousUser(userHistory);

  return {
    transactionRisk,
    userSuspicion,
    overallRisk: Math.max(transactionRisk.riskScore, userSuspicion.suspicionScore),
    isHighRisk: transactionRisk.riskScore > 0.7 || userSuspicion.isSuspicious,
    recommendations: [
      ...transactionRisk.recommendations,
      ...(userSuspicion.isSuspicious ? ['User account flagged for review'] : []),
    ],
  };
};

/**
 * Get KYC validation score
 * @param {Object} images - KYC images
 * @returns {Object} - KYC validation results
 */
export const getKYCScore = (images) => {
  return kycValidationModel.validateKYCImages(images);
};

/**
 * Get investment probability for user-property match
 * @param {Object} userProfile - User profile
 * @param {Object} property - Property object
 * @returns {Object} - Investment probability
 */
export const getInvestmentProbability = (userProfile, property) => {
  return investmentProbabilityModel.predictUserPropertyMatch(userProfile, property);
};

/**
 * Get sentiment analysis
 * @param {String} text - Text to analyze
 * @returns {Object} - Sentiment analysis
 */
export const getSentiment = (text) => {
  return sentimentModel.analyzeSentiment(text);
};

// Export all models for direct access if needed
export {
  propertyPriceModel,
  roiForecastModel,
  demandModel,
  riskModel,
  investorClusterModel,
  investmentProbabilityModel,
  fraudDetectionModel,
  kycValidationModel,
  sentimentModel,
  tokenPriceModel,
};


