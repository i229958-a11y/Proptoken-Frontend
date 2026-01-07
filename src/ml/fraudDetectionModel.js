/**
 * Fraud Detection Model (Anomaly Detection)
 * Uses Isolation Forest style anomaly scoring and deviation detection
 */

export const fraudDetectionModel = {
  /**
   * Evaluate transaction risk
   * @param {Object} transaction - Transaction data
   * @returns {Object} - Risk assessment
   */
  evaluateTransactionRisk: (transaction) => {
    // Anomaly indicators
    const anomalies = {
      amountAnomaly: 0,
      timeAnomaly: 0,
      frequencyAnomaly: 0,
      patternAnomaly: 0,
      velocityAnomaly: 0,
    };

    // Amount anomaly (unusually large transaction)
    const avgAmount = transaction.userAvgAmount || 10000;
    const amountRatio = transaction.amount / avgAmount;
    anomalies.amountAnomaly = amountRatio > 5 ? 0.8 : 
                              amountRatio > 3 ? 0.5 : 
                              amountRatio > 2 ? 0.2 : 0;

    // Time anomaly (unusual time of day)
    const hour = new Date(transaction.timestamp).getHours();
    anomalies.timeAnomaly = (hour >= 2 && hour <= 5) ? 0.4 : 0; // Late night

    // Frequency anomaly (too many transactions in short time)
    const recentTxCount = transaction.recentTxCount || 0;
    anomalies.frequencyAnomaly = recentTxCount > 10 ? 0.9 :
                                 recentTxCount > 5 ? 0.6 :
                                 recentTxCount > 3 ? 0.3 : 0;

    // Pattern anomaly (different from user's usual pattern)
    const patternDeviation = transaction.patternDeviation || 0;
    anomalies.patternAnomaly = patternDeviation > 0.8 ? 0.7 :
                               patternDeviation > 0.5 ? 0.4 : 0;

    // Velocity anomaly (rapid successive transactions)
    const timeSinceLastTx = transaction.timeSinceLastTx || 3600000; // milliseconds
    anomalies.velocityAnomaly = timeSinceLastTx < 60000 ? 0.8 : // Less than 1 minute
                                timeSinceLastTx < 300000 ? 0.5 : // Less than 5 minutes
                                0;

    // Isolation Forest style scoring (higher = more isolated = more suspicious)
    const isolationScore = (
      anomalies.amountAnomaly * 0.25 +
      anomalies.timeAnomaly * 0.10 +
      anomalies.frequencyAnomaly * 0.25 +
      anomalies.patternAnomaly * 0.20 +
      anomalies.velocityAnomaly * 0.20
    );

    // Risk level classification
    let riskLevel, riskLabel, riskColor;
    if (isolationScore < 0.3) {
      riskLevel = 'low';
      riskLabel = 'Low Risk';
      riskColor = '#10b981';
    } else if (isolationScore < 0.5) {
      riskLevel = 'medium';
      riskLabel = 'Medium Risk';
      riskColor = '#f59e0b';
    } else if (isolationScore < 0.7) {
      riskLevel = 'high';
      riskLabel = 'High Risk';
      riskColor = '#ef4444';
    } else {
      riskLevel = 'critical';
      riskLabel = 'Critical Risk';
      riskColor = '#dc2626';
    }

    return {
      riskScore: parseFloat(isolationScore.toFixed(3)),
      riskLevel,
      riskLabel,
      riskColor,
      anomalies,
      isSuspicious: isolationScore > 0.5,
      recommendations: isolationScore > 0.7 
        ? ['Flag for manual review', 'Require additional verification', 'Monitor user activity']
        : isolationScore > 0.5
        ? ['Review transaction details', 'Monitor for patterns']
        : ['Transaction appears normal']
    };
  },

  /**
   * Check if user is suspicious based on history
   * @param {Object} userHistory - User transaction history
   * @returns {Object} - Suspicion assessment
   */
  isSuspiciousUser: (userHistory) => {
    const transactions = userHistory.transactions || [];
    
    if (transactions.length === 0) {
      return {
        isSuspicious: false,
        suspicionScore: 0,
        reasons: []
      };
    }

    // Analyze patterns
    const recentTransactions = transactions.slice(-10);
    const avgAmount = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / recentTransactions.length;
    const amountVariance = recentTransactions.reduce((sum, tx) => sum + Math.pow(tx.amount - avgAmount, 2), 0) / recentTransactions.length;
    const amountStdDev = Math.sqrt(amountVariance);

    // Suspicion indicators
    const reasons = [];
    let suspicionScore = 0;

    // High variance in amounts
    if (amountStdDev / avgAmount > 2) {
      suspicionScore += 0.2;
      reasons.push('High variance in transaction amounts');
    }

    // Rapid transactions
    const rapidTxCount = recentTransactions.filter((tx, i) => {
      if (i === 0) return false;
      const timeDiff = tx.timestamp - recentTransactions[i - 1].timestamp;
      return timeDiff < 300000; // Less than 5 minutes
    }).length;
    
    if (rapidTxCount > 3) {
      suspicionScore += 0.3;
      reasons.push('Multiple rapid transactions');
    }

    // Unusual amounts
    const unusualAmounts = recentTransactions.filter(tx => 
      tx.amount > avgAmount * 3 || tx.amount < avgAmount * 0.1
    ).length;
    
    if (unusualAmounts > 2) {
      suspicionScore += 0.25;
      reasons.push('Multiple unusual transaction amounts');
    }

    // Failed transactions
    const failedCount = transactions.filter(tx => tx.status === 'failed').length;
    if (failedCount > transactions.length * 0.3) {
      suspicionScore += 0.25;
      reasons.push('High failure rate');
    }

    return {
      isSuspicious: suspicionScore > 0.5,
      suspicionScore: Math.min(1, parseFloat(suspicionScore.toFixed(3))),
      reasons,
      riskLevel: suspicionScore > 0.7 ? 'high' : suspicionScore > 0.5 ? 'medium' : 'low'
    };
  }
};

