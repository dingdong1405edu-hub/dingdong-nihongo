'use server'

import { signIn, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { AuthError } from 'next-auth'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

export async function register(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { ok: false, error: 'Email đã được sử dụng' }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  await db.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
  })

  await signIn('credentials', {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: '/dashboard',
  })
  return { ok: true }
}

export async function loginWithCredentials(formData: FormData) {
  try {
    await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: '/dashboard' })
    return { ok: true }
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: 'Email hoặc mật khẩu không đúng' }
    }
    throw e
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}
