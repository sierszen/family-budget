import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Walidacja danych
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format email' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Nieprawidłowe hasło', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik z tym emailem już istnieje' },
        { status: 409 }
      )
    }

    // Hashuj hasło
    const hashedPassword = await hashPassword(password)

    // Utwórz użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

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
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
