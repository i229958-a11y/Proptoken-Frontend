import { motion } from 'framer-motion';

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  caption, 
  trend, 
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-4 bg-[#FF7A00]/10 rounded-2xl">
          <Icon className="text-[#FF7A00]" size={28} />
        </div>
        {trend && (
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      {caption && (
        <p className="text-xs text-gray-500 mt-2">{caption}</p>
      )}
    </motion.div>
  );
};

export default StatCard;

