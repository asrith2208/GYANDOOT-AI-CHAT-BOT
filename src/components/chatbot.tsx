"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Bot, User, Volume2, Loader2, University } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getResponse, type Message as ActionMessage } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface Message extends ActionMessage {
  id: string;
  language?: string;
}

// For cross-browser compatibility
const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-message",
      role: "bot",
      content: "Namaste! I am Gyandoot, your guide to Uttaranchal University. How may I help you today?",
      language: "en-IN"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        setTimeout(() => {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }, 0);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Voice Error",
          description: `Could not recognize voice. Error: ${event.error}`,
          variant: "destructive"
        });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      toast({
        title: "Unsupported Browser",
        description: "Your browser does not support voice recognition.",
        variant: "destructive"
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Could not start recognition", error);
        toast({
          title: "Voice Error",
          description: "Could not start voice recognition. Please check your microphone permissions.",
          variant: "destructive",
        });
        setIsRecording(false);
      }
    }
  };


  const playAudio = useCallback((text: string, lang: string = 'en-US') => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === lang);
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      if(selectedVoice) {
          utterance.voice = selectedVoice;
      }

      utterance.lang = selectedVoice ? selectedVoice.lang : 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
        toast({
            title: "Unsupported Browser",
            description: "Your browser does not support text-to-speech.",
            variant: "destructive"
        });
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const history: ActionMessage[] = newMessages.map(({ id, language, ...rest }) => rest);

    try {
      const result = await getResponse(history, input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: result.answer,
        language: result.language,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Sorry, something went wrong. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl h-[85vh] lg:h-[80vh] flex flex-col shadow-2xl bg-card/90 backdrop-blur-sm border-2">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              <University />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-2xl text-foreground">ज्ञानदूत</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "bot" && (
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg p-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.role === "bot" && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mt-2 text-muted-foreground/70 hover:text-foreground"
                        onClick={() => playAudio(msg.content, msg.language)}
                      >
                        <Volume2 className="h-4 w-4" />
                     </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar>
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">ज्ञानदूत is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak your question..."
            disabled={isLoading}
            className="text-base"
          />
          <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={handleVoiceInput} disabled={isLoading}>
            <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")} />
            <span className="sr-only">Record voice message</span>
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
