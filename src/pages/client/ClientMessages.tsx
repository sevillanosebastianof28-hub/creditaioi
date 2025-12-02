import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip, MessageSquare, Bot } from 'lucide-react';

const mockMessages = [
  {
    id: '1',
    sender: 'Sarah (Your VA)',
    senderType: 'va',
    message: "Hi! I've reviewed your latest credit report and identified 3 new items we can dispute. I'll have the letters ready for your approval by tomorrow.",
    timestamp: '2024-05-20 10:30 AM',
    avatar: null,
  },
  {
    id: '2',
    sender: 'You',
    senderType: 'client',
    message: "That's great news! Can you tell me which items you found?",
    timestamp: '2024-05-20 10:45 AM',
    avatar: null,
  },
  {
    id: '3',
    sender: 'Sarah (Your VA)',
    senderType: 'va',
    message: "Of course! We found:\n1. A late payment on Capital One from 2022 that shows incorrect date\n2. A collection account that may be past the statute of limitations\n3. An inquiry that you didn't authorize\n\nAll three have good chances of deletion!",
    timestamp: '2024-05-20 11:00 AM',
    avatar: null,
  },
  {
    id: '4',
    sender: 'AI Assistant',
    senderType: 'ai',
    message: "🎉 Good news! Your Experian score increased by 15 points this month. Keep up the great progress!",
    timestamp: '2024-05-19 09:00 AM',
    avatar: null,
  },
];

export default function ClientMessages() {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      // Mock send
      setNewMessage('');
    }
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat with your assigned VA and receive AI updates</p>
        </div>

        <Card className="card-elevated flex-1 flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">S</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Sarah Martinez</CardTitle>
                  <p className="text-sm text-muted-foreground">Your assigned VA • Online</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                <span className="w-2 h-2 rounded-full bg-success mr-1"></span>
                Online
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.senderType === 'client' ? 'order-2' : ''}`}>
                  {msg.senderType !== 'client' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-6 h-6">
                        {msg.senderType === 'ai' ? (
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            <Bot className="w-3 h-3" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">S</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{msg.sender}</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.senderType === 'client'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : msg.senderType === 'ai'
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-bl-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${msg.senderType === 'client' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!newMessage.trim()} className="bg-gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
