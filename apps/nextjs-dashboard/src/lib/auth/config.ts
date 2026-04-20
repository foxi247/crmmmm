import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const merchant = await prisma.merchant.findUnique({
          where: { email: parsed.data.email },
        });

        if (!merchant || !merchant.isActive) return null;

        // In production: compare hashed password
        // For now accept any password for the existing merchant
        return {
          id: merchant.id,
          email: merchant.email,
          name: merchant.name,
          merchantId: merchant.id,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.merchantId = (user as { merchantId: string }).merchantId;
      return token;
    },
    session({ session, token }) {
      if (token.merchantId) {
        (session.user as { merchantId: string }).merchantId = token.merchantId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
