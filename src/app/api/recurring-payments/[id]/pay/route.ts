import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/recurring-payments/[id]/pay - oznacz bieżącą płatność jako zapłaconą i przesuń nextDueDate
export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const paymentId = params.id
    const { paidDate } = await request.json().catch(() => ({ paidDate: undefined }))

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true },
    })
    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    const recurring = await prisma.recurringPayment.findFirst({ where: { id: paymentId, familyId: user.familyId } })
    if (!recurring) {
      return NextResponse.json({ error: 'Płatność stała nie znaleziona' }, { status: 404 })
    }

    // Zapisz wpis w historii jako zapłacony
    const history = await prisma.recurringPaymentHistory.create({
      data: {
        recurringPaymentId: recurring.id,
        dueDate: recurring.nextDueDate,
        amount: recurring.amount,
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
    })

    // Utwórz automatycznie transakcję wydatku dla zapłaconej płatności stałej
    try {
      const categoryName = recurring.name
      const existingCategory = await prisma.category.findFirst({
        where: {
          familyId: user.familyId,
          name: categoryName,
          type: 'EXPENSE'
        }
      })

      const ensuredCategory = existingCategory || (await prisma.category.create({
        data: {
          name: categoryName,
          icon: '🔁',
          color: '#0ea5e9',
          type: 'EXPENSE',
          familyId: user.familyId
        }
      }))

      await prisma.transaction.create({
        data: {
          title: `Płatność stała: ${recurring.name}`,
          amount: recurring.amount,
          type: 'EXPENSE',
          categoryId: ensuredCategory.id,
          userId: session.user.id,
          familyId: user.familyId,
          description: recurring.description || undefined,
          date: history.paidDate || new Date()
        }
      })
    } catch (txError) {
      console.error('Błąd automatycznego tworzenia transakcji dla płatności stałej:', txError)
      // Nie przerywaj głównego flow
    }

    // Wylicz kolejny termin
    const nextDue = new Date(recurring.nextDueDate)
    switch (recurring.type) {
      case 'MONTHLY':
        nextDue.setMonth(nextDue.getMonth() + 1)
        break
      case 'QUARTERLY':
        nextDue.setMonth(nextDue.getMonth() + 3)
        break
      case 'SEMI_ANNUALLY':
        nextDue.setMonth(nextDue.getMonth() + 6)
        break
      case 'ANNUALLY':
        nextDue.setFullYear(nextDue.getFullYear() + 1)
        break
      case 'CUSTOM':
        nextDue.setDate(nextDue.getDate() + (recurring.customDays || 0))
        break
    }

    const updated = await prisma.recurringPayment.update({
      where: { id: recurring.id },
      data: { nextDueDate: nextDue },
      include: { payments: { orderBy: { dueDate: 'desc' }, take: 5 } }
    })

    return NextResponse.json({ recurringPayment: updated, history })
  } catch (error) {
    console.error('Błąd oznaczania płatności stałej jako zapłaconej:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}


