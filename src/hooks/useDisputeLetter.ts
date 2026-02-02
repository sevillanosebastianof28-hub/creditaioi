import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DisputableItem } from './useCreditAnalysis';
import { readAiStream } from '@/lib/aiStream';

export type LetterType = 
  | 'fcra_605b'
  | 'debt_validation'
  | 'hipaa_medical'
  | 'goodwill'
  | 'data_breach'
  | 'identity_theft'
  | 'factual_dispute'
  | 'collection_validation'
  | 'inquiry_removal'
  | 'experian_backdoor';

export interface LetterTemplate {
  id: LetterType;
  name: string;
  description: string;
  applicableLaws: string[];
}

export const letterTemplates: LetterTemplate[] = [
  {
    id: 'fcra_605b',
    name: 'FCRA 605(b) Deletion',
    description: 'Request removal due to 7-year reporting limit or wrong DOFD',
    applicableLaws: ['FCRA 605', 'FCRA 605(b)'],
  },
  {
    id: 'debt_validation',
    name: 'Debt Validation Request',
    description: 'Demand complete documentation proving debt validity',
    applicableLaws: ['FDCPA 809'],
  },
  {
    id: 'hipaa_medical',
    name: 'HIPAA Medical Dispute',
    description: 'Dispute medical debt reported without authorization',
    applicableLaws: ['HIPAA', 'FCRA'],
  },
  {
    id: 'goodwill',
    name: 'Goodwill Adjustment',
    description: 'Request removal due to temporary hardship',
    applicableLaws: ['Goodwill'],
  },
  {
    id: 'data_breach',
    name: 'Data Breach Letter',
    description: 'Dispute citing potential identity theft or data compromise',
    applicableLaws: ['FCRA 611'],
  },
  {
    id: 'identity_theft',
    name: 'Identity Theft Affidavit',
    description: 'Demand removal of fraudulent accounts',
    applicableLaws: ['FCRA 605B', 'FTC'],
  },
  {
    id: 'factual_dispute',
    name: 'Factual Dispute',
    description: 'Dispute specific inaccuracies in reported information',
    applicableLaws: ['FCRA 611'],
  },
  {
    id: 'collection_validation',
    name: 'Collection Validation',
    description: 'Demand documentation from collection agency',
    applicableLaws: ['FDCPA 809'],
  },
  {
    id: 'inquiry_removal',
    name: 'Inquiry Removal',
    description: 'Request removal of unauthorized credit inquiries',
    applicableLaws: ['FCRA 604'],
  },
  {
    id: 'experian_backdoor',
    name: 'Experian NCAC Letter',
    description: 'Request manual review bypassing e-OSCAR',
    applicableLaws: ['FCRA'],
  },
];

export interface GeneratedLetter {
  letter: string;
  letterType: LetterType;
  creditor: string;
  bureaus: string[];
}

export function useDisputeLetter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateLetter = async (
    letterType: LetterType,
    disputableItem: DisputableItem,
    customInstructions?: string
  ) => {
    setIsGenerating(true);
    setGeneratedLetter(null);

    try {
      setStatusMessage('Drafting letter...');
      const { data: { session } } = await supabase.auth.getSession();
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-dispute-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || publishableKey}`,
          apikey: publishableKey
        },
        body: JSON.stringify({
          letterType,
          disputableItem,
          customInstructions,
          stream: true
        })
      });

      const data = await readAiStream<GeneratedLetter>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

      setGeneratedLetter(data);
      
      toast({
        title: "Letter Generated",
        description: `${letterTemplates.find(t => t.id === letterType)?.name} letter is ready.`,
      });

      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setStatusMessage(null);
      setIsGenerating(false);
    }
  };

  const clearLetter = () => {
    setGeneratedLetter(null);
  };

  const downloadLetter = (letter: string, filename: string) => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLetter = async (letter: string) => {
    try {
      await navigator.clipboard.writeText(letter);
      toast({
        title: "Copied",
        description: "Letter copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy letter. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  return {
    isGenerating,
    generatedLetter,
    statusMessage,
    generateLetter,
    clearLetter,
    downloadLetter,
    copyLetter,
    letterTemplates,
  };
}
