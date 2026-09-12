'use client'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CalendarRange() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 6, 20),
    to: new Date(2026, 6, 24),
  })
  return (
    <Card className="w-fit">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Book a session</CardTitle>
          <Badge variant="secondary">5 days selected</Badge>
        </div>
        <CardDescription>Pick the days you want with the product team.</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          defaultMonth={new Date(2026, 6)}
          className="rounded-lg border border-border"
        />
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">July 20 – 24, 2026</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Clear
          </Button>
          <Button size="sm">Reserve</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
