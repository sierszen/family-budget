'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { LoginPrompt } from '@/components/LoginPrompt'
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Percent,
  MoreVertical,
  Edit,
  Eye,
  Download,
  Calculator
} from 'lucide-react'
import { AddCreditModal } from '@/components/AddCreditModal'
import { CreditDetailsModal } from '@/components/CreditDetailsModal'

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

export default function CreditsPage() {
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Sprawdź rolę użytkownika
  const checkUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/debug-session', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Rola użytkownika:', data.user?.role)
        setUserRole(data.user?.role || null)
      }
    } catch (error) {
      console.error('Błąd sprawdzania roli:', error)
    }
  }, [])

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔍 Pobieram kredyty...')
      const response = await fetch(`/api/credits?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania kredytów')
      }

      const data = await response.json()
      console.log('📋 Otrzymane kredyty:', data.credits)
      setCredits(data.credits || [])
    } catch (err) {
      console.error('Błąd pobierania kredytów:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAddCredit = useCallback(async (creditData: any) => {
    try {
      console.log('🔍 Wysyłam dane kredytu:', creditData)
      console.log('🔍 URL API:', window.location.origin + '/api/credits')
      
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creditData),
      })

      console.log('🔍 Status odpowiedzi:', response.status)
      console.log('🔍 Headers odpowiedzi:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Błąd odpowiedzi:', errorData)
        throw new Error(errorData.error || 'Błąd podczas dodawania kredytu')
      }

      await fetchCredits()
      setShowAddModal(false)
    } catch (err) {
      console.error('Błąd dodawania kredytu:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas dodawania kredytu')
    }
  }, [fetchCredits])

  const handleDeleteCredit = useCallback(async (creditId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kredyt? Ta operacja jest nieodwracalna.')) {
      return
    }

    try {
      const response = await fetch(`/api/credits/${creditId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania kredytu')
      }

      await fetchCredits()
    } catch (err) {
      console.error('Błąd usuwania kredytu:', err)
      alert('Błąd podczas usuwania kredytu')
    }
  }, [fetchCredits])

  const handleMenuToggle = useCallback((creditId: string) => {
    console.log('🔍 Kliknięto menu dla kredytu:', creditId, 'obecnie otwarte:', openMenuId)
    setOpenMenuId(openMenuId === creditId ? null : creditId)
  }, [openMenuId])

  useEffect(() => {
    console.log('🔍 Sesja zmieniła się:', {
      user: session?.user?.name,
      email: session?.user?.email,
      id: session?.user?.id
    })
    if (session) {
      fetchCredits()
      // Wywołaj checkUserRole w osobnej funkcji
      const checkRole = async () => {
        await checkUserRole()
      }
      checkRole()
    }
  }, [session, fetchCredits, checkUserRole])

  // Debug stanu kredytów
  useEffect(() => {
    console.log('🔍 Stan kredytów zmienił się:', {
      liczba: credits.length,
      kredyty: credits.map(c => ({ id: c.id, name: c.name }))
    })
  }, [credits])

  // Zamykanie menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.credit-menu')) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'PAID_OFF':
        return 'bg-green-100 text-green-800'
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800'
      case 'REFINANCED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4" />
      case 'PAID_OFF':
        return <CheckCircle className="h-4 w-4" />
      case 'DEFAULTED':
        return <AlertTriangle className="h-4 w-4" />
      case 'REFINANCED':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktywny'
      case 'PAID_OFF':
        return 'Spłacony'
      case 'DEFAULTED':
        return 'Przeterminowany'
      case 'REFINANCED':
        return 'Refinansowany'
      default:
        return 'Nieznany'
    }
  }

  const calculateProgress = (credit: Credit) => {
    const paidAmount = Number(credit.totalAmount) - Number(credit.remainingCapital)
    return (paidAmount / Number(credit.totalAmount)) * 100
  }

  const handleViewSchedule = (credit: Credit) => {
    setSelectedCredit(credit)
    setShowDetailsModal(true)
    setOpenMenuId(null)
  }

  const handleEditCredit = (_credit: Credit) => {
    alert('Funkcja edycji kredytu będzie dostępna wkrótce!')
    setOpenMenuId(null)
  }

  const handleCalculateEarlyPayment = (_credit: Credit) => {
    alert('Kalkulator wczesnej spłaty będzie dostępny wkrótce!')
    setOpenMenuId(null)
  }

  const handleExportCredit = (_credit: Credit) => {
    alert('Funkcja eksportu będzie dostępna wkrótce!')
    setOpenMenuId(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  Kredyty
                </h1>
                <p className="text-gray-600 mt-2">Zarządzaj swoimi kredytami i harmonogramami spłat</p>
                {userRole && (
                  <p className="text-sm text-gray-500 mt-1">
                    Rola: <span className="font-medium">{userRole}</span>
                    {userRole !== 'ADMIN' && (
                      <span className="text-red-500 ml-2">
                        (Wymagana rola ADMIN do dodawania kredytów)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Dodaj kredyt</span>
              </button>
            </div>

            {/* Credits List */}
            {credits.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Brak kredytów</h3>
                <p className="text-gray-500 mb-6">
                  Dodaj swój pierwszy kredyt, aby rozpocząć śledzenie spłat.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Dodaj pierwszy kredyt</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credits.map((credit) => (
                  <div key={credit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{credit.name}</h3>
                        <p className="text-sm text-gray-500">{credit.purpose}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(credit.status)}`}>
                          {getStatusIcon(credit.status)}
                          {getStatusText(credit.status)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Postęp spłaty</span>
                        <span>{calculateProgress(credit).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(credit)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Kwota całkowita
                        </span>
                        <span className="font-medium">{Number(credit.totalAmount).toLocaleString('pl-PL')} zł</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Pozostały kapitał
                        </span>
                        <span className="font-medium text-red-600">{Number(credit.remainingCapital).toLocaleString('pl-PL')} zł</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Rata miesięczna
                        </span>
                        <span className="font-medium">{Number(credit.monthlyPayment).toLocaleString('pl-PL')} zł</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          Oprocentowanie
                        </span>
                        <span className="font-medium">{(Number(credit.interestRate) * 100).toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedCredit(credit)
                          setShowDetailsModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Szczegóły
                      </button>
                      <div className="flex items-center space-x-2">
                        {/* Menu */}
                        <div className="relative credit-menu">
                          <button
                            onClick={() => handleMenuToggle(credit.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-lg"
                            title="Więcej opcji"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {openMenuId === credit.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => handleViewSchedule(credit)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Zobacz harmonogram</span>
                              </button>
                              <button
                                onClick={() => handleEditCredit(credit)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edytuj kredyt</span>
                              </button>
                              <button
                                onClick={() => handleCalculateEarlyPayment(credit)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Calculator className="h-4 w-4" />
                                <span>Kalkulator wczesnej spłaty</span>
                              </button>
                              <button
                                onClick={() => handleExportCredit(credit)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Download className="h-4 w-4" />
                                <span>Eksportuj dane</span>
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => handleDeleteCredit(credit.id)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Usuń kredyt</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modals */}
            {showAddModal && (
              <AddCreditModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddCredit}
              />
            )}

            {showDetailsModal && selectedCredit && (
              <CreditDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                  setShowDetailsModal(false)
                  setSelectedCredit(null)
                }}
                credit={selectedCredit}
                onUpdate={fetchCredits}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
