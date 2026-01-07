import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

const LineChartBox = ({ title, data, dataKey, color = '#FF7A00', showArea = false, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
            <TrendingUp className="text-[#FF7A00]" size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        {showArea ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: `1px solid ${color}`,
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={`url(#gradient-${dataKey})`}
              strokeWidth={3}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: `1px solid ${color}`,
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChartBox;

