import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BureauResponse {
  id: string;
  dispute_item_id?: string;
  bureau: string;
  response_type: 'verified' | 'deleted' | 'updated' | 'investigating' | 'no_response';
  response_date: string;
  outcome?: string;
  response_content?: string;
  file_path?: string;
  ai_analysis?: any;
  created_at: string;
}

export function useBureauResponses() {
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<BureauResponse[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchResponses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bureau_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('response_date', { ascending: false });

      if (error) throw error;
      setResponses((data || []) as BureauResponse[]);
    } catch (error) {
      console.error('Error fetching bureau responses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const recordResponse = useCallback(async (
    bureau: string,
    responseType: BureauResponse['response_type'],
    disputeItemId?: string,
    content?: string,
    filePath?: string
  ): Promise<BureauResponse | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('bureau_responses')
        .insert({
          user_id: user.id,
          dispute_item_id: disputeItemId,
          bureau,
          response_type: responseType,
          response_content: content,
          file_path: filePath
        })
        .select()
        .single();

      if (error) throw error;

      const newResponse = data as BureauResponse;
      setResponses(prev => [newResponse, ...prev]);

      // If linked to a dispute item, update its outcome
      if (disputeItemId) {
        // Map response type to dispute outcome
        const outcomeMap: Record<string, 'pending' | 'in_progress' | 'responded' | 'verified' | 'deleted' | 'updated' | 'failed'> = {
          'verified': 'verified',
          'deleted': 'deleted',
          'updated': 'updated',
          'investigating': 'in_progress',
          'no_response': 'pending'
        };
        
        await supabase
          .from('dispute_items')
          .update({ 
            outcome: outcomeMap[responseType] || 'responded',
            response_received_at: new Date().toISOString()
          })
          .eq('id', disputeItemId);
      }

      toast({ 
        title: "Response Recorded",
        description: `${bureau} response marked as ${responseType}.` 
      });
      return newResponse;
    } catch (error: any) {
      console.error('Error recording response:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const uploadResponseDocument = useCallback(async (
    file: File,
    bureau: string,
    disputeItemId?: string
  ): Promise<BureauResponse | null> => {
    if (!user) return null;
    try {
      const fileName = `${user.id}/responses/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('credit-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Parse the response with AI
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('ocr-document-parser', {
        body: {
          filePath: fileName,
          documentType: 'bureau_response',
          userId: user.id
        }
      });

      if (parseError) throw parseError;

      const responseType = parseResult?.analysis?.outcome || 'investigating';
      
      const response = await recordResponse(
        bureau,
        responseType,
        disputeItemId,
        parseResult?.rawText,
        fileName
      );

      if (response && parseResult?.analysis) {
        await supabase
          .from('bureau_responses')
          .update({ ai_analysis: parseResult.analysis })
          .eq('id', response.id);
      }

      return response;
    } catch (error: any) {
      console.error('Error uploading response document:', error);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, recordResponse, toast]);

  const getResponseStats = useCallback(() => {
    const total = responses.length;
    const deleted = responses.filter(r => r.response_type === 'deleted').length;
    const verified = responses.filter(r => r.response_type === 'verified').length;
    const updated = responses.filter(r => r.response_type === 'updated').length;
    const pending = responses.filter(r => r.response_type === 'investigating' || r.response_type === 'no_response').length;

    return { total, deleted, verified, updated, pending };
  }, [responses]);

  return {
    isLoading,
    responses,
    fetchResponses,
    recordResponse,
    uploadResponseDocument,
    getResponseStats
  };
}
