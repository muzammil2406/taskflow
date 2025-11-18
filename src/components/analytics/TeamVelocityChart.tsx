'use client';
import { TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { WeeklyVelocity } from '@/lib/analytics';
import type { UserProfile } from '@/types';

const userColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface TeamVelocityChartProps {
    data: WeeklyVelocity[];
    users: UserProfile[];
}

export default function TeamVelocityChart({ data, users }: TeamVelocityChartProps) {
  
  const chartConfig = users.reduce((acc, user, index) => {
    if(user.name) {
        acc[user.name] = {
            label: user.name,
            color: userColors[index % userColors.length],
        }
    }
    return acc;
  }, {} as any)

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Team Velocity</CardTitle>
        <CardDescription>Tasks completed per week over the last 12 weeks.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `W${value}`}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
             {users.map((user) => (
                user.name && (
                    <Line
                        key={user.uid}
                        dataKey={user.name}
                        type="natural"
                        stroke={`var(--color-${user.name})`}
                        strokeWidth={2}
                        dot={true}
                    />
                )
             ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing data for the last 12 weeks
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
