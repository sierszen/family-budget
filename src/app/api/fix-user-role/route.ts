import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    console.log('🔧 Naprawianie roli użytkownika...')
    console.log('👤 User ID:', session.user.id)

    // Znajdź użytkownika
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 })
    }

    console.log('👥 Użytkownik:', {
      id: user.id,
      email: user.email,
      role: user.role,
      familyId: user.familyId
    })

    if (!user.familyId) {
      return NextResponse.json({ error: 'Użytkownik nie ma przypisanej rodziny' }, { status: 404 })
    }

    // Sprawdź czy użytkownik już jest ADMIN
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        message: 'Użytkownik już ma rolę ADMIN',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      })
    }

    // Znajdź wszystkich członków rodziny
    const familyMembers = await prisma.user.findMany({
      where: { familyId: user.familyId },
      orderBy: { createdAt: 'asc' }
    })

    console.log('👨‍👩‍👧‍👦 Członkowie rodziny:', familyMembers.map(m => ({
      id: m.id,
      email: m.email,
      role: m.role,
      createdAt: m.createdAt
    })))

    // Sprawdź czy ktoś już jest ADMIN
    const existingAdmin = familyMembers.find(member => member.role === 'ADMIN')

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Rodzina już ma administratora',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      })
    }

    // Ustaw pierwszego użytkownika jako ADMIN
    const firstMember = familyMembers[0]

    if (firstMember.id !== user.id) {
      return NextResponse.json({
        message: 'Nie jesteś pierwszym członkiem rodziny',
        firstMember: {
          id: firstMember.id,
          email: firstMember.email,
          role: firstMember.role
        }
      })
    }

    // Zaktualizuj rolę użytkownika na ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      include: { family: true }
    })

    console.log('✅ Rola użytkownika zaktualizowana na ADMIN')

    return NextResponse.json({
      message: 'Rola użytkownika została zaktualizowana na ADMIN',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        familyId: updatedUser.familyId
      }
    })

  } catch (error) {
    console.error('💥 Błąd naprawiania roli użytkownika:', error)
    return NextResponse.json({
      error: 'Błąd serwera',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 })
  }
}
