import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { X, Send, Bot, User, Sparkles, Heart, Brain, Activity, Shield, Zap, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '@/store/calendarStore'
import { fetchUserCycleEvents } from '@/lib/calendarClient'
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';


interface AIChatProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

function formatTime(raw: string) {
  let iso = raw.replace(' ', 'T');
  if (!/Z$|[+-]\d{2}:\d{2}$/.test(iso)) {
    iso = iso + 'Z';
  }

  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return '—'; 
  }
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}


const AIChat = ({ onClose }: AIChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
  if (user?.id) {
    fetchChatHistory();

    fetchUserCycleEvents(user.id).then(events => {
       console.log(' Events fetched from Supabase:', events);
      useCalendarStore.getState().setEvents(events);
    });
  }
}, [user?.id]);


  // useEffect(() => {
  //   fetchChatHistory();
  // }, [user]);

  // useEffect(() => {
  //   if (scrollAreaRef.current) {
  //     scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  //   }
  // }, [messages]);

    useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

   const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

const generateAIResponse = async (
  message: string,
  events: CalendarEvent[]
): Promise<string> => {
  try {
    const res = await fetch('https://automations.aiagents.co.id/webhook/ai-health-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: user?.id,
        events, 
      }),
    });

    const data = await res.json();
    console.log(data.content);
    return data.content || "Sorry, I could not understand your question.";
  } catch (err) {
    console.error('Error fetching AI response from n8n:', err);
    return "There was an error contacting the AI service.";
  }
};

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');
// const aiResponse = generateAIResponse(userMessage);
  //  Pull events from global state
  const calendarEvents = useCalendarStore.getState().events;

  // 👇 Pass calendar events with the message
  const aiResponse = await generateAIResponse(userMessage, calendarEvents);
    // Generate AI response (in a real app, this would call an AI API)
    // const aiResponse = generateAIResponse(userMessage);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user?.id,
          message: userMessage,
          response: aiResponse,
          message_type: 'health_guidance'
        })
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error saving chat message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{ 
                y: [null, -100],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-2xl h-[85vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Gradient Header */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 flex-shrink-0 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>
            
            {/* Status indicator */}
            <motion.div 
              className="absolute top-4 right-20 flex items-center gap-2 text-primary-foreground/80 text-xs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Online</span>
            </motion.div>

            <div className="relative flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3 
                  }}
                  className="relative w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20"
                >
                  <Sparkles className="h-6 w-6" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">AI Health Guide</h2>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-4 w-4 text-primary-foreground/60" />
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                    <Heart className="h-3 w-3" />
                    <span>Your personal wellness assistant</span>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-primary-foreground border-white/30 text-xs font-semibold backdrop-blur-sm">
                    <Zap className="h-3 w-3 mr-1" />
                    Beta
                  </Badge>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-primary-foreground hover:bg-white/20 rounded-full h-10 w-10 p-0 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Chat Messages Area */}
          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground) / 0.2) transparent'
            }}
          >
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.div 
                  className="relative w-20 h-20 mx-auto mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-500/30 to-blue-300/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Welcome to AI Health Guide
                </motion.h3>
                
                <motion.p 
                  className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your intelligent wellness companion for menstrual health, nutrition guidance, and emotional support.
                </motion.p>

                {/* Feature highlights */}
                <motion.div 
                  className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span>Symptom tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span>Wellness tips</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="h-3 w-3 text-purple-500" />
                    <span>Mood support</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-3 w-3 text-blue-500" />
                    <span>Private & secure</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="space-y-4"
                >
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] relative group">
                      <motion.div 
                        className="relative bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground rounded-2xl rounded-br-md p-4 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Animated border */}
                        <div className="absolute -right-1 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-500 rounded-r-full">
                          <motion.div 
                            className="w-full h-2 bg-white/50 rounded-full"
                            animate={{ y: [0, '100%', 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                        
                        {/* Message content */}
                        <p className="text-sm leading-relaxed relative z-10">{msg.message}</p>
                        
                        {/* Hover effect */}
                        <motion.div 
                          className="absolute inset-0 bg-white/10 rounded-2xl rounded-br-md opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={false}
                        />
                      </motion.div>
                      
                      <div className="flex items-center gap-2 justify-end mt-2">
                        <motion.div 
                          className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.2, rotate: 15 }}
                        >
                          <User className="h-3 w-3 text-primary" />
                        </motion.div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {/* <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span> */}
                          <span>{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] relative group">
                      <motion.div 
                        className="relative bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40 backdrop-blur-sm rounded-2xl rounded-bl-md p-4 shadow-sm border border-white/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Animated gradient border */}
                        <div className="absolute -left-1 top-0 bottom-0 w-1 rounded-l-full overflow-hidden">
                          <motion.div 
                            className="w-full h-full bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-500"
                            animate={{ 
                              background: [
                                "linear-gradient(to bottom, rgb(168 85 247), rgb(139 92 246), rgb(147 51 234))",
                                "linear-gradient(to bottom, rgb(139 92 246), rgb(147 51 234), rgb(168 85 247))",
                                "linear-gradient(to bottom, rgb(147 51 234), rgb(168 85 247), rgb(139 92 246))"
                              ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </div>
                        
                        {/* AI thinking indicator */}
                        <motion.div 
                          className="absolute top-2 right-3 w-2 h-2 bg-green-400 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        
                        <p className="text-sm leading-relaxed text-foreground relative z-10">{msg.response}</p>
                        
                        {/* Hover glow effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={false}
                        />
                      </motion.div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <motion.div 
                          className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center border border-purple-500/20"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Bot className="h-3 w-3 text-purple-600" />
                        </motion.div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-teal-500" />
                          <span>AI Health Guide</span>
                          <motion.div 
                            className="w-1 h-1 bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] relative">
                  <motion.div 
                    className="bg-gradient-to-br from-muted/80 to-muted/60 backdrop-blur-sm rounded-2xl rounded-bl-md p-4 shadow-sm border border-white/10 relative overflow-hidden"
                    animate={{ 
                      boxShadow: [
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Animated gradient border */}
                    <motion.div 
                      className="absolute -left-1 top-0 bottom-0 w-1 rounded-l-full"
                      animate={{ 
                        background: [
                          "linear-gradient(to bottom, rgb(168 85 247), rgb(139 92 246))",
                          "linear-gradient(to bottom, rgb(139 92 246), rgb(147 51 234))",
                          "linear-gradient(to bottom, rgb(147 51 234), rgb(168 85 247))"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Shimmer effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <motion.div 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-violet-400 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      />
                      <motion.span 
                        className="text-xs text-muted-foreground ml-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        AI is analyzing your question...
                      </motion.span>
                    </div>
                  </motion.div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <motion.div 
                      className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center border border-blue-400/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Bot className="h-3 w-3 text-purple-600" />
                    </motion.div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Brain className="h-3 w-3 text-purple-500" />
                      </motion.div>
                      <span>Processing...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Enhanced Sticky Input Bar */}
          <div className="relative bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 border-t border-border/30 p-6 flex-shrink-0 backdrop-blur-sm">
            {/* Subtle animation background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
              animate={{ 
                background: [
                  "linear-gradient(to right, rgba(var(--primary), 0.05), transparent, rgba(var(--primary), 0.05))",
                  "linear-gradient(to right, transparent, rgba(var(--primary), 0.08), transparent)",
                  "linear-gradient(to right, rgba(var(--primary), 0.05), transparent, rgba(var(--primary), 0.05))"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative flex gap-3">
              {/* Enhanced Input */}
              <div className="flex-1 relative">
                <motion.div
                  animate={inputMessage ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your menstrual health..."
                    disabled={isLoading}
                    className="rounded-2xl border-2 border-muted-foreground/20 bg-background/90 backdrop-blur-md focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-base py-4 px-5 transition-all duration-200 placeholder:text-muted-foreground/60"
                  />
                </motion.div>
                
                {/* Input indicators */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {inputMessage && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                  )}
                  <MessageCircle className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </div>
              
              {/* Enhanced Send Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  className="relative rounded-2xl px-6 py-4 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary shadow-xl disabled:opacity-50 border border-white/20 overflow-hidden group"
                >
                  {/* Button glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"
                    initial={false}
                  />
                  
                  <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  >
                    {isLoading ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
                
                {/* Button hover particles */}
                {inputMessage.trim() && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>
            
            {/* Quick suggestions */}
            {messages.length === 0 && !inputMessage && (
              <motion.div 
                className="mt-4 flex gap-2 flex-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {["Help with cramps", "Diet tips", "Mood support"].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs px-3 py-1.5 bg-muted/60 hover:bg-muted/80 rounded-full border border-border/30 text-muted-foreground hover:text-foreground transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;