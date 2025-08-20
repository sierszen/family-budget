import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const body = await request.json()
    const { paymentIds, status } = body

    if (!paymentIds || !Array.isArray(paymentIds)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID płatności' }, { status: 400 })
    }

    // Sprawdź czy kredyt należy do rodziny użytkownika
    const credit = await prisma.credit.findFirst({
      where: {
        id: id,
        familyId: user.familyId
      }
    })

    if (!credit) {
      return NextResponse.json({ error: 'Kredyt nie został znaleziony' }, { status: 404 })
    }

    // Aktualizuj płatności
    await Promise.all(
      paymentIds.map(paymentId =>
        prisma.creditPayment.update({
          where: {
            id: paymentId,
            creditId: id
          },
          data: {
            status,
            ...(status === 'PAID' && { paidDate: new Date() })
          }
        })
      )
    )

    // Oblicz nowy pozostały kapitał
    console.log('🔍 Obliczam nowy pozostały kapitał...')
    console.log('🔍 ID kredytu:', id)
    console.log('🔍 ID płatności do aktualizacji:', paymentIds)

    const paidPayments = await prisma.creditPayment.findMany({
      where: {
        creditId: id,
        status: 'PAID'
      }
    })

    console.log('🔍 Znalezione zapłacone płatności:', paidPayments.length)
    console.log('🔍 Szczegóły zapłaconych płatności:', paidPayments.map(p => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      capitalPart: p.capitalPart,
      interestPart: p.interestPart
    })))

    const totalPaidCapital = paidPayments.reduce((sum, payment) => sum + Number(payment.capitalPart), 0)
    const totalPaidInterest = paidPayments.reduce((sum, payment) => sum + Number(payment.interestPart), 0)
    const newRemainingCapital = Number(credit.totalAmount) - totalPaidCapital

    console.log('🔍 Obliczenia:')
    console.log('🔍 - Kwota całkowita kredytu:', credit.totalAmount)
    console.log('🔍 - Suma zapłaconego kapitału:', totalPaidCapital)
    console.log('🔍 - Suma zapłaconych odsetek:', totalPaidInterest)
    console.log('🔍 - Nowy pozostały kapitał:', newRemainingCapital)

    // Sprawdź czy kredyt został spłacony
    const newStatus = newRemainingCapital <= 0 ? 'PAID_OFF' : credit.status
    console.log('🔍 Nowy status kredytu:', newStatus)

    // Aktualizuj kredyt
    console.log('🔍 Aktualizuję kredyt w bazie danych...')
    const updatedCredit = await prisma.credit.update({
      where: { id: id },
      data: {
        remainingCapital: newRemainingCapital,
        totalPaidInterest,
        status: newStatus
      },
      include: {
        payments: {
          orderBy: { paymentNumber: 'asc' }
        }
      }
    })

    console.log('🔍 Kredyt zaktualizowany:', {
      id: updatedCredit.id,
      remainingCapital: updatedCredit.remainingCapital,
      totalPaidInterest: updatedCredit.totalPaidInterest,
      status: updatedCredit.status
    })

    return NextResponse.json({
      credit: updatedCredit,
      message: 'Płatności zostały zaktualizowane'
    })
  } catch (error) {
    console.error('Błąd aktualizacji płatności:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
