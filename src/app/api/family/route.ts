import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET - pobierz dane rodziny
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        family: {
          include: {
            members: true,
            categories: true
          }
        }
      }
    })

    if (!user?.family) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    return NextResponse.json({
      family: user.family,
      userRole: user.role
    })

  } catch (error) {
    console.error('Błąd pobierania rodziny:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// PUT - zaktualizuj dane rodziny
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { name, description } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.family) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy użytkownik ma uprawnienia (ADMIN)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    const updatedFamily = await prisma.family.update({
      where: { id: user.family.id },
      data: {
        name: name || user.family.name,
        description: description || user.family.description
      },
      include: {
        members: true,
        categories: true
      }
    })

    return NextResponse.json({
      family: updatedFamily,
      message: 'Rodzina zaktualizowana pomyślnie'
    })

  } catch (error) {
    console.error('Błąd aktualizacji rodziny:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// DELETE - usuń rodzinę (tylko ADMIN)
export async function DELETE() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.family) {
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    // Sprawdź czy użytkownik ma uprawnienia (ADMIN)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    // Usuń rodzinę (cascade usunie wszystkie powiązane dane)
    await prisma.family.delete({
      where: { id: user.family.id }
    })

    return NextResponse.json({
      message: 'Rodzina została usunięta pomyślnie'
    })

  } catch (error) {
    console.error('Błąd usuwania rodziny:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
