import { motion } from 'framer-motion';
import { X, TrendingUp, MapPin, DollarSign, Coins, AlertCircle } from 'lucide-react';

const PropertyComparison = ({ properties, onRemove, onClear }) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  const comparisonFields = [
    { key: 'price', label: 'Price', icon: DollarSign, format: (val) => `$${val.toLocaleString()}` },
    { key: 'location', label: 'Location', icon: MapPin, format: (val) => val },
    { key: 'roi', label: 'ROI', icon: TrendingUp, format: (val) => `${val}%` },
    { key: 'tokensAvailable', label: 'Tokens Available', icon: Coins, format: (val) => val.toLocaleString() },
    { key: 'riskLevel', label: 'Risk Level', icon: AlertCircle, format: (val) => val?.toUpperCase() || 'MEDIUM' },
    { key: 'aiScore', label: 'AI Score', icon: TrendingUp, format: (val) => val || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl shadow-2xl p-6 md:p-8 mt-8 border-2 border-primary/20 overflow-hidden"
    >
      {/* Header - Enhanced */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b-2 border-primary/10">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="p-3 bg-gradient-to-br from-primary to-primary-600 rounded-2xl shadow-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-accent-900">Property Comparison</h3>
            <p className="text-xs md:text-sm text-accent-600 mt-1">Compare up to 3 properties side by side</p>
          </div>
        </div>
        {properties.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl md:rounded-2xl text-sm font-bold transition-all shadow-lg"
          >
            Clear All
          </motion.button>
        )}
      </div>

      {/* Comparison Table - Enhanced & Mobile Responsive */}
      <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
        <div className="min-w-full">
          <div className="grid grid-cols-1 md:table w-full">
            {/* Mobile View */}
            <div className="md:hidden space-y-6">
              {properties.map((property, propIndex) => (
                <div key={property.id} className="bg-white rounded-2xl p-4 border-2 border-primary/10 shadow-lg">
                  <div className="relative mb-4">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => onRemove(property.id)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                      <p className="font-bold text-white text-sm">{property.name}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {comparisonFields.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key} className="flex items-center justify-between p-3 bg-accent-50 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <Icon size={18} className="text-primary" />
                            <span className="font-semibold text-accent-700">{field.label}</span>
                          </div>
                          <span className="font-bold text-accent-900">{field.format(property[field.key])}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-4 px-6 font-bold text-accent-800 bg-primary/5">Property</th>
                  {properties.map((property, index) => (
                    <th key={property.id} className="text-center py-4 px-6 min-w-[220px] bg-gradient-to-b from-primary/10 to-transparent">
                      <div className="relative group">
                        <img
                          src={property.image}
                          alt={property.name}
                          className="w-full h-40 object-cover rounded-2xl mb-3 shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={() => onRemove(property.id)}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                        <p className="font-bold text-accent-900 text-base">{property.name}</p>
                        <p className="text-xs text-accent-600 mt-1">{property.location}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <tr 
                      key={field.key} 
                      className={`border-b border-accent-100 ${index % 2 === 0 ? 'bg-white' : 'bg-accent-50/50'}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon size={18} className="text-primary" />
                          </div>
                          <span className="font-bold text-accent-800">{field.label}</span>
                        </div>
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-4 px-6 text-center">
                          <span className="font-bold text-accent-900 text-lg">{field.format(property[field.key])}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {properties.length < 2 && (
        <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-primary/5 rounded-2xl border-2 border-dashed border-primary/20 mt-6">
          <TrendingUp className="mx-auto text-primary/40 mb-3" size={48} />
          <p className="text-accent-700 font-semibold mb-1">Select at least 2 properties to compare</p>
          <p className="text-sm text-accent-600">Use the "Compare" button on property cards to add them here</p>
        </div>
      )}
    </motion.div>
  );
};

export default PropertyComparison;

