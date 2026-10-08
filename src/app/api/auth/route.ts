import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name } = await req.json()

    if (action === 'signup') {
      const user = await createUser(email, password, name)
      return NextResponse.json({ success: true, user })
    }

    if (action === 'login') {
      const user = await findUserByEmail(email, password)
      return NextResponse.json({ success: true, user })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    )
  }
}
