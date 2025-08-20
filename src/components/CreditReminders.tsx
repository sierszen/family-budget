'use client'

import { useState, useEffect } from 'react'
import { Bell, CreditCard, Calendar, AlertTriangle } from 'lucide-react'

interface Reminder {
  type: 'credit' | 'recurring' | 'bill'
  // Dla kredytów
  creditId?: string
  creditName?: string
  creditPurpose?: string
  monthlyPayment?: number
  upcomingPayments?: {
    paymentNumber: number
    dueDate: string
    amount: number
    daysUntilDue: number
  }[]
  // Dla płatności stałych
  id?: string
  name?: string
  description?: string
  amount?: number
  nextDueDate?: string
  daysUntilDue?: number
  // Dla rachunków
  dueDate?: string
  provider?: string
  category?: string
}

interface PaymentRemindersProps {
  isOpen: boolean
  onClose: () => void
}

export function PaymentReminders({ isOpen, onClose }: PaymentRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReminders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/credit-reminders')

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania przypomnień')
      }

      const data = await response.json()
      setReminders(data.reminders || [])
    } catch (err) {
      console.error('Błąd pobierania przypomnień:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania przypomnień')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchReminders()
    }
  }, [isOpen])

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) return 'text-red-600 bg-red-50'
    if (daysUntilDue <= 3) return 'text-orange-600 bg-orange-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getUrgencyIcon = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) return <AlertTriangle className="h-4 w-4" />
    return <Calendar className="h-4 w-4" />
  }

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return 'Dzisiaj'
    if (daysUntilDue === 1) return 'Jutro'
    if (daysUntilDue < 7) return `Za ${daysUntilDue} dni`
    return `Za ${daysUntilDue} dni`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Przypomnienia o płatnościach</h2>
              <p className="text-sm text-gray-500">Zbliżające się terminy kredytów, płatności stałych i rachunków</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Zamknij</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Ładowanie przypomnień...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchReminders}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Brak zbliżających się terminów płatności</p>
              <p className="text-sm text-gray-500 mt-2">Wszystkie kredyty, płatności stałe i rachunki są na czas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder, index) => (
                <div key={reminder.creditId || reminder.id || index} className="border border-gray-200 rounded-lg p-4">
                  {reminder.type === 'credit' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{reminder.creditName}</h3>
                          <p className="text-sm text-gray-500">{reminder.creditPurpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {Number(reminder.monthlyPayment).toLocaleString('pl-PL')} zł
                          </p>
                          <p className="text-xs text-gray-500">rata miesięczna</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {reminder.upcomingPayments?.map((payment) => (
                          <div
                            key={payment.paymentNumber}
                            className={`flex items-center justify-between p-3 rounded-lg ${getUrgencyColor(payment.daysUntilDue)}`}
                          >
                            <div className="flex items-center space-x-3">
                              {getUrgencyIcon(payment.daysUntilDue)}
                              <div>
                                <p className="font-medium">Rata {payment.paymentNumber}</p>
                                <p className="text-sm opacity-75">
                                  {new Date(payment.dueDate).toLocaleDateString('pl-PL')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{Number(payment.amount).toLocaleString('pl-PL')} zł</p>
                              <p className="text-sm font-medium">{getUrgencyText(payment.daysUntilDue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {reminder.type === 'recurring' && (
                    <div className={`flex items-center justify-between p-3 rounded-lg ${getUrgencyColor(reminder.daysUntilDue || 0)}`}>
                      <div className="flex items-center space-x-3">
                        {getUrgencyIcon(reminder.daysUntilDue || 0)}
                        <div>
                          <p className="font-medium">{reminder.name}</p>
                          <p className="text-sm opacity-75">
                            {reminder.description && `${reminder.description} • `}
                            {reminder.nextDueDate && new Date(reminder.nextDueDate).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(reminder.amount).toLocaleString('pl-PL')} zł</p>
                        <p className="text-sm font-medium">{getUrgencyText(reminder.daysUntilDue || 0)}</p>
                      </div>
                    </div>
                  )}

                  {reminder.type === 'bill' && (
                    <div className={`flex items-center justify-between p-3 rounded-lg ${getUrgencyColor(reminder.daysUntilDue || 0)}`}>
                      <div className="flex items-center space-x-3">
                        {getUrgencyIcon(reminder.daysUntilDue || 0)}
                        <div>
                          <p className="font-medium">{reminder.name}</p>
                          <p className="text-sm opacity-75">
                            {reminder.provider && `${reminder.provider} • `}
                            {reminder.category && `${reminder.category} • `}
                            {reminder.dueDate && new Date(reminder.dueDate).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(reminder.amount).toLocaleString('pl-PL')} zł</p>
                        <p className="text-sm font-medium">{getUrgencyText(reminder.daysUntilDue || 0)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}
