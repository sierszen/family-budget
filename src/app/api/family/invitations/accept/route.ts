import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendInvitationAcceptedNotification } from '@/lib/email'

// POST - akceptuj zaproszenie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token jest wymagany' }, { status: 400 })
    }

    // Znajdź zaproszenie
    const invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        family: true,
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Nieprawidłowy token zaproszenia' }, { status: 400 })
    }

    // Sprawdź czy zaproszenie nie wygasło
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Zaproszenie wygasło' }, { status: 400 })
    }

    // Sprawdź czy zaproszenie nie zostało już użyte
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Zaproszenie zostało już użyte' }, { status: 400 })
    }

    // Sprawdź czy użytkownik już należy do tej samej rodziny
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.familyId === invitation.familyId) {
      return NextResponse.json({ error: 'Już należysz do tej rodziny' }, { status: 400 })
    }

    // Jeśli użytkownik należy do innej rodziny, przenieś go do nowej
    if (currentUser?.familyId) {
      console.log(`Użytkownik ${session.user.email} przenosi się z rodziny ${currentUser.familyId} do ${invitation.familyId}`)
    }

    // Sprawdź czy email zaproszenia zgadza się z emailem zalogowanego użytkownika
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: 'Zaproszenie nie jest dla tego użytkownika' }, { status: 400 })
    }

    // Dodaj użytkownika do rodziny
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        familyId: invitation.familyId,
        role: invitation.role
      }
    })

    // Oznacz zaproszenie jako zaakceptowane
    await prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    })

    // Wyślij powiadomienie do osoby, która wysłała zaproszenie
    if (invitation.inviter.email) {
      await sendInvitationAcceptedNotification(
        invitation.inviter.email,
        session.user.name || session.user.email!,
        invitation.family.name
      )
    }

    return NextResponse.json({
      message: 'Pomyślnie dołączyłeś do rodziny',
      family: {
        id: invitation.family.id,
        name: invitation.family.name,
        description: invitation.family.description
      }
    })

  } catch (error) {
    console.error('Błąd akceptacji zaproszenia:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
