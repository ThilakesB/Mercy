import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Scale,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { judicialStore, type HearingRecord } from '../lib/judicialStore'
import { Button, Card, useApp } from '../ui'

interface DateSectionProps {
  onSelectDate?: (dateStr: string) => void
  onSelectHearing?: (hearing: HearingRecord) => void
  className?: string
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

export default function DateSection({ onSelectDate, onSelectHearing, className = '' }: DateSectionProps) {
  const { toast } = useApp()

  // Base state: Current view year & month (Defaulting to October 2026 to align with sample records)
  const [currentYear, setCurrentYear] = useState<number>(2026)
  const [currentMonth, setCurrentMonth] = useState<number>(9) // 0-indexed: 9 = October
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-12')

  const hearings = judicialStore.getHearings()
  const alarms = judicialStore.getAlarms()

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Jump to today
  const jumpToToday = () => {
    setCurrentYear(2026)
    setCurrentMonth(9)
    setSelectedDateStr('2026-10-12')
    onSelectDate?.('2026-10-12')
    toast('Calendar centered on Bench Today (Oct 12, 2026)', 'info')
  }

  // Compute days matrix dynamically
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Day of week (0=Sunday, 1=Monday, ...). Adjust so Monday=0, Sunday=6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startingDayOfWeek === -1) startingDayOfWeek = 6

    // Previous month padding
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
    const days: { day: number; currentMonth: boolean; dateStr: string }[] = []

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevM = currentMonth === 0 ? 12 : currentMonth
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear
      const mStr = String(prevM).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({ day: d, currentMonth: false, dateStr: `${prevY}-${mStr}-${dStr}` })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({ day: d, currentMonth: true, dateStr: `${currentYear}-${mStr}-${dStr}` })
    }

    // Trailing next month padding to complete 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remainingCells; d++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear
      const mStr = String(nextM).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({ day: d, currentMonth: false, dateStr: `${nextY}-${mStr}-${dStr}` })
    }

    return days
  }, [currentYear, currentMonth])

  // Count events for each day
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>()
    hearings.forEach((h) => {
      map.set(h.date, (map.get(h.date) || 0) + 1)
    })
    return map
  }, [hearings])

  // Get list of hearings on selected date
  const selectedDateHearings = useMemo(() => {
    return hearings.filter((h) => h.date === selectedDateStr)
  }, [hearings, selectedDateStr])

  // Friendly formatted date string
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number)
    if (!y || !m || !d) return selectedDateStr
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }, [selectedDateStr])

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr)
    onSelectDate?.(dateStr)
  }

  return (
    <Card className={`p-5.5 space-y-4 bg-white/95 backdrop-blur-xs font-sans ${className}`}>
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-full bg-[#FAF7F0] border border-black/10 text-zinc-800">
            <CalendarIcon className="size-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">
              Judicial Cause Roster
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={jumpToToday}
            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-all cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center border border-black/10 rounded-full bg-white p-0.5">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="grid size-6 place-items-center rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="grid size-6 place-items-center rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center text-[10.5px] font-bold text-zinc-400">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Matrix */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold gap-y-1">
        {calendarDays.map(({ day, currentMonth: isCurr, dateStr }) => {
          const isSelected = dateStr === selectedDateStr
          const isToday = dateStr === '2026-10-12'
          const eventCount = eventsByDate.get(dateStr) || 0

          return (
            <div key={dateStr} className="py-0.5">
              <button
                type="button"
                onClick={() => handleDayClick(dateStr)}
                className={`group relative size-8 rounded-full mx-auto grid place-items-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF5C5C] text-white font-bold shadow-sm scale-105'
                    : isToday
                    ? 'bg-[#141518] text-white font-bold shadow-xs'
                    : isCurr
                    ? 'text-zinc-800 hover:bg-[#F0EDE4]'
                    : 'text-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span className="text-[11.5px]">{day}</span>

                {/* Event Dot Indicator */}
                {eventCount > 0 && !isSelected && (
                  <span
                    className={`absolute bottom-0.5 size-1.5 rounded-full ${
                      isToday ? 'bg-[#FF5C5C]' : 'bg-[#FF5C5C]'
                    }`}
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Selected Day Agenda Section */}
      <div className="pt-3 border-t border-black/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {formattedSelectedDate}
            </h4>
            <span className="text-[10.5px] text-zinc-500 font-medium">
              {selectedDateHearings.length} matter{selectedDateHearings.length === 1 ? '' : 's'} listed on bench
            </span>
          </div>

          <Link to="/schedule">
            <span className="text-[11px] font-bold text-[#FF5C5C] hover:underline cursor-pointer">
              Full Schedule &rarr;
            </span>
          </Link>
        </div>

        {/* Selected Date Matters Stream */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {selectedDateHearings.length > 0 ? (
            selectedDateHearings.map((h, idx) => (
              <div
                key={h.id}
                onClick={() => onSelectHearing?.(h)}
                className="p-3 rounded-2xl border border-black/[0.06] bg-[#FAF7F0] hover:bg-[#F0EDE4] transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="grid size-5 place-items-center rounded-full bg-white text-zinc-900 font-extrabold text-[10px] shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-foreground truncate max-w-40">
                      {h.caseTitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10.5px] font-bold text-zinc-700 shadow-xs flex items-center gap-1">
                    <Clock className="size-3 text-zinc-400" />
                    {h.time}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-600 pl-6.5">
                  <span className="font-mono text-[10px] text-zinc-500">{h.caseNumber}</span>
                  <span className="font-semibold text-zinc-700">{h.stage}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-1">
              <CheckCircle2 className="size-5 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-zinc-700">No Matters Listed</p>
              <p className="text-[11px] text-zinc-400">
                No hearings or remand proceedings scheduled for this date.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link to="/schedule" className="block pt-1">
          <button
            type="button"
            className="w-full h-10 rounded-full bg-[#141518] text-white font-semibold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            <span>List Matter / Adjourn Hearing</span>
          </button>
        </Link>
      </div>
    </Card>
  )
}
