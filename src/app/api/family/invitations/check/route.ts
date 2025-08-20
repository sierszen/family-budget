import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - sprawdź zaproszenie (publiczne API)
export async function POST(request: NextRequest) {
  try {
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
      // Oznacz jako wygasłe
      await prisma.familyInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })

      return NextResponse.json({
        error: 'Zaproszenie wygasło',
        invitation: {
          ...invitation,
          status: 'EXPIRED'
        }
      }, { status: 400 })
    }

    // Sprawdź czy zaproszenie nie zostało już użyte
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({
        error: 'Zaproszenie zostało już użyte',
        invitation
      }, { status: 400 })
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        family: {
          id: invitation.family.id,
          name: invitation.family.name,
          description: invitation.family.description
        },
        inviter: {
          id: invitation.inviter.id,
          name: invitation.inviter.name,
          email: invitation.inviter.email
        }
      }
    })

  } catch (error) {
    console.error('Błąd sprawdzania zaproszenia:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
