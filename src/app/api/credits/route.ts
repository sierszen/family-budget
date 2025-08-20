import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Funkcja do obliczania harmonogramu spłat
function calculatePaymentSchedule(
  totalAmount: number,
  interestRate: number,
  termInMonths: number,
  startDate: Date
) {
  console.log('🧮 calculatePaymentSchedule - parametry wejściowe:')
  console.log('🧮 - totalAmount:', totalAmount)
  console.log('🧮 - interestRate:', interestRate)
  console.log('🧮 - termInMonths:', termInMonths)
  console.log('🧮 - startDate:', startDate)

  // interestRate to już wartość dziesiętna (np. 0.155 dla 15.5%)
  const monthlyRate = interestRate / 12
  console.log('🧮 - monthlyRate (interestRate / 12):', monthlyRate)

  const monthlyPayment = totalAmount * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / (Math.pow(1 + monthlyRate, termInMonths) - 1)
  console.log('🧮 - obliczona rata miesięczna:', monthlyPayment)

  const payments = []
  let remainingCapital = totalAmount

  for (let i = 1; i <= termInMonths; i++) {
    const interestPart = remainingCapital * monthlyRate
    const capitalPart = monthlyPayment - interestPart
    remainingCapital -= capitalPart

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    payments.push({
      paymentNumber: i,
      dueDate,
      amount: monthlyPayment,
      capitalPart,
      interestPart,
      remainingCapital: Math.max(0, remainingCapital)
    })
  }

  return { monthlyPayment, payments }
}

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
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    const credits = await prisma.credit.findMany({
      where: { familyId: user.familyId },
      include: {
        payments: {
          orderBy: { paymentNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('🔍 Pobrane kredyty z bazy:')
    credits.forEach(credit => {
      console.log('🔍 Kredyt:', {
        id: credit.id,
        name: credit.name,
        totalAmount: credit.totalAmount,
        interestRate: credit.interestRate,
        monthlyPayment: credit.monthlyPayment,
        remainingCapital: credit.remainingCapital
      })
    })

    return NextResponse.json({ credits })
  } catch (error) {
    console.error('Błąd pobierania kredytów:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Rozpoczynam tworzenie kredytu...')
    console.log('🔍 URL request:', request.url)
    console.log('🔍 Method:', request.method)
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()))
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('❌ Brak sesji użytkownika')
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: true }
    })

    console.log('👤 Użytkownik:', { id: user?.id, familyId: user?.familyId, role: user?.role })

    if (!user?.familyId) {
      console.log('❌ Użytkownik nie należy do rodziny')
      return NextResponse.json({ error: 'Użytkownik nie należy do rodziny' }, { status: 400 })
    }

    // Sprawdź czy użytkownik ma rolę ADMIN
    if (user.role !== 'ADMIN') {
      console.log('❌ Użytkownik nie ma roli ADMIN:', user.role)
      console.log('🔧 Próba naprawy roli...')

      // Sprawdź czy w rodzinie jest już ADMIN
      const existingAdmin = await prisma.user.findFirst({
        where: {
          familyId: user.familyId,
          role: 'ADMIN'
        }
      })

      if (!existingAdmin) {
        console.log('🔧 Brak ADMIN w rodzinie, ustawiam rolę ADMIN dla użytkownika')
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        })
        user.role = 'ADMIN'
        console.log('✅ Rola użytkownika została naprawiona na ADMIN')
      } else {
        console.log('❌ W rodzinie jest już ADMIN:', existingAdmin.email)
        return NextResponse.json({ error: 'Brak uprawnień - wymagana rola ADMIN' }, { status: 403 })
      }
    }

    console.log('✅ Użytkownik ma uprawnienia ADMIN, kontynuuję...')

    console.log('🔍 Sprawdzam body request...')
    const body = await request.json()
    console.log('📋 Otrzymane dane:', JSON.stringify(body, null, 2))

    const { name, purpose, totalAmount, interestRate, termInMonths, startDate } = body

    console.log('📋 Dane kredytu:', { name, purpose, totalAmount, interestRate, termInMonths, startDate })
    console.log('🔍 Typy danych:', {
      name: typeof name,
      purpose: typeof purpose,
      totalAmount: typeof totalAmount,
      interestRate: typeof interestRate,
      termInMonths: typeof termInMonths,
      startDate: typeof startDate
    })

    // Walidacja
    if (!name || !purpose || !totalAmount || !interestRate || !termInMonths || !startDate) {
      console.log('❌ Brakujące pola:', { name, purpose, totalAmount, interestRate, termInMonths, startDate })
      return NextResponse.json({ error: 'Wszystkie pola są wymagane' }, { status: 400 })
    }

    // Konwersja typów
    const totalAmountNum = Number(totalAmount)
    let interestRateNum = Number(interestRate)
    const termInMonthsNum = Number(termInMonths)
    const startDateObj = new Date(startDate)

    // Jeśli oprocentowanie jest większe niż 1, podziel przez 100 (np. 15.5% -> 0.155)
    if (interestRateNum > 1) {
      console.log('🔧 Oprocentowanie > 1, dzielę przez 100:', interestRateNum, '->', interestRateNum / 100)
      interestRateNum = interestRateNum / 100
    }

    console.log('🔧 Po konwersji:', {
      totalAmountNum,
      interestRateNum,
      termInMonthsNum,
      startDateObj
    })

    // Sprawdź czy konwersja się udała
    if (isNaN(totalAmountNum) || isNaN(interestRateNum) || isNaN(termInMonthsNum) || isNaN(startDateObj.getTime())) {
      console.log('❌ Błąd konwersji typów')
      return NextResponse.json({ error: 'Nieprawidłowe typy danych' }, { status: 400 })
    }

    if (totalAmountNum <= 0 || interestRateNum < 0 || termInMonthsNum <= 0) {
      console.log('❌ Nieprawidłowe wartości:', { totalAmountNum, interestRateNum, termInMonthsNum })
      return NextResponse.json({ error: 'Nieprawidłowe wartości' }, { status: 400 })
    }

    const endDate = new Date(startDateObj)
    endDate.setMonth(endDate.getMonth() + termInMonthsNum)

    console.log('🧮 Obliczam harmonogram spłat...')
    console.log('🧮 Parametry:', { totalAmountNum, interestRateNum, termInMonthsNum, startDateObj })

    let monthlyPayment: number
    let payments: any[]

    try {
      // Oblicz harmonogram spłat
      const result = calculatePaymentSchedule(
        totalAmountNum,
        interestRateNum,
        termInMonthsNum,
        startDateObj
      )
      monthlyPayment = result.monthlyPayment
      payments = result.payments
      console.log('✅ Harmonogram obliczony:', { monthlyPayment, paymentsCount: payments.length })
    } catch (error) {
      console.error('❌ Błąd obliczania harmonogramu:', error)
      return NextResponse.json({ error: 'Błąd obliczania harmonogramu spłat' }, { status: 500 })
    }

    console.log('💰 Obliczona rata miesięczna:', monthlyPayment)
    console.log('📅 Liczba płatności:', payments.length)

    // Utwórz kredyt
    console.log('💾 Tworzę kredyt w bazie danych...')
    console.log('💾 Dane do zapisu:', {
      name,
      purpose,
      totalAmount: totalAmountNum,
      interestRate: interestRateNum,
      termInMonths: termInMonthsNum,
      monthlyPayment,
      startDate: startDateObj,
      endDate,
      remainingCapital: totalAmountNum,
      familyId: user.familyId
    })

    let credit: any

    try {
      credit = await prisma.credit.create({
        data: {
          name,
          purpose,
          totalAmount: totalAmountNum,
          interestRate: interestRateNum,
          termInMonths: termInMonthsNum,
          monthlyPayment: monthlyPayment,
          startDate: startDateObj,
          endDate,
          remainingCapital: totalAmountNum,
          familyId: user.familyId
        }
      })
      console.log('✅ Kredyt utworzony w bazie:', credit.id)
    } catch (error) {
      console.error('❌ Błąd tworzenia kredytu w bazie:', error)
      return NextResponse.json({ error: 'Błąd tworzenia kredytu w bazie danych' }, { status: 500 })
    }

    // Utwórz harmonogram spłat
    console.log('📝 Tworzę harmonogram spłat...')
    console.log('📝 Liczba płatności do utworzenia:', payments.length)

    let creditPayments: any[]

    try {
      creditPayments = await Promise.all(
        payments.map(payment =>
          prisma.creditPayment.create({
            data: {
              creditId: credit.id,
              paymentNumber: payment.paymentNumber,
              dueDate: payment.dueDate,
              amount: payment.amount,
              capitalPart: payment.capitalPart,
              interestPart: payment.interestPart
            }
          })
        )
      )
      console.log('✅ Harmonogram spłat utworzony:', creditPayments.length, 'płatności')
    } catch (error) {
      console.error('❌ Błąd tworzenia harmonogramu spłat:', error)
      return NextResponse.json({ error: 'Błąd tworzenia harmonogramu spłat' }, { status: 500 })
    }

    console.log('✅ Kredyt został utworzony pomyślnie!')
    return NextResponse.json({
      credit: { ...credit, payments: creditPayments },
      message: 'Kredyt został utworzony pomyślnie'
    })
  } catch (error) {
    console.error('❌ Błąd tworzenia kredytu:', error)
    console.error('❌ Szczegóły błędu:', {
      message: error instanceof Error ? error.message : 'Nieznany błąd',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
