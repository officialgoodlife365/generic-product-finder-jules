import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const PHASES = ["Discovery", "Scored", "Validated", "Blueprint"];

export default function Pipeline() {
  const { data: opps, error, isLoading } = useSWR('/opportunities', fetcher);
  const navigate = useNavigate();

  if (isLoading) return <div className="p-8">Loading pipeline...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load pipeline data.</div>;

  const groupedOpps = PHASES.reduce((acc, phase) => {
    acc[phase] = opps?.filter((o: any) => o.phase === phase) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {PHASES.map((phase) => (
          <div key={phase} className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
            <h2 className="font-semibold mb-4 text-gray-700 flex justify-between">
              {phase} <Badge variant="secondary">{groupedOpps[phase].length}</Badge>
            </h2>
            <div className="space-y-4">
              {groupedOpps[phase].map((opp: any) => (
                <Card
                  key={opp.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium leading-snug">{opp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={opp.score > 80 ? 'default' : 'secondary'}>Score: {opp.score}</Badge>
                      <span className="text-xs text-muted-foreground">{opp.leadCount} leads</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groupedOpps[phase].length === 0 && (
                <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed rounded-lg">
                  No opportunities in {phase}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
