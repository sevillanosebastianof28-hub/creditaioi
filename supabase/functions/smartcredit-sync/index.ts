import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, connectionData, reportData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "init_connection": {
        // Initialize SmartCredit connection for a user
        const { data: existing } = await supabase
          .from('smartcredit_connections')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (existing) {
          // Update existing connection
          const { error } = await supabase
            .from('smartcredit_connections')
            .update({
              connection_status: 'pending',
            })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Create new connection record
          const { error } = await supabase
            .from('smartcredit_connections')
            .insert({
              user_id: userId,
              connection_status: 'pending',
            });

          if (error) throw error;
        }

        console.log(`SmartCredit: Initialized connection for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Connection initialized',
          // In production, this would be the actual SmartCredit OAuth URL
          oauthUrl: `https://smartcredit.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(supabaseUrl + '/functions/v1/smartcredit-callback')}&state=${userId}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "complete_connection": {
        // Complete the OAuth flow and store tokens
        const { error } = await supabase
          .from('smartcredit_connections')
          .update({
            connection_status: 'connected',
            connected_at: new Date().toISOString(),
            access_token_encrypted: connectionData?.accessToken, // In production, encrypt this
          })
          .eq('user_id', userId);

        if (error) throw error;

        console.log(`SmartCredit: Completed connection for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Connection completed'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sync_report": {
        // Sync credit report data from SmartCredit
        // In production, this would call SmartCredit API
        
        // Update last sync time
        const { error: updateError } = await supabase
          .from('smartcredit_connections')
          .update({
            last_sync_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;

        // If report data provided, store the analysis
        if (reportData) {
          const { error: analysisError } = await supabase
            .from('credit_report_analyses')
            .insert({
              user_id: userId,
              raw_text: JSON.stringify(reportData),
              summary: reportData.summary || {},
              disputable_items: reportData.negativeItems || [],
              analysis_result: reportData,
            });

          if (analysisError) throw analysisError;
        }

        console.log(`SmartCredit: Synced report for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Report synced',
          lastSyncAt: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        // Disconnect SmartCredit
        const { error } = await supabase
          .from('smartcredit_connections')
          .update({
            connection_status: 'disconnected',
            access_token_encrypted: null,
          })
          .eq('user_id', userId);

        if (error) throw error;

        console.log(`SmartCredit: Disconnected for user ${userId}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Disconnected successfully'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_status": {
        // Get connection status
        const { data, error } = await supabase
          .from('smartcredit_connections')
          .select('connection_status, connected_at, last_sync_at')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          status: data?.connection_status || 'not_connected',
          connectedAt: data?.connected_at,
          lastSyncAt: data?.last_sync_at
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    console.error("Error in smartcredit-sync:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
