import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stats = [
  { label: 'Total revenue', value: '$48,120', delta: '+12.4%', tone: 'default' as const },
  { label: 'Active users', value: '3,842', delta: '+4.1%', tone: 'default' as const },
  { label: 'Churn', value: '1.9%', delta: '−0.3%', tone: 'secondary' as const },
  { label: 'Open tickets', value: '27', delta: '+6', tone: 'destructive' as const },
]

/** A responsive grid of KPI cards, each showing a value with a delta badge versus last month. */
export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader>
            <CardDescription>{s.label}</CardDescription>
            <CardTitle className="text-2xl">{s.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={s.tone}>{s.delta}</Badge>
            <span className="ml-2 text-sm text-muted-foreground">vs last month</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
