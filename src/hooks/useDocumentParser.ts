import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParsedDocument {
  personalInfo?: any;
  scores?: any[];
  tradelines?: any[];
  collections?: any[];
  inquiries?: any[];
  publicRecords?: any[];
  negativeItems?: any[];
  summary?: any;
  documentType?: string;
  fullName?: any;
  dateOfBirth?: string;
  address?: string;
  documentNumber?: string;
  expirationDate?: string;
  isValid?: boolean;
  warnings?: string[];
  rawText?: string;
}

export function useDocumentParser() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDocument | null>(null);
  const { toast } = useToast();

  const parseImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseCreditReport = async (file?: File, text?: string) => {
    setIsProcessing(true);
    try {
      let body: any = { action: 'parse_credit_report' };
      
      if (file) {
        const base64 = await parseImageToBase64(file);
        body.imageBase64 = base64;
      } else if (text) {
        body.extractedText = text;
      } else {
        throw new Error("Either file or text is required");
      }

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', { body });

      if (error) throw error;
      
      setParsedData(data.result);
      toast({
        title: "Report Parsed",
        description: `Found ${data.result.negativeItems?.length || 0} disputable items`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error parsing credit report:', error);
      toast({
        title: "Parsing Failed",
        description: error.message || "Failed to parse credit report.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const parseIdDocument = async (file: File) => {
    setIsProcessing(true);
    try {
      const base64 = await parseImageToBase64(file);

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', {
        body: {
          action: 'parse_id_document',
          imageBase64: base64
        }
      });

      if (error) throw error;
      
      setParsedData(data.result);
      
      if (data.result.isValid) {
        toast({
          title: "ID Verified",
          description: `${data.result.documentType} for ${data.result.fullName?.firstName || 'client'}`,
        });
      } else {
        toast({
          title: "ID Needs Review",
          description: data.result.warnings?.[0] || "Please verify the document",
          variant: "destructive",
        });
      }
      
      return data.result;
    } catch (error: any) {
      console.error('Error parsing ID document:', error);
      toast({
        title: "ID Parsing Failed",
        description: error.message || "Failed to parse ID document.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const parseBureauLetter = async (file?: File, text?: string) => {
    setIsProcessing(true);
    try {
      let body: any = { action: 'parse_bureau_letter' };
      
      if (file) {
        const base64 = await parseImageToBase64(file);
        body.imageBase64 = base64;
      } else if (text) {
        body.extractedText = text;
      } else {
        throw new Error("Either file or text is required");
      }

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', { body });

      if (error) throw error;
      
      setParsedData(data.result);
      toast({
        title: "Letter Parsed",
        description: `Found ${data.result.items?.length || 0} item outcomes`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error parsing bureau letter:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const parseProofDocument = async (file?: File, text?: string) => {
    setIsProcessing(true);
    try {
      let body: any = { action: 'parse_proof_document' };
      
      if (file) {
        const base64 = await parseImageToBase64(file);
        body.imageBase64 = base64;
      } else if (text) {
        body.extractedText = text;
      } else {
        throw new Error("Either file or text is required");
      }

      const { data, error } = await supabase.functions.invoke('ocr-document-parser', { body });

      if (error) throw error;
      
      setParsedData(data.result);
      toast({
        title: "Document Parsed",
        description: data.result.isValidProof ? "Valid proof document" : "Document needs review",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error parsing proof document:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearParsedData = () => setParsedData(null);

  return {
    isProcessing,
    parsedData,
    parseCreditReport,
    parseIdDocument,
    parseBureauLetter,
    parseProofDocument,
    clearParsedData
  };
}
