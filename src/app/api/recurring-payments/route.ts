import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    const recurringPayments = await prisma.recurringPayment.findMany({
      where: { familyId: user.familyId },
      include: {
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 5 // Ostatnie 5 płatności
        }
      },
      orderBy: { nextDueDate: 'asc' }
    })

    return NextResponse.json({ recurringPayments })
  } catch (error) {
    console.error('Błąd pobierania płatności stałych:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, amount, type, customDays, startDate, endDate } = body

    // Walidacja
    if (!name || !amount || !type || !startDate) {
      return NextResponse.json({ error: 'Wszystkie wymagane pola muszą być wypełnione' }, { status: 400 })
    }

    // Oblicz następny termin płatności
    const startDateObj = new Date(startDate)
    const nextDueDate = new Date(startDateObj)

    switch (type) {
      case 'MONTHLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        break
      case 'QUARTERLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + 3)
        break
      case 'SEMI_ANNUALLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + 6)
        break
      case 'ANNUALLY':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
        break
      case 'CUSTOM':
        if (!customDays) {
          return NextResponse.json({ error: 'Liczba dni jest wymagana dla płatności niestandardowej' }, { status: 400 })
        }
        nextDueDate.setDate(nextDueDate.getDate() + customDays)
        break
      default:
        return NextResponse.json({ error: 'Nieprawidłowy typ płatności' }, { status: 400 })
    }

    const recurringPayment = await prisma.recurringPayment.create({
      data: {
        name,
        description,
        amount: Number(amount),
        type,
        customDays: customDays ? Number(customDays) : null,
        startDate: startDateObj,
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        familyId: user.familyId
      }
    })

    return NextResponse.json({ recurringPayment })
  } catch (error) {
    console.error('Błąd tworzenia płatności stałej:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
