import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Sprawdź czy użytkownik ma rodzinę
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { family: true }
      })

      if (!existingUser?.familyId) {
        // Utwórz nową rodzinę dla użytkownika
        const family = await prisma.family.create({
          data: {
            name: `${user.name}'s Family`,
            description: 'Rodzina utworzona automatycznie',
            members: {
              connect: { id: user.id }
            }
          }
        })

        // Dodaj domyślne kategorie
        const defaultCategories = [
          { name: 'Jedzenie', icon: '🍽️', color: '#ef4444', type: 'EXPENSE' },
          { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' },
          { name: 'Rozrywka', icon: '🎮', color: '#8b5cf6', type: 'EXPENSE' },
          { name: 'Zdrowie', icon: '🏥', color: '#10b981', type: 'EXPENSE' },
          { name: 'Edukacja', icon: '📚', color: '#f59e0b', type: 'EXPENSE' },
          { name: 'Wynagrodzenie', icon: '💰', color: '#22c55e', type: 'INCOME' },
          { name: 'Inne przychody', icon: '💵', color: '#06b6d4', type: 'INCOME' }
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
