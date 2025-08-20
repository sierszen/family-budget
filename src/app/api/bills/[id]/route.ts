import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT /api/bills/[id] - aktualizacja rachunku
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const billId = params.id
    const body = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true },
    })
    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    // Upewnij się, że rachunek należy do tej rodziny
    const bill = await prisma.bill.findFirst({ where: { id: billId, familyId: user.familyId } })
    if (!bill) {
      return NextResponse.json({ error: 'Rachunek nie znaleziony' }, { status: 404 })
    }

    const updated = await prisma.bill.update({
      where: { id: billId },
      data: {
        name: body.name ?? bill.name,
        description: body.description ?? bill.description,
        amount: body.amount != null ? Number(body.amount) : bill.amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : bill.dueDate,
        billNumber: body.billNumber ?? bill.billNumber,
        provider: body.provider ?? bill.provider,
        category: body.category ?? bill.category,
        notes: body.notes ?? bill.notes,
        status: body.status ?? bill.status,
        paidDate: body.paidDate ? new Date(body.paidDate) : bill.paidDate,
      },
    })

    return NextResponse.json({ bill: updated })
  } catch (error) {
    console.error('Błąd aktualizacji rachunku:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

// DELETE /api/bills/[id] - usuń rachunek
export async function DELETE(
  _request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const billId = params.id

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true },
    })
    if (!user?.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    // Upewnij się, że rachunek należy do tej rodziny
    const bill = await prisma.bill.findFirst({ where: { id: billId, familyId: user.familyId } })
    if (!bill) {
      return NextResponse.json({ error: 'Rachunek nie znaleziony' }, { status: 404 })
    }

    await prisma.bill.delete({ where: { id: billId } })
    return NextResponse.json({ message: 'Rachunek usunięty' })
  } catch (error) {
    console.error('Błąd usuwania rachunku:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}


