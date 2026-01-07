import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';

const AISnapshotPanel = ({ insights }) => {
  if (!insights) {
    return null;
  }

  const getInvestmentStyleColor = (style) => {
    switch (style.toLowerCase()) {
      case 'conservative':
        return 'bg-blue-100 text-blue-800';
      case 'aggressive':
        return 'bg-red-100 text-red-800';
      case 'balanced':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-accent-100 text-accent-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-soft p-6 space-y-6 border-2 border-accent-200"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="text-primary" size={24} />
        <h3 className="text-xl font-bold text-accent-800">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {/* Investment Style */}
        <div className="bg-accent-50 p-4 rounded-2xl border border-accent-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={16} className="text-accent-600" />
            <p className="text-sm font-semibold text-accent-700">Investment Style</p>
          </div>
          <span className={`inline-block px-3 py-1 rounded-2xl text-sm font-bold ${getInvestmentStyleColor(insights.investmentStyle)}`}>
            {insights.investmentStyle}
          </span>
        </div>

        {/* Frequently Viewed */}
        <div className="bg-accent-50 p-4 rounded-2xl border border-accent-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={16} className="text-accent-600" />
            <p className="text-sm font-semibold text-accent-700">You Frequently View</p>
          </div>
          <p className="text-sm text-accent-600">{insights.frequentlyViewed}</p>
        </div>

        {/* Risk Profile */}
        <div className="bg-accent-50 p-4 rounded-2xl border border-accent-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={16} className="text-accent-600" />
            <p className="text-sm font-semibold text-accent-700">Risk Profile</p>
          </div>
          <p className="text-sm text-accent-600 capitalize">{insights.riskProfile}</p>
        </div>

        {/* Suggested Action */}
        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb size={16} className="text-primary" />
            <p className="text-sm font-semibold text-primary">Suggested Next Step</p>
          </div>
          <p className="text-sm text-accent-700">{insights.suggestedAction}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AISnapshotPanel;

