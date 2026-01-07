import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, DollarSign, Upload, ArrowLeft, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { submitPropertyListing } from '../utils/backend';

const ListProperty = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, kycStatus } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    tokensTotal: '',
    tokenPrice: '',
    roi: '',
    type: 'residential',
    description: '',
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { kycStatus } = useStore.getState();
    if (kycStatus !== 'approved') {
      alert('KYC verification is required to list properties. Please complete your KYC verification in the Dashboard.');
      return;
    }
    
    if (!formData.name || !formData.location || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        tokensTotal: parseInt(formData.tokensTotal) || 10000,
        tokenPrice: parseFloat(formData.tokenPrice) || 250,
        roi: parseFloat(formData.roi) || 12,
        tokensAvailable: parseInt(formData.tokensTotal) || 10000,
        userId: user.email,
        userEmail: user.email,
        userName: user.name,
      };

      await submitPropertyListing(propertyData);
      alert('Property listing request submitted successfully! It will be reviewed by admin.');
      navigate('/dashboard');
    } catch (error) {
      alert('Error submitting property listing: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-accent-600 hover:text-primary mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          {/* Premium Header Section */}
          <section className="relative py-12 bg-gradient-to-br from-primary/10 via-white to-primary/5 overflow-hidden rounded-3xl mb-8">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"
              />
            </div>
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
              >
                <Building size={16} />
                <span>Tokenize Your Property</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
                  List Your Property
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-accent-600 font-medium"
              >
                Submit your property for tokenization and start earning
              </motion.p>
            </div>
          </section>
        </motion.div>

        {kycStatus !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <p className="font-semibold text-yellow-800">KYC Verification Required</p>
                <p className="text-sm text-yellow-700">
                  You must complete KYC verification before listing properties. Please complete your KYC in the Dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Property Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter property name"
                    className="w-full pl-10 pr-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full pl-10 pr-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Property Price ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Total Tokens
                </label>
                <input
                  type="number"
                  value={formData.tokensTotal}
                  onChange={(e) => setFormData({ ...formData, tokensTotal: e.target.value })}
                  placeholder="10000"
                  min="1"
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Token Price ($)
                </label>
                <input
                  type="number"
                  value={formData.tokenPrice}
                  onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                  placeholder="250"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Expected ROI (%)
                </label>
                <input
                  type="number"
                  value={formData.roi}
                  onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                  placeholder="12"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Property Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe your property..."
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Property Image
                </label>
                <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center">
                  {formData.image ? (
                    <div>
                      <img src={formData.image} alt="Property" className="max-h-64 mx-auto rounded-2xl mb-4" />
                      <label className="cursor-pointer text-primary font-medium">
                        <Upload className="inline mr-2" size={20} />
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-accent-400 mb-2" size={32} />
                      <p className="text-sm text-accent-600 mb-2">Click to upload property image</p>
                      <label className="cursor-pointer text-primary font-medium">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        Upload Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-accent-200 hover:bg-accent-300 text-accent-800 rounded-2xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-600 disabled:bg-accent-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ListProperty;




