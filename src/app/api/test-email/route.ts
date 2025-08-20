import { NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET() {
  try {
    const isConnected = await testEmailConnection()

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Połączenie z serwerem email OK',
        config: {
          user: process.env.EMAIL_USER ? '✅ Skonfigurowany' : '❌ Brak',
          password: process.env.EMAIL_PASSWORD ? '✅ Skonfigurowany' : '❌ Brak'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Błąd połączenia z serwerem email',
        config: {
          user: process.env.EMAIL_USER ? '✅ Skonfigurowany' : '❌ Brak',
          password: process.env.EMAIL_PASSWORD ? '✅ Skonfigurowany' : '❌ Brak'
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Błąd testowania email:', error)
    return NextResponse.json({
      success: false,
      message: 'Błąd serwera',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
