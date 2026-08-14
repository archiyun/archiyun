import { NextRequest, NextResponse } from 'next/server'

const TWIKOO_ORIGIN = 'http://127.0.0.1:8090'

async function proxy(req: NextRequest) {
  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  }
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) headers['X-Forwarded-For'] = forwarded

  const res = await fetch(TWIKOO_ORIGIN, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
  })

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/json',
    },
  })
}

export async function GET(req: NextRequest) {
  return proxy(req)
}

export async function POST(req: NextRequest) {
  return proxy(req)
}
