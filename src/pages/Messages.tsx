import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Search,
  Send,
  Check,
  CheckCheck,
  Loader2,
  Users,
} from 'lucide-react';

interface MessageContact {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  subject: string | null;
  read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<MessageContact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts (people you've messaged or who messaged you)
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['message-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all messages involving this user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) {
        // No messages yet, fetch agency contacts
        const { data: profile } = await supabase
          .from('profiles')
          .select('agency_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.agency_id) return [];

        const { data: agencyProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .eq('agency_id', profile.agency_id)
          .neq('user_id', user.id);

        return (agencyProfiles || []).map(p => ({
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          unreadCount: 0,
        })) as MessageContact[];
      }

      // Build contacts from messages
      const contactMap = new Map<string, MessageContact>();
      
      for (const msg of messages) {
        const contactId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (!contactMap.has(contactId)) {
          contactMap.set(contactId, {
            user_id: contactId,
            first_name: null,
            last_name: null,
            email: null,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: 0,
          });
        }

        // Count unread messages from this contact
        if (msg.sender_id === contactId && !msg.read) {
          const contact = contactMap.get(contactId)!;
          contact.unreadCount++;
        }
      }

      // Fetch profiles for contacts
      const contactIds = Array.from(contactMap.keys());
      if (contactIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', contactIds);

        profiles?.forEach(p => {
          const contact = contactMap.get(p.user_id);
          if (contact) {
            contact.first_name = p.first_name;
            contact.last_name = p.last_name;
            contact.email = p.email;
          }
        });
      }

      return Array.from(contactMap.values());
    },
    enabled: !!user,
  });

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', user?.id, selectedContact?.user_id],
    queryFn: async () => {
      if (!user || !selectedContact) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact.user_id}),and(sender_id.eq.${selectedContact.user_id},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark unread messages as read
      const unreadIds = (data || [])
        .filter(m => m.recipient_id === user.id && !m.read)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
        
        queryClient.invalidateQueries({ queryKey: ['message-contacts'] });
      }

      return data as Message[];
    },
    enabled: !!user && !!selectedContact,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['message-contacts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedContact) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: selectedContact.user_id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-contacts'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getContactName = (contact: MessageContact) => {
    if (contact.first_name || contact.last_name) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    }
    return contact.email || 'Unknown';
  };

  const getContactInitials = (contact: MessageContact) => {
    return `${(contact.first_name || '?')[0]}${(contact.last_name || '')[0] || ''}`;
  };

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
            Communicate with clients and team members.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[calc(100vh-220px)] flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contactsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.user_id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      'flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border',
                      selectedContact?.user_id === contact.user_id
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-secondary/50'
                    )}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-foreground">
                        {getContactInitials(contact)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate text-sm">
                          {getContactName(contact)}
                        </p>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(contact.lastMessageTime), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      {contact.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">{contact.unreadCount}</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a contact to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-foreground">
                        {getContactInitials(selectedContact)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getContactName(selectedContact)}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedContact.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            msg.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-secondary text-foreground rounded-bl-md'
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1 mt-1',
                              msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}
                          >
                            <span className="text-xs">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.sender_id === user?.id && (
                              msg.read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button 
                      className="bg-gradient-primary hover:opacity-90"
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;