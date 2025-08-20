import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Test konfiguracji NextAuth...')

    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'USTAWIONY' : 'BRAK',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'USTAWIONY' : 'BRAK',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'USTAWIONY' : 'BRAK',
      DATABASE_URL: process.env.DATABASE_URL ? 'USTAWIONY' : 'BRAK'
    }

    console.log('📋 Zmienne środowiskowe:', envVars)

    return NextResponse.json({
      status: 'success',
      message: 'Test konfiguracji NextAuth',
      environment: envVars,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Błąd testu NextAuth:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas testu',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
