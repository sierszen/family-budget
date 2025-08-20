'use client';

import { LucideIcon } from 'lucide-react';

interface BudgetCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning';
  icon: LucideIcon;
  color: string;
}

export function BudgetCard({ title, value, change, changeType, icon: Icon, color }: BudgetCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-50';
      case 'red':
        return 'text-red-600 bg-red-50';
      case 'blue':
        return 'text-blue-600 bg-blue-50';
      case 'orange':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const IconOrFallback: LucideIcon | null = Icon || null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm font-medium mt-1 ${getChangeColor()}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          {IconOrFallback ? (
            <IconOrFallback className="h-6 w-6" />
          ) : (
            <div className="h-6 w-6 rounded bg-gray-200" />
          )}
        </div>
      </div>
    </div>
  );
}
