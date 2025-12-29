import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Send,
  FileText,
  Users,
  Zap,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useRoundManager } from "@/hooks/useRoundManager";
import { mockClients, mockTradelines } from "@/data/mockData";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  responded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  verified: "bg-red-500/20 text-red-400 border-red-500/30",
  deleted: "bg-green-500/20 text-green-400 border-green-500/30",
  updated: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

// Mock rounds data
const mockRounds = [
  {
    id: "round-1",
    clientId: "1",
    clientName: "John Smith",
    roundNumber: 1,
    status: "responded",
    startedAt: "2024-01-15",
    itemsCount: 5,
    deletedCount: 2,
    pendingCount: 3,
  },
  {
    id: "round-2",
    clientId: "2",
    clientName: "Sarah Johnson",
    roundNumber: 2,
    status: "in_progress",
    startedAt: "2024-01-20",
    itemsCount: 4,
    deletedCount: 1,
    pendingCount: 2,
  },
  {
    id: "round-3",
    clientId: "3",
    clientName: "Michael Brown",
    roundNumber: 1,
    status: "pending",
    startedAt: "2024-01-25",
    itemsCount: 6,
    deletedCount: 0,
    pendingCount: 6,
  },
];

export default function RoundManager() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const { isProcessing, analysis, analyzeRound, generateNextRound, detectResponses, clearAnalysis } = useRoundManager();

  const clientRounds = mockRounds.filter(r => r.clientId === selectedClient);
  const selectedClientData = mockClients.find(c => c.id === selectedClient);

  const handleAnalyzeRound = async () => {
    if (!selectedRound || !selectedClient) return;
    
    const disputeItems = mockTradelines.slice(0, 5).map(t => ({
      creditorName: t.creditor,
      bureau: t.bureaus[0],
      accountType: t.accountType,
      balance: t.balance,
      status: t.status,
    }));
    
    await analyzeRound(selectedClient, selectedRound.id, disputeItems, []);
  };

  const handleGenerateNextRound = async () => {
    if (!selectedClient) return;
    
    const previousItems = mockTradelines.slice(0, 5).map(t => ({
      creditorName: t.creditor,
      bureau: t.bureaus[0],
      accountType: t.accountType,
      outcome: t.status === "collection" ? "verified" : "deleted",
    }));
    
    await generateNextRound(selectedClient, previousItems, []);
  };

  const handleDetectResponses = async () => {
    if (!responseText.trim()) return;
    
    await detectResponses({
      rawText: responseText,
      clientId: selectedClient,
      roundId: selectedRound?.id,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Round Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Automate dispute rounds with AI-powered strategy and response detection
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAnalysis} disabled={!analysis}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Analysis
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockRounds.length}</p>
                  <p className="text-xs text-muted-foreground">Active Rounds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Items Deleted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">11</p>
                  <p className="text-xs text-muted-foreground">Pending Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">27%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client & Round Selection */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Select Client & Round</CardTitle>
              <CardDescription>Choose a client to manage their dispute rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setSelectedRound(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClient && (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {clientRounds.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No rounds yet</p>
                        <Button size="sm" className="mt-2" onClick={handleGenerateNextRound}>
                          Start First Round
                        </Button>
                      </div>
                    ) : (
                      clientRounds.map((round) => (
                        <div
                          key={round.id}
                          onClick={() => setSelectedRound(round)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedRound?.id === round.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Round {round.roundNumber}</span>
                            <Badge className={statusColors[round.status as keyof typeof statusColors] || ""}>
                              {round.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{round.itemsCount} items</span>
                            <span className="text-green-400">{round.deletedCount} deleted</span>
                            <span className="text-yellow-400">{round.pendingCount} pending</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Main Actions */}
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Round Management</CardTitle>
              <CardDescription>
                {selectedRound 
                  ? `Managing Round ${selectedRound.roundNumber} for ${selectedClientData?.firstName} ${selectedClientData?.lastName}`
                  : "Select a round to manage or generate next round"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="analyze" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="analyze">Analyze Round</TabsTrigger>
                  <TabsTrigger value="detect">Detect Responses</TabsTrigger>
                  <TabsTrigger value="next">Generate Next</TabsTrigger>
                </TabsList>

                <TabsContent value="analyze" className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="font-medium mb-2">AI Round Analysis</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analyze the current round to get strategic recommendations for escalation, 
                      timing, and letter type changes.
                    </p>
                    <Button 
                      onClick={handleAnalyzeRound} 
                      disabled={!selectedRound || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Analyze Current Round
                    </Button>
                  </div>

                  {analysis && (
                    <div className="space-y-3">
                      {analysis.insights && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <h5 className="font-medium text-primary mb-2">Key Insights</h5>
                          <ul className="text-sm space-y-1">
                            {analysis.insights.map((insight, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.timing && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">Recommended Timing:</span>
                          <span className="text-sm ml-2">{analysis.timing}</span>
                        </div>
                      )}
                      {analysis.analysis && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm whitespace-pre-wrap">{analysis.analysis}</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="detect" className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="font-medium mb-2">Bureau Response Detection</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Paste bureau response letters and AI will extract outcomes for each disputed item.
                    </p>
                    <Textarea
                      placeholder="Paste bureau response letter here..."
                      className="min-h-[150px] mb-4"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <Button 
                      onClick={handleDetectResponses} 
                      disabled={!responseText.trim() || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Detect & Parse Responses
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="next" className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="font-medium mb-2">Generate Next Round</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze previous outcomes and generate an optimized next round 
                      with adjusted letter types and strategies.
                    </p>
                    <Button 
                      onClick={handleGenerateNextRound} 
                      disabled={!selectedClient || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Generate Next Round Strategy
                    </Button>
                  </div>

                  {analysis?.items && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Next Round Items ({analysis.items.length})</h5>
                      {analysis.items.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.creditorName}</span>
                            <Badge variant="outline">{item.priority}</Badge>
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{item.bureau}</span>
                            <span>{item.letterType}</span>
                          </div>
                        </div>
                      ))}
                      {analysis.estimatedSuccessRate && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <span className="text-sm">Estimated Success Rate: </span>
                          <span className="font-bold text-green-400">{analysis.estimatedSuccessRate}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
