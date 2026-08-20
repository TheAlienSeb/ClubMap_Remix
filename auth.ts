import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import db from "@/lib/supabase/db";
import { users } from "@/lib/supabase/schema";
import { verifyPassword } from "@/lib/password";
import { localAuthenticate, localMode } from "@/lib/local-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "clubmap-development-secret-change-me",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = String(credentials.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials.password || "");
        if (localMode) {
          const user = await localAuthenticate(email, password);
          return user
            ? {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                universityVerified: user.universityVerified,
              }
            : null;
        }
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user || !(await verifyPassword(password, user.passwordHash)))
          return null;
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          universityVerified: user.universityVerified,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.universityVerified = user.universityVerified;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id);
      session.user.role = String(token.role);
      session.user.universityVerified = Boolean(token.universityVerified);
      return session;
    },
  },
});
