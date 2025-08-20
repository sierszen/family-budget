import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - zaktualizuj kategorię
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { id } = await params
    const { name, icon, color, type } = await request.json()

    // Walidacja
    if (!name || !icon || !color || !type) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy kategoria należy do rodziny użytkownika
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        familyId: user.familyId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategoria nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy kategoria o tej nazwie już istnieje (poza tą, którą edytujemy)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        familyId: user.familyId,
        name: name,
        type: type,
        id: { not: id }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Kategoria o tej nazwie już istnieje' },
        { status: 409 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        icon,
        color,
        type
      }
    })

    return NextResponse.json({
      category: updatedCategory,
      message: 'Kategoria została zaktualizowana pomyślnie'
    })

  } catch (error) {
    console.error('Błąd aktualizacji kategorii:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// DELETE - usuń kategorię
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy kategoria należy do rodziny użytkownika
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        familyId: user.familyId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategoria nie znaleziona' }, { status: 404 })
    }

    // Usuń kategorię (cascade usunie powiązane transakcje)
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Kategoria została usunięta pomyślnie'
    })

  } catch (error) {
    console.error('Błąd usuwania kategorii:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
