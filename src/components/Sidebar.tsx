'use client'

import { useState } from 'react'
import {
  Home,
  CreditCard,
  BarChart3,
  Users,
  FileText,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Transakcje', icon: CreditCard, href: '/transactions' },
  { name: 'Analizy', icon: BarChart3, href: '/analytics' },
  { name: 'Rodzina', icon: Users, href: '/members' },
  { name: 'Raporty', icon: FileText, href: '/reports' },
  { name: 'Ustawienia', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Add Transaction button */}
        <div className="p-4">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
            <Plus className="h-4 w-4" />
            {!collapsed && <span>Dodaj transakcję</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
