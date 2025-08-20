import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - pobierz członków rodziny
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
      return NextResponse.json({ error: 'Rodzina nie znaleziona' }, { status: 404 })
    }

    const members = await prisma.user.findMany({
      where: { familyId: user.familyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ members })

  } catch (error) {
    console.error('Błąd pobierania członków:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// POST - dodaj nowego członka (tylko ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { email, name, role = 'MEMBER' } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Email i nazwa są wymagane' }, { status: 400 })
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

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Jeśli użytkownik istnieje, dodaj go do rodziny
      if (existingUser.familyId) {
        return NextResponse.json({ error: 'Użytkownik już należy do innej rodziny' }, { status: 409 })
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          familyId: user.family.id,
          role: role as 'ADMIN' | 'MEMBER'
        }
      })
    } else {
      // Utwórz nowego użytkownika
      await prisma.user.create({
        data: {
          email,
          name,
          familyId: user.family.id,
          role: role as 'ADMIN' | 'MEMBER'
        }
      })
    }

    return NextResponse.json({
      message: 'Członek rodziny został dodany pomyślnie'
    })

  } catch (error) {
    console.error('Błąd dodawania członka:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// PUT - zaktualizuj rolę członka (tylko ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { memberId, role } = await request.json()

    if (!memberId || !role) {
      return NextResponse.json({ error: 'ID członka i rola są wymagane' }, { status: 400 })
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

    // Sprawdź czy członek należy do tej samej rodziny
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        familyId: user.family.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Członek nie znaleziony' }, { status: 404 })
    }

    // Nie można zmienić roli samego siebie
    if (memberId === session.user.id) {
      return NextResponse.json({ error: 'Nie możesz zmienić swojej roli' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { role: role as 'ADMIN' | 'MEMBER' }
    })

    return NextResponse.json({
      message: 'Rola członka została zaktualizowana pomyślnie'
    })

  } catch (error) {
    console.error('Błąd aktualizacji roli:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// DELETE - usuń członka z rodziny (tylko ADMIN)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json({ error: 'ID członka jest wymagane' }, { status: 400 })
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

    // Sprawdź czy członek należy do tej samej rodziny
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        familyId: user.family.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Członek nie znaleziony' }, { status: 404 })
    }

    // Nie można usunąć samego siebie
    if (memberId === session.user.id) {
      return NextResponse.json({ error: 'Nie możesz usunąć samego siebie' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { familyId: null, role: 'MEMBER' }
    })

    return NextResponse.json({
      message: 'Członek został usunięty z rodziny pomyślnie'
    })

  } catch (error) {
    console.error('Błąd usuwania członka:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
