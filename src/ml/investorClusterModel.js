/**
 * Investor Segmentation Model (K-Means Style)
 * Clusters users by budget, investments, risk behavior, and frequency
 */

export const investorClusterModel = {
  /**
   * Cluster a user based on their profile
   * @param {Object} userData - User profile data
   * @returns {Object} - Cluster assignment and characteristics
   */
  clusterUser: (userData) => {
    // Extract features
    const features = {
      budget: (userData.totalInvestment || 0) / 100000, // Normalized to 100k
      investmentCount: userData.investmentCount || 0,
      avgInvestmentSize: (userData.totalInvestment || 0) / Math.max(1, userData.investmentCount || 1),
      riskTolerance: userData.riskTolerance || 0.5, // 0-1 scale
      investmentFrequency: (userData.investmentCount || 0) / Math.max(1, (userData.accountAge || 365) / 30), // Per month
      preferredType: userData.preferredType === 'commercial' ? 1 : 0,
      avgROI: userData.avgROI || 12,
    };

    // Predefined cluster centroids (K-Means style)
    const clusters = [
      {
        id: 0,
        name: 'Whale Investor',
        label: 'Whale',
        color: '#FF7A00',
        centroid: { budget: 5, investmentCount: 10, avgInvestmentSize: 3, riskTolerance: 0.6, investmentFrequency: 2, preferredType: 0.5, avgROI: 15 },
        description: 'High-value investors with large portfolios'
      },
      {
        id: 1,
        name: 'Conservative Investor',
        label: 'Conservative',
        color: '#10b981',
        centroid: { budget: 1, investmentCount: 3, avgInvestmentSize: 0.5, riskTolerance: 0.2, investmentFrequency: 0.5, preferredType: 0, avgROI: 10 },
        description: 'Low-risk, steady investors'
      },
      {
        id: 2,
        name: 'Aggressive Investor',
        label: 'Aggressive',
        color: '#ef4444',
        centroid: { budget: 2, investmentCount: 8, avgInvestmentSize: 1.5, riskTolerance: 0.9, investmentFrequency: 1.5, preferredType: 0.7, avgROI: 18 },
        description: 'High-risk, high-reward seekers'
      },
      {
        id: 3,
        name: 'Regular Investor',
        label: 'Regular',
        color: '#3b82f6',
        centroid: { budget: 1.5, investmentCount: 5, avgInvestmentSize: 1, riskTolerance: 0.5, investmentFrequency: 1, preferredType: 0.5, avgROI: 12 },
        description: 'Balanced, consistent investors'
      },
      {
        id: 4,
        name: 'New Investor',
        label: 'New',
        color: '#8b5cf6',
        centroid: { budget: 0.5, investmentCount: 1, avgInvestmentSize: 0.3, riskTolerance: 0.4, investmentFrequency: 0.2, preferredType: 0.3, avgROI: 11 },
        description: 'Just starting their investment journey'
      }
    ];

    // Calculate distance to each cluster (Euclidean distance)
    let minDistance = Infinity;
    let assignedCluster = clusters[3]; // Default to Regular

    clusters.forEach(cluster => {
      let distance = 0;
      distance += Math.pow(features.budget - cluster.centroid.budget, 2);
      distance += Math.pow(features.investmentCount - cluster.centroid.investmentCount, 2);
      distance += Math.pow(features.avgInvestmentSize - cluster.centroid.avgInvestmentSize, 2);
      distance += Math.pow(features.riskTolerance - cluster.centroid.riskTolerance, 2);
      distance += Math.pow(features.investmentFrequency - cluster.centroid.investmentFrequency, 2);
      distance += Math.pow(features.preferredType - cluster.centroid.preferredType, 2);
      distance += Math.pow((features.avgROI / 20) - (cluster.centroid.avgROI / 20), 2); // Normalized ROI

      const euclideanDistance = Math.sqrt(distance);

      if (euclideanDistance < minDistance) {
        minDistance = euclideanDistance;
        assignedCluster = cluster;
      }
    });

    // Calculate confidence (inverse of distance, normalized)
    const maxPossibleDistance = 10; // Approximate max
    const confidence = Math.max(0.5, 1 - (minDistance / maxPossibleDistance));

    return {
      clusterId: assignedCluster.id,
      clusterName: assignedCluster.name,
      clusterLabel: assignedCluster.label,
      clusterColor: assignedCluster.color,
      description: assignedCluster.description,
      confidence: parseFloat(confidence.toFixed(3)),
      distance: parseFloat(minDistance.toFixed(3)),
      features: {
        budget: parseFloat(features.budget.toFixed(2)),
        investmentCount: features.investmentCount,
        riskTolerance: parseFloat(features.riskTolerance.toFixed(2)),
        investmentFrequency: parseFloat(features.investmentFrequency.toFixed(2)),
      }
    };
  },

  /**
   * Get cluster label by ID
   */
  getClusterLabel: (clusterId) => {
    const clusters = {
      0: { name: 'Whale Investor', label: 'Whale', color: '#FF7A00' },
      1: { name: 'Conservative Investor', label: 'Conservative', color: '#10b981' },
      2: { name: 'Aggressive Investor', label: 'Aggressive', color: '#ef4444' },
      3: { name: 'Regular Investor', label: 'Regular', color: '#3b82f6' },
      4: { name: 'New Investor', label: 'New', color: '#8b5cf6' },
    };
    return clusters[clusterId] || clusters[3];
  }
};

