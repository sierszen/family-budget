import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const since = new Date()
    since.setDate(since.getDate() - (isNaN(days) ? 30 : days))

    // Pobierz transakcje wydatkowe z ostatniego okresu z przypisanymi kategoriami
    const transactions = await prisma.transaction.findMany({
      where: {
        familyId: user.familyId,
        type: 'EXPENSE',
        date: { gte: since }
      },
      include: {
        category: true
      }
    })

    // Agregacja po kategorii
    const categoryTotals = new Map<string, { name: string; color?: string; value: number }>()
    for (const t of transactions) {
      const categoryName = t.category?.name || 'Inne'
      const key = t.category?.id || 'uncategorized'
      const current = categoryTotals.get(key) || { name: categoryName, color: t.category?.color || '#6B7280', value: 0 }
      current.value += Number(t.amount)
      current.name = categoryName
      current.color = t.category?.color || current.color
      categoryTotals.set(key, current)
    }

    // Sortuj malejąco po wartości
    const data = Array.from(categoryTotals.values())
      .sort((a, b) => b.value - a.value)

    return NextResponse.json({ data, since })
  } catch (error) {
    console.error('Błąd agregacji wydatków wg kategorii:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}


