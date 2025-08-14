import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Rozpoczynam rejestrację użytkownika...')

    const body = await request.json()
    console.log('Otrzymane dane:', { email: body.email, name: body.name, hasPassword: !!body.password })

    const { email, password, name } = body

    // Walidacja danych
    if (!email || !password || !name) {
      console.log('Błąd walidacji: brakujące pola')
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      console.log('Błąd walidacji: nieprawidłowy email')
      return NextResponse.json(
        { error: 'Nieprawidłowy format email' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      console.log('Błąd walidacji hasła:', passwordValidation.errors)
      return NextResponse.json(
        { error: 'Nieprawidłowe hasło', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    console.log('Sprawdzam czy użytkownik już istnieje...')

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Użytkownik już istnieje')
      return NextResponse.json(
        { error: 'Użytkownik z tym emailem już istnieje' },
        { status: 409 }
      )
    }

    console.log('Hashuję hasło...')

    // Hashuj hasło
    const hashedPassword = await hashPassword(password)

    console.log('Tworzę użytkownika...')

    // Utwórz użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    console.log('Użytkownik utworzony, tworzę rodzinę...')

    // Utwórz rodzinę dla użytkownika
    const family = await prisma.family.create({
      data: {
        name: `${name}'s Family`,
        description: 'Rodzina utworzona automatycznie',
        members: {
          connect: { id: user.id }
        }
      }
    })

    console.log('Rodzina utworzona, dodaję kategorie...')

    // Dodaj domyślne kategorie
    const defaultCategories = [
      { name: 'Jedzenie', icon: '🍽️', color: '#ef4444', type: 'EXPENSE' as const },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' as const },
      { name: 'Rozrywka', icon: '🎮', color: '#8b5cf6', type: 'EXPENSE' as const },
      { name: 'Zdrowie', icon: '🏥', color: '#10b981', type: 'EXPENSE' as const },
      { name: 'Edukacja', icon: '📚', color: '#f59e0b', type: 'EXPENSE' as const },
      { name: 'Wynagrodzenie', icon: '💰', color: '#22c55e', type: 'INCOME' as const },
      { name: 'Inne przychody', icon: '💵', color: '#06b6d4', type: 'INCOME' as const }
    ]

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: {
          ...category,
          familyId: family.id
        }
      })
    }

    console.log('Rejestracja zakończona pomyślnie')

    return NextResponse.json({
      message: 'Użytkownik został utworzony pomyślnie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Błąd rejestracji:', error)

    // Sprawdź typ błędu
    if (error instanceof Error) {
      console.error('Szczegóły błędu:', error.message)
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { error: 'Błąd serwera podczas rejestracji', details: error instanceof Error ? error.message : 'Nieznany błąd' },
      { status: 500 }
    )
  }
}
