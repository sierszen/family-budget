'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Receipt, Building, Hash, FileText } from 'lucide-react'

interface BillFormData {
  name: string
  description: string
  amount: string
  dueDate: string
  billNumber: string
  provider: string
  category: string
  notes: string
}

interface BillModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BillFormData) => Promise<void>
  editingBill?: any
  loading?: boolean
}

const CATEGORIES = [
  'Prąd',
  'Gaz',
  'Woda',
  'Internet',
  'Telefon',
  'Telewizja',
  'Ogrzewanie',
  'Śmieci',
  'Ubezpieczenie',
  'Inne'
]

const PROVIDERS = [
  'Tauron',
  'PGE',
  'Enea',
  'PGNiG',
  'Orlen',
  'Orange',
  'Play',
  'T-Mobile',
  'Plus',
  'UPC',
  'Vectra',
  'Inny'
]

export function BillModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingBill, 
  loading = false 
}: BillModalProps) {
  const [formData, setFormData] = useState<BillFormData>({
    name: '',
    description: '',
    amount: '',
    dueDate: '',
    billNumber: '',
    provider: '',
    category: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name || '',
        description: editingBill.description || '',
        amount: editingBill.amount?.toString() || '',
        dueDate: editingBill.dueDate ? new Date(editingBill.dueDate).toISOString().split('T')[0] : '',
        billNumber: editingBill.billNumber || '',
        provider: editingBill.provider || '',
        category: editingBill.category || '',
        notes: editingBill.notes || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        amount: '',
        dueDate: '',
        billNumber: '',
        provider: '',
        category: '',
        notes: ''
      })
    }
    setErrors({})
  }, [editingBill, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa rachunku jest wymagana'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Kwota musi być większa od 0'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Termin płatności jest wymagany'
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Termin płatności nie może być w przeszłości'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error)
    }
  }

  const handleInputChange = (field: keyof BillFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBill ? 'Edytuj rachunek' : 'Dodaj rachunek'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {editingBill ? 'Zmień szczegóły rachunku' : 'Utwórz nowy rachunek do zapłaty'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa rachunku *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="np. Rachunek za prąd - styczeń 2024"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dodatkowe informacje o rachunku..."
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kwota (zł) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termin płatności *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dostawca
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.provider}
                    onChange={(e) => handleInputChange('provider', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz dostawcę</option>
                    {PROVIDERS.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoria
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz kategorie</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bill Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer rachunku
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.billNumber}
                    onChange={(e) => handleInputChange('billNumber', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="np. 2024/001/123456"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notatki (opcjonalnie)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dodatkowe uwagi, przypomnienia lub informacje..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={loading}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <span>{editingBill ? 'Zapisz zmiany' : 'Dodaj rachunek'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
