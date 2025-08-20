'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { LoginPrompt } from '@/components/LoginPrompt'
import { CheckCircle, XCircle, Clock, Users, Mail, Calendar } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  expiresAt: string
  family: {
    id: string
    name: string
    description?: string
  }
  inviter: {
    id: string
    name: string
    email: string
  }
}

function InvitePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Brak tokenu zaproszenia')
      setLoading(false)
      return
    }

    // Sprawdź zaproszenie
    checkInvitation()
  }, [token])

  const checkInvitation = async () => {
    try {
      const response = await fetch('/api/family/invitations/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Błąd sprawdzania zaproszenia')
        setLoading(false)
        return
      }

      const data = await response.json()
      setInvitation(data.invitation)
    } catch (err) {
      console.error('Błąd sprawdzania zaproszenia:', err)
      setError('Błąd serwera')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!token) return

    setAccepting(true)
    try {
      const response = await fetch('/api/family/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Błąd akceptacji zaproszenia')
        return
      }

      setSuccess(true)
      // Przekieruj do strony rodziny po 3 sekundach
      setTimeout(() => {
        router.push('/family')
      }, 3000)
    } catch (err) {
      console.error('Błąd akceptacji zaproszenia:', err)
      setError('Błąd serwera')
    } finally {
      setAccepting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-blue-600'
      case 'ACCEPTED':
        return 'text-green-600'
      case 'DECLINED':
        return 'text-red-600'
      case 'EXPIRED':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Oczekujące'
      case 'ACCEPTED':
        return 'Zaakceptowane'
      case 'DECLINED':
        return 'Odrzucone'
      case 'EXPIRED':
        return 'Wygasło'
      default:
        return 'Nieznany'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5" />
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5" />
      case 'DECLINED':
      case 'EXPIRED':
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Zaproszenie do rodziny</h1>
                <p className="text-gray-600">Sprawdź i zaakceptuj zaproszenie do dołączenia do rodziny</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-red-800 font-medium">Błąd</h3>
                      <p className="text-red-600 mt-1">{error}</p>
                      {error.includes('Już należysz do tej rodziny') && (
                        <div className="mt-3">
                          <p className="text-sm text-red-600 mb-2">
                            Możesz przejść do swojej rodziny lub spróbować dołączyć do innej.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => router.push('/family')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Przejdź do rodziny
                            </button>
                            <button
                              onClick={() => router.push('/')}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                            >
                              Strona główna
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-green-800 font-medium">Sukces!</h3>
                      <p className="text-green-600 mt-1">
                        Pomyślnie dołączyłeś do rodziny. Przekierowywanie...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Sprawdzanie zaproszenia...</p>
                </div>
              ) : invitation ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {/* Family Info */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{invitation.family.name}</h2>
                    {invitation.family.description && (
                      <p className="text-gray-600">{invitation.family.description}</p>
                    )}
                  </div>

                  {/* Invitation Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Zaproszenie od:</span>
                      <span className="font-medium text-gray-900">{invitation.inviter.name}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{invitation.email}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Rola w rodzinie:</span>
                      <span className="font-medium text-gray-900">
                        {invitation.role === 'ADMIN' ? 'Administrator' : 'Członek'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Status:</span>
                      <div className={`flex items-center space-x-2 ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        <span className="font-medium">{getStatusText(invitation.status)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">Wygasa:</span>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(invitation.expiresAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {invitation.status === 'PENDING' && (
                    <div className="text-center">
                      <button
                        onClick={handleAcceptInvitation}
                        disabled={accepting}
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {accepting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Dołączanie...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Dołącz do rodziny</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Expired/Used Invitation */}
                  {invitation.status !== 'PENDING' && (
                    <div className="text-center">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600">
                          {invitation.status === 'ACCEPTED'
                            ? 'To zaproszenie zostało już zaakceptowane.'
                            : invitation.status === 'EXPIRED'
                            ? 'To zaproszenie wygasło.'
                            : 'To zaproszenie zostało odrzucone.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Zaproszenie nie znalezione</h3>
                  <p className="text-gray-600 mb-6">
                    Podany link zaproszenia jest nieprawidłowy lub wygasł.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Wróć do strony głównej
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  )
}
