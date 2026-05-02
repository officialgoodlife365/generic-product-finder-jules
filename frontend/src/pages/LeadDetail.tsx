import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar as CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, error, isLoading } = useSWR(`/leads/${id}`, fetcher);

  if (isLoading) return <div className="p-8">Loading lead...</div>;
  if (error || !lead) return <div className="p-8 text-red-500">Failed to load lead or not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl">{lead.name}</CardTitle>
          <Badge variant="outline" className="ml-auto">{lead.temperature}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <Mail className="w-4 h-4 mr-2" />
            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Last Contacted: {format(new Date(lead.contactedAt), 'PPP p')}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2" />
            Linked Opportunity ID: {lead.opportunityId}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* Simple static timeline for mock purposes */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.25rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Initial Outreach</div>
                  <time className="font-caveat font-medium text-indigo-500">{format(new Date(lead.contactedAt), 'MMM dd')}</time>
                </div>
                <div className="text-slate-500 text-sm">Sent welcome email regarding their interest in opportunity {lead.opportunityId}.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
