import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"

import { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  debug: true, // Włącz debugowanie
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || undefined
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔍 JWT callback - user:', user)
      console.log('🔍 JWT callback - token:', token)

      if (user) {
        token.userId = user.id
        console.log('✅ User ID set in token:', user.id)
      }

      return token
    },
    async session({ session, token }) {
      console.log('🔍 Session callback - token:', token)
      console.log('🔍 Session callback - session before:', session)

      if (token.userId) {
        session.user.id = token.userId
        console.log('✅ User ID set in session:', token.userId)
      } else {
        console.log('❌ No token.userId available')
      }

      console.log('🔍 Session callback - session after:', session)
      return session
    },
    async signIn({ user }) {
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

          // Ustaw rolę użytkownika na ADMIN (twórca rodziny)
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              familyId: family.id,
              role: 'ADMIN'
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
