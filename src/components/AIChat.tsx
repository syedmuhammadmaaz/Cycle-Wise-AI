import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { X, Send, Bot, User } from 'lucide-react';
import { useCalendarStore } from '@/store/calendarStore'
import { fetchUserCycleEvents } from '@/lib/calendarClient'
import ReactMarkdown from 'react-markdown';


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

  // const generateAIResponse = (message: string): string => {
  //   const lowerMessage = message.toLowerCase();
    
  //   // Diet advice
  //   if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
  //     return "During your menstrual cycle, focus on iron-rich foods like leafy greens, lean meats, and legumes to combat fatigue. Omega-3 fatty acids from fish and nuts can help reduce inflammation. Stay hydrated and consider magnesium-rich foods like dark chocolate and almonds to help with cramps. Limit caffeine and processed foods which can worsen symptoms.";
  //   }
    
  //   // Symptom management
  //   if (lowerMessage.includes('cramp') || lowerMessage.includes('pain')) {
  //     return "For menstrual cramps, try applying heat to your lower abdomen, gentle exercise like walking or yoga, and staying hydrated. Magnesium supplements and anti-inflammatory foods can help. If pain is severe or interferes with daily activities, consider consulting your healthcare provider about pain management options.";
  //   }
    
  //   // Mood and mental health
  //   if (lowerMessage.includes('mood') || lowerMessage.includes('emotional') || lowerMessage.includes('stress')) {
  //     return "Hormonal changes during your cycle can affect mood. Practice self-care through regular sleep, gentle exercise, and relaxation techniques like meditation. Journaling can help track mood patterns. Don't hesitate to reach out to friends, family, or a mental health professional if you're struggling. Remember, these feelings are valid and temporary.";
  //   }
    
  //   // Exercise and activity
  //   if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('activity')) {
  //     return "Listen to your body during different cycle phases. During menstruation, gentle activities like walking, light yoga, or stretching can help. As estrogen rises (follicular phase), you might have more energy for moderate workouts. During ovulation, you may feel strongest. In the luteal phase, consider reducing intensity if you feel fatigued.";
  //   }
    
  //   // Sleep
  //   if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
  //     return "Hormonal changes can affect sleep quality throughout your cycle. Maintain a consistent sleep schedule, create a relaxing bedtime routine, and keep your bedroom cool and dark. If you experience insomnia before your period, try relaxation techniques and limit screen time before bed. Aim for 7-9 hours of quality sleep.";
  //   }
    
  //   // General cycle questions
  //   if (lowerMessage.includes('cycle') || lowerMessage.includes('period') || lowerMessage.includes('menstrual')) {
  //     return "A typical menstrual cycle is 21-35 days long, with periods lasting 3-7 days. Track your cycles to understand your personal patterns. Irregular cycles can be normal, especially during adolescence or perimenopause, but significant changes should be discussed with a healthcare provider. Each person's cycle is unique!";
  //   }
    
  //   // Default response
  //   return "I'm here to help with menstrual health, nutrition, wellness tips, and cycle-related questions. Feel free to ask about managing symptoms, diet recommendations, exercise during different cycle phases, or emotional support. Remember, I provide general guidance - always consult your healthcare provider for medical concerns.";
  // };

  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim()) return;

  //   setIsLoading(true);
  //   const userMessage = inputMessage.trim();
  //   setInputMessage('');

  //   // Generate AI response (in a real app, this would call an AI API)
  //   const aiResponse = generateAIResponse(userMessage);

  //   try {
  //     const { data, error } = await supabase
  //       .from('chat_messages')
  //       .insert({
  //         user_id: user?.id,
  //         message: userMessage,
  //         response: aiResponse,
  //         message_type: 'health_guidance'
  //       })
  //       .select()
  //       .single();

  //     if (error) throw error;
  //     setMessages(prev => [...prev, data]);
  //   } catch (error) {
  //     console.error('Error saving chat message:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

//   const handleSendMessage = async () => {
//   if (!inputMessage.trim()) return;

//   setIsLoading(true);
//   const userMessage = inputMessage.trim();
//   setInputMessage('');

//   const aiResponse = generateAIResponse(userMessage);

//   // 1. Optimistically add user's message (temporary)
//   const tempMessage: ChatMessage = {
//     id: crypto.randomUUID(),
//     message: userMessage,
//     response: '', // initially empty
//     message_type: 'health_guidance',
//     created_at: new Date().toISOString(),
//   };
//   setMessages(prev => [...prev, tempMessage]);

//   try {
//     // 2. Save the full message with response
//     const { data, error } = await supabase
//       .from('chat_messages')
//       .insert({
//         user_id: user?.id,
//         message: userMessage,
//         response: aiResponse,
//         message_type: 'health_guidance',
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     // 3. Replace temp message with real message from Supabase
//     setMessages(prev => [...prev.slice(0, -1), data]);
//   } catch (error) {
//     console.error('Error saving chat message:', error);
//     // Optional: show error message or retry logic
//   } finally {
//     setIsLoading(false);
//   }
// };

// const generateAIResponse = async (message: string): Promise<string> => {
//   try {
//     const res = await fetch('https://automations.aiagents.co.id/webhook/ai-health-guide', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ message, user_id: user?.id }),
//     });

//     const data = await res.json();
//     console.log(data.content);
//     return data.content || "Sorry, I couldn't understand your question.";
//   } catch (err) {
//     console.error('Error fetching AI response from n8n:', err);
//     return "There was an error contacting the AI service.";
//   }
// };



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
    return data.content || "Sorry, I couldn't understand your question.";
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
  // 🧠 Pull events from global state
  const calendarEvents = useCalendarStore.getState().events;

  // 👇 Pass calendar events with the message
  const aiResponse = await generateAIResponse(userMessage, calendarEvents);

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user?.id,
        message: userMessage,
        response: aiResponse,
        message_type: 'health_guidance',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
       {/* <Card className="w-full max-w-2xl h-[80vh] flex flex-col"> */}
       {/* <Card className="w-full max-w-4xl h-[90vh] flex flex-col"> */}
    <Card className="w-full max-w-6xl h-[95vh] flex flex-col">

        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>AI Health Guide</CardTitle>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
<ScrollArea className="flex-1 p-4 overflow-y-auto max-h-[calc(95vh-160px)]">
  {/* <ScrollArea className="flex-1 px-4 pt-4 overflow-y-auto"> */}

  <div className="flex flex-col gap-4">
    {/* Empty state */}
    {messages.length === 0 && (
      <div className="text-center py-8">
        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">AI Health Guide</h3>
        <p className="text-muted-foreground text-sm">
          Ask me about menstrual health, nutrition tips, managing symptoms, or emotional wellness during your cycle.
        </p>
      </div>
    )}

    {/* Message list */}
    {messages.map((msg) => (
      <div key={msg.id} className="space-y-3">
        {/* User message */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm">{msg.message}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(msg.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* AI response */}
        {/* <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-sm">{msg.response}</p> 
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI Health Guide</p>
          </div>
        </div> */}
        {/* AI response */}
<div className="flex items-start gap-3">
  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
    <Bot className="h-4 w-4 text-primary" />
  </div>
  <div className="flex-1">
    <div className="bg-primary/5 rounded-lg p-3">
      <div className="prose prose-sm max-w-none text-sm text-gray-800">
        <ReactMarkdown>
          {msg.response}
        </ReactMarkdown>
      </div>
    </div>
    <p className="text-xs text-muted-foreground mt-1">AI Health Guide</p>
  </div>
</div>

      </div>
    ))}

    {/* Typing loader */}
    {isLoading && (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* 👇 Ensure this stays at the very end */}
    <div ref={bottomRef} />
  </div>
</ScrollArea>


          
          {/* <div className="border-t p-4">
            <div className="flex gap-2"> */}
              {/* <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your menstrual health..."
                disabled={isLoading}
                className="flex-1"
              /> */}
              {/* <Input
  value={inputMessage}
  onChange={(e) => setInputMessage(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Ask about your menstrual health..."
  disabled={isLoading || !user}
  className="flex-1"
/> */}

              {/* <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button> */}

              {/* <Button 
  onClick={handleSendMessage} 
  disabled={isLoading || !inputMessage.trim() || !user}
  size="sm"
>
  <Send className="h-4 w-4" />
</Button> */}

            {/* </div> */}
          {/* </div>
           */}


 {/* <div className="border-t p-3 bg-gradient-to-r from-pink-50 to-rose-100 shadow-inner">
  <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-md">
    <Input
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask about your menstrual health..."
      disabled={isLoading || !user}
      className="flex-1 border-none focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-sm placeholder:text-muted-foreground"
    />
    <Button 
      onClick={handleSendMessage} 
      disabled={isLoading || !inputMessage.trim() || !user}
      size="icon"
      className="bg-rose-500 hover:bg-rose-600 text-white shadow-md"
    >
      <Send className="h-4 w-4" />
    </Button>
  </div>
</div> */}


{/* <div className="border-t p-3 bg-gradient-to-br from-pink-100 via-rose-200 to-fuchsia-100 shadow-inner backdrop-blur-sm">
  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-white/30 ring-1 ring-rose-100">
    <Input
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask about your menstrual health..."
      disabled={isLoading || !user}
      className="flex-1 border-none focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-sm text-rose-900 placeholder:text-rose-400"
    />
    <Button 
      onClick={handleSendMessage} 
      disabled={isLoading || !inputMessage.trim() || !user}
      size="icon"
      className="bg-gradient-to-tr from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-200"
    >
      <Send className="h-4 w-4" />
    </Button>
  </div>
</div> */}


<div className="border-t p-3 bg-gradient-to-br from-pink-100 via-rose-200 to-fuchsia-100 shadow-inner backdrop-blur-md">
  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-white/30 ring-1 ring-rose-200">
    <Input
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask about your menstrual health..."
      disabled={isLoading || !user}
      className="flex-1 border-none focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-sm text-rose-900 placeholder:text-rose-400 placeholder:italic"
    />
    <Button 
      onClick={handleSendMessage} 
      disabled={isLoading || !inputMessage.trim() || !user}
      size="icon"
      className="bg-gradient-to-tr from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-200 transition-all duration-200 ease-in-out"
    >
      <Send className="h-4 w-4" />
    </Button>
  </div>
</div>



        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;