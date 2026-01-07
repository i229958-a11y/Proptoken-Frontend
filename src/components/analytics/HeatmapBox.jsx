import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const HeatmapBox = ({ title, data, delay = 0 }) => {
  const getRiskColor = (riskScore) => {
    if (riskScore < 0.3) return 'bg-green-500';
    if (riskScore < 0.5) return 'bg-yellow-500';
    if (riskScore < 0.7) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskIntensity = (riskScore) => {
    return Math.min(100, riskScore * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
          <AlertTriangle className="text-[#FF7A00]" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className={`grid gap-3 ${data.length <= 5 ? 'grid-cols-5' : data.length <= 10 ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {data.length === 0 ? (
          <div className="col-span-5 text-center py-12 text-gray-500">
            No properties match the selected filters
          </div>
        ) : (
          data.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + index * 0.02 }}
            className="group relative"
          >
            <div
              className={`${getRiskColor(item.riskScore)} rounded-xl aspect-square flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-md`}
              style={{ opacity: getRiskIntensity(item.riskScore) / 100 }}
            >
              <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {item.name}
              </span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {item.name}<br />
                Risk: {(item.riskScore * 100).toFixed(0)}%
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>
      <div className="mt-8 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-600">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Very High</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeatmapBox;

