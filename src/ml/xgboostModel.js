/**
 * XGBoost Model (Gradient Boosting)
 * Simplified implementation of gradient boosting with decision trees
 */

export const xgboostModel = {
  /**
   * Decision Tree Node
   */
  createNode: (featureIndex, threshold, left, right, value = null) => ({
    featureIndex,
    threshold,
    left,
    right,
    value,
    isLeaf: value !== null
  }),

  /**
   * Build a decision tree (simplified)
   */
  buildTree: (X, y, depth = 0, maxDepth = 5) => {
    if (depth >= maxDepth || X.length <= 2) {
      // Leaf node - return average value
      const avgValue = y.reduce((sum, val) => sum + val, 0) / y.length;
      return xgboostModel.createNode(null, null, null, null, avgValue);
    }

    // Find best split
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestGain = -Infinity;
    const nFeatures = X[0].length;

    for (let feature = 0; feature < nFeatures; feature++) {
      const values = X.map(row => row[feature]).sort((a, b) => a - b);
      
      // Try different thresholds
      for (let i = 1; i < values.length; i++) {
        const threshold = (values[i - 1] + values[i]) / 2;
        
        // Split data
        const leftIndices = [];
        const rightIndices = [];
        X.forEach((row, idx) => {
          if (row[feature] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        });

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        // Calculate gain (variance reduction)
        const leftY = leftIndices.map(idx => y[idx]);
        const rightY = rightIndices.map(idx => y[idx]);
        
        const parentVariance = xgboostModel._calculateVariance(y);
        const leftVariance = xgboostModel._calculateVariance(leftY);
        const rightVariance = xgboostModel._calculateVariance(rightY);
        
        const gain = parentVariance - 
          (leftY.length / y.length) * leftVariance - 
          (rightY.length / y.length) * rightVariance;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }

    if (bestGain <= 0) {
      const avgValue = y.reduce((sum, val) => sum + val, 0) / y.length;
      return xgboostModel.createNode(null, null, null, null, avgValue);
    }

    // Split data
    const leftIndices = [];
    const rightIndices = [];
    X.forEach((row, idx) => {
      if (row[bestFeature] <= bestThreshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    });

    const leftX = leftIndices.map(idx => X[idx]);
    const leftY = leftIndices.map(idx => y[idx]);
    const rightX = rightIndices.map(idx => X[idx]);
    const rightY = rightIndices.map(idx => y[idx]);

    // Recursively build children
    const left = xgboostModel.buildTree(leftX, leftY, depth + 1, maxDepth);
    const right = xgboostModel.buildTree(rightX, rightY, depth + 1, maxDepth);

    return xgboostModel.createNode(bestFeature, bestThreshold, left, right);
  },

  /**
   * Calculate variance
   */
  calculateVariance: (values) => {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  },

  /**
   * Calculate variance (helper for buildTree)
   */
  _calculateVariance: (values) => {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  },

  /**
   * Predict using a single tree
   */
  predictTree: (tree, sample) => {
    if (tree.isLeaf) {
      return tree.value;
    }

    if (sample[tree.featureIndex] <= tree.threshold) {
      return xgboostModel.predictTree(tree.left, sample);
    } else {
      return xgboostModel.predictTree(tree.right, sample);
    }
  },

  /**
   * Train XGBoost model
   * @param {Array} X - Features
   * @param {Array} y - Targets
   * @param {Object} options - Training options
   * @returns {Object} - Trained model
   */
  train: (X, y, options = {}) => {
    const {
      nEstimators = 100,
      learningRate = 0.1,
      maxDepth = 5,
      subsample = 0.8
    } = options;

    const trees = [];
    let predictions = new Array(X.length).fill(0);
    const residuals = [...y];

    for (let i = 0; i < nEstimators; i++) {
      // Create subsample
      const subsampleIndices = [];
      const usedIndices = new Set();
      const nSamples = Math.floor(X.length * subsample);
      
      while (subsampleIndices.length < nSamples) {
        const idx = Math.floor(Math.random() * X.length);
        if (!usedIndices.has(idx)) {
          subsampleIndices.push(idx);
          usedIndices.add(idx);
        }
      }

      const subsampleX = subsampleIndices.map(idx => X[idx]);
      const subsampleY = subsampleIndices.map(idx => residuals[idx]);

      // Build tree on residuals
      const tree = xgboostModel.buildTree(subsampleX, subsampleY, 0, maxDepth);
      trees.push(tree);

      // Update predictions
      for (let j = 0; j < X.length; j++) {
        const treePred = xgboostModel.predictTree(tree, X[j]);
        predictions[j] += learningRate * treePred;
        residuals[j] = y[j] - predictions[j];
      }
    }

    return {
      trees,
      learningRate,
      nEstimators,
      featureImportance: xgboostModel.calculateFeatureImportance(trees, X[0].length)
    };
  },

  /**
   * Calculate feature importance
   */
  calculateFeatureImportance: (trees, nFeatures) => {
    const importance = new Array(nFeatures).fill(0);
    
    trees.forEach(tree => {
      xgboostModel.traverseTree(tree, importance);
    });

    // Normalize
    const total = importance.reduce((sum, val) => sum + val, 0);
    return importance.map(val => total > 0 ? val / total : 0);
  },

  /**
   * Traverse tree to calculate importance
   */
  traverseTree: (node, importance) => {
    if (node.isLeaf) return;
    
    if (node.featureIndex !== null) {
      importance[node.featureIndex] += 1;
    }
    
    if (node.left) xgboostModel.traverseTree(node.left, importance);
    if (node.right) xgboostModel.traverseTree(node.right, importance);
  },

  /**
   * Predict using XGBoost model
   * @param {Array} X - Features (single or multiple)
   * @param {Object} model - Trained model
   * @returns {Array|Number} - Predictions
   */
  predict: (X, model) => {
    const { trees, learningRate } = model;
    const isSingle = !Array.isArray(X[0]);
    const XArray = isSingle ? [X] : X;

    const predictions = XArray.map(sample => {
      let prediction = 0;
      trees.forEach(tree => {
        prediction += learningRate * xgboostModel.predictTree(tree, sample);
      });
      return prediction;
    });

    return isSingle ? predictions[0] : predictions;
  },

  /**
   * Predict property price using XGBoost
   * @param {Object} property - Property object
   * @param {Array} trainingData - Historical property data
   * @returns {Object} - Prediction results
   */
  predictPropertyPrice: (property, trainingData = []) => {
    // Generate synthetic training data if not provided
    const syntheticData = trainingData.length > 0 ? trainingData : xgboostModel.generateSyntheticData();
    
    // Extract features
    const X = syntheticData.map(prop => [
      prop.price || 1000000,
      prop.roi || 12,
      prop.tokensTotal || 5000,
      prop.location?.includes('DHA') ? 1 : 0,
      prop.type === 'commercial' ? 1 : 0,
      prop.age || 5
    ]);
    
    const y = syntheticData.map(prop => prop.futurePrice || prop.price * 1.05);

    // Train model
    const model = xgboostModel.train(X, y, {
      nEstimators: 50,
      learningRate: 0.1,
      maxDepth: 4,
      subsample: 0.8
    });

    // Predict for current property
    const features = [
      property.price || 1000000,
      property.roi || 12,
      property.tokensTotal || 5000,
      property.location?.includes('DHA') ? 1 : 0,
      property.type === 'commercial' ? 1 : 0,
      property.age || 5
    ];

    const predictedPrice = xgboostModel.predict(features, model);

    // Calculate accuracy metrics
    const trainPredictions = xgboostModel.predict(X, model);
    const mse = trainPredictions.reduce((sum, pred, i) => {
      return sum + Math.pow(pred - y[i], 2);
    }, 0) / y.length;
    
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const r2Score = 1 - (mse * y.length / ssTot);

    return {
      predictedPrice: Math.round(predictedPrice),
      currentPrice: property.price || 1000000,
      growth: ((predictedPrice - (property.price || 1000000)) / (property.price || 1000000)) * 100,
      confidence: Math.min(0.95, Math.max(0.7, r2Score)),
      r2Score: r2Score,
      mse: mse,
      featureImportance: model.featureImportance,
      modelMetrics: {
        nTrees: model.nEstimators,
        learningRate: model.learningRate,
        maxDepth: 4
      }
    };
  },

  /**
   * Generate synthetic training data
   * @param {Object} filters - Optional filters to adjust data generation
   */
  generateSyntheticData: (filters = {}) => {
    const data = [];
    const locations = ['DHA', 'Gulberg', 'Bahria', 'Model Town'];
    const types = ['residential', 'commercial'];
    
    // Adjust data range based on filters
    let minPrice = 500000;
    let maxPrice = 2500000;
    let minROI = 8;
    let maxROI = 18;
    
    if (filters.minPrice) minPrice = filters.minPrice;
    if (filters.maxPrice) maxPrice = filters.maxPrice;
    if (filters.minROI) minROI = filters.minROI;
    if (filters.maxROI) maxROI = filters.maxROI;

    for (let i = 0; i < 200; i++) {
      const basePrice = minPrice + Math.random() * (maxPrice - minPrice);
      const roi = minROI + Math.random() * (maxROI - minROI);
      const location = locations[Math.floor(Math.random() * locations.length)];
      const type = filters.propertyType && filters.propertyType !== 'All' 
        ? filters.propertyType.toLowerCase() 
        : types[Math.floor(Math.random() * types.length)];
      
      data.push({
        price: basePrice,
        roi: roi,
        tokensTotal: 1000 + Math.random() * 10000,
        location: `${location}, Lahore`,
        type: type,
        age: Math.random() * 20,
        futurePrice: basePrice * (1 + roi / 100 + (Math.random() - 0.5) * 0.1)
      });
    }

    return data;
  }
};

