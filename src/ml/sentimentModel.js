/**
 * Sentiment Analysis Model (Text Rule-Based)
 * Analyzes user messages, feedback, and property comments
 */

export const sentimentModel = {
  /**
   * Analyze sentiment of text
   * @param {String} text - Text to analyze
   * @returns {Object} - Sentiment analysis results
   */
  analyzeSentiment: (text) => {
    if (!text || text.length === 0) {
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        keywords: []
      };
    }

    const lowerText = text.toLowerCase();

    // Positive keywords and weights
    const positiveKeywords = {
      'excellent': 0.3, 'great': 0.25, 'amazing': 0.3, 'wonderful': 0.25,
      'good': 0.15, 'nice': 0.1, 'love': 0.3, 'perfect': 0.25,
      'satisfied': 0.2, 'happy': 0.25, 'pleased': 0.2, 'fantastic': 0.3,
      'outstanding': 0.3, 'superb': 0.25, 'brilliant': 0.25, 'awesome': 0.25,
      'recommend': 0.2, 'best': 0.25, 'top': 0.2, 'quality': 0.15,
      'professional': 0.15, 'reliable': 0.15, 'trustworthy': 0.2,
    };

    // Negative keywords and weights
    const negativeKeywords = {
      'bad': 0.2, 'terrible': 0.3, 'awful': 0.3, 'horrible': 0.3,
      'poor': 0.2, 'worst': 0.25, 'disappointed': 0.25, 'disappointing': 0.25,
      'hate': 0.3, 'disgusting': 0.3, 'frustrated': 0.25, 'angry': 0.25,
      'useless': 0.25, 'waste': 0.2, 'scam': 0.4, 'fraud': 0.4,
      'problem': 0.15, 'issue': 0.15, 'error': 0.2, 'bug': 0.2,
      'slow': 0.15, 'broken': 0.25, 'failed': 0.2, 'unreliable': 0.2,
    };

    // Neutral/negation words
    const negationWords = ['not', 'no', 'never', 'none', 'neither', 'nobody', 'nothing'];
    const neutralWords = ['okay', 'ok', 'fine', 'average', 'normal', 'standard'];

    // Calculate positive score
    let positiveScore = 0;
    const foundPositive = [];
    Object.keys(positiveKeywords).forEach(keyword => {
      if (lowerText.includes(keyword)) {
        // Check for negation
        const keywordIndex = lowerText.indexOf(keyword);
        const beforeKeyword = lowerText.substring(Math.max(0, keywordIndex - 20), keywordIndex);
        const hasNegation = negationWords.some(neg => beforeKeyword.includes(neg));
        
        if (!hasNegation) {
          positiveScore += positiveKeywords[keyword];
          foundPositive.push(keyword);
        }
      }
    });

    // Calculate negative score
    let negativeScore = 0;
    const foundNegative = [];
    Object.keys(negativeKeywords).forEach(keyword => {
      if (lowerText.includes(keyword)) {
        negativeScore += negativeKeywords[keyword];
        foundNegative.push(keyword);
      }
    });

    // Check for neutral words
    let neutralCount = 0;
    neutralWords.forEach(word => {
      if (lowerText.includes(word)) neutralCount++;
    });

    // Calculate final sentiment score (-1 to 1)
    const rawScore = positiveScore - negativeScore;
    const normalizedScore = Math.max(-1, Math.min(1, rawScore / 2)); // Normalize

    // Determine sentiment
    let sentiment, sentimentLabel, sentimentColor;
    if (normalizedScore > 0.3) {
      sentiment = 'positive';
      sentimentLabel = 'Positive';
      sentimentColor = '#10b981'; // Green
    } else if (normalizedScore > 0.1) {
      sentiment = 'slightly-positive';
      sentimentLabel = 'Slightly Positive';
      sentimentColor = '#84cc16'; // Lime
    } else if (normalizedScore < -0.3) {
      sentiment = 'negative';
      sentimentLabel = 'Negative';
      sentimentColor = '#ef4444'; // Red
    } else if (normalizedScore < -0.1) {
      sentiment = 'slightly-negative';
      sentimentLabel = 'Slightly Negative';
      sentimentColor = '#f59e0b'; // Orange
    } else {
      sentiment = 'neutral';
      sentimentLabel = 'Neutral';
      sentimentColor = '#6b7280'; // Gray
    }

    // Confidence based on keyword count and score magnitude
    const keywordCount = foundPositive.length + foundNegative.length;
    const confidence = Math.min(0.95, 0.5 + (keywordCount * 0.1) + Math.abs(normalizedScore) * 0.3);

    return {
      sentiment,
      sentimentLabel,
      sentimentColor,
      score: parseFloat(normalizedScore.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(3)),
      positiveScore: parseFloat(positiveScore.toFixed(3)),
      negativeScore: parseFloat(negativeScore.toFixed(3)),
      keywords: {
        positive: foundPositive,
        negative: foundNegative,
      },
      insights: {
        isPositive: normalizedScore > 0.1,
        isNegative: normalizedScore < -0.1,
        isNeutral: normalizedScore >= -0.1 && normalizedScore <= 0.1,
        requiresAttention: normalizedScore < -0.3 || foundNegative.some(k => ['scam', 'fraud'].includes(k)),
      }
    };
  }
};

