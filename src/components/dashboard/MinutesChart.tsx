'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MinutesChart({ data }: { data: number[] }) {
  const today = new Date().getDay()
  const labels = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today - 6 + i + 7) % 7
    return DAYS[dayIndex]
  })

  const chartData = data.map((minutes, i) => ({
    day: labels[i],
    minutes,
    isToday: i === 6,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700 mb-4">This week (minutes)</p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(val: number) => [`${val} min`, 'Practice']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.isToday ? '#4f46e5' : '#c7d2fe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
