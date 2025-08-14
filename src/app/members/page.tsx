'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, User, Crown, Shield } from 'lucide-react';

const familyMembers = [
  {
    id: 1,
    name: 'Mama',
    email: 'mama@example.com',
    role: 'admin',
    avatar: '👩',
    joinDate: '2024-01-01',
    totalTransactions: 45,
    totalSpent: 3200,
    status: 'active'
  },
  {
    id: 2,
    name: 'Tata',
    email: 'tata@example.com',
    role: 'admin',
    avatar: '👨',
    joinDate: '2024-01-01',
    totalTransactions: 38,
    totalSpent: 2800,
    status: 'active'
  },
  {
    id: 3,
    name: 'Janek',
    email: 'janek@example.com',
    role: 'member',
    avatar: '👦',
    joinDate: '2024-01-15',
    totalTransactions: 12,
    totalSpent: 450,
    status: 'active'
  },
  {
    id: 4,
    name: 'Ania',
    email: 'ania@example.com',
    role: 'member',
    avatar: '👧',
    joinDate: '2024-01-15',
    totalTransactions: 8,
    totalSpent: 320,
    status: 'active'
  }
];

export default function MembersPage() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'member':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'member':
        return 'Członek';
      default:
        return 'Użytkownik';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Członkowie rodziny</h1>
          <p className="text-gray-600">Zarządzaj członkami rodziny i ich uprawnieniami</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
          <Plus className="h-4 w-4" />
          <span>Dodaj członka</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Łączna liczba członków</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administratorzy</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktywni członkowie</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Łączne transakcje</p>
              <p className="text-2xl font-bold text-gray-900">103</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-3">Członek</div>
            <div className="col-span-2">Rola</div>
            <div className="col-span-2">Data dołączenia</div>
            <div className="col-span-2">Transakcje</div>
            <div className="col-span-2">Wydatki</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {familyMembers.map((member) => (
            <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{member.avatar}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium text-gray-900">
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 text-sm text-gray-600">
                  {new Date(member.joinDate).toLocaleDateString('pl-PL')}
                </div>

                <div className="col-span-2 text-sm text-gray-600">
                  {member.totalTransactions} transakcji
                </div>

                <div className="col-span-2 text-sm font-medium text-gray-900">
                  {member.totalSpent} zł
                </div>

                <div className="col-span-1 text-right">
                  <button
                    onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions dropdown */}
              {selectedMember === member.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                      <span>Edytuj</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm text-yellow-600 hover:text-yellow-700">
                      <Crown className="h-4 w-4" />
                      <span>Zmień rolę</span>
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
      </div>

      {/* Invite Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Zaproś nowego członka</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="Email nowego członka"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="member">Członek</option>
            <option value="admin">Administrator</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Wyślij zaproszenie
          </button>
        </div>
      </div>

      {/* Permissions Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uprawnienia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>Administrator</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Dodawanie i edycja transakcji</li>
              <li>• Zarządzanie członkami rodziny</li>
              <li>• Ustawianie limitów budżetowych</li>
              <li>• Dostęp do wszystkich raportów</li>
              <li>• Zarządzanie kategoriami</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Członek</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Dodawanie własnych transakcji</li>
              <li>• Przeglądanie raportów</li>
              <li>• Dostęp do dashboard</li>
              <li>• Edycja własnych transakcji</li>
              <li>• Brak dostępu do ustawień</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
