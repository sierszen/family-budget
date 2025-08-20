import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'

// Konfiguracja transportera email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Można zmienić na inny serwis
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App password dla Gmail
  }
})

// Generowanie unikalnego tokenu
export function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

// Wysyłanie zaproszenia do rodziny
export async function sendFamilyInvitation(
  toEmail: string,
  inviterName: string,
  familyName: string,
  invitationToken: string,
  invitationUrl: string
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Zaproszenie do rodziny ${familyName} - Family Budget`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🏠 Zaproszenie do rodziny</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Family Budget</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Cześć!</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>${inviterName}</strong> zaprasza Cię do dołączenia do rodziny <strong>${familyName}</strong>
            w aplikacji Family Budget.
          </p>

          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Dołączając do rodziny będziesz mógł:
          </p>

          <ul style="color: #666; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
            <li>Śledzić wspólne wydatki i przychody</li>
            <li>Zarządzać budżetem rodzinnym</li>
            <li>Analizować wydatki i oszczędności</li>
            <li>Planować wspólne cele finansowe</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}?token=${invitationToken}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🎉 Dołącz do rodziny
            </a>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Ważne:</strong> To zaproszenie wygasa za 7 dni. Jeśli link nie działa,
              skopiuj i wklej poniższy adres w przeglądarce:
            </p>
            <p style="color: #667eea; margin: 10px 0 0 0; font-size: 12px; word-break: break-all;">
              ${invitationUrl}?token=${invitationToken}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            To jest automatyczna wiadomość z aplikacji Family Budget.
            Jeśli nie spodziewałeś się tego zaproszenia, możesz je zignorować.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Zaproszenie wysłane do: ${toEmail}`)
    return true
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error)
    return false
  }
}

// Wysyłanie powiadomienia o akceptacji zaproszenia
export async function sendInvitationAcceptedNotification(
  toEmail: string,
  acceptedBy: string,
  familyName: string
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Nowy członek rodziny ${familyName} - Family Budget`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Nowy członek rodziny</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Family Budget</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Świetne wieści!</h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>${acceptedBy}</strong> dołączył(a) do rodziny <strong>${familyName}</strong>!
          </p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">👋 Witamy w rodzinie!</p>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Teraz możecie wspólnie:
          </p>

          <ul style="color: #666; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
            <li>Dodawać i śledzić transakcje</li>
            <li>Analizować wydatki rodzinne</li>
            <li>Planować budżet</li>
            <li>Ustawiać cele oszczędnościowe</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/family"
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">
              👥 Zobacz członków rodziny
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            To jest automatyczna wiadomość z aplikacji Family Budget.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Powiadomienie o akceptacji wysłane do: ${toEmail}`)
    return true
  } catch (error) {
    console.error('Błąd wysyłania powiadomienia:', error)
    return false
  }
}

// Test połączenia z serwerem email
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log('Połączenie z serwerem email OK')
    return true
  } catch (error) {
    console.error('Błąd połączenia z serwerem email:', error)
    return false
  }
}
