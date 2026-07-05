import { createContext, useContext } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import type { TooltipProps, LegendProps } from 'recharts'
import {
  Legend,
  Tooltip,
} from 'recharts'

import { cn } from '../../lib/utils'

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode
    color?: string
  }
>

type ChartContextValue = {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextValue | null>(null)

function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error('Chart components must be used inside ChartContainer.')
  }

  return context
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { config: ChartConfig }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          'flex aspect-[4/3] w-full items-center justify-center text-sm [&_.recharts-cartesian-axis-tick_text]:fill-[var(--sea-ink-soft)] [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-[var(--line)] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[var(--line)] [&_.recharts-default-legend]:!text-[var(--sea-ink-soft)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
}: TooltipProps<number, string> & {
  labelFormatter?: (label: unknown) => ReactNode
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const renderedLabel = labelFormatter ? labelFormatter(label) : label

  return (
    <div className="min-w-44 rounded-2xl border border-(--line) bg-[var(--surface-strong)] px-4 py-3 shadow-[0_20px_40px_rgba(23,58,64,0.16)] backdrop-blur">
      {renderedLabel !== undefined ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-(--sea-ink-soft)">
          {renderedLabel}
        </p>
      ) : null}
      <div className="mt-2 space-y-2">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? 'value')
          const entry = config[key] ?? {}
          const value = typeof item.value === 'number' ? item.value : Number(item.value)

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color ?? entry.color ?? 'var(--lagoon)' }}
                />
                <span className="text-sm font-medium text-(--sea-ink)">
                  {entry.label ?? item.name ?? key}
                </span>
              </div>
              <span className="text-sm font-semibold text-(--sea-ink)">
                {Number.isFinite(value) ? value.toLocaleString() : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegendContent({ payload }: LegendProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm text-(--sea-ink-soft)">
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? item.id ?? 'value')
        const entry = config[key] ?? {}

        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: String(item.color ?? entry.color ?? 'var(--lagoon)') }}
            />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              {entry.label ?? item.value ?? key}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ChartTooltip({
  labelFormatter,
}: {
  labelFormatter?: (label: unknown) => ReactNode
}) {
  return <Tooltip cursor={false} content={<ChartTooltipContent labelFormatter={labelFormatter} />} />
}

export function ChartLegend(props: LegendProps) {
  return <Legend content={<ChartLegendContent {...props} />} />
}