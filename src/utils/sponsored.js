/**
 * Sponsored Properties Management
 */

/**
 * Get all sponsored properties
 * @param {Array} properties - All properties
 * @returns {Array} Sponsored properties sorted by rank
 */
export const getSponsoredProperties = (properties) => {
  return properties
    .filter(p => p.sponsored === true && p.visible !== false)
    .sort((a, b) => (b.sponsoredRank || 0) - (a.sponsoredRank || 0));
};

/**
 * Track sponsored property impression
 * @param {number} propertyId - Property ID
 */
export const trackImpression = (propertyId) => {
  const impressions = JSON.parse(sessionStorage.getItem('sponsoredImpressions') || '{}');
  impressions[propertyId] = (impressions[propertyId] || 0) + 1;
  sessionStorage.setItem('sponsoredImpressions', JSON.stringify(impressions));
};

/**
 * Track sponsored property click
 * @param {number} propertyId - Property ID
 */
export const trackClick = (propertyId) => {
  const clicks = JSON.parse(sessionStorage.getItem('sponsoredClicks') || '{}');
  clicks[propertyId] = (clicks[propertyId] || 0) + 1;
  sessionStorage.setItem('sponsoredClicks', JSON.stringify(clicks));
};

/**
 * Get analytics for sponsored property
 * @param {number} propertyId - Property ID
 * @returns {Object} Analytics data
 */
export const getSponsoredAnalytics = (propertyId) => {
  const impressions = JSON.parse(sessionStorage.getItem('sponsoredImpressions') || '{}');
  const clicks = JSON.parse(sessionStorage.getItem('sponsoredClicks') || '{}');
  
  const impressionCount = impressions[propertyId] || 0;
  const clickCount = clicks[propertyId] || 0;
  const ctr = impressionCount > 0 ? ((clickCount / impressionCount) * 100).toFixed(2) : 0;

  return {
    impressions: impressionCount,
    clicks: clickCount,
    ctr: parseFloat(ctr),
  };
};

/**
 * Mark property as sponsored
 * @param {Object} property - Property object
 * @param {number} rank - Sponsored rank (higher = more prominent)
 * @returns {Object} Updated property
 */
export const markAsSponsored = (property, rank = 1) => {
  return {
    ...property,
    sponsored: true,
    sponsoredRank: rank,
  };
};

/**
 * Unmark property as sponsored
 * @param {Object} property - Property object
 * @returns {Object} Updated property
 */
export const unmarkAsSponsored = (property) => {
  const { sponsored, sponsoredRank, ...rest } = property;
  return rest;
};

