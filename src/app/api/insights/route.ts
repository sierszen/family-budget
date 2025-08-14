import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { generateBudgetInsights, generateExpensePrediction } from '@/lib/openai'

export async function GET() {
  try {
    const session = await getServerSession()
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

    // Pobierz transakcje z ostatnich 30 dni
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId: user.familyId,
        date: { gte: thirtyDaysAgo }
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Pobierz dane o rodzinie
    const familyData = {
      name: user.family?.name || 'Unknown Family',
      memberCount: await prisma.user.count({
        where: { familyId: user.familyId }
      }),
      totalTransactions: transactions.length,
      totalExpenses: transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalIncome: transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    // Generuj insights z OpenAI
    const insights = await generateBudgetInsights(transactions, familyData)

    // Generuj predykcję wydatków
    const historicalData = await prisma.transaction.findMany({
      where: {
        familyId: user.familyId,
        type: 'EXPENSE',
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 dni
      },
      select: {
        amount: true,
        date: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    const prediction = await generateExpensePrediction(historicalData)

    return NextResponse.json({
      insights,
      prediction,
      summary: {
        totalExpenses: familyData.totalExpenses,
        totalIncome: familyData.totalIncome,
        balance: familyData.totalIncome - familyData.totalExpenses,
        transactionCount: familyData.totalTransactions
      }
    })

  } catch (error) {
    console.error('Błąd generowania insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
