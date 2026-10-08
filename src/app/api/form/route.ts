import { NextRequest, NextResponse } from 'next/server'
import { saveFormResponse, getUserResponses } from '@/lib/storage'
import { FormResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { action, response } = await req.json()

    if (action === 'save') {
      await saveFormResponse(response as FormResponse)
      return NextResponse.json({ success: true })
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

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const responses = await getUserResponses(userId)
    return NextResponse.json({ success: true, responses })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    )
  }
}
