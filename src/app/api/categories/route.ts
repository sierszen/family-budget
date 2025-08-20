import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - pobierz kategorie
export async function GET() {
  try {
    console.log('🔍 Pobieranie kategorii...')
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'OK' : 'BRAK')
    console.log('📋 Session details:', {
      user: session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    })

    if (!session?.user?.id) {
      console.log('❌ Brak sesji użytkownika - session.user.id is undefined')
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    console.log('👤 User ID:', session.user.id)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    console.log('👥 User:', user ? 'Znaleziony' : 'Nie znaleziony')
    console.log('🏠 Family ID:', user?.familyId)

    if (!user?.familyId) {
      console.log('❌ Brak rodziny dla użytkownika')
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    const categories = await prisma.category.findMany({
      where: { familyId: user.familyId },
      orderBy: { name: 'asc' }
    })

    console.log('📊 Znaleziono kategorii:', categories.length)

    return NextResponse.json({
      categories
    })

  } catch (error) {
    console.error('💥 Błąd pobierania kategorii:', error)
    return NextResponse.json(
      { error: 'Błąd serwera', details: error instanceof Error ? error.message : 'Nieznany błąd' },
      { status: 500 }
    )
  }
}

// POST - dodaj nową kategorię
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { name, icon, color, type } = await request.json()

    // Walidacja
    if (!name || !icon || !color || !type) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy kategoria o tej nazwie już istnieje w rodzinie
    const existingCategory = await prisma.category.findFirst({
      where: {
        familyId: user.familyId,
        name: name,
        type: type
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Kategoria o tej nazwie już istnieje' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type,
        familyId: user.familyId
      }
    })

    return NextResponse.json({
      category,
      message: 'Kategoria została dodana pomyślnie'
    })

  } catch (error) {
    console.error('Błąd dodawania kategorii:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
