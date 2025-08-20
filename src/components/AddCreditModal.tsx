'use client'

import { useState } from 'react'
import { X, CreditCard, DollarSign, Percent, Calendar, Target } from 'lucide-react'

interface AddCreditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (creditData: any) => void
}

export function AddCreditModal({ isOpen, onClose, onSubmit }: AddCreditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    totalAmount: '',
    interestRate: '',
    termInMonths: '',
    startDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [calculatedPayment, setCalculatedPayment] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Oblicz ratę miesięczną jeśli mamy wszystkie potrzebne dane
    if (name === 'totalAmount' || name === 'interestRate' || name === 'termInMonths') {
      calculateMonthlyPayment()
    }
  }

  const calculateMonthlyPayment = () => {
    const { totalAmount, interestRate, termInMonths } = formData

    if (totalAmount && interestRate && termInMonths) {
      const principal = parseFloat(totalAmount)
      const rate = parseFloat(interestRate) / 100 / 12 // Miesięczna stopa procentowa
      const months = parseInt(termInMonths)

      if (principal > 0 && rate > 0 && months > 0) {
        const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
        setCalculatedPayment(monthlyPayment)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.purpose || !formData.totalAmount ||
        !formData.interestRate || !formData.termInMonths || !formData.startDate) {
      alert('Wszystkie pola są wymagane')
      return
    }

    if (parseFloat(formData.totalAmount) <= 0 || parseFloat(formData.interestRate) < 0 ||
        parseInt(formData.termInMonths) <= 0) {
      alert('Nieprawidłowe wartości')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        name: formData.name,
        purpose: formData.purpose,
        totalAmount: parseFloat(formData.totalAmount),
        interestRate: parseFloat(formData.interestRate),
        termInMonths: parseInt(formData.termInMonths),
        startDate: formData.startDate
      })

      // Reset form
      setFormData({
        name: '',
        purpose: '',
        totalAmount: '',
        interestRate: '',
        termInMonths: '',
        startDate: ''
      })
      setCalculatedPayment(null)
    } catch (error) {
      console.error('Błąd dodawania kredytu:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Dodaj nowy kredyt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nazwa kredytu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa kredytu *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="np. Kredyt hipoteczny"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Cel kredytu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cel kredytu *
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="np. Zakup mieszkania w Warszawie"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Kwota całkowita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Kwota całkowita (zł) *
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              placeholder="500000"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Oprocentowanie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Percent className="h-4 w-4" />
              Oprocentowanie roczne (%) *
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleInputChange}
              placeholder="4.5"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Okres kredytowania */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4" />
              Okres kredytowania (miesiące) *
            </label>
            <input
              type="number"
              name="termInMonths"
              value={formData.termInMonths}
              onChange={handleInputChange}
              placeholder="360"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Data rozpoczęcia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data rozpoczęcia kredytu *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Obliczona rata miesięczna */}
          {calculatedPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Obliczona rata miesięczna:</span>
                <span className="text-lg font-bold text-blue-900">
                  {calculatedPayment.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Dodawanie...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Dodaj kredyt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
