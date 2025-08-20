import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🧪 Test kategorii...')

    // Test 1: Sprawdź połączenie z bazą
    console.log('🔌 Test połączenia z bazą...')
    await prisma.$connect()
    console.log('✅ Połączenie z bazą OK')

    // Test 2: Sprawdź sesję
    console.log('📋 Sprawdzanie sesji...')
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'OK' : 'BRAK')

    if (!session?.user?.id) {
      return NextResponse.json({
        status: 'error',
        message: 'Brak sesji użytkownika',
        session: null
      })
    }

    // Test 3: Sprawdź użytkownika
    console.log('👤 Sprawdzanie użytkownika...')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    console.log('👥 User:', user ? 'Znaleziony' : 'Nie znaleziony')
    console.log('🏠 Family ID:', user?.familyId)

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'Użytkownik nie znaleziony',
        userId: session.user.id
      })
    }

    if (!user.familyId) {
      return NextResponse.json({
        status: 'error',
        message: 'Użytkownik nie ma przypisanej rodziny',
        user: {
          id: user.id,
          email: user.email,
          familyId: user.familyId
        }
      })
    }

    // Test 4: Sprawdź kategorie
    console.log('📊 Sprawdzanie kategorii...')
    const categories = await prisma.category.findMany({
      where: { familyId: user.familyId },
      orderBy: { name: 'asc' }
    })

    console.log('📊 Znaleziono kategorii:', categories.length)

    return NextResponse.json({
      status: 'success',
      message: 'Test kategorii zakończony pomyślnie',
      data: {
        userId: user.id,
        familyId: user.familyId,
        categoriesCount: categories.length,
        categories: categories
      }
    })

  } catch (error) {
    console.error('💥 Błąd testu kategorii:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd podczas testu',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
