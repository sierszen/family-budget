'use client';

import { useState } from 'react';
import {
  Home,
  Wallet,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Wallet, label: 'Transakcje', href: '/transactions' },
  { icon: TrendingUp, label: 'Analizy', href: '/analytics' },
  { icon: Users, label: 'Członkowie', href: '/members' },
  { icon: BarChart3, label: 'Raporty', href: '/reports' },
  { icon: Settings, label: 'Ustawienia', href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
            <Plus className="h-4 w-4" />
            {!collapsed && <span>Dodaj transakcję</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
