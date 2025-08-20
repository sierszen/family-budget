'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { LoginPrompt } from '@/components/LoginPrompt'
import { Plus, Edit, Trash2, Calendar, DollarSign, Receipt, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { BillModal } from '@/components/BillModal'

interface Bill {
  id: string
  name: string
  description?: string
  amount: number
  dueDate: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paidDate?: string
  billNumber?: string
  provider?: string
  category?: string
  notes?: string
}

export default function BillsPage() {
  const { data: session, status } = useSession()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBill, setEditingBill] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchBills = useCallback(async () => {
    try {
      const response = await fetch('/api/bills')
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania rachunków')
      }
      const data = await response.json()
      setBills(data.bills || [])
    } catch (err) {
      console.error('Błąd pobierania rachunków:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania danych')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchBills()
    }
  }, [session, fetchBills])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Zapłacony'
      case 'PENDING':
        return 'Oczekujący'
      case 'OVERDUE':
        return 'Przeterminowany'
      case 'CANCELLED':
        return 'Anulowany'
      default:
        return 'Nieznany'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      case 'CANCELLED':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800'

    switch (category.toLowerCase()) {
      case 'prąd':
        return 'bg-yellow-100 text-yellow-800'
      case 'gaz':
        return 'bg-blue-100 text-blue-800'
      case 'woda':
        return 'bg-cyan-100 text-cyan-800'
      case 'internet':
        return 'bg-purple-100 text-purple-800'
      case 'telefon':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveBill = async (formData: any) => {
    setSaving(true)
    try {
      const url = editingBill
        ? `/api/bills/${editingBill.id}`
        : '/api/bills'

      const method = editingBill ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania rachunku')
      }

      await fetchBills()
      setEditingBill(null)
    } catch (err) {
      console.error('Błąd zapisywania rachunku:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleEditBill = (bill: any) => {
    setEditingBill(bill)
    setShowAddModal(true)
  }

  const markBillPaid = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      if (!response.ok) {
        throw new Error('Nie udało się oznaczyć rachunku jako zapłacony')
      }
      await fetchBills()
    } catch (err) {
      console.error(err)
      alert('Błąd podczas oznaczania rachunku jako zapłacony')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBill(null)
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
                  <h1 className="text-3xl font-bold text-gray-900">Rachunki</h1>
                  <p className="text-gray-600 mt-2">Zarządzaj rachunkami i terminami płatności</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj rachunek</span>
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
                  <p className="mt-4 text-gray-600">Ładowanie rachunków...</p>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak rachunków</h3>
                  <p className="text-gray-600 mb-6">Dodaj pierwszy rachunek, aby śledzić terminy płatności.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Dodaj rachunek
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bills.map((bill) => {
                    const daysUntilDue = getDaysUntilDue(bill.dueDate)
                    const isOverdue = daysUntilDue < 0 && bill.status === 'PENDING'

                    return (
                      <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{bill.name}</h3>
                            {bill.description && (
                              <p className="text-gray-500 text-sm mt-1">{bill.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditBill(bill)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {bill.status !== 'PAID' && (
                              <button
                                onClick={() => markBillPaid(bill.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Oznacz jako zapłacone"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">
                              {Number(bill.amount).toLocaleString('pl-PL')} zł
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(bill.status)}`}>
                            {getStatusIcon(bill.status)}
                            <span>{getStatusText(bill.status)}</span>
                          </div>
                        </div>

                        {/* Provider and Category */}
                        {(bill.provider || bill.category) && (
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Receipt className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {bill.provider && `${bill.provider}`}
                                {bill.provider && bill.category && ' • '}
                                {bill.category && `${bill.category}`}
                              </span>
                            </div>
                            {bill.category && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bill.category)}`}>
                                {bill.category}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Due Date */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Termin płatności:</span>
                          </div>
                          <span className={`text-sm font-medium ${getUrgencyColor(daysUntilDue)}`}>
                            {formatDate(bill.dueDate)}
                          </span>
                        </div>

                        {/* Bill Number */}
                        {bill.billNumber && (
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Nr rachunku:</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {bill.billNumber}
                            </span>
                          </div>
                        )}

                        {/* Paid Date */}
                        {bill.paidDate && (
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">Zapłacono:</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {formatDate(bill.paidDate)}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {bill.notes && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-600">{bill.notes}</p>
                          </div>
                        )}

                        {/* Overdue Warning */}
                        {isOverdue && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">
                              ⚠️ Rachunek przeterminowany o {Math.abs(daysUntilDue)} dni
                            </p>
                          </div>
                        )}

                        {/* Due Soon Warning */}
                        {!isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && bill.status === 'PENDING' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-600 text-sm font-medium">
                              ⏰ Rachunek do zapłaty za {daysUntilDue} dni
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
      <BillModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveBill}
        editingBill={editingBill}
        loading={saving}
      />
    </div>
  )
}
