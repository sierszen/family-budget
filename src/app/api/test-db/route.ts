import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testuję połączenie z bazą danych...')

    // Sprawdź połączenie
    await prisma.$connect()
    console.log('Połączenie z bazą danych udane')

    // Sprawdź czy tabele istnieją
    const userCount = await prisma.user.count()
    console.log('Liczba użytkowników w bazie:', userCount)

    return NextResponse.json({
      status: 'success',
      message: 'Baza danych działa poprawnie',
      userCount
    })

  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Błąd połączenia z bazą danych',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}
