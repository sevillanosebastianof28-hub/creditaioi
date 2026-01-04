import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
  };
  recipient_profile?: {
    first_name: string;
    last_name: string;
  };
}

export function useMessages(conversationUserId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, conversationUserId]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all messages involving the user
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const convMap = new Map<string, any>();
      for (const msg of (allMessages || [])) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            partnerId,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: msg.recipient_id === user.id && !msg.read ? 1 : 0
          });
        } else if (msg.recipient_id === user.id && !msg.read) {
          convMap.get(partnerId).unreadCount++;
        }
      }

      // Fetch partner profiles
      const partnerIds = Array.from(convMap.keys());
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', partnerIds);

        for (const profile of (profiles || [])) {
          const conv = convMap.get(profile.user_id);
          if (conv) {
            conv.partnerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
          }
        }
      }

      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (recipientId: string, content: string, subject?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          subject
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  }, [user]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('recipient_id', user.id);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          if (conversationUserId) {
            fetchMessages();
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationUserId, fetchMessages, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationUserId) {
      fetchMessages();
    }
  }, [conversationUserId, fetchMessages]);

  return {
    messages,
    conversations,
    isLoading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  };
}
