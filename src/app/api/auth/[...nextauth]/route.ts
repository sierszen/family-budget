import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async signIn({ user, account, profile }) {
      try {
        // Sprawdź czy użytkownik istnieje
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { family: true }
        })

        if (!dbUser) {
          // Utwórz nowego użytkownika
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              avatar: user.image,
            },
            include: { family: true }
          })
        }

        if (!dbUser.familyId) {
          // Utwórz nową rodzinę dla użytkownika
          const family = await prisma.family.create({
            data: {
              name: `${user.name}'s Family`,
              description: 'Rodzina utworzona automatycznie',
              members: {
                connect: { id: dbUser.id }
              }
            }
          })

          // Dodaj domyślne kategorie
          const defaultCategories = [
            { name: 'Jedzenie', icon: '🍽️', color: '#ef4444', type: 'EXPENSE' as const },
            { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' as const },
            { name: 'Rozrywka', icon: '🎮', color: '#8b5cf6', type: 'EXPENSE' as const },
            { name: 'Zdrowie', icon: '🏥', color: '#10b981', type: 'EXPENSE' as const },
            { name: 'Edukacja', icon: '📚', color: '#f59e0b', type: 'EXPENSE' as const },
            { name: 'Wynagrodzenie', icon: '💰', color: '#22c55e', type: 'INCOME' as const },
            { name: 'Inne przychody', icon: '💵', color: '#06b6d4', type: 'INCOME' as const }
          ]

          for (const category of defaultCategories) {
            await prisma.category.create({
              data: {
                ...category,
                familyId: family.id
              }
            })
          }
        }

        return true
      } catch (error) {
        console.error('Błąd podczas logowania:', error)
        return false
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST }
