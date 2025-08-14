'use client'

import { LogIn, Users, Shield, Zap } from 'lucide-react'
import { signIn } from 'next-auth/react'

export function LoginPrompt() {
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

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">Bezpieczna autoryzacja przez Google</span>
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

        <button
          onClick={() => signIn('google')}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <LogIn className="h-5 w-5" />
          <span>Zaloguj się przez Google</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Logując się, akceptujesz nasze warunki użytkowania i politykę prywatności
        </p>
      </div>
    </div>
  )
}
