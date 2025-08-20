'use client'

import { useState } from 'react'
import { X, Mail, User, Crown, Send, Loader2 } from 'lucide-react'

interface InviteFormData {
  email: string
  name: string
  role: 'MEMBER' | 'ADMIN'
}

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (data: InviteFormData) => Promise<void>
  loading?: boolean
  onShowInvitations?: () => void
}

export function InviteModal({
  isOpen,
  onClose,
  onSend,
  loading = false,
  onShowInvitations
}: InviteModalProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    name: '',
    role: 'MEMBER'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email'
    }

    if (formData.name.trim() && formData.name.length < 2) {
      newErrors.name = 'Nazwa musi mieć co najmniej 2 znaki'
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
      await onSend(formData)
      // Reset form
      setFormData({ email: '', name: '', role: 'MEMBER' })
      setErrors({})
    } catch (error) {
      console.error('Błąd wysyłania zaproszenia:', error)
      // Dodaj błąd do formularza
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      } else {
        setErrors({ submit: 'Nieznany błąd podczas wysyłania zaproszenia' })
      }
    }
  }

  const handleInputChange = (field: keyof InviteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Zaproś członka</h2>
                <p className="text-gray-600 text-sm">Wyślij zaproszenie email</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="jan.kowalski@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa (opcjonalnie)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Jan Kowalski"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rola w rodzinie
              </label>
              <div className="relative">
                <Crown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MEMBER">Członek</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Administrator może zarządzać rodziną i zaproszeniami
              </p>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
                {onShowInvitations && (
                  <button
                    type="button"
                    onClick={onShowInvitations}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Sprawdź istniejące zaproszenia
                  </button>
                )}
              </div>
            )}

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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Wysyłanie...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Wyślij zaproszenie</span>
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
