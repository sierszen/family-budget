'use client';

import { ArrowUpRight, ShoppingCart, Car, Home, Utensils } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'jedzenie':
      return ShoppingCart;
    case 'transport':
      return Car;
    case 'mieszkanie':
      return Home;
    case 'rozrywka':
      return Utensils;
    default:
      return ArrowUpRight;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'jedzenie':
      return 'bg-blue-100 text-blue-800';
    case 'transport':
      return 'bg-green-100 text-green-800';
    case 'mieszkanie':
      return 'bg-red-100 text-red-800';
    case 'rozrywka':
      return 'bg-yellow-100 text-yellow-800';
    case 'zdrowie':
      return 'bg-purple-100 text-purple-800';
    case 'przychód':
    case 'wynagrodzenie':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RecentTransactions() {
  const { transactions, loading, error } = useTransactions();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Błąd podczas ładowania transakcji: {error}</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Brak transakcji. Dodaj pierwszą transakcję!</p>
      </div>
    );
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => {
        const IconComponent = getCategoryIcon(transaction.category.name);
        const amount = Number(transaction.amount);
        
        return (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${getCategoryColor(transaction.category.name)}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{transaction.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category.name)}`}>
                    {transaction.category.name}
                  </span>
                  <span>•</span>
                  <span>{new Date(transaction.date).toLocaleDateString('pl-PL')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {amount > 0 ? '+' : ''}{amount.toFixed(2)} zł
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
