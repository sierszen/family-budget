'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Repeat } from 'lucide-react'

interface RecurringPaymentFormData {
  name: string
  description: string
  amount: string
  type: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'CUSTOM'
  customDays: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface RecurringPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: RecurringPaymentFormData) => Promise<void>
  editingPayment?: any
  loading?: boolean
}

export function RecurringPaymentModal({
  isOpen,
  onClose,
  onSave,
  editingPayment,
  loading = false
}: RecurringPaymentModalProps) {
  const [formData, setFormData] = useState<RecurringPaymentFormData>({
    name: '',
    description: '',
    amount: '',
    type: 'MONTHLY',
    customDays: '',
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        name: editingPayment.name || '',
        description: editingPayment.description || '',
        amount: editingPayment.amount?.toString() || '',
        type: editingPayment.type || 'MONTHLY',
        customDays: editingPayment.customDays?.toString() || '',
        startDate: editingPayment.startDate ? new Date(editingPayment.startDate).toISOString().split('T')[0] : '',
        endDate: editingPayment.endDate ? new Date(editingPayment.endDate).toISOString().split('T')[0] : '',
        isActive: editingPayment.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        description: '',
        amount: '',
        type: 'MONTHLY',
        customDays: '',
        startDate: '',
        endDate: '',
        isActive: true
      })
    }
    setErrors({})
  }, [editingPayment, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa jest wymagana'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Kwota musi być większa od 0'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data rozpoczęcia jest wymagana'
    }

    if (formData.type === 'CUSTOM' && (!formData.customDays || parseInt(formData.customDays) <= 0)) {
      newErrors.customDays = 'Liczba dni musi być większa od 0'
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
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

  const handleInputChange = (field: keyof RecurringPaymentFormData, value: string | boolean) => {
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Repeat className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPayment ? 'Edytuj płatność stałą' : 'Dodaj płatność stałą'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {editingPayment ? 'Zmień szczegóły płatności stałej' : 'Utwórz nową regularną płatność'}
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
                  Nazwa płatności *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="np. Netflix, Spotify, Abonament telefon"
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
                  placeholder="Dodatkowe informacje o płatności..."
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

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Częstotliwość *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Miesięcznie</option>
                  <option value="QUARTERLY">Kwartalnie</option>
                  <option value="SEMI_ANNUALLY">Półrocznie</option>
                  <option value="ANNUALLY">Rocznie</option>
                  <option value="CUSTOM">Niestandardowa</option>
                </select>
              </div>

              {/* Custom Days */}
              {formData.type === 'CUSTOM' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Co ile dni *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.customDays}
                    onChange={(e) => handleInputChange('customDays', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.customDays ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="np. 14 dla co 2 tygodnie"
                  />
                  {errors.customDays && <p className="mt-1 text-sm text-red-600">{errors.customDays}</p>}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data rozpoczęcia *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data zakończenia (opcjonalnie)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Aktywna płatność
              </label>
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
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Zapisywanie...</span>
                  </>
                ) : (
                  <>
                    <span>{editingPayment ? 'Zapisz zmiany' : 'Dodaj płatność'}</span>
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
