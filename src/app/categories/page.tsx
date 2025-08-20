'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE'
}

export default function CategoriesPage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#3b82f6',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
  })

  useEffect(() => {
    if (session) {
      fetchCategories()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania kategorii')
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Błąd pobierania kategorii:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      name: '',
      icon: '💰',
      color: '#3b82f6',
      type: 'EXPENSE'
    })
    setShowAddModal(true)
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type
    })
    setEditingCategory(category)
    setShowAddModal(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kategorię? Transakcje z tą kategorią zostaną również usunięte.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas usuwania')
      }

      await fetchCategories()
      alert('Kategoria została usunięta pomyślnie!')
    } catch (err) {
      console.error('Błąd usuwania:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas usuwania')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'

      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas zapisywania')
      }

      await fetchCategories()
      setShowAddModal(false)
      setEditingCategory(null)
      alert(editingCategory ? 'Kategoria zaktualizowana pomyślnie!' : 'Kategoria dodana pomyślnie!')
    } catch (err) {
      console.error('Błąd zapisywania:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas zapisywania')
    }
  }

  const handleCancel = () => {
    setShowAddModal(false)
    setEditingCategory(null)
  }

  const iconOptions = ['💰', '🍽️', '🚗', '🏠', '🎮', '🏥', '📚', '💵', '🛒', '🎬', '✈️', '🏋️', '🎨', '📱', '💻', '🎵', '📺', '🎪', '🏖️', '🎯']

  const colorOptions = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#84cc16', '#f59e0b'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Błąd</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE')
  const incomeCategories = categories.filter(cat => cat.type === 'INCOME')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zarządzanie kategoriami</h1>
              <p className="text-gray-600">Dodawaj, edytuj i usuwaj kategorie wydatków i przychodów</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj kategorię</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-red-500 mr-2">📤</span>
              Kategorie wydatków
            </h2>
            <div className="space-y-3">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <div
                        className="w-4 h-4 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edytuj"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-gray-500 text-center py-4">Brak kategorii wydatków</p>
              )}
            </div>
          </div>

          {/* Income Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-green-500 mr-2">📥</span>
              Kategorie przychodów
            </h2>
            <div className="space-y-3">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <div
                        className="w-4 h-4 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edytuj"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-gray-500 text-center py-4">Brak kategorii przychodów</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Edytuj kategorię' : 'Dodaj kategorię'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ kategorii
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      formData.type === 'EXPENSE'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Wydatek
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      formData.type === 'INCOME'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Przychód
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa kategorii
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Jedzenie"
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ikona
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 text-2xl rounded-lg border transition-colors ${
                        formData.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kolor
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                        formData.color === color
                          ? 'border-gray-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorię'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
