import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Coins, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { trackImpression, trackClick } from '../utils/sponsored';

const SponsoredCard = ({ property, onViewDetails, onBuy }) => {
  useEffect(() => {
    // Track impression when card is rendered
    trackImpression(property.id);
  }, [property.id]);

  const handleClick = () => {
    trackClick(property.id);
    onViewDetails(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-soft-lg overflow-hidden relative border-2 border-primary/30"
    >
      {/* Sponsored Ribbon */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-gradient-to-r from-primary to-primary-600 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold flex items-center space-x-1">
          <Sparkles size={12} />
          <span>SPONSORED</span>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {property.sponsorLogo && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl">
            <img
              src={property.sponsorLogo}
              alt="Sponsor"
              className="h-6 w-auto"
            />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-2xl mb-2">
            PROMOTED
          </span>
        </div>
        <h3 className="text-xl font-bold text-accent-800 mb-2">{property.name}</h3>
        {property.tagline && (
          <p className="text-sm text-accent-600 mb-4">{property.tagline}</p>
        )}
        <div className="flex items-center text-accent-600 mb-4">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-accent-500 mb-1">ROI</p>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <p className="text-lg font-bold text-green-600">{property.roi}%</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-accent-500 mb-1">Tokens</p>
            <div className="flex items-center">
              <Coins size={16} className="text-primary mr-1" />
              <p className="text-lg font-bold text-accent-800">
                {property.tokensAvailable.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleClick}
            className="flex-1 px-4 py-2 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-2xl text-sm font-medium transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => {
              trackClick(property.id);
              onBuy(property);
            }}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl text-sm font-medium transition-colors"
          >
            Invest Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SponsoredCard;

