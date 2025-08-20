import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('📋 Transakcje GET - Session:', session ? 'OK' : 'BRAK')
    console.log('📋 Transakcje GET - User ID:', session?.user?.id)

    if (!session?.user?.id) {
      console.log('❌ Transakcje GET - Brak sesji użytkownika')
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      familyId: user.familyId
    }

    if (categoryId) where.categoryId = categoryId
    if (type) where.type = type
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Błąd pobierania transakcji:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, amount, type, categoryId, description, date } = body

    // Walidacja
    if (!title || !amount || !type || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sprawdź czy kategoria należy do rodziny
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        familyId: user.familyId
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        categoryId,
        userId: session.user.id,
        familyId: user.familyId,
        description,
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Sprawdź limity budżetowe
    const budgetLimit = await prisma.budgetLimit.findFirst({
      where: {
        categoryId,
        familyId: user.familyId,
        userId: session.user.id
      }
    })

    if (budgetLimit && type === 'EXPENSE') {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthExpenses = await prisma.transaction.aggregate({
        where: {
          categoryId,
          familyId: user.familyId,
          type: 'EXPENSE',
          date: { gte: monthStart }
        },
        _sum: { amount: true }
      })

      const totalExpenses = Number(monthExpenses._sum.amount || 0) + parseFloat(amount)

      if (totalExpenses > Number(budgetLimit.amount)) {
        await createNotification(
          session.user.id,
          'BUDGET_LIMIT',
          'Przekroczono limit budżetowy',
          `Kategoria ${category.name} przekroczyła limit ${budgetLimit.amount} zł`
        )
      }
    }

    return NextResponse.json(transaction)

  } catch (error) {
    console.error('Błąd tworzenia transakcji:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
