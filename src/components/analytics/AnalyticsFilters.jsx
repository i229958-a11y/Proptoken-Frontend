import { motion } from 'framer-motion';
import { Filter, Calendar, Building2, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const AnalyticsFilters = ({ filters, onFilterChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const propertyTypes = ['All', 'Residential', 'Commercial', 'Industrial', 'Mixed'];
  const riskLevels = ['All', 'Low', 'Medium-Low', 'Medium', 'High', 'Very High'];
  const timeRanges = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'Last 6 Months', value: 180 },
    { label: 'Custom', value: 'custom' },
  ];

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== 'all' && v !== null && v !== undefined && v !== ''
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
            <Filter className="text-[#FF7A00]" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-[#FF7A00] text-white text-xs font-semibold rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-[#FF7A00] transition-colors"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 text-[#FF7A00] rounded-lg text-sm font-semibold transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Time Range */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={14} />
            <span>Time Range</span>
          </label>
          <select
            value={filters.timeRange || 30}
            onChange={(e) => onFilterChange('timeRange', parseInt(e.target.value) || e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 size={14} />
            <span>Property Type</span>
          </label>
          <select
            value={filters.propertyType || 'All'}
            onChange={(e) => onFilterChange('propertyType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle size={14} />
            <span>Risk Level</span>
          </label>
          <select
            value={filters.riskLevel || 'All'}
            onChange={(e) => onFilterChange('riskLevel', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
          >
            {riskLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min ROI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min ROI (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={filters.minROI || ''}
                onChange={(e) => onFilterChange('minROI', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
              />
            </div>

            {/* Max ROI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max ROI (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={filters.maxROI || ''}
                onChange={(e) => onFilterChange('maxROI', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="No limit"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsFilters;

