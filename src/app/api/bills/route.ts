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

    const bills = await prisma.bill.findMany({
      where: { familyId: user.familyId },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json({ bills })
  } catch (error) {
    console.error('Błąd pobierania rachunków:', error)
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
    const {
      name,
      description,
      amount,
      dueDate,
      billNumber,
      provider,
      category,
      notes
    } = body

    // Walidacja
    if (!name || !amount || !dueDate) {
      return NextResponse.json({ error: 'Nazwa, kwota i termin są wymagane' }, { status: 400 })
    }

    const bill = await prisma.bill.create({
      data: {
        name,
        description,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        billNumber,
        provider,
        category,
        notes,
        familyId: user.familyId
      }
    })

    return NextResponse.json({ bill })
  } catch (error) {
    console.error('Błąd tworzenia rachunku:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
