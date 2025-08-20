import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendFamilyInvitation, generateInvitationToken } from '@/lib/email'

// GET - pobierz zaproszenia rodziny
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

    // Sprawdź czy użytkownik ma uprawnienia (ADMIN)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    const invitations = await prisma.familyInvitation.findMany({
      where: { familyId: user.familyId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('Błąd pobierania zaproszeń:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// POST - wyślij zaproszenie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { email, name, role = 'MEMBER' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email jest wymagany' }, { status: 400 })
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

    // Sprawdź czy użytkownik już należy do tej rodziny
    const existingMember = await prisma.user.findFirst({
      where: {
        email,
        familyId: user.family.id
      }
    })

    if (existingMember) {
      return NextResponse.json({
        error: `Użytkownik z adresem ${email} już należy do tej rodziny. Nie można wysłać zaproszenia.`
      }, { status: 409 })
    }

    // Sprawdź czy istnieje aktywne zaproszenie
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        email,
        familyId: user.family.id,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({
        error: `Aktywne zaproszenie dla adresu ${email} już istnieje. Sprawdź listę zaproszeń lub anuluj poprzednie zaproszenie.`
      }, { status: 409 })
    }

    // Generuj token i datę wygaśnięcia
    const token = generateInvitationToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dni

    // Utwórz zaproszenie w bazie
    const invitation = await prisma.familyInvitation.create({
      data: {
        email,
        name,
        role: role as 'ADMIN' | 'MEMBER',
        token,
        expiresAt,
        familyId: user.family.id,
        invitedBy: session.user.id
      }
    })

    // Wyślij email
    const invitationUrl = `${process.env.NEXTAUTH_URL}/invite`
    const emailSent = await sendFamilyInvitation(
      email,
      user.name,
      user.family.name,
      token,
      invitationUrl
    )

    if (!emailSent) {
      // Jeśli email się nie wysłał, usuń zaproszenie z bazy
      await prisma.familyInvitation.delete({
        where: { id: invitation.id }
      })
      return NextResponse.json({ error: 'Błąd wysyłania emaila' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Zaproszenie zostało wysłane pomyślnie',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    })

  } catch (error) {
    console.error('Błąd wysyłania zaproszenia:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

// DELETE - anuluj zaproszenie
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'ID zaproszenia jest wymagane' }, { status: 400 })
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

    // Sprawdź czy zaproszenie należy do tej rodziny
    const invitation = await prisma.familyInvitation.findFirst({
      where: {
        id: invitationId,
        familyId: user.family.id
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Zaproszenie nie znalezione' }, { status: 404 })
    }

    // Usuń zaproszenie
    await prisma.familyInvitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      message: 'Zaproszenie zostało anulowane pomyślnie'
    })

  } catch (error) {
    console.error('Błąd anulowania zaproszenia:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
