import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';

const PieChartBox = ({ title, data, delay = 0 }) => {
  const COLORS = data.map(item => item.color || '#FF7A00');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
          <Users className="text-[#FF7A00]" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #FF7A00',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PieChartBox;

