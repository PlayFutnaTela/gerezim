import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { url, ...payload } = body

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        // Try to parse JSON, but handle text responses too
        const responseText = await response.text()
        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch {
            responseData = { message: responseText }
        }

        if (!response.ok) {
            return NextResponse.json(responseData, { status: response.status })
        }

        return NextResponse.json(responseData)
    } catch (error) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
