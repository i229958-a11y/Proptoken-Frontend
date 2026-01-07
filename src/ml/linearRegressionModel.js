/**
 * Linear Regression Model
 * Proper implementation with gradient descent and feature scaling
 */

export const linearRegressionModel = {
  /**
   * Train linear regression model
   * @param {Array} X - Features array (2D array)
   * @param {Array} y - Target values
   * @param {Object} options - Training options
   * @returns {Object} - Trained model with weights
   */
  train: (X, y, options = {}) => {
    const {
      learningRate = 0.01,
      iterations = 1000,
      regularization = 0.01
    } = options;

    // Feature scaling (normalization)
    const normalize = (data) => {
      const means = data[0].map((_, colIndex) => {
        return data.reduce((sum, row) => sum + row[colIndex], 0) / data.length;
      });
      const stds = data[0].map((_, colIndex) => {
        const mean = means[colIndex];
        const variance = data.reduce((sum, row) => {
          return sum + Math.pow(row[colIndex] - mean, 2);
        }, 0) / data.length;
        return Math.sqrt(variance) || 1;
      });
      
      return {
        normalized: data.map(row => 
          row.map((val, idx) => (val - means[idx]) / stds[idx])
        ),
        means,
        stds
      };
    };

    const { normalized: XNorm, means, stds } = normalize(X);
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    const yStd = Math.sqrt(
      y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / y.length
    ) || 1;

    // Initialize weights (bias + features)
    const m = XNorm[0].length;
    let weights = new Array(m + 1).fill(0); // +1 for bias term

    // Gradient descent
    const costs = [];
    for (let iter = 0; iter < iterations; iter++) {
      let cost = 0;
      const gradients = new Array(m + 1).fill(0);

      // Calculate predictions and gradients
      for (let i = 0; i < XNorm.length; i++) {
        // Prediction: h(x) = w0 + w1*x1 + w2*x2 + ...
        let prediction = weights[0]; // bias
        for (let j = 0; j < m; j++) {
          prediction += weights[j + 1] * XNorm[i][j];
        }

        const error = prediction - ((y[i] - yMean) / yStd);
        cost += error * error;

        // Update gradients
        gradients[0] += error; // bias gradient
        for (let j = 0; j < m; j++) {
          gradients[j + 1] += error * XNorm[i][j];
        }
      }

      // Average gradients and add regularization
      for (let j = 0; j <= m; j++) {
        gradients[j] = gradients[j] / XNorm.length;
        if (j > 0) {
          gradients[j] += regularization * weights[j]; // L2 regularization
        }
      }

      // Update weights
      for (let j = 0; j <= m; j++) {
        weights[j] -= learningRate * gradients[j];
      }

      costs.push(cost / XNorm.length);
    }

    return {
      weights,
      means,
      stds,
      yMean,
      yStd,
      costs,
      r2Score: linearRegressionModel.calculateR2(X, y, weights, means, stds, yMean, yStd)
    };
  },

  /**
   * Predict using trained model
   * @param {Array} X - Features (can be single sample or array of samples)
   * @param {Object} model - Trained model
   * @returns {Array|Number} - Predictions
   */
  predict: (X, model) => {
    const { weights, means, stds, yMean, yStd } = model;
    const isSingle = !Array.isArray(X[0]);
    const XArray = isSingle ? [X] : X;

    const predictions = XArray.map(sample => {
      // Normalize features
      const normalized = sample.map((val, idx) => 
        (val - means[idx]) / stds[idx]
      );

      // Calculate prediction
      let prediction = weights[0]; // bias
      for (let j = 0; j < normalized.length; j++) {
        prediction += weights[j + 1] * normalized[j];
      }

      // Denormalize
      return prediction * yStd + yMean;
    });

    return isSingle ? predictions[0] : predictions;
  },

  /**
   * Calculate R² score
   */
  calculateR2: (X, y, weights, means, stds, yMean, yStd) => {
    const predictions = linearRegressionModel.predict(X, { weights, means, stds, yMean, yStd });
    const predArray = Array.isArray(predictions) ? predictions : [predictions];
    
    const ssRes = predArray.reduce((sum, pred, i) => {
      return sum + Math.pow(y[i] - pred, 2);
    }, 0);
    
    const ssTot = y.reduce((sum, val) => {
      return sum + Math.pow(val - yMean, 2);
    }, 0);

    return 1 - (ssRes / ssTot);
  },

  /**
   * Predict property price using linear regression
   * @param {Object} property - Property object
   * @param {Array} trainingData - Historical property data for training
   * @returns {Object} - Prediction results
   */
  predictPropertyPrice: (property, trainingData = []) => {
    // Generate synthetic training data if not provided
    const syntheticData = trainingData.length > 0 ? trainingData : linearRegressionModel.generateSyntheticData();
    
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
    const model = linearRegressionModel.train(X, y, {
      learningRate: 0.001,
      iterations: 500,
      regularization: 0.1
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

    const predictedPrice = linearRegressionModel.predict(features, model);

    return {
      predictedPrice: Math.round(predictedPrice),
      currentPrice: property.price || 1000000,
      growth: ((predictedPrice - (property.price || 1000000)) / (property.price || 1000000)) * 100,
      confidence: Math.min(0.95, model.r2Score),
      r2Score: model.r2Score,
      modelMetrics: {
        trainingCost: model.costs[model.costs.length - 1],
        iterations: model.costs.length,
        weights: model.weights,
        costs: model.costs // Include full costs array for graph
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

    for (let i = 0; i < 100; i++) {
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
        futurePrice: basePrice * (1 + roi / 100 + Math.random() * 0.05)
      });
    }

    return data;
  }
};

