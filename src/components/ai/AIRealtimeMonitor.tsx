import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AIRealtimeMonitor() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor realtime connection status
    const channel = supabase.channel('connection-monitor');
    
    channel
      .on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          setIsConnected(true);
          setLastUpdate(new Date());
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    // Heartbeat to check connection
    const heartbeat = setInterval(() => {
      if (channel.state === 'joined') {
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    }, 5000);

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-4 left-4 z-50"
      >
        <Badge 
          variant={isConnected ? "outline" : "destructive"}
          className={`${isConnected ? 'bg-success/10 border-success/20 text-success' : ''} flex items-center gap-2`}
        >
          {isConnected ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Activity className="w-3 h-3" />
              </motion.div>
              <span className="text-xs">AI Real-time Active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span className="text-xs">Reconnecting...</span>
            </>
          )}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}
