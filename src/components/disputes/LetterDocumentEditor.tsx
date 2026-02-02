import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Download,
  Printer,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { readAiStream } from '@/lib/aiStream';

interface LetterDocumentEditorProps {
  content: string;
  onChange?: (content: string) => void;
  creditor?: string;
  letterType?: string;
  bureaus?: string[];
  onSave?: (content: string) => void;
  onDownload?: (content: string) => void;
  onPrint?: (content: string) => void;
  readOnly?: boolean;
  showOptimize?: boolean;
}

const LetterDocumentEditor = ({
  content,
  onChange,
  creditor,
  letterType,
  bureaus = [],
  onSave,
  onDownload,
  onPrint,
  readOnly = false,
  showOptimize = true,
}: LetterDocumentEditorProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('serif');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!editedContent.trim()) {
      toast({ title: 'Error', description: 'No content to optimize', variant: 'destructive' });
      return;
    }

    setIsOptimizing(true);
    setStatusMessage('Optimizing letter...');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-dispute-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          letterContent: editedContent,
          letterType,
          creditor,
          stream: true
        })
      });

      const data = await readAiStream<{ optimizedLetter: string }>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

      if (data?.optimizedLetter) {
        if (editorRef.current) {
          editorRef.current.innerText = data.optimizedLetter;
        }
        setEditedContent(data.optimizedLetter);
        setHasChanges(true);
        onChange?.(data.optimizedLetter);
        toast({
          title: 'Letter Optimized',
          description: 'AI has enhanced your letter for maximum impact.',
        });
      }
    } catch (err) {
      console.error('Optimization error:', err);
      toast({
        title: 'Optimization Failed',
        description: 'Unable to optimize letter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setStatusMessage(null);
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
  }, [content]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerText;
      setEditedContent(newContent);
      setHasChanges(newContent !== content);
      onChange?.(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      toast({ title: 'Copied', description: 'Letter copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    onDownload?.(editedContent);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Dispute Letter${creditor ? ` - ${creditor}` : ''}</title>
            <style>
              @page { margin: 1in; }
              body {
                font-family: 'Times New Roman', Georgia, serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000;
                background: #fff;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 0;
              }
              .letter-content {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <div class="letter-content">${editedContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    onPrint?.(editedContent);
  };

  const handleSave = () => {
    onSave?.(editedContent);
    setHasChanges(false);
    toast({ title: 'Saved', description: 'Letter has been saved' });
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    onClick, 
    tooltip,
    active = false 
  }: { 
    icon: React.ElementType; 
    onClick: () => void; 
    tooltip: string;
    active?: boolean;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            active && 'bg-primary/10 text-primary'
          )}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Document Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              Dispute Letter {creditor && `- ${creditor}`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {letterType && (
                <Badge variant="secondary" className="text-xs">
                  {letterType}
                </Badge>
              )}
              {bureaus.map((bureau) => (
                <Badge key={bureau} variant="outline" className="text-xs capitalize">
                  {bureau}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Unsaved changes
            </Badge>
          )}
          {!hasChanges && editedContent && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/20 flex-wrap">
          {/* Font Family */}
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serif">Times New Roman</SelectItem>
              <SelectItem value="sans-serif">Arial</SelectItem>
              <SelectItem value="mono">Courier</SelectItem>
            </SelectContent>
          </Select>

          {/* Font Size */}
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10pt</SelectItem>
              <SelectItem value="11">11pt</SelectItem>
              <SelectItem value="12">12pt</SelectItem>
              <SelectItem value="14">14pt</SelectItem>
              <SelectItem value="16">16pt</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} tooltip="Bold (Ctrl+B)" />
          <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} tooltip="Italic (Ctrl+I)" />
          <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} tooltip="Underline (Ctrl+U)" />

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} tooltip="Align Left" />
          <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} tooltip="Align Center" />
          <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} tooltip="Align Right" />

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton icon={Undo2} onClick={() => execCommand('undo')} tooltip="Undo (Ctrl+Z)" />
          <ToolbarButton icon={Redo2} onClick={() => execCommand('redo')} tooltip="Redo (Ctrl+Y)" />

          {showOptimize && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Optimize
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI will enhance this letter for maximum legal impact</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
          {isOptimizing && statusMessage && (
            <p className="text-xs text-muted-foreground mt-2">{statusMessage}</p>
          )}
      )}

      {/* Document Editor Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-8">
        {/* Paper Document */}
        <div 
          className="mx-auto bg-white shadow-lg rounded-sm max-w-[8.5in] min-h-[11in]"
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), 0 0 40px rgba(0,0,0,0.05)',
          }}
        >
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={handleContentChange}
            onBlur={handleContentChange}
            className={cn(
              'p-8 md:p-12 min-h-[11in] outline-none text-black leading-relaxed',
              fontFamily === 'serif' && 'font-serif',
              fontFamily === 'sans-serif' && 'font-sans',
              fontFamily === 'mono' && 'font-mono',
              readOnly && 'cursor-default'
            )}
            style={{
              fontSize: `${fontSize}pt`,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/30">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        
        <div className="flex-1" />
        
        {onSave && !readOnly && (
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Letter
          </Button>
        )}
      </div>
    </div>
  );
};

export default LetterDocumentEditor;
