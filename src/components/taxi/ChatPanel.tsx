'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { translations, Language } from '@/lib/i18n';
import { Message, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Phone, 
  MoreVertical,
  Smile,
  Paperclip
} from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  users: User[];
  currentUserId?: string;
  language?: Language;
  onSendMessage?: (content: string, receiverId?: string, groupId?: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ChatPanel({
  messages,
  users,
  currentUserId,
  language = 'ar',
  onSendMessage,
  isOpen = true,
  onToggle,
}: ChatPanelProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  const [inputValue, setInputValue] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && selectedChat) {
      onSendMessage?.(inputValue, selectedChat);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get online users
  const onlineUsers = users.filter((u) => u.status === 'online');
  
  // Filter messages for selected chat
  const chatMessages = messages.filter(
    (m) =>
      (m.senderId === selectedChat && m.receiverId === currentUserId) ||
      (m.senderId === currentUserId && m.receiverId === selectedChat)
  );

  // Get user for selected chat
  const selectedUser = users.find((u) => u.id === selectedChat);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {onlineUsers.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {onlineUsers.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="h-[600px] w-80 flex flex-col shadow-xl">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t.chat}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{onlineUsers.length} {t.onlineNow}</span>
        </div>
      </CardHeader>

      <Separator />

      <div className="flex flex-1 overflow-hidden">
        {/* User List */}
        <div className={cn(
          'w-1/3 border-r flex-shrink-0',
          isRTL && 'border-r-0 border-l'
        )}>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedChat(user.id)}
                  className={cn(
                    'w-full p-2 rounded-lg flex items-center gap-2 transition-colors',
                    isRTL && 'flex-row-reverse',
                    selectedChat === user.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background',
                        user.status === 'online' && 'bg-green-500',
                        user.status === 'offline' && 'bg-gray-500',
                        user.status === 'busy' && 'bg-yellow-500'
                      )}
                    />
                  </div>
                  <span className={cn(
                    'text-sm truncate',
                    isRTL && 'text-right'
                  )}>
                    {user.name}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={cn(
                'p-3 border-b flex items-center gap-2 flex-shrink-0',
                isRTL && 'flex-row-reverse'
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser?.avatar} />
                  <AvatarFallback>
                    {selectedUser?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                  <p className="text-sm font-medium truncate">{selectedUser?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedUser?.status === 'online' ? t.online : t.offline}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3" ref={scrollRef}>
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {t.noMessages}
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.senderId === currentUserId
                            ? isRTL ? 'justify-start' : 'justify-end'
                            : isRTL ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg px-3 py-2',
                            message.senderId === currentUserId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              message.senderId === currentUserId
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t flex-shrink-0">
                <div className={cn(
                  'flex items-center gap-2',
                  isRTL && 'flex-row-reverse'
                )}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.typeMessage}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon" disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {language === 'ar' ? 'اختر محادثة للبدء' : 'Sélectionnez une conversation'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Import X for close button
import { X } from 'lucide-react';
