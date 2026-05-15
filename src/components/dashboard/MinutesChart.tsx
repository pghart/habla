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
    day: i === 6 ? 'Today' : labels[i],
    minutes,
    isToday: i === 6,
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">This week</p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <Tooltip
            formatter={(val: number) => [`${val} min`, 'Practice']}
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            }}
            cursor={{ fill: '#f1f5f9', radius: 6 }}
          />
          <Bar dataKey="minutes" radius={[6, 6, 2, 2]} maxBarSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.isToday ? '#4f46e5' : '#e0e7ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
