import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { name: "Jan", male: 400, female: 240 },
  { name: "Feb", male: 600, female: 380 },
  { name: "Mar", male: 450, female: 200 },
  { name: "Apr", male: 300, female: 400 },
  { name: "May", male: 450, female: 300 },
  { name: "Jun", male: 400, female: 280 }
];

export default function ShadcnBarChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          January - June 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar
              dataKey="male"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
            <Bar
              dataKey="female"
              fill="#ec4899"
              radius={[4, 4, 0, 0]}
              className="fill-rose-500"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Trending up by 5.2% this month</span>
        </div>
      </CardFooter>
    </Card>
  );
}