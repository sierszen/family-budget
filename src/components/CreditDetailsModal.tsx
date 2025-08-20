'use client'

import { useState } from 'react'
import { X, CreditCard, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface Credit {
  id: string
  name: string
  purpose: string
  totalAmount: number
  interestRate: number
  termInMonths: number
  monthlyPayment: number
  startDate: string
  endDate: string
  remainingCapital: number
  totalPaidInterest: number
  status: 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED' | 'REFINANCED'
  payments: CreditPayment[]
}

interface CreditPayment {
  id: string
  paymentNumber: number
  dueDate: string
  amount: number
  capitalPart: number
  interestPart: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL'
  paidDate?: string
}

interface CreditDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  credit: Credit
  onUpdate: () => void
}

export function CreditDetailsModal({ isOpen, onClose, credit, onUpdate }: CreditDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  const handlePaymentToggle = (paymentId: string) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  const handleMarkAsPaid = async () => {
    if (selectedPayments.length === 0) {
      alert('Wybierz płatności do oznaczenia jako zapłacone')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/credits/${credit.id}/payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIds: selectedPayments,
          status: 'PAID'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas aktualizacji płatności')
      }

      setSelectedPayments([])
      onUpdate()
    } catch (err) {
      console.error('Błąd aktualizacji płatności:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas aktualizacji płatności')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusColor = (status: string) => {
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

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      case 'PARTIAL':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentStatusText = (status: string) => {
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

  const calculateProgress = () => {
    const paidAmount = Number(credit.totalAmount) - Number(credit.remainingCapital)
    return (paidAmount / Number(credit.totalAmount)) * 100
  }

  const paidPayments = credit.payments.filter(p => p.status === 'PAID').length
  const totalPayments = credit.payments.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{credit.name}</h2>
              <p className="text-sm text-gray-500">{credit.purpose}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Credit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Kwota całkowita</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {Number(credit.totalAmount).toLocaleString('pl-PL')} zł
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Pozostały kapitał</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {Number(credit.remainingCapital).toLocaleString('pl-PL')} zł
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Rata miesięczna</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {Number(credit.monthlyPayment).toLocaleString('pl-PL')} zł
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Postęp spłaty</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {calculateProgress().toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Spłacone: {paidPayments} z {totalPayments} rat</span>
              <span>Zapłacone odsetki: {Number(credit.totalPaidInterest).toLocaleString('pl-PL')} zł</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Harmonogram spłat</h3>
              {selectedPayments.length > 0 && (
                <button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Aktualizowanie...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Oznacz jako zapłacone ({selectedPayments.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {credit.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedPayments.includes(payment.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handlePaymentToggle(payment.id)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={payment.status === 'PAID'}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Rata {payment.paymentNumber}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusIcon(payment.status)}
                            {getPaymentStatusText(payment.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Termin: {new Date(payment.dueDate).toLocaleDateString('pl-PL')}
                          {payment.paidDate && (
                            <span className="ml-2">
                              • Zapłacono: {new Date(payment.paidDate).toLocaleDateString('pl-PL')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">{Number(payment.amount).toLocaleString('pl-PL')} zł</div>
                      <div className="text-xs text-gray-500">
                        Kapitał: {Number(payment.capitalPart).toLocaleString('pl-PL')} zł
                      </div>
                      <div className="text-xs text-gray-500">
                        Odsetki: {Number(payment.interestPart).toLocaleString('pl-PL')} zł
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Credit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Szczegóły kredytu</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Oprocentowanie:</span>
                  <span className="font-medium">{(Number(credit.interestRate) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Okres kredytowania:</span>
                  <span className="font-medium">{credit.termInMonths} miesięcy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data rozpoczęcia:</span>
                  <span className="font-medium">{new Date(credit.startDate).toLocaleDateString('pl-PL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data zakończenia:</span>
                  <span className="font-medium">{new Date(credit.endDate).toLocaleDateString('pl-PL')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Status kredytu</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(credit.status)}`}>
                    {getPaymentStatusText(credit.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spłacone raty:</span>
                  <span className="font-medium">{paidPayments} z {totalPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pozostałe raty:</span>
                  <span className="font-medium">{totalPayments - paidPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zapłacone odsetki:</span>
                  <span className="font-medium">{Number(credit.totalPaidInterest).toLocaleString('pl-PL')} zł</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
