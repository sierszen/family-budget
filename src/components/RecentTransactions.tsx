'use client';

import { ArrowUpRight, ArrowDownLeft, ShoppingCart, Car, Home, Utensils } from 'lucide-react';

const transactions = [
  {
    id: 1,
    title: 'Zakupy spożywcze',
    amount: -120.50,
    category: 'Jedzenie',
    date: '2024-01-15',
    user: 'Mama',
    icon: ShoppingCart,
    color: 'blue'
  },
  {
    id: 2,
    title: 'Paliwo',
    amount: -85.00,
    category: 'Transport',
    date: '2024-01-14',
    user: 'Tata',
    icon: Car,
    color: 'green'
  },
  {
    id: 3,
    title: 'Wynagrodzenie',
    amount: 3200.00,
    category: 'Przychód',
    date: '2024-01-14',
    user: 'Tata',
    icon: ArrowUpRight,
    color: 'green'
  },
  {
    id: 4,
    title: 'Czynsz',
    amount: -1800.00,
    category: 'Mieszkanie',
    date: '2024-01-13',
    user: 'Mama',
    icon: Home,
    color: 'red'
  },
  {
    id: 5,
    title: 'Restauracja',
    amount: -95.00,
    category: 'Jedzenie',
    date: '2024-01-12',
    user: 'Mama',
    icon: Utensils,
    color: 'blue'
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Jedzenie':
      return 'bg-blue-100 text-blue-800';
    case 'Transport':
      return 'bg-green-100 text-green-800';
    case 'Mieszkanie':
      return 'bg-red-100 text-red-800';
    case 'Rozrywka':
      return 'bg-yellow-100 text-yellow-800';
    case 'Zdrowie':
      return 'bg-purple-100 text-purple-800';
    case 'Przychód':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${getCategoryColor(transaction.category)}`}>
              <transaction.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{transaction.title}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                  {transaction.category}
                </span>
                <span>•</span>
                <span>{transaction.user}</span>
                <span>•</span>
                <span>{new Date(transaction.date).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} zł
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
