import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: opp, error, isLoading } = useSWR(`/opportunities/${id}`, fetcher);

  if (isLoading) return <div className="p-8">Loading opportunity...</div>;
  if (error || !opp) return <div className="p-8 text-red-500">Failed to load opportunity or not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{opp.name}</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{opp.phase}</Badge>
            <Badge variant={opp.score > 80 ? 'default' : 'secondary'}>Score: {opp.score}</Badge>
            <span className="text-sm text-muted-foreground">{opp.velocity} velocity</span>
          </div>
        </div>
        <Button>Generate Blueprint</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Evidence & Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {opp.evidence?.map((ev: string, i: number) => (
                <li key={i} className="flex items-start space-x-2 text-sm bg-gray-50 p-3 rounded-md">
                  <ExternalLink className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Pain Intensity</span>
                <span className="font-medium">8.5/10</span>
              </div>
              <Progress value={85} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Willingness to Pay</span>
                <span className="font-medium">7.2/10</span>
              </div>
              <Progress value={72} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Market Size</span>
                <span className="font-medium">6.0/10</span>
              </div>
              <Progress value={60} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Competitor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {opp.competitors?.length > 0 ? (
              <div className="space-y-3">
                {opp.competitors.map((comp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-muted-foreground">{comp.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No known direct competitors found yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
