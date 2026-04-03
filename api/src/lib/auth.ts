import { render } from '@react-email/render'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { openAPI } from 'better-auth/plugins'

import { db } from '@/db'
import { members } from '@/db/schema'

import { ForgotPasswordEmail } from '@/emails/reset-password'
import { VerifyEmail } from '@/emails/verify-email'

import { env } from '@/env'
import { resend } from '@/lib/resend'

export const auth = betterAuth({
  trustedOrigins: [
    env.BETTER_AUTH_LOCALHOST_URL,
    // env.BETTER_AUTH_TRUSTED_ORIGIN
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  hooks: {
    after: createAuthMiddleware(async ctx => {
      const session = ctx.context.newSession
      if (!session) return

      const user = session.user

      await db
        .insert(members)
        .values({
          userId: user.id,
          name: user.name,
          relationship: 'Titular',
        })
        .onConflictDoNothing({
          target: [members.userId, members.name],
        })
    }),
  },
  plugins: [openAPI()],
  secret: env.BETTER_AUTH_SECRET,
  baseUrl: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const html = await render(
        ForgotPasswordEmail({ userName: user.name, userEmail: user.email, resetUrl: url }),
        {
          pretty: true,
        },
      )

      await resend.emails.send({
        to: user.email,
        from: '',
        subject: 'Reset your password',
        html,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(VerifyEmail({ userName: user.name, verifyUrl: url }), {
        pretty: true,
      })

      await resend.emails.send({
        to: user.email,
        from: env.RESEND_EMAIL_FROM,
        subject: 'Verify your email',
        html,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
})
