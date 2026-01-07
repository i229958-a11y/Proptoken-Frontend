import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, DollarSign, Users } from 'lucide-react';

const iconMap = {
  trending: TrendingUp,
  risk: AlertTriangle,
  roi: DollarSign,
  cluster: Users,
};

const InsightCard = ({ insight, index = 0 }) => {
  const Icon = iconMap[insight.icon] || TrendingUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-[#FF7A00]/10 rounded-2xl flex-shrink-0">
          <Icon className="text-[#FF7A00]" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-2">{insight.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{insight.text}</p>
          <span className="inline-block mt-3 px-3 py-1 bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-semibold rounded-full">
            {insight.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;

