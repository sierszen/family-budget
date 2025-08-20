import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Test bazy danych...')

    // Test połączenia
    await prisma.$connect()
    console.log('✅ Połączenie z bazą OK')

    // Sprawdź liczbę użytkowników
    const userCount = await prisma.user.count()
    console.log('👥 Liczba użytkowników:', userCount)

    // Sprawdź liczbę rodzin
    const familyCount = await prisma.family.count()
    console.log('🏠 Liczba rodzin:', familyCount)

    // Sprawdź liczbę kategorii
    const categoryCount = await prisma.category.count()
    console.log('📊 Liczba kategorii:', categoryCount)

    return NextResponse.json({
      status: 'success',
      message: 'Test bazy danych zakończony pomyślnie',
      data: {
        userCount,
        familyCount,
        categoryCount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Błąd testu bazy danych:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Błąd połączenia z bazą danych',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
