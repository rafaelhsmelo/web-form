import { NextRequest, NextResponse } from 'next/server'
import { saveFormResponse, getUserResponses, deleteFormResponse } from '@/lib/storage'
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
    const responseId = req.nextUrl.searchParams.get('responseId')

    // Se tem responseId, retorna apenas uma resposta
    if (responseId) {
      const responses = await getUserResponses(userId || '')
      const response = responses.find(r => r.id === responseId)
      
      if (!response) {
        return NextResponse.json(
          { success: false, error: 'Resposta não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, response })
    }

    // Se tem userId, retorna todas as respostas do usuário
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

export async function DELETE(req: NextRequest) {
  try {
    const { responseId } = await req.json()

    if (!responseId) {
      return NextResponse.json(
        { success: false, error: 'Missing responseId' },
        { status: 400 }
      )
    }

    const deleted = await deleteFormResponse(responseId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Resposta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    )
  }
}
