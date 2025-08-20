'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Wrench, Crown, AlertTriangle, CheckCircle } from 'lucide-react'

export default function FixRolePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixRole = async () => {
    if (!session) {
      setError('Musisz być zalogowany')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/fix-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas naprawiania roli')
      }

      setResult(data)
    } catch (err) {
      console.error('Błąd naprawiania roli:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Wymagane logowanie</h2>
          <p className="text-gray-600">Musisz być zalogowany, aby naprawić rolę użytkownika.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <Wrench className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Napraw rolę użytkownika</h1>
            <p className="text-gray-600 mt-2">
              Napraw rolę użytkownika, aby móc zarządzać rodziną
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Informacje o użytkowniku:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Nazwa:</strong> {session.user?.name}</p>
                <p><strong>ID:</strong> {session.user?.id}</p>
              </div>
            </div>

            <button
              onClick={handleFixRole}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Naprawianie...</span>
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  <span>Napraw rolę użytkownika</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 font-medium">Błąd</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">Sukces</span>
                </div>
                <p className="text-green-700 mt-1">{result.message}</p>
                {result.user && (
                  <div className="mt-2 text-sm text-green-600">
                    <p><strong>Rola:</strong> {result.user.role}</p>
                    <p><strong>Email:</strong> {result.user.email}</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              <p>Ta funkcja naprawi rolę użytkownika, ustawiając ją na ADMIN.</p>
              <p>Dotyczy tylko pierwszego członka rodziny.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
