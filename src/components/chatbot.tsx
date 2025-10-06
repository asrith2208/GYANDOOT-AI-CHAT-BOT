"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Bot, User, Volume2, Loader2, University, Pause, Play, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getResponseAndAudio } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  language?: string;
  audioData?: string;
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
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [language, setLanguage] = useState("en-IN");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
        setNowPlaying(null);
    }
  }, []);

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
      recognition.lang = language; // Set language for speech recognition

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
  }, [toast, language]);

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
        if(recognitionRef.current) {
          recognitionRef.current.lang = language;
          recognitionRef.current.start();
          setIsRecording(true);
        }
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

  const handlePlayAudio = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.audioData) return;

    if (nowPlaying === messageId) {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    } else {
        stopPlayback();
        const audio = new Audio(message.audioData);
        audioRef.current = audio;
        audio.onplay = () => setNowPlaying(messageId);
        audio.onpause = () => setNowPlaying(p => p === messageId ? null : p);
        audio.onended = () => {
            setNowPlaying(null);
            audioRef.current = null;
        };
        audio.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: 'Could not play the audio file.',
            });
            setNowPlaying(null);
        };
        audio.play();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    stopPlayback();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const queryWithLang = `${input} (Please respond in ${language})`;
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const history = newMessages.map(({ id, language, audioData, ...rest }) => rest);

    try {
      const result = await getResponseAndAudio(history, queryWithLang);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: result.answer,
        language: result.language,
        audioData: result.audioData,
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
        <div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">Select Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Select a language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                    <DropdownMenuRadioItem value="en-IN">English</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hi-IN">हिन्दी (Hindi)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="te-IN">తెలుగు (Telugu)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bn-IN">বাংলা (Bengali)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="mr-IN">मराठी (Marathi)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ta-IN">தமிழ் (Tamil)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
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
                  {msg.role === "bot" && msg.audioData && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mt-2 text-muted-foreground/70 hover:text-foreground"
                        onClick={() => handlePlayAudio(msg.id)}
                      >
                        {nowPlaying === msg.id && audioRef.current && !audioRef.current.paused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
          <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={handleVoiceInput} disabled={isLoading || !SpeechRecognition}>
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
