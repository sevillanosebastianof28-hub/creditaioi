import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { mockClients } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
} from 'lucide-react';

const mockConversations = [
  {
    id: '1',
    client: mockClients[0],
    lastMessage: 'Thank you! I received the letters.',
    timestamp: '2 min ago',
    unread: 2,
  },
  {
    id: '2',
    client: mockClients[1],
    lastMessage: 'When should I expect the next update?',
    timestamp: '1 hour ago',
    unread: 0,
  },
  {
    id: '3',
    client: mockClients[2],
    lastMessage: 'My score went up! 🎉',
    timestamp: '3 hours ago',
    unread: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'client',
    text: "Hi, I just uploaded my new credit report. Can you take a look?",
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    sender: 'agent',
    text: "Hi Marcus! Yes, I can see the report. Our AI is analyzing it now - should have results in a few minutes.",
    time: '10:32 AM',
    status: 'read',
  },
  {
    id: '3',
    sender: 'agent',
    text: "Great news! We found 5 disputable items with an average 82% deletion probability. This could boost your score by 45-65 points.",
    time: '10:35 AM',
    status: 'read',
  },
  {
    id: '4',
    sender: 'client',
    text: "That's amazing! What's the next step?",
    time: '10:38 AM',
    status: 'read',
  },
  {
    id: '5',
    sender: 'agent',
    text: "I'll generate the dispute letters now. You'll receive them in your portal within the hour for review. Once you approve, we'll send them to the bureaus.",
    time: '10:40 AM',
    status: 'read',
  },
  {
    id: '6',
    sender: 'client',
    text: 'Thank you! I received the letters.',
    time: '11:45 AM',
    status: 'delivered',
  },
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Communicate with clients via unified inbox.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[calc(100vh-220px)] flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    'flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border',
                    selectedConversation.id === conv.id
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-secondary text-foreground">
                      {conv.client.firstName[0]}
                      {conv.client.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conv.client.firstName} {conv.client.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground">{conv.unread}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-secondary text-foreground">
                    {selectedConversation.client.firstName[0]}
                    {selectedConversation.client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedConversation.client.firstName}{' '}
                    {selectedConversation.client.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.client.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.sender === 'agent' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      msg.sender === 'agent'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-foreground rounded-bl-md'
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div
                      className={cn(
                        'flex items-center justify-end gap-1 mt-1',
                        msg.sender === 'agent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      <span className="text-xs">{msg.time}</span>
                      {msg.sender === 'agent' && (
                        msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
