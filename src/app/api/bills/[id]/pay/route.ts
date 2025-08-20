import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/bills/[id]/pay - oznacz jako zapłacony
export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const billId = params.id
    const { paidDate } = await request.json().catch(() => ({ paidDate: undefined }))

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true },
    })
    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    const bill = await prisma.bill.findFirst({ where: { id: billId, familyId: user.familyId } })
    if (!bill) {
      return NextResponse.json({ error: 'Rachunek nie znaleziony' }, { status: 404 })
    }

    const updated = await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
      },
    })

    // Utwórz automatycznie transakcję wydatku dla opłaconego rachunku
    try {
      const categoryName = bill.category || 'Rachunki'
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
          icon: '🧾',
          color: '#64748b',
          type: 'EXPENSE',
          familyId: user.familyId
        }
      }))

      await prisma.transaction.create({
        data: {
          title: `Rachunek: ${bill.name}`,
          amount: updated.amount,
          type: 'EXPENSE',
          categoryId: ensuredCategory.id,
          userId: session.user.id,
          familyId: user.familyId,
          description: bill.description || undefined,
          date: updated.paidDate || new Date()
        }
      })
    } catch (txError) {
      console.error('Błąd automatycznego tworzenia transakcji dla rachunku:', txError)
      // Nie przerywaj głównego flow – rachunek został oznaczony jako zapłacony
    }

    return NextResponse.json({ bill: updated })
  } catch (error) {
    console.error('Błąd oznaczania rachunku jako zapłaconego:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}


