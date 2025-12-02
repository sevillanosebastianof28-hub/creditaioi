import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FileText, Search, Eye, Edit, Send, CheckCircle2, Clock, AlertCircle, Brain, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockLetters = [
  {
    id: '1',
    client: 'John Doe',
    creditor: 'Capital One',
    bureau: 'Experian',
    type: 'Late Payment Dispute',
    status: 'pending_review',
    aiGenerated: true,
    createdAt: '2024-05-20',
    round: 2,
  },
  {
    id: '2',
    client: 'John Doe',
    creditor: 'Collection Agency XYZ',
    bureau: 'Equifax',
    type: 'Collection Validation',
    status: 'pending_review',
    aiGenerated: true,
    createdAt: '2024-05-20',
    round: 2,
  },
  {
    id: '3',
    client: 'Sarah Williams',
    creditor: 'Old Credit Card',
    bureau: 'TransUnion',
    type: 'Charge-Off Dispute',
    status: 'approved',
    aiGenerated: true,
    createdAt: '2024-05-19',
    round: 2,
  },
  {
    id: '4',
    client: 'Sarah Williams',
    creditor: 'Medical Collections',
    bureau: 'All Three',
    type: 'HIPAA Letter',
    status: 'sent',
    aiGenerated: true,
    createdAt: '2024-05-15',
    round: 1,
  },
  {
    id: '5',
    client: 'Jane Smith',
    creditor: 'Bank of America',
    bureau: 'Experian',
    type: 'Inquiry Removal',
    status: 'response_received',
    aiGenerated: true,
    createdAt: '2024-05-10',
    round: 1,
  },
];

const statusConfig = {
  pending_review: { label: 'Pending Review', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  approved: { label: 'Approved', color: 'bg-info/10 text-info border-info/20', icon: CheckCircle2 },
  sent: { label: 'Sent', color: 'bg-primary/10 text-primary border-primary/20', icon: Send },
  response_received: { label: 'Response Received', color: 'bg-success/10 text-success border-success/20', icon: AlertCircle },
};

export default function VADisputes() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const handleApprove = (letterId: string) => {
    toast({
      title: 'Letter Approved',
      description: 'The dispute letter has been approved and queued for sending.',
    });
  };

  const filteredLetters = mockLetters.filter(letter =>
    letter.client.toLowerCase().includes(search.toLowerCase()) ||
    letter.creditor.toLowerCase().includes(search.toLowerCase())
  );

  const pendingLetters = filteredLetters.filter(l => l.status === 'pending_review');
  const otherLetters = filteredLetters.filter(l => l.status !== 'pending_review');

  const LetterCard = ({ letter }: { letter: typeof mockLetters[0] }) => {
    const config = statusConfig[letter.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <Card className="card-elevated hover:border-primary/30 transition-colors">
        <CardContent className="py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{letter.creditor}</h4>
                {letter.aiGenerated && (
                  <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{letter.type}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {letter.client}
                </span>
                <Badge variant="secondary">{letter.bureau}</Badge>
                <Badge variant="outline">Round {letter.round}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              {letter.status === 'pending_review' && (
                <>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" className="bg-gradient-primary" onClick={() => handleApprove(letter.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispute Letters</h1>
          <p className="text-muted-foreground mt-1">Review, edit, and approve AI-generated dispute letters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{pendingLetters.length}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {mockLetters.filter(l => l.status === 'sent').length}
              </div>
              <p className="text-sm text-muted-foreground">Sent This Week</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {mockLetters.filter(l => l.status === 'response_received').length}
              </div>
              <p className="text-sm text-muted-foreground">Responses</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{mockLetters.length}</div>
              <p className="text-sm text-muted-foreground">Total Letters</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or creditor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Letters */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review ({pendingLetters.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Letters ({filteredLetters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingLetters.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold">All letters reviewed!</h3>
                  <p className="text-muted-foreground">No pending letters at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              pendingLetters.map(letter => <LetterCard key={letter.id} letter={letter} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredLetters.map(letter => <LetterCard key={letter.id} letter={letter} />)}
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedLayout>
  );
}
