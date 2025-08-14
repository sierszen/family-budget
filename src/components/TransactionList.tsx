'use client';

import { useState } from 'react';
import {
  Edit,
  Trash2,
  MoreVertical,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Heart,
  Gamepad2,
  DollarSign
} from 'lucide-react';

interface TransactionListProps {
  searchTerm: string;
  category: string;
}

const mockTransactions = [
  {
    id: 1,
    title: 'Zakupy spożywcze',
    amount: -120.50,
    category: 'food',
    categoryName: 'Jedzenie',
    date: '2024-01-15',
    user: 'Mama',
    description: 'Zakupy w Biedronce',
    icon: ShoppingCart,
    color: 'blue'
  },
  {
    id: 2,
    title: 'Paliwo',
    amount: -85.00,
    category: 'transport',
    categoryName: 'Transport',
    date: '2024-01-14',
    user: 'Tata',
    description: 'Tankowanie na Orlen',
    icon: Car,
    color: 'green'
  },
  {
    id: 3,
    title: 'Wynagrodzenie',
    amount: 3200.00,
    category: 'income',
    categoryName: 'Przychód',
    date: '2024-01-14',
    user: 'Tata',
    description: 'Wypłata za styczeń',
    icon: DollarSign,
    color: 'green'
  },
  {
    id: 4,
    title: 'Czynsz',
    amount: -1800.00,
    category: 'housing',
    categoryName: 'Mieszkanie',
    date: '2024-01-13',
    user: 'Mama',
    description: 'Czynsz za styczeń',
    icon: Home,
    color: 'red'
  },
  {
    id: 5,
    title: 'Restauracja',
    amount: -95.00,
    category: 'food',
    categoryName: 'Jedzenie',
    date: '2024-01-12',
    user: 'Mama',
    description: 'Kolacja w restauracji',
    icon: Utensils,
    color: 'blue'
  },
  {
    id: 6,
    title: 'Kino',
    amount: -45.00,
    category: 'entertainment',
    categoryName: 'Rozrywka',
    date: '2024-01-11',
    user: 'Mama',
    description: 'Bilety do kina',
    icon: Gamepad2,
    color: 'yellow'
  },
  {
    id: 7,
    title: 'Lekarz',
    amount: -150.00,
    category: 'health',
    categoryName: 'Zdrowie',
    date: '2024-01-10',
    user: 'Tata',
    description: 'Wizyta u lekarza',
    icon: Heart,
    color: 'purple'
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'food':
      return 'bg-blue-100 text-blue-800';
    case 'transport':
      return 'bg-green-100 text-green-800';
    case 'housing':
      return 'bg-red-100 text-red-800';
    case 'entertainment':
      return 'bg-yellow-100 text-yellow-800';
    case 'health':
      return 'bg-purple-100 text-purple-800';
    case 'income':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function TransactionList({ searchTerm, category }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || transaction.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
          <div className="col-span-4">Transakcja</div>
          <div className="col-span-2">Kategoria</div>
          <div className="col-span-2">Użytkownik</div>
          <div className="col-span-2">Data</div>
          <div className="col-span-1 text-right">Kwota</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Transactions */}
      <div className="divide-y divide-gray-200">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(transaction.category)}`}>
                    <transaction.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.title}</h4>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                  {transaction.categoryName}
                </span>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {transaction.user}
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {new Date(transaction.date).toLocaleDateString('pl-PL')}
              </div>
              <div className="col-span-1 text-right">
                <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} zł
                </span>
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions dropdown */}
            {selectedTransaction === transaction.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                    <span>Edytuj</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    <span>Usuń</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTransactions.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingCart className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak transakcji</h3>
          <p className="text-gray-500">
            {searchTerm || category !== 'all'
              ? 'Nie znaleziono transakcji spełniających kryteria wyszukiwania.'
              : 'Dodaj pierwszą transakcję, aby rozpocząć śledzenie wydatków.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
