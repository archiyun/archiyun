import { NextRequest, NextResponse } from 'next/server'

function extractYouTubeId(input: string): string | null {
  const value = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value
  try {
    const url = new URL(value)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? id.slice(0, 11) : null
    }
    const fromQuery = url.searchParams.get('v')
    if (fromQuery) return fromQuery
  } catch {
    /* ignore invalid URLs */
  }
  return null
}

function extractPlaylistId(input: string): string | null {
  const value = input.trim()
  if (/^(PL|OLAK5|RD)[\w-]+$/.test(value)) return value
  try {
    const url = new URL(value)
    const list = url.searchParams.get('list')
    if (list && !url.searchParams.get('v')) return list
  } catch {
    /* ignore */
  }
  return null
}

async function expandPlaylist(playlistId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return []
    const xml = await res.text()
    return [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map((m) => m[1])
  } catch (error) {
    console.error(`[api/music] 展开播放列表 ${playlistId} 失败:`, error)
    return []
  }
}

async function resolveVideoIds(rawIds: string[]): Promise<string[]> {
  const resolved: string[] = []
  const seen = new Set<string>()

  for (const raw of rawIds) {
    const playlistId = extractPlaylistId(raw)
    const candidates = playlistId ? await expandPlaylist(playlistId) : [extractYouTubeId(raw)].filter((id): id is string => Boolean(id))
    for (const id of candidates) {
      if (seen.has(id)) continue
      seen.add(id)
      resolved.push(id)
    }
  }

  return resolved
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
  }

  const videoIds = await resolveVideoIds(ids.split(',').map((id) => id.trim()).filter(Boolean))

  const results = await Promise.all(
    videoIds.map(async (videoId) => {
      const fallback = {
        id: videoId,
        name: videoId,
        artist: 'YouTube Music',
        cover: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        source: 'youtube' as const,
      }

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
        const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(6000) })
        if (!res.ok) return fallback
        const data = await res.json()
        return {
          id: videoId,
          name: data.title || fallback.name,
          artist: data.author_name || fallback.artist,
          cover: data.thumbnail_url || fallback.cover,
          source: 'youtube' as const,
        }
      } catch (error) {
        console.error(`[api/music] YouTube oEmbed ${videoId} 失败:`, error)
        return fallback
      }
    }),
  )

  return NextResponse.json(results)
}
