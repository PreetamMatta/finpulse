import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
          const apiKey = process.env.INTERNAL_API_KEY || "finpulse-internal-key"
          const res = await fetch(`${backendUrl}/api/auth/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const user = await res.json()
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 3600 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as { role?: string }).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
})
