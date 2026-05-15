export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { transcribeAudio } from '@/lib/whisper'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const audioBlob = formData.get('audio') as File | null

  if (!audioBlob) {
    return Response.json({ error: 'No audio provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await audioBlob.arrayBuffer())
  const mimeType = audioBlob.type || 'audio/webm'

  const transcript = await transcribeAudio(buffer, mimeType)
  return Response.json({ transcript })
}
