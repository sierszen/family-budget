import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// PUT - zaktualizuj transakcję
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { title, amount, type, categoryId, description, date } = await request.json()
    const { id } = await params

    // Sprawdź czy transakcja należy do użytkownika
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transakcja nie znaleziona' }, { status: 404 })
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    // Sprawdź czy kategoria należy do rodziny użytkownika
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category || category.familyId !== user?.familyId) {
        return NextResponse.json({ error: 'Nieprawidłowa kategoria' }, { status: 400 })
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        title: title || existingTransaction.title,
        amount: amount !== undefined ? amount : existingTransaction.amount,
        type: type || existingTransaction.type,
        categoryId: categoryId || existingTransaction.categoryId,
        description: description !== undefined ? description : existingTransaction.description,
        date: date ? new Date(date) : existingTransaction.date
      },
      include: {
        category: true,
        user: true
      }
    })

    return NextResponse.json({
      transaction: updatedTransaction,
      message: 'Transakcja zaktualizowana pomyślnie'
    })

  } catch (error) {
    console.error('Błąd aktualizacji transakcji:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// DELETE - usuń transakcję
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { id } = await params
    
    // Sprawdź czy transakcja należy do użytkownika
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transakcja nie znaleziona' }, { status: 404 })
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Transakcja została usunięta pomyślnie'
    })

  } catch (error) {
    console.error('Błąd usuwania transakcji:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
