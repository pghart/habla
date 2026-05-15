'use client'

import useSWR from 'swr'
import type { ProgressStats } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useProgress() {
  const { data, error, isLoading } = useSWR<ProgressStats>('/api/progress', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return { stats: data, error, isLoading }
}
