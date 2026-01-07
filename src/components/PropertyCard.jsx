import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Coins } from 'lucide-react';

const PropertyCard = ({ property, onViewProperty }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer"
      onClick={() => onViewProperty(property)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent-100 to-accent-200">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback image if original fails to load - Pakistani property image
            const fallbackImages = [
              'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&q=80',
              'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
              'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
              'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
            ];
            e.target.src = fallbackImages[property.id % fallbackImages.length];
            e.target.onerror = null; // Prevent infinite loop
          }}
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-sm font-semibold text-primary capitalize">
          {property.type}
        </div>
        {property.country === 'Pakistan' && (
          <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-xs font-bold text-white">
            🇵🇰 PK
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-accent-800 mb-2">{property.name}</h3>
        <div className="flex items-center text-accent-600 mb-4">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-accent-500 mb-1">Price</p>
            <p className="text-lg font-bold text-accent-800">
              ${property.price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-accent-500 mb-1">ROI</p>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <p className="text-lg font-bold text-green-600">{property.roi}%</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-accent-200">
          <div className="flex items-center text-sm text-accent-600">
            <Coins size={16} className="mr-1" />
            <span>{property.tokensAvailable.toLocaleString()} tokens</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProperty(property);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl text-sm font-medium transition-colors"
          >
            View Property
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;

