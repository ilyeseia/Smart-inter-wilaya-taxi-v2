'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search as SearchIcon, 
  X, 
  ExternalLink, 
  Clock,
  Loader2,
  MessageCircle,
  Send,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  hostname: string;
  date?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================
// Web Search Component
// ============================================
interface WebSearchProps {
  language?: 'ar' | 'fr';
  onClose?: () => void;
}

export function WebSearch({ language = 'ar', onClose }: WebSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&lang=${language}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  }, [query, language]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            {language === 'ar' ? 'البحث على الويب' : 'Recherche Web'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder={language === 'ar' ? 'ابحث عن...' : 'Rechercher...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {/* Results */}
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {results.map((result, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium line-clamp-1"
                    >
                      {result.title}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {result.hostname}
                      </Badge>
                      {result.date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.date}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================
// AI Assistant Component
// ============================================
interface AIAssistantProps {
  language?: 'ar' | 'fr';
  context?: 'general' | 'booking' | 'route' | 'driver' | 'support';
}

export function AIAssistant({ 
  language = 'ar', 
  context = 'general' 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context,
          language,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Assistant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [input, context, language, messages]);

  const handleSpeak = useCallback(async (text: string) => {
    try {
      await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          voice: 'male',
        }),
      });
      // Audio playback would be implemented here
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, [language]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {language === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {language === 'ar'
                  ? 'مرحباً! كيف يمكنني مساعدتك؟'
                  : 'Bonjour! Comment puis-je vous aider?'}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' && 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 px-2"
                      onClick={() => handleSpeak(message.content)}
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      {language === 'ar' ? 'استمع' : 'Écouter'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Écrivez votre message...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
