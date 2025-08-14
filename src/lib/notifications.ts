import { Resend } from 'resend'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBudgetAlertEmail(userId: string, alertData: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.email) return

    const { data, error } = await resend.emails.send({
      from: 'Family Budget <noreply@familybudget.app>',
      to: [user.email],
      subject: `🚨 Alert budżetowy: ${alertData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">🚨 Alert budżetowy</h2>
          <h3>${alertData.title}</h3>
          <p>${alertData.message}</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>Szczegóły:</strong>
            <ul>
              <li>Kategoria: ${alertData.category}</li>
              <li>Wydatki: ${alertData.amount} zł</li>
              <li>Limit: ${alertData.limit} zł</li>
            </ul>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Sprawdź dashboard
          </a>
        </div>
      `
    })

    if (error) {
      console.error('Błąd wysyłania email:', error)
    }

    // Zapisz powiadomienie w bazie
    await prisma.notification.create({
      data: {
        userId,
        type: 'BUDGET_LIMIT',
        title: alertData.title,
        message: alertData.message
      }
    })

  } catch (error) {
    console.error('Błąd systemu powiadomień:', error)
  }
}

export async function sendWeeklyReport(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.email || !user.family) return

    // Pobierz dane z ostatniego tygodnia
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId: user.family.id,
        date: {
          gte: weekAgo
        }
      },
      include: {
        category: true,
        user: true
      }
    })

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const { data, error } = await resend.emails.send({
      from: 'Family Budget <noreply@familybudget.app>',
      to: [user.email],
      subject: '📊 Tygodniowy raport budżetowy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📊 Tygodniowy raport budżetowy</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Podsumowanie tygodnia</h3>
            <p><strong>Przychody:</strong> ${totalIncome} zł</p>
            <p><strong>Wydatki:</strong> ${totalExpenses} zł</p>
            <p><strong>Bilans:</strong> ${totalIncome - totalExpenses} zł</p>
          </div>
          <h3>Ostatnie transakcje:</h3>
          <ul>
            ${transactions.slice(0, 5).map(t => `
              <li>${t.title} - ${t.amount} zł (${t.category.name})</li>
            `).join('')}
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/analytics"
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Zobacz szczegółowe analizy
          </a>
        </div>
      `
    })

    if (error) {
      console.error('Błąd wysyłania raportu:', error)
    }

  } catch (error) {
    console.error('Błąd generowania raportu:', error)
  }
}

export async function createNotification(userId: string, type: string, title: string, message: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message
      }
    })
  } catch (error) {
    console.error('Błąd tworzenia powiadomienia:', error)
  }
}
