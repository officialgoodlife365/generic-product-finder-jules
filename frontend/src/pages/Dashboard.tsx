import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Users, Lightbulb } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, error: metricsError, isLoading: metricsLoading } = useSWR('/opportunities/metrics', fetcher);
  const { data: opps, error: oppsError, isLoading: oppsLoading } = useSWR('/opportunities', fetcher);

  if (metricsLoading || oppsLoading) return <div className="p-8">Loading dashboard...</div>;
  if (metricsError || oppsError) return <div className="p-8 text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalOpportunities || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgScore || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSignals || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Best Source</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics?.bestSource || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opps?.slice(0, 3).map((opp: any) => (
                <div key={opp.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{opp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Phase: {opp.phase} | Score: {opp.score}
                    </p>
                  </div>
                  <div className="font-medium text-sm text-primary">{opp.velocity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Signal Trends</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-green-500 mr-2" />
                  <span className="text-sm">Accelerating (3)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
                  <span className="text-sm">Stable (15)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-orange-500 mr-2" />
                  <span className="text-sm">Cooling (2)</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
