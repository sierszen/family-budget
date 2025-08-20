import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug sesji...')

    const session = await getServerSession(authOptions)

    console.log('📋 Pełna sesja:', JSON.stringify(session, null, 2))

    // Sprawdź użytkownika w bazie danych
    let userFromDb = null
    if (session?.user?.id) {
      try {
        userFromDb = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { family: true }
        })
        console.log('👤 Użytkownik z bazy:', {
          id: userFromDb?.id,
          email: userFromDb?.email,
          role: userFromDb?.role,
          familyId: userFromDb?.familyId,
          familyName: userFromDb?.family?.name
        })
      } catch (error) {
        console.error('❌ Błąd pobierania użytkownika z bazy:', error)
      }
    }

    const response = NextResponse.json({
      status: 'success',
      message: 'Debug sesji',
      session: session,
      sessionExists: !!session,
      userExists: !!session?.user,
      userIdExists: !!session?.user?.id,
      emailExists: !!session?.user?.email,
      user: userFromDb,
      timestamp: new Date().toISOString()
    })

    // Dodaj header do wymuszenia odświeżenia
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    return response

  } catch (error) {
    console.error('💥 Błąd debug sesji:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas debugowania sesji',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
