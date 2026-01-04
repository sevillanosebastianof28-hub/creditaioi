import { useState, useEffect, useRef } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Bot, Loader2 } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useVAAssignments } from '@/hooks/useVAAssignments';
import { format } from 'date-fns';

export default function ClientMessages() {
  const { user } = useAuth();
  const { assignments } = useVAAssignments();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the assigned VA for this client
  const assignedVA = assignments.find(a => a.client_user_id === user?.id);
  const vaUserId = assignedVA?.va_user_id;
  const vaName = assignedVA?.va_profile 
    ? `${assignedVA.va_profile.first_name || ''} ${assignedVA.va_profile.last_name || ''}`.trim()
    : 'Your VA';

  const { messages, isLoading, sendMessage } = useMessages(vaUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !vaUserId) return;
    await sendMessage(vaUserId, newMessage.trim());
    setNewMessage('');
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
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {vaName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{vaName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {assignedVA ? 'Your assigned VA' : 'No VA assigned yet'}
                  </p>
                </div>
              </div>
              {assignedVA && (
                <Badge className="bg-success/10 text-success border-success/20">
                  <span className="w-2 h-2 rounded-full bg-success mr-1"></span>
                  Available
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !assignedVA ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No VA has been assigned to you yet.</p>
                  <p className="text-sm">Please contact your agency for assistance.</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${isMe ? 'order-2' : ''}`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {vaName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{vaName}</span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : ''}`}>
                          {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                placeholder={assignedVA ? "Type your message..." : "No VA assigned"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
                disabled={!assignedVA}
              />
              <Button 
                onClick={handleSend} 
                disabled={!newMessage.trim() || !assignedVA} 
                className="bg-gradient-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
