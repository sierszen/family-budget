import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔄 Wymuszanie ponownego logowania...')

    const session = await getServerSession(authOptions)

    console.log('📋 Aktualna sesja:', {
      user: session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    })

    // Sprawdź czy sesja ma user.id
    if (session?.user?.id) {
      console.log('✅ Sesja ma user.id:', session.user.id)
      return NextResponse.json({
        status: 'success',
        message: 'Sesja jest poprawna',
        session: session,
        userId: session.user.id
      })
    } else {
      console.log('❌ Sesja nie ma user.id - wymagane ponowne logowanie')
      return NextResponse.json({
        status: 'error',
        message: 'Sesja nie ma user.id - zaloguj się ponownie',
        session: session,
        requiresReauth: true
      }, { status: 401 })
    }

  } catch (error) {
    console.error('💥 Błąd sprawdzania sesji:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas sprawdzania sesji',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
