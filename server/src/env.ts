import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_LOCALHOST_URL: z.url().startsWith('http://localhost'),
  // BETTER_AUTH_TRUSTED_ORIGIN: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_EMAIL_FROM: z.string(),
})

export const env = EnvSchema.parse(process.env)
