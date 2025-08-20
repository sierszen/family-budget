import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔄 Odświeżanie sesji...')

    const session = await getServerSession(authOptions)

    console.log('📋 Aktualna sesja:', {
      user: session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    })

    // Sprawdź czy sesja ma user.id
    if (!session?.user?.id) {
      console.log('❌ Sesja nie ma user.id - wymagane ponowne logowanie')
      return NextResponse.json({
        status: 'error',
        message: 'Sesja nie ma user.id - zaloguj się ponownie',
        session: session
      }, { status: 401 })
    }

    console.log('✅ Sesja ma user.id:', session.user.id)

    return NextResponse.json({
      status: 'success',
      message: 'Sesja jest poprawna',
      session: session,
      userId: session.user.id
    })

  } catch (error) {
    console.error('💥 Błąd odświeżania sesji:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas odświeżania sesji',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
