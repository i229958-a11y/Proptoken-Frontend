/**
 * Backend Integration Utilities
 * Simulates backend API calls with localStorage
 */

/**
 * Submit property listing request
 */
export const submitPropertyListing = async (propertyData) => {
  const requests = JSON.parse(localStorage.getItem('propertyListingRequests') || '[]');
  const newRequest = {
    id: Date.now(),
    ...propertyData,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    submittedBy: propertyData.userId || 'anonymous',
  };
  requests.push(newRequest);
  localStorage.setItem('propertyListingRequests', JSON.stringify(requests));
  
  // Log the action
  logAction('property_listing_request', {
    propertyId: newRequest.id,
    propertyName: propertyData.name,
    userId: propertyData.userId,
  });
  
  return newRequest;
};

/**
 * Get all pending property listing requests
 */
export const getPendingPropertyRequests = () => {
  const requests = JSON.parse(localStorage.getItem('propertyListingRequests') || '[]');
  return requests.filter(r => r.status === 'pending');
};

/**
 * Approve property listing
 */
export const approvePropertyListing = async (requestId, adminId) => {
  const requests = JSON.parse(localStorage.getItem('propertyListingRequests') || '[]');
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    request.status = 'approved';
    request.approvedAt = new Date().toISOString();
    request.approvedBy = adminId;
    
    // Move to approved properties
    const approvedProperties = JSON.parse(localStorage.getItem('approvedProperties') || '[]');
    const { status, submittedAt, submittedBy, approvedAt, approvedBy, ...propertyData } = request;
    approvedProperties.push({
      ...propertyData,
      visible: true,
      approvedAt: request.approvedAt,
    });
    localStorage.setItem('approvedProperties', JSON.stringify(approvedProperties));
    
    // Update requests
    localStorage.setItem('propertyListingRequests', JSON.stringify(requests));
    
    // Log the action
    logAction('property_approved', {
      propertyId: requestId,
      propertyName: request.name,
      adminId: adminId,
    });
    
    return request;
  }
  return null;
};

/**
 * Reject property listing
 */
export const rejectPropertyListing = async (requestId, adminId, reason) => {
  const requests = JSON.parse(localStorage.getItem('propertyListingRequests') || '[]');
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();
    request.rejectedBy = adminId;
    request.rejectionReason = reason;
    
    localStorage.setItem('propertyListingRequests', JSON.stringify(requests));
    
    // Log the action
    logAction('property_rejected', {
      propertyId: requestId,
      propertyName: request.name,
      adminId: adminId,
      reason: reason,
    });
    
    return request;
  }
  return null;
};

/**
 * Get user account linked to admin
 */
export const getUserAccount = (userId) => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  return users.find(u => u.id === userId || u.email === userId);
};

/**
 * Link admin account to user account
 */
export const linkAdminToUser = (adminEmail, userId) => {
  const adminLinks = JSON.parse(localStorage.getItem('adminUserLinks') || '[]');
  const existingLink = adminLinks.find(l => l.adminEmail === adminEmail);
  
  if (existingLink) {
    existingLink.userId = userId;
    existingLink.linkedAt = new Date().toISOString();
  } else {
    adminLinks.push({
      adminEmail,
      userId,
      linkedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem('adminUserLinks', JSON.stringify(adminLinks));
  
  // Log the action
  logAction('admin_user_linked', {
    adminEmail,
    userId,
  });
};

/**
 * Get admin linked user
 */
export const getAdminLinkedUser = (adminEmail) => {
  const adminLinks = JSON.parse(localStorage.getItem('adminUserLinks') || '[]');
  const link = adminLinks.find(l => l.adminEmail === adminEmail);
  if (link) {
    return getUserAccount(link.userId);
  }
  return null;
};

/**
 * Log action to audit log
 */
export const logAction = (actionType, data) => {
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  const logEntry = {
    id: Date.now(),
    actionType,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
  logs.push(logEntry);
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.shift();
  }
  
  localStorage.setItem('auditLogs', JSON.stringify(logs));
  return logEntry;
};

/**
 * Get audit logs
 */
export const getAuditLogs = (filters = {}) => {
  let logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  
  if (filters.actionType) {
    logs = logs.filter(l => l.actionType === filters.actionType);
  }
  
  if (filters.startDate) {
    logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Get user requests (property listings, etc.)
 */
export const getUserRequests = (userId) => {
  const requests = JSON.parse(localStorage.getItem('propertyListingRequests') || '[]');
  return requests.filter(r => r.submittedBy === userId || r.userId === userId);
};

/**
 * Submit KYC application
 */
export const submitKYCApplication = (userData, kycDocuments) => {
  const kycApplications = JSON.parse(localStorage.getItem('kycApplications') || '[]');
  
  // Check if user already has a pending application
  const existingApp = kycApplications.find(
    app => app.userEmail === userData.email && (app.status === 'submitted' || app.status === 'hold')
  );
  
  if (existingApp) {
    // Update existing application
    existingApp.kycDocuments = kycDocuments;
    existingApp.submittedDate = new Date().toISOString();
    existingApp.status = 'submitted';
    localStorage.setItem('kycApplications', JSON.stringify(kycApplications));
    
    // Log the action
    logAction('kyc_resubmitted', {
      userId: userData.email,
      userName: userData.name,
    });
    
    return existingApp;
  }
  
  // Create new application
  const newApplication = {
    id: Date.now(),
    userId: userData.id || userData.email,
    userEmail: userData.email,
    userName: userData.name || userData.email,
    kycDocuments: kycDocuments,
    status: 'submitted',
    submittedDate: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  };
  
  kycApplications.push(newApplication);
  localStorage.setItem('kycApplications', JSON.stringify(kycApplications));
  
  // Log the action
  logAction('kyc_submitted', {
    userId: userData.email,
    userName: userData.name,
    applicationId: newApplication.id,
  });
  
  return newApplication;
};

/**
 * Get all KYC applications
 */
export const getAllKYCApplications = () => {
  return JSON.parse(localStorage.getItem('kycApplications') || '[]');
};

/**
 * Get pending KYC applications
 */
export const getPendingKYCApplications = () => {
  const applications = getAllKYCApplications();
  return applications.filter(app => app.status === 'submitted' || app.status === 'hold');
};

/**
 * Approve KYC application
 */
export const approveKYCApplication = (applicationId, adminId) => {
  const applications = getAllKYCApplications();
  const application = applications.find(app => app.id === applicationId);
  
  if (application) {
    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date().toISOString();
    
    localStorage.setItem('kycApplications', JSON.stringify(applications));
    
    // Update user's KYC status in registered users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => u.email === application.userEmail || u.id === application.userId);
    if (user) {
      user.kycStatus = 'approved';
      user.kycApprovedAt = new Date().toISOString();
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
    
    // Log the action
    logAction('kyc_approved', {
      applicationId: applicationId,
      userId: application.userEmail,
      adminId: adminId,
    });
    
    return application;
  }
  return null;
};

/**
 * Reject KYC application
 */
export const rejectKYCApplication = (applicationId, adminId, reason) => {
  const applications = getAllKYCApplications();
  const application = applications.find(app => app.id === applicationId);
  
  if (application) {
    application.status = 'rejected';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date().toISOString();
    application.rejectionReason = reason;
    
    localStorage.setItem('kycApplications', JSON.stringify(applications));
    
    // Update user's KYC status in registered users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => u.email === application.userEmail || u.id === application.userId);
    if (user) {
      user.kycStatus = 'rejected';
      user.kycRejectionReason = reason;
      user.kycRejectedAt = new Date().toISOString();
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
    
    // Log the action
    logAction('kyc_rejected', {
      applicationId: applicationId,
      userId: application.userEmail,
      adminId: adminId,
      reason: reason,
    });
    
    return application;
  }
  return null;
};

/**
 * Get KYC status for a user
 */
export const getKYCStatusForUser = (userId) => {
  const applications = getAllKYCApplications();
  const application = applications.find(
    app => app.userId === userId || app.userEmail === userId
  );
  
  if (application) {
    return {
      status: application.status,
      rejectionReason: application.rejectionReason || '',
      reviewedAt: application.reviewedAt,
    };
  }
  
  return {
    status: 'not_submitted',
    rejectionReason: '',
    reviewedAt: null,
  };
};

/**
 * Add investment (when user buys tokens)
 */
export const addInvestment = (userId, investmentData) => {
  const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  
  const newInvestment = {
    id: Date.now(),
    userId: userId,
    propertyId: investmentData.propertyId,
    propertyName: investmentData.propertyName,
    propertyImage: investmentData.propertyImage,
    propertyLocation: investmentData.propertyLocation,
    tokens: parseFloat(investmentData.tokens) || 0,
    amount: parseFloat(investmentData.amount) || 0, // ETH amount invested
    tokenPrice: parseFloat(investmentData.tokenPrice) || 0.25,
    roi: parseFloat(investmentData.roi) || 12,
    investedAt: new Date().toISOString(),
    transactionHash: investmentData.transactionHash || null,
    status: 'active',
    currentValuation: parseFloat(investmentData.amount) || 0, // Will be updated based on current price
  };
  
  investments.push(newInvestment);
  localStorage.setItem('userInvestments', JSON.stringify(investments));
  
  // Log the action
  logAction('investment_made', {
    userId: userId,
    propertyId: investmentData.propertyId,
    propertyName: investmentData.propertyName,
    tokens: newInvestment.tokens,
    amount: newInvestment.amount,
  });
  
  return newInvestment;
};

/**
 * Get all investments for a user
 */
export const getUserInvestments = (userId) => {
  const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  return investments.filter(inv => inv.userId === userId).sort((a, b) => 
    new Date(b.investedAt) - new Date(a.investedAt)
  );
};

/**
 * Update investment valuation
 */
export const updateInvestmentValuation = (investmentId, newValuation) => {
  const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  const investment = investments.find(inv => inv.id === investmentId);
  
  if (investment) {
    investment.currentValuation = parseFloat(newValuation);
    investment.lastUpdated = new Date().toISOString();
    localStorage.setItem('userInvestments', JSON.stringify(investments));
    return investment;
  }
  return null;
};

/**
 * Get total investment stats for a user
 */
export const getUserInvestmentStats = (userId) => {
  const investments = getUserInvestments(userId);
  
  const totalInvestment = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalTokens = investments.reduce((sum, inv) => sum + (inv.tokens || 0), 0);
  const totalValuation = investments.reduce((sum, inv) => sum + (inv.currentValuation || inv.amount || 0), 0);
  const totalROI = totalInvestment > 0 ? ((totalValuation - totalInvestment) / totalInvestment) * 100 : 0;
  
  return {
    totalInvestment,
    totalTokens,
    totalValuation,
    totalROI,
    investmentCount: investments.length,
    properties: investments.map(inv => ({
      id: inv.propertyId,
      name: inv.propertyName,
      tokens: inv.tokens,
      amount: inv.amount,
      roi: inv.roi,
    })),
  };
};

/**
 * Get user wallet data
 */
export const getUserWalletData = (userId) => {
  const walletData = JSON.parse(localStorage.getItem('userWalletData') || '{}');
  return walletData[userId] || {
    ethBalance: '0',
    propyBalance: '0',
    walletAddress: null,
    lastUpdated: null,
  };
};

/**
 * Update user wallet data
 */
export const updateUserWalletData = (userId, walletData) => {
  const allWalletData = JSON.parse(localStorage.getItem('userWalletData') || '{}');
  allWalletData[userId] = {
    ...allWalletData[userId],
    ...walletData,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem('userWalletData', JSON.stringify(allWalletData));
  return allWalletData[userId];
};

