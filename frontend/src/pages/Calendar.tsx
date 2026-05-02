import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Telescope } from "lucide-react";

export default function Calendar() {
  const { data: events, error, isLoading } = useSWR('/calendar', fetcher);

  if (isLoading) return <div className="p-8">Loading calendar...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load calendar data.</div>;

  const urgent = events?.filter((e: any) => e.urgency === 'Urgent') || [];
  const upcoming = events?.filter((e: any) => e.urgency === 'Upcoming') || [];
  const horizon = events?.filter((e: any) => e.urgency === 'Horizon') || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Regulatory Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 pb-4 border-b border-red-100">
            <CardTitle className="text-red-700 flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2" /> Urgent {"(< 30 days)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {urgent.map((ev: any) => (
              <div key={ev.id} className="p-3 bg-white border border-red-100 rounded-md shadow-sm">
                <div className="font-medium text-red-900">{ev.title}</div>
                <div className="text-sm text-red-700 mt-1">{format(new Date(ev.date), 'MMMM d, yyyy')}</div>
                <div className="mt-2"><Badge variant="outline" className="text-xs bg-red-50">{ev.niche}</Badge></div>
              </div>
            ))}
            {urgent.length === 0 && <p className="text-sm text-muted-foreground italic">No urgent deadlines.</p>}
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 pb-4 border-b border-blue-100">
            <CardTitle className="text-blue-700 flex items-center text-lg">
              <CalendarIcon className="w-5 h-5 mr-2" /> Upcoming {"(30-90 days)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {upcoming.map((ev: any) => (
              <div key={ev.id} className="p-3 bg-white border border-blue-100 rounded-md shadow-sm">
                <div className="font-medium text-blue-900">{ev.title}</div>
                <div className="text-sm text-blue-700 mt-1">{format(new Date(ev.date), 'MMMM d, yyyy')}</div>
                <div className="mt-2"><Badge variant="outline" className="text-xs bg-blue-50">{ev.niche}</Badge></div>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground italic">No upcoming deadlines.</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
            <CardTitle className="text-slate-700 flex items-center text-lg">
              <Telescope className="w-5 h-5 mr-2" /> Horizon {"(> 90 days)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {horizon.map((ev: any) => (
              <div key={ev.id} className="p-3 bg-white border border-slate-100 rounded-md shadow-sm">
                <div className="font-medium text-slate-900">{ev.title}</div>
                <div className="text-sm text-slate-700 mt-1">{format(new Date(ev.date), 'MMMM d, yyyy')}</div>
                <div className="mt-2"><Badge variant="outline" className="text-xs bg-slate-50">{ev.niche}</Badge></div>
              </div>
            ))}
            {horizon.length === 0 && <p className="text-sm text-muted-foreground italic">No horizon deadlines.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
