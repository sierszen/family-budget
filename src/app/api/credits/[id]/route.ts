import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const credit = await prisma.credit.findFirst({
      where: {
        id: id,
        familyId: user.familyId
      },
      include: {
        payments: {
          orderBy: { paymentNumber: 'asc' }
        }
      }
    })

    if (!credit) {
      return NextResponse.json({ error: 'Kredyt nie został znaleziony' }, { status: 404 })
    }

    return NextResponse.json({ credit })
  } catch (error) {
    console.error('Błąd pobierania kredytu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const { name, purpose, status } = body

    const credit = await prisma.credit.findFirst({
      where: {
        id: id,
        familyId: user.familyId
      }
    })

    if (!credit) {
      return NextResponse.json({ error: 'Kredyt nie został znaleziony' }, { status: 404 })
    }

    const updatedCredit = await prisma.credit.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(purpose && { purpose }),
        ...(status && { status })
      },
      include: {
        payments: {
          orderBy: { paymentNumber: 'asc' }
        }
      }
    })

    return NextResponse.json({
      credit: updatedCredit,
      message: 'Kredyt został zaktualizowany'
    })
  } catch (error) {
    console.error('Błąd aktualizacji kredytu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const credit = await prisma.credit.findFirst({
      where: {
        id: id,
        familyId: user.familyId
      }
    })

    if (!credit) {
      return NextResponse.json({ error: 'Kredyt nie został znaleziony' }, { status: 404 })
    }

    // Usuń wszystkie płatności kredytu
    await prisma.creditPayment.deleteMany({
      where: { creditId: id }
    })

    // Usuń kredyt
    await prisma.credit.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Kredyt został usunięty'
    })
  } catch (error) {
    console.error('Błąd usuwania kredytu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
