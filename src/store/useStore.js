import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Wallet state
      walletAddress: null,
      isConnected: false,
      ethBalance: '0',
      propyBalance: '0',
      chainId: null,

      // User state
      user: {
        name: '',
        email: '',
        profilePicture: null,
        walletAddress: null,
      },
      isLoggedIn: false,

      // KYC state
      kycStatus: 'not_submitted', // not_submitted, submitted, hold, approved, rejected
      kycRejectionReason: '',
      kycDocuments: {
        cnicFront: null,
        cnicBack: null,
        selfie: null,
        addressProof: null,
      },

      // Properties state
      properties: [],
      userInvestments: [],

      // Notifications
      notifications: [],

      // Admin state
      isAdmin: false,
      adminLoggedIn: false,
      contractFrozen: false,

      // Recommendations state
      userProfile: {
        budgetRange: null,
        preferredROI: null,
        preferredCities: [],
        preferredTypes: [],
        riskTolerance: null,
      },
      viewingHistory: [],
      aiPreferences: {},
      comparisonProperties: [],

      // Actions
      setWalletAddress: (address) => set({ walletAddress: address, isConnected: !!address }),
      setEthBalance: (balance) => set({ ethBalance: balance }),
      setPropyBalance: (balance) => set({ propyBalance: balance }),
      setChainId: (chainId) => set({ chainId }),
      disconnectWallet: () => set({ 
        walletAddress: null, 
        isConnected: false, 
        ethBalance: '0',
        propyBalance: '0',
      }),

      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData },
        isLoggedIn: true,
      })),
      logout: () => set({ 
        user: { name: '', email: '', profilePicture: null, walletAddress: null },
        isLoggedIn: false,
        walletAddress: null,
        isConnected: false,
      }),

      setKycStatus: (status, reason = '') => set({ 
        kycStatus: status, 
        kycRejectionReason: reason 
      }),
      updateKycDocuments: (documents) => set((state) => ({
        kycDocuments: { ...state.kycDocuments, ...documents }
      })),

      setProperties: (properties) => set({ properties }),
      addProperty: (property) => set((state) => ({
        properties: [...state.properties, property]
      })),
      updateProperty: (id, updates) => set((state) => ({
        properties: state.properties.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      setPropertyVisibility: (id, visible) => set((state) => ({
        properties: state.properties.map(p => 
          p.id === id ? { ...p, visible } : p
        )
      })),

      addInvestment: (investment) => set((state) => ({
        userInvestments: [...state.userInvestments, investment]
      })),
      setInvestments: (investments) => set({ userInvestments: investments }),

      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: Date.now(), read: false }, ...state.notifications]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set({ notifications: [] }),

      setAdminLoggedIn: (loggedIn) => set({ adminLoggedIn: loggedIn, isAdmin: loggedIn }),
      setContractFrozen: (frozen) => set({ contractFrozen: frozen }),

      // Recommendations actions
      updateUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),
      addToViewingHistory: (property) => set((state) => {
        const history = state.viewingHistory || [];
        const exists = history.find(h => h.id === property.id);
        if (!exists) {
          return { viewingHistory: [...history, { ...property, viewedAt: Date.now() }] };
        }
        return state;
      }),
      updateAIPreferences: (preferences) => set((state) => ({
        aiPreferences: { ...state.aiPreferences, ...preferences }
      })),
      addToComparison: (property) => set((state) => {
        const comparison = state.comparisonProperties || [];
        if (comparison.length >= 3) return state;
        if (comparison.find(p => p.id === property.id)) return state;
        return { comparisonProperties: [...comparison, property] };
      }),
      removeFromComparison: (propertyId) => set((state) => ({
        comparisonProperties: (state.comparisonProperties || []).filter(p => p.id !== propertyId)
      })),
      clearComparison: () => set({ comparisonProperties: [] }),
    }),
    {
      name: 'proptoken-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        kycStatus: state.kycStatus,
        kycDocuments: state.kycDocuments,
        userInvestments: state.userInvestments,
        notifications: state.notifications,
        adminLoggedIn: state.adminLoggedIn,
        userProfile: state.userProfile,
        viewingHistory: state.viewingHistory,
        aiPreferences: state.aiPreferences,
      }),
    }
  )
);

