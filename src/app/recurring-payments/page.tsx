'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { LoginPrompt } from '@/components/LoginPrompt'
import { Plus, Edit, Trash2, Calendar, DollarSign, Repeat, Clock, CheckCircle } from 'lucide-react'
import { RecurringPaymentModal } from '@/components/RecurringPaymentModal'

interface RecurringPayment {
  id: string
  name: string
  description?: string
  amount: number
  type: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'CUSTOM'
  customDays?: number
  startDate: string
  endDate?: string
  nextDueDate: string
  isActive: boolean
  payments: {
    id: string
    dueDate: string
    amount: number
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL'
    paidDate?: string
  }[]
}

export default function RecurringPaymentsPage() {
  const { data: session, status } = useSession()
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchRecurringPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/recurring-payments')
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania płatności stałych')
      }
      const data = await response.json()
      setRecurringPayments(data.recurringPayments || [])
    } catch (err) {
      console.error('Błąd pobierania płatności stałych:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania danych')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchRecurringPayments()
    }
  }, [session, fetchRecurringPayments])

  const getTypeText = (type: string, customDays?: number) => {
    switch (type) {
      case 'MONTHLY':
        return 'Miesięcznie'
      case 'QUARTERLY':
        return 'Kwartalnie'
      case 'SEMI_ANNUALLY':
        return 'Półrocznie'
      case 'ANNUALLY':
        return 'Rocznie'
      case 'CUSTOM':
        return `Co ${customDays} dni`
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Zapłacona'
      case 'PENDING':
        return 'Oczekująca'
      case 'OVERDUE':
        return 'Przeterminowana'
      case 'PARTIAL':
        return 'Częściowa'
      default:
        return 'Nieznany'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL')
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 0) return 'text-red-600'
    if (daysUntilDue <= 3) return 'text-orange-600'
    if (daysUntilDue <= 7) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const handleSavePayment = async (formData: any) => {
    setSaving(true)
    try {
      const url = editingPayment
        ? `/api/recurring-payments/${editingPayment.id}`
        : '/api/recurring-payments'

      const method = editingPayment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          customDays: formData.type === 'CUSTOM' ? parseInt(formData.customDays) : null,
          endDate: formData.endDate || null
        }),
      })

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania płatności')
      }

      await fetchRecurringPayments()
      setEditingPayment(null)
    } catch (err) {
      console.error('Błąd zapisywania płatności:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setShowAddModal(true)
  }

  const markRecurringPaid = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/recurring-payments/${paymentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      if (!response.ok) {
        throw new Error('Nie udało się oznaczyć płatności jako zapłaconej')
      }
      await fetchRecurringPayments()
    } catch (err) {
      console.error(err)
      alert('Błąd podczas oznaczania płatności jako zapłaconej')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingPayment(null)
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return <LoginPrompt />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />

          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Płatności stałe</h1>
                  <p className="text-gray-600 mt-2">Zarządzaj regularnymi płatnościami</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj płatność</span>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Ładowanie płatności stałych...</p>
                </div>
              ) : recurringPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Repeat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak płatności stałych</h3>
                  <p className="text-gray-600 mb-6">Dodaj pierwszą płatność stałą, aby rozpocząć śledzenie regularnych wydatków.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Dodaj płatność
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recurringPayments.map((payment) => {
                    const daysUntilDue = getDaysUntilDue(payment.nextDueDate)
                    const isOverdue = daysUntilDue < 0

                    return (
                      <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{payment.name}</h3>
                            {payment.description && (
                              <p className="text-gray-500 text-sm mt-1">{payment.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => markRecurringPaid(payment.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Oznacz aktualny termin jako zapłacony"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Amount and Type */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">
                              {Number(payment.amount).toLocaleString('pl-PL')} zł
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Repeat className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-600">
                              {getTypeText(payment.type, payment.customDays)}
                            </span>
                          </div>
                        </div>

                        {/* Next Due Date */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Następny termin:</span>
                          </div>
                          <span className={`text-sm font-medium ${getUrgencyColor(daysUntilDue)}`}>
                            {formatDate(payment.nextDueDate)}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Status:</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.isActive ? 'PENDING' : 'PAID')}`}>
                            {payment.isActive ? 'Aktywna' : 'Nieaktywna'}
                          </div>
                        </div>

                        {/* Recent Payments */}
                        {payment.payments.length > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Ostatnie płatności:</h4>
                            <div className="space-y-2">
                              {payment.payments.slice(0, 3).map((paymentHistory) => (
                                <div key={paymentHistory.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    {paymentHistory.status === 'PAID' ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-gray-400" />
                                    )}
                                    <span className="text-gray-600">{formatDate(paymentHistory.dueDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-900">{Number(paymentHistory.amount).toLocaleString('pl-PL')} zł</span>
                                    <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(paymentHistory.status)}`}>
                                      {getStatusText(paymentHistory.status)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Overdue Warning */}
                        {isOverdue && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">
                              ⚠️ Płatność przeterminowana o {Math.abs(daysUntilDue)} dni
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      <RecurringPaymentModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
        loading={saving}
      />
    </div>
  )
}
