'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Jedzenie', value: 1200, color: '#3B82F6' },
  { name: 'Transport', value: 800, color: '#10B981' },
  { name: 'Rozrywka', value: 600, color: '#F59E0B' },
  { name: 'Mieszkanie', value: 1500, color: '#EF4444' },
  { name: 'Zdrowie', value: 400, color: '#8B5CF6' },
  { name: 'Inne', value: 300, color: '#6B7280' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-blue-600 font-semibold">{payload[0].value} zł</p>
      </div>
    );
  }
  return null;
};

export function ExpenseChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-gray-700 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
