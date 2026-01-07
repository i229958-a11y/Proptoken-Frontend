import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { 
  Building2, Users, AlertCircle, Zap, Target, 
  TrendingUp, Shield, Lock, Wallet
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, 
  Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useStore } from '../store/useStore';
import { getMLData } from '../data/mlData';
import { linearRegressionModel } from '../ml/linearRegressionModel';
import { xgboostModel } from '../ml/xgboostModel';
import { sampleProperties } from '../data/properties';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatCard from '../components/analytics/StatCard';
import LineChartBox from '../components/analytics/LineChartBox';
import PieChartBox from '../components/analytics/PieChartBox';
import HeatmapBox from '../components/analytics/HeatmapBox';
import InsightCard from '../components/analytics/InsightCard';

const MLAnalytics = () => {
  const { isConnected, kycStatus } = useStore();
  const isKYCVerified = kycStatus === 'approved';
  
  // Filter state
  const [filters, setFilters] = useState({
    timeRange: 30,
    propertyType: 'All',
    riskLevel: 'All',
    minROI: null,
    maxROI: null,
    minPrice: null,
    maxPrice: null,
  });
  
  // Get filtered data
  const filteredData = useMemo(() => getMLData(filters), [filters]);

  // Filter properties based on filters
  const filteredProperties = useMemo(() => {
    return sampleProperties.filter(property => {
      // Property Type filter
      if (filters.propertyType && filters.propertyType !== 'All') {
        const propType = property.type === 'residential' ? 'Residential' : 
                        property.type === 'commercial' ? 'Commercial' : 
                        property.type === 'industrial' ? 'Industrial' : 'Mixed';
        if (propType !== filters.propertyType) return false;
      }
      
      // ROI filters
      if (filters.minROI && property.roi < filters.minROI) return false;
      if (filters.maxROI && property.roi > filters.maxROI) return false;
      
      // Price filters
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      
      // Risk Level filter (calculate risk level)
      if (filters.riskLevel && filters.riskLevel !== 'All') {
        const riskMap = {
          'Low': 'low',
          'Medium-Low': 'medium-low',
          'Medium': 'medium',
          'High': 'high',
          'Very High': 'very-high'
        };
        // Simple risk calculation based on ROI and price
        let riskLevel = 'medium';
        if (property.roi > 18 || property.price > 3000000) riskLevel = 'high';
        else if (property.roi < 10 && property.price < 1000000) riskLevel = 'low';
        
        if (riskMap[filters.riskLevel] !== riskLevel) return false;
      }
      
      return true;
    });
  }, [filters, sampleProperties]);

  // ML Model Predictions with Graph Data - Now uses filtered properties
  const mlPredictions = useMemo(() => {
    // Determine which properties to use
    const propertiesToUse = filteredProperties.length > 0 ? filteredProperties : sampleProperties;
    if (propertiesToUse.length === 0) return null;
    
    // Use average property for more accurate predictions based on filters
    // Adjust based on filters to ensure predictions change
    let basePrice = propertiesToUse.reduce((sum, p) => sum + p.price, 0) / propertiesToUse.length;
    let baseROI = propertiesToUse.reduce((sum, p) => sum + p.roi, 0) / propertiesToUse.length;
    
    // Adjust based on ROI filters
    if (filters.minROI && filters.maxROI) {
      baseROI = (filters.minROI + filters.maxROI) / 2;
    } else if (filters.minROI) {
      baseROI = filters.minROI + 2;
    } else if (filters.maxROI) {
      baseROI = filters.maxROI - 2;
    }
    
    // Adjust based on price filters
    if (filters.minPrice && filters.maxPrice) {
      basePrice = (filters.minPrice + filters.maxPrice) / 2;
    } else if (filters.minPrice) {
      basePrice = filters.minPrice * 1.2;
    } else if (filters.maxPrice) {
      basePrice = filters.maxPrice * 0.8;
    }
    
    const avgProperty = {
      price: Math.round(basePrice),
      roi: parseFloat(baseROI.toFixed(2)),
      tokensTotal: Math.round(propertiesToUse.reduce((sum, p) => sum + (p.tokensTotal || 5000), 0) / propertiesToUse.length),
      location: propertiesToUse[0]?.location || 'Lahore, Pakistan',
      type: filters.propertyType && filters.propertyType !== 'All' 
        ? filters.propertyType.toLowerCase() 
        : (propertiesToUse[0]?.type || 'residential'),
      age: 5
    };
    
    // Create a filter hash to ensure different training data for different filters
    const filterHash = JSON.stringify(filters);
    const filterSeed = filterHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Prepare training data from filtered properties (add futurePrice for training)
    // Use filtered properties as primary training data - this ensures models learn from filtered data
    let trainingData = propertiesToUse.map((prop, idx) => {
      // Use filter-based seed to make futurePrice deterministic but different per filter
      const seedValue = ((filterSeed + idx * 17) % 100) / 100;
      return {
        ...prop,
        futurePrice: prop.price * (1 + (prop.roi || 12) / 100 + seedValue * 0.15 - 0.075)
      };
    });
    
    // Convert propertyType filter to match model expectations
    const filterForModel = {
      ...filters,
      propertyType: filters.propertyType === 'Residential' ? 'residential' :
                   filters.propertyType === 'Commercial' ? 'commercial' :
                   filters.propertyType === 'Industrial' ? 'industrial' :
                   filters.propertyType === 'Mixed' ? 'mixed' : filters.propertyType
    };
    
    // Always supplement with filtered synthetic data to ensure enough training data
    // This ensures models train on data that matches the filters
    const syntheticData = linearRegressionModel.generateSyntheticData(filterForModel);
    const neededSynthetic = Math.max(100 - trainingData.length, 50);
    trainingData = [...trainingData, ...syntheticData.slice(0, neededSynthetic)];
    
    // Linear Regression Prediction - Train on filtered properties
    const lrPrediction = linearRegressionModel.predictPropertyPrice(avgProperty, trainingData);
    
    // XGBoost Prediction - Train on filtered properties (use same training data)
    const xgbPrediction = xgboostModel.predictPropertyPrice(avgProperty, trainingData);
    
    // Prepare graph data
    const trainingCostData = lrPrediction.modelMetrics?.costs?.map((cost, index) => ({
      iteration: index + 1,
      cost: cost.toFixed(4),
      costValue: parseFloat(cost.toFixed(4))
    })) || [];
    
    const featureImportanceData = xgbPrediction.featureImportance?.map((importance, index) => ({
      name: ['Price', 'ROI', 'Tokens', 'Location', 'Type', 'Age'][index],
      importance: (importance * 100).toFixed(1),
      value: parseFloat((importance * 100).toFixed(1))
    })) || [];
    
    const modelComparisonData = [
      {
        metric: 'R² Score',
        'Linear Regression': (lrPrediction.r2Score * 100).toFixed(1),
        'XGBoost': (xgbPrediction.r2Score * 100).toFixed(1),
        lrValue: parseFloat((lrPrediction.r2Score * 100).toFixed(1)),
        xgbValue: parseFloat((xgbPrediction.r2Score * 100).toFixed(1))
      },
      {
        metric: 'Confidence',
        'Linear Regression': (lrPrediction.confidence * 100).toFixed(1),
        'XGBoost': (xgbPrediction.confidence * 100).toFixed(1),
        lrValue: parseFloat((lrPrediction.confidence * 100).toFixed(1)),
        xgbValue: parseFloat((xgbPrediction.confidence * 100).toFixed(1))
      },
      {
        metric: 'Growth %',
        'Linear Regression': lrPrediction.growth.toFixed(2),
        'XGBoost': xgbPrediction.growth.toFixed(2),
        lrValue: parseFloat(lrPrediction.growth.toFixed(2)),
        xgbValue: parseFloat(xgbPrediction.growth.toFixed(2))
      }
    ];
    
    const predictionComparisonData = [
      {
        model: 'Current Price',
        value: avgProperty.price || 1000000
      },
      {
        model: 'Linear Regression',
        value: lrPrediction.predictedPrice
      },
      {
        model: 'XGBoost',
        value: xgbPrediction.predictedPrice
      }
    ];
    
    return {
      linearRegression: lrPrediction,
      xgboost: xgbPrediction,
      sampleProperty: avgProperty,
      filteredCount: filteredProperties.length,
      totalCount: sampleProperties.length,
      graphs: {
        trainingCost: trainingCostData,
        featureImportance: featureImportanceData,
        modelComparison: modelComparisonData,
        predictionComparison: predictionComparisonData
      }
    };
  }, [filteredProperties, sampleProperties]);
  
  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      timeRange: 30,
      propertyType: 'All',
      riskLevel: 'All',
      minROI: null,
      maxROI: null,
      minPrice: null,
      maxPrice: null,
    });
  };

  // If wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-md w-full mx-4"
        >
          <div className="p-4 bg-[#FF7A00]/10 rounded-2xl inline-block mb-6">
            <Wallet className="text-[#FF7A00] mx-auto" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-gray-600 mb-6">
            Connect your wallet to unlock ML Analytics.
          </p>
        </motion.div>
      </div>
    );
  }

  // If KYC not verified
  if (!isKYCVerified) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnalyticsHeader />
          
          {/* Blurred Content with Overlay */}
          <div className="relative">
            <div className="blur-sm pointer-events-none">
              {/* Row 1 - Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard
                  icon={Building2}
                  title="Property Overview Metrics"
                  value={`${mlData.propertyOverview.totalProperties.toLocaleString()}`}
                  caption={`${mlData.propertyOverview.activeListings} active listings`}
                  trend={mlData.propertyOverview.growthRate}
                  delay={0.1}
                />
                <StatCard
                  icon={Users}
                  title="User Overview Metrics"
                  value={`${mlData.userOverview.totalUsers.toLocaleString()}`}
                  caption={`${mlData.userOverview.activeInvestors} active investors`}
                  trend={mlData.userOverview.retentionRate}
                  delay={0.2}
                />
              </div>
            </div>
            
            {/* KYC Banner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-[#FF7A00] max-w-2xl mx-4"
              >
                <div className="p-4 bg-[#FF7A00]/10 rounded-2xl inline-block mb-6">
                  <Shield className="text-[#FF7A00] mx-auto" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">KYC Verification Required</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Your KYC is under review. Full AI insights will unlock once verified.
                </p>
          </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full access - show all content
  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1️⃣ Header Section */}
        <AnalyticsHeader />

        {/* Filters Section */}
        <AnalyticsFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* 2️⃣ Row 1 — Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={Building2}
            title="Property Overview Metrics"
            value={`${filteredData.propertyOverview.totalProperties.toLocaleString()}`}
            caption={`${filteredData.propertyOverview.activeListings} active listings • $${(filteredData.propertyOverview.totalValue / 1000000).toFixed(1)}M total value`}
            trend={filteredData.propertyOverview.growthRate}
            delay={0.1}
          />
          <StatCard
            icon={Users}
            title="User Overview Metrics"
            value={`${filteredData.userOverview.totalUsers.toLocaleString()}`}
            caption={`${filteredData.userOverview.activeInvestors} active investors • ${filteredData.userOverview.retentionRate}% retention`}
            trend={filteredData.userOverview.retentionRate}
            delay={0.2}
                  />
                </div>

        {/* 3️⃣ Row 2 — Property Growth Forecast */}
        <div className="mb-8">
          <LineChartBox
            title="Property Growth Forecast"
            data={filteredData.growthCurve}
            dataKey="value"
            color="#FF7A00"
            showArea={true}
            delay={0.3}
                  />
                </div>

        {/* 4️⃣ Row 3 — Dual Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HeatmapBox
            title="Property Risk Heatmap"
            data={filteredData.riskHeatmap}
            delay={0.4}
          />
          <LineChartBox
            title="Token Trend Forecast"
            data={filteredData.tokenTrendCurve}
            dataKey="price"
            color="#FF7A00"
            delay={0.5}
                  />
                </div>

        {/* 5️⃣ Row 4 — Investor Segmentation */}
        <div className="mb-8">
          <PieChartBox
            title="Investor Segmentation"
            data={filteredData.investorClusters}
            delay={0.6}
                  />
                </div>

        {/* 6️⃣ Row 5 — ML Alerts & Predictions */}
        <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
                <AlertCircle className="text-[#FF7A00]" size={24} />
                </div>
              <span>ML Alerts & Predictions</span>
            </h2>
              </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Fraud Detection Alerts */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Shield className="text-red-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Fraud Detection Alerts</h3>
              </div>
              <div className="space-y-4">
                {filteredData.fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.severity}
                    </span>
                      </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            {/* Behavioral Predictions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="text-blue-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Behavioral Predictions</h3>
              </div>
              <div className="space-y-4">
                {filteredData.behavioralPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{prediction.title}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {(prediction.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                    <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
                    <div className="text-xs text-gray-500">
                      Timeframe: {prediction.timeframe}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </div>

        {/* 7️⃣ Row 6 — ML Models: Linear Regression & XGBoost */}
        {mlPredictions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
                <Target className="text-[#FF7A00]" size={24} />
              </div>
              <span>ML Models: Linear Regression & XGBoost</span>
              {mlPredictions && (
                <div className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {mlPredictions.filteredCount > 0 
                    ? `${mlPredictions.filteredCount}/${mlPredictions.totalCount} Match`
                    : `All ${mlPredictions.totalCount} Properties`
                  }
                </div>
              )}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Linear Regression Model */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 shadow-xl border-2 border-blue-200"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Linear Regression</h3>
                    <p className="text-sm text-gray-600">Gradient Descent with Feature Scaling</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Current Price</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${mlPredictions.linearRegression.currentPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Predicted Price</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${mlPredictions.linearRegression.predictedPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Growth</span>
                      <span className={`text-lg font-bold ${mlPredictions.linearRegression.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {mlPredictions.linearRegression.growth >= 0 ? '+' : ''}
                        {mlPredictions.linearRegression.growth.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">R² Score</p>
                      <p className="text-xl font-bold text-blue-600">
                        {(mlPredictions.linearRegression.r2Score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Confidence</p>
                      <p className="text-xl font-bold text-blue-600">
                        {(mlPredictions.linearRegression.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-800 mb-2">Model Metrics</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span>Training Iterations:</span>
                        <span className="font-semibold">{mlPredictions.linearRegression.modelMetrics.iterations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Final Cost:</span>
                        <span className="font-semibold">
                          {mlPredictions.linearRegression.modelMetrics.trainingCost.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weights:</span>
                        <span className="font-semibold">{mlPredictions.linearRegression.modelMetrics.weights.length} features</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* XGBoost Model */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 shadow-xl border-2 border-green-200"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">XGBoost</h3>
                    <p className="text-sm text-gray-600">Gradient Boosting with Decision Trees</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border-2 border-green-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Current Price</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${mlPredictions.xgboost.currentPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Predicted Price</span>
                      <span className="text-lg font-bold text-green-600">
                        ${mlPredictions.xgboost.predictedPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Growth</span>
                      <span className={`text-lg font-bold ${mlPredictions.xgboost.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {mlPredictions.xgboost.growth >= 0 ? '+' : ''}
                        {mlPredictions.xgboost.growth.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">R² Score</p>
                      <p className="text-xl font-bold text-green-600">
                        {(mlPredictions.xgboost.r2Score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Confidence</p>
                      <p className="text-xl font-bold text-green-600">
                        {(mlPredictions.xgboost.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-xs font-semibold text-green-800 mb-2">Model Metrics</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span>Number of Trees:</span>
                        <span className="font-semibold">{mlPredictions.xgboost.modelMetrics.nTrees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Learning Rate:</span>
                        <span className="font-semibold">{mlPredictions.xgboost.modelMetrics.learningRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Depth:</span>
                        <span className="font-semibold">{mlPredictions.xgboost.modelMetrics.maxDepth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MSE:</span>
                        <span className="font-semibold">
                          {mlPredictions.xgboost.mse.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-xs font-semibold text-green-800 mb-3">Feature Importance</p>
                    <div className="space-y-2">
                      {['Price', 'ROI', 'Tokens', 'Location', 'Type', 'Age'].map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600 w-20">{feature}</span>
                          <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-500 h-full rounded-full transition-all"
                              style={{ width: `${(mlPredictions.xgboost.featureImportance[idx] || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-12 text-right">
                            {((mlPredictions.xgboost.featureImportance[idx] || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Model Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="bg-gradient-to-r from-purple-50 via-white to-purple-50 rounded-3xl p-6 shadow-lg border-2 border-purple-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="text-purple-600" size={20} />
                <span>Model Comparison</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">Price Difference</p>
                  <p className="text-lg font-bold text-purple-600">
                    ${Math.abs(mlPredictions.linearRegression.predictedPrice - mlPredictions.xgboost.predictedPrice).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">Best R² Score</p>
                  <p className="text-lg font-bold text-purple-600">
                    {mlPredictions.linearRegression.r2Score > mlPredictions.xgboost.r2Score ? 'Linear Regression' : 'XGBoost'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">Average Confidence</p>
                  <p className="text-lg font-bold text-purple-600">
                    {(((mlPredictions.linearRegression.confidence + mlPredictions.xgboost.confidence) / 2) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Linear Regression Training Cost Curve */}
              {mlPredictions.graphs.trainingCost.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    <span>Linear Regression Training Cost</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mlPredictions.graphs.trainingCost}>
                      <defs>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="iteration" 
                        stroke="#6b7280"
                        label={{ value: 'Iteration', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #3b82f6',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [value, 'Cost']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="costValue" 
                        stroke="#3b82f6" 
                        fill="url(#costGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* XGBoost Feature Importance */}
              {mlPredictions.graphs.featureImportance.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Zap className="text-green-600" size={20} />
                    <span>XGBoost Feature Importance</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mlPredictions.graphs.featureImportance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#6b7280"
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #10b981',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [`${value}%`, 'Importance']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#10b981"
                        radius={[0, 8, 8, 0]}
                      >
                        {mlPredictions.graphs.featureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 20}, 70%, 50%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Model Comparison Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="text-purple-600" size={20} />
                  <span>Model Performance Comparison</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mlPredictions.graphs.modelComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="metric" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #a855f7',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="lrValue" fill="#3b82f6" name="Linear Regression" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="xgbValue" fill="#10b981" name="XGBoost" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Prediction Comparison Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.7 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-orange-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="text-orange-600" size={20} />
                  <span>Price Predictions Comparison</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mlPredictions.graphs.predictionComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="model" stroke="#6b7280" />
                    <YAxis 
                      stroke="#6b7280"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f97316',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#f97316"
                      radius={[8, 8, 0, 0]}
                    >
                      {mlPredictions.graphs.predictionComparison.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#6b7280' : index === 1 ? '#3b82f6' : '#10b981'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* 8️⃣ Row 7 — Insight Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
              <Zap className="text-[#FF7A00]" size={24} />
            </div>
            <span>ML Insights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredData.insights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MLAnalytics;
