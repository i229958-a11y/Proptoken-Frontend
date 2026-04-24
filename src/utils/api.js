/**
 * API Service Layer for MongoDB Backend
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==================== AUTH ====================

export const registerUser = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (email, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
};

export const loginWithWallet = async (walletAddress, name, email) => {
  const response = await apiRequest('/auth/login-wallet', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, name, email }),
  });
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
};

// ==================== USERS ====================

export const getCurrentUser = async () => {
  return apiRequest('/users/profile');
};

export const getUserProfile = async () => {
  return apiRequest('/users/profile');
};

export const updateUserProfile = async (profileData) => {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const getUserTokens = async (userId) => {
  return apiRequest(`/users/${userId}/tokens`);
};

// ==================== ADMIN - USERS ====================

export const getAllUsersAdmin = async () => {
  return apiRequest('/admin/users');
};

// ==================== INVESTMENTS ====================

export const createInvestment = async (investmentData) => {
  return apiRequest('/investments', {
    method: 'POST',
    body: JSON.stringify(investmentData),
  });
};

export const getUserInvestments = async () => {
  return apiRequest('/investments');
};

export const getInvestmentStats = async () => {
  return apiRequest('/investments/stats');
};

export const getInvestment = async (investmentId) => {
  return apiRequest(`/investments/${investmentId}`);
};

export const updateInvestmentValuation = async (investmentId, currentValuation) => {
  return apiRequest(`/investments/${investmentId}/valuation`, {
    method: 'PUT',
    body: JSON.stringify({ currentValuation }),
  });
};

export const sellTokens = async (investmentId, tokensToSell) => {
  return apiRequest('/sell', {
    method: 'POST',
    body: JSON.stringify({ investmentId, tokensToSell }),
  });
};

// ==================== ADMIN - TRANSACTIONS ====================

export const getAllTransactionsAdmin = async () => {
  return apiRequest('/admin/transactions');
};

// ==================== PROPERTIES ====================

export const getProperties = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return apiRequest(`/properties${queryString ? `?${queryString}` : ''}`);
};

export const getProperty = async (propertyId) => {
  return apiRequest(`/properties/${propertyId}`);
};

export const createPropertyListing = async (propertyData) => {
  return apiRequest('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
};

export const approveProperty = async (propertyId) => {
  return apiRequest(`/properties/${propertyId}/approve`, {
    method: 'PUT',
  });
};

export const rejectProperty = async (propertyId, rejectionReason) => {
  return apiRequest(`/properties/${propertyId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejectionReason }),
  });
};

// ==================== KYC ====================

export const submitKYCApplication = async (kycDocuments) => {
  return apiRequest('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ kycDocuments }),
  });
};

export const getKYCStatus = async () => {
  return apiRequest('/kyc/status');
};

export const getKYCApplications = async () => {
  return apiRequest('/kyc/applications');
};

export const approveKYC = async (applicationId) => {
  return apiRequest(`/kyc/approve/${applicationId}`, {
    method: 'PUT',
  });
};

export const rejectKYC = async (applicationId, rejectionReason) => {
  return apiRequest(`/kyc/reject/${applicationId}`, {
    method: 'PUT',
    body: JSON.stringify({ rejectionReason }),
  });
};

// ==================== NOTIFICATIONS ====================

export const getUserNotifications = async () => {
  return apiRequest('/notifications');
};

export const markNotificationRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
};

export const clearNotifications = async () => {
  return apiRequest('/notifications/clear', {
    method: 'DELETE',
  });
};





