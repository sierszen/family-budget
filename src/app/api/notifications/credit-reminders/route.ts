import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Pobierz dzisiejszą datę
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7) // 7 dni do przodu

    console.log('🔔 Sprawdzam zbliżające się terminy kredytów...')
    console.log('🔔 Dzisiejsza data:', today.toISOString())
    console.log('🔔 Data za tydzień:', nextWeek.toISOString())

    // Znajdź płatności kredytów, które są w ciągu najbliższych 7 dni
    const upcomingCreditPayments = await prisma.creditPayment.findMany({
      where: {
        credit: {
          familyId: user.familyId,
          status: 'ACTIVE' // Tylko aktywne kredyty
        },
        status: 'PENDING', // Tylko nieopłacone płatności
        dueDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        credit: {
          select: {
            id: true,
            name: true,
            purpose: true,
            monthlyPayment: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Znajdź płatności stałe, które są w ciągu najbliższych 7 dni
    const upcomingRecurringPayments = await prisma.recurringPayment.findMany({
      where: {
        familyId: user.familyId,
        isActive: true,
        nextDueDate: {
          gte: today,
          lte: nextWeek
        }
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    })

    // Znajdź rachunki, które są w ciągu najbliższych 7 dni
    const upcomingBills = await prisma.bill.findMany({
      where: {
        familyId: user.familyId,
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: nextWeek
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

        console.log('🔔 Znalezione zbliżające się płatności:')
    console.log('🔔 - Kredyty:', upcomingCreditPayments.length)
    console.log('🔔 - Płatności stałe:', upcomingRecurringPayments.length)
    console.log('🔔 - Rachunki:', upcomingBills.length)

    // Grupuj płatności kredytów według kredytów
    const creditReminders = upcomingCreditPayments.reduce((acc, payment) => {
      const creditId = payment.credit.id

      if (!acc[creditId]) {
        acc[creditId] = {
          type: 'credit',
          creditId: creditId,
          creditName: payment.credit.name,
          creditPurpose: payment.credit.purpose,
          monthlyPayment: payment.credit.monthlyPayment,
          upcomingPayments: []
        }
      }

      acc[creditId].upcomingPayments.push({
        paymentNumber: payment.paymentNumber,
        dueDate: payment.dueDate,
        amount: payment.amount,
        daysUntilDue: Math.ceil((new Date(payment.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      })

      return acc
    }, {} as Record<string, any>)

    // Dodaj płatności stałe
    const recurringPaymentReminders = upcomingRecurringPayments.map(payment => ({
      type: 'recurring',
      id: payment.id,
      name: payment.name,
      description: payment.description,
      amount: payment.amount,
      nextDueDate: payment.nextDueDate,
      daysUntilDue: Math.ceil((new Date(payment.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))

    // Dodaj rachunki
    const billReminders = upcomingBills.map(bill => ({
      type: 'bill',
      id: bill.id,
      name: bill.name,
      description: bill.description,
      amount: bill.amount,
      dueDate: bill.dueDate,
      provider: bill.provider,
      category: bill.category,
      daysUntilDue: Math.ceil((new Date(bill.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))

    const reminders = [
      ...Object.values(creditReminders),
      ...recurringPaymentReminders,
      ...billReminders
    ]

    console.log('🔔 Przypomnienia:', reminders.map(r => ({
      type: r.type,
      name: r.creditName || r.name,
      daysUntilDue: r.daysUntilDue || (r.upcomingPayments && r.upcomingPayments[0]?.daysUntilDue)
    })))

    return NextResponse.json({
      reminders,
      totalReminders: reminders.length
    })
  } catch (error) {
    console.error('❌ Błąd sprawdzania przypomnień o kredytach:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
