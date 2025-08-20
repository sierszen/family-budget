'use client'

import { useState } from 'react'
import { LogIn, Users, Shield, Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'

export function LoginPrompt() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Logowanie
        console.log('Próba logowania...')
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        console.log('Wynik logowania:', result)

        if (result?.error) {
          setError('Nieprawidłowy email lub hasło')
        }
      } else {
        // Rejestracja
        console.log('Próba rejestracji...', { email: formData.email, name: formData.name })

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        console.log('Status odpowiedzi:', response.status)

        const data = await response.json()
        console.log('Odpowiedź serwera:', data)

        if (!response.ok) {
          if (response.status === 409 && data.error?.includes('już istnieje')) {
            setError('Użytkownik z tym emailem już istnieje. Spróbuj się zalogować zamiast rejestrować.')
            setIsLogin(true) // Przełącz na tryb logowania
          } else if (response.ok && data.message?.includes('aktywowane')) {
            // Konto zostało aktywowane - nie pokazuj błędu, tylko komunikat sukcesu
            console.log('Konto aktywowane:', data.message)
          } else if (data.details) {
            setError(`${data.error}: ${Array.isArray(data.details) ? data.details.join(', ') : data.details}`)
          } else {
            setError(data.error || 'Błąd podczas rejestracji')
          }
        } else {
          // Po udanej rejestracji lub aktywacji konta, zaloguj użytkownika
          console.log('Rejestracja/aktywacja udana, loguję użytkownika...')
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          })

          if (result?.error) {
            setError('Błąd podczas logowania po rejestracji')
          }
        }
      }
    } catch (error) {
      console.error('Błąd w handleSubmit:', error)
      setError('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Family Budget
          </h1>
          <p className="text-gray-600">
            Inteligentne zarządzanie budżetem rodzinnym
          </p>
        </div>

        {/* Formularz */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imię i nazwisko
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jan Kowalski"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="jan@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>{loading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}</span>
          </button>
        </form>

        {/* Przełącznik między logowaniem a rejestracją */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ email: '', password: '', name: '' })
            }}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
          </button>
        </div>

        {/* Separator */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">lub</span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => signIn('google')}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Zaloguj się przez Google</span>
        </button>

        <div className="space-y-4 mt-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">Bezpieczna autoryzacja</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700">AI-powered podpowiedzi finansowe</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-gray-700">Współdzielenie z rodziną</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Logując się, akceptujesz nasze warunki użytkowania i politykę prywatności
        </p>
      </div>
    </div>
  )
}
