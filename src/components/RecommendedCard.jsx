import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Coins, Sparkles, Award, Brain, AlertTriangle } from 'lucide-react';

const RecommendedCard = ({ property, rank, isTopPick, onViewDetails, onBuy }) => {
  const getRankBadge = () => {
    if (rank === 1) return { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' };
    if (rank === 2) return { icon: '🥈', color: 'bg-gray-100 text-gray-800' };
    if (rank === 3) return { icon: '🥉', color: 'bg-orange-100 text-orange-800' };
    return null;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const badge = getRankBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-soft overflow-hidden relative border-2 border-primary/30 hover:border-primary ${
        isTopPick ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      {isTopPick && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-primary text-white px-3 py-1 rounded-2xl text-xs font-bold flex items-center space-x-1">
            <Sparkles size={12} />
            <span>AI Recommended For You</span>
          </div>
        </div>
      )}

      {badge && (
        <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-2xl text-sm font-bold ${badge.color}`}>
          {badge.icon} #{rank}
        </div>
      )}

      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-2xl">
          <div className="flex items-center space-x-2">
            <Brain size={16} className="text-primary" />
            <span className="text-sm font-bold text-accent-800">
              ML Score: {property.aiScore?.toFixed(1) || 0}
            </span>
          </div>
        </div>
        {property.investmentProbability && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-2xl">
            <div className="flex items-center space-x-1">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary">
                {(property.investmentProbability * 100).toFixed(0)}% Match
              </span>
            </div>
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
            <p className="text-xs text-accent-500 mb-1">ROI</p>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <p className="text-lg font-bold text-green-600">
                {property.mlAnalytics?.roiForecast.predictedROI?.toFixed(1) || property.roi}%
              </p>
            </div>
            {property.mlAnalytics?.roiForecast.trend && (
              <p className="text-xs text-accent-500 mt-1">
                Trend: {property.mlAnalytics.roiForecast.trend}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-accent-500 mb-1">Risk Level</p>
            <span 
              className={`px-2 py-1 rounded-2xl text-xs font-semibold ${
                property.mlAnalytics?.riskClassification 
                  ? `text-white` 
                  : getRiskColor(property.riskLevel)
              }`}
              style={property.mlAnalytics?.riskClassification ? {
                backgroundColor: property.mlAnalytics.riskClassification.riskColor
              } : {}}
            >
              {property.mlAnalytics?.riskClassification?.riskLabel?.toUpperCase() || 
               property.riskLevel?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
        </div>
        
        {property.mlAnalytics && (
          <div className="mb-4 p-3 bg-accent-50 rounded-xl">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-accent-500">Price Growth</p>
                <p className="font-bold text-primary">
                  {property.mlAnalytics.pricePrediction.growth > 0 ? '+' : ''}
                  {property.mlAnalytics.pricePrediction.growth.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-accent-500">Demand</p>
                <p className="font-bold text-primary">
                  {property.mlAnalytics.demandPrediction.demandLevel}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-accent-200">
          <div className="flex items-center text-sm text-accent-600">
            <Coins size={16} className="mr-1" />
            <span>{property.tokensAvailable.toLocaleString()} tokens left</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(property)}
            className="flex-1 px-4 py-2 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-2xl text-sm font-medium transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onBuy(property)}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl text-sm font-medium transition-colors"
          >
            Buy Tokens
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendedCard;

