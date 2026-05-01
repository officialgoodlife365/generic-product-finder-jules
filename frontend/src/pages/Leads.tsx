import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Leads() {
  const { data: leads, error, isLoading } = useSWR('/leads', fetcher);
  const navigate = useNavigate();

  if (isLoading) return <div className="p-8">Loading leads...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load leads data.</div>;

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case "Hot": return <Badge className="bg-red-500 hover:bg-red-600">🔴 Hot</Badge>;
      case "Warm": return <Badge className="bg-yellow-500 hover:bg-yellow-600">🟡 Warm</Badge>;
      case "Cold": return <Badge className="bg-blue-500 hover:bg-blue-600">🔵 Cold</Badge>;
      case "Converted": return <Badge className="bg-green-500 hover:bg-green-600">✅ Converted</Badge>;
      default: return <Badge>{temp}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leads</h1>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Last Contacted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead: any) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{getTemperatureBadge(lead.temperature)}</TableCell>
                <TableCell>
                  {format(new Date(lead.contactedAt), 'MMM dd, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
