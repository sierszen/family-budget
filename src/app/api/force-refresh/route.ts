import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔄 Wymuszanie odświeżenia sesji...')

    const session = await getServerSession(authOptions)

    console.log('📋 Sesja przed odświeżeniem:', {
      user: session?.user,
      userId: session?.user?.id
    })

    // Wymuś ponowne wywołanie callbacks przez zmianę sesji
    const response = NextResponse.json({
      status: 'success',
      message: 'Sesja odświeżona',
      session: session,
      timestamp: new Date().toISOString()
    })

    // Dodaj header do wymuszenia odświeżenia
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    return response

  } catch (error) {
    console.error('💥 Błąd odświeżania sesji:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas odświeżania sesji',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
