import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Search, MessageSquare } from 'lucide-react';

const mockConversations = [
  {
    id: '1',
    client: 'John Doe',
    lastMessage: "Thank you! When will the next round start?",
    timestamp: '10:30 AM',
    unread: 2,
  },
  {
    id: '2',
    client: 'Jane Smith',
    lastMessage: "I uploaded my new utility bill.",
    timestamp: '9:15 AM',
    unread: 1,
  },
  {
    id: '3',
    client: 'Mike Johnson',
    lastMessage: "Got it, thanks for the update!",
    timestamp: 'Yesterday',
    unread: 0,
  },
  {
    id: '4',
    client: 'Sarah Williams',
    lastMessage: "What does this response from Equifax mean?",
    timestamp: 'Yesterday',
    unread: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'client',
    message: "Hi! I just got a response from Experian. Is this good news?",
    timestamp: '10:15 AM',
  },
  {
    id: '2',
    sender: 'va',
    message: "Hi John! Yes, this is great news! The late payment from Capital One has been removed from your Experian report. Your score should update within the next few days.",
    timestamp: '10:20 AM',
  },
  {
    id: '3',
    sender: 'client',
    message: "That's amazing! Thank you so much for your help!",
    timestamp: '10:25 AM',
  },
  {
    id: '4',
    sender: 'client',
    message: "When will the next round start?",
    timestamp: '10:30 AM',
  },
];

export default function VAMessages() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  const filteredConversations = mockConversations.filter(c =>
    c.client.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  return (
    <RoleBasedLayout>
      <div className="h-[calc(100vh-200px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with your assigned clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
          {/* Conversations List */}
          <Card className="card-elevated md:col-span-1 flex flex-col">
            <CardHeader className="border-b border-border py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation.id === conversation.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.client.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.client}</p>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="bg-primary">{conversation.unread}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="card-elevated md:col-span-2 flex flex-col">
            <CardHeader className="border-b border-border py-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConversation.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedConversation.client}</CardTitle>
                  <p className="text-sm text-muted-foreground">Client</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'va' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.sender === 'va'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${msg.sender === 'va' ? 'text-right' : ''}`}>
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
      </div>
    </RoleBasedLayout>
  );
}
