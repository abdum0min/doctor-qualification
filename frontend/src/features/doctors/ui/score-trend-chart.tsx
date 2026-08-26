import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { formatDate } from '@/shared/lib/format'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import type { DoctorScorePoint } from '../model/types'

const CONFIG: ChartConfig = {
  score: { label: 'Natija', color: 'var(--chart-1)' },
}

/** Yakunlangan urinishlar natijasi — eskisidan yangisiga qarab. */
export function ScoreTrendChart({ points }: { points: DoctorScorePoint[] }) {
  const data = points.map((point) => ({
    label: formatDate(point.date),
    score: point.score,
  }))

  return (
    <ChartContainer config={CONFIG} className="h-64 w-full">
      <LineChart data={data} margin={{ left: -24, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
