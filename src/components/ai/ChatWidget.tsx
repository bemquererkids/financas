"use client";

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
        onError: (err) => {
            console.error("ChatWidget Error:", err);
        }
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] md:w-[400px] h-[500px] mb-4 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-white">Consultor IA</CardTitle>
                                <p className="text-xs text-zinc-400">Contexto Financeiro Ativo</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                                <Bot className="h-12 w-12 text-emerald-500 mb-2" />
                                <p className="text-sm font-medium text-white">Olá! Sou seu assistente.</p>
                                <p className="text-xs text-zinc-400">Pergunte sobre seu saldo, gastos ou peça conselhos.</p>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex w-full",
                                    m.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                        m.role === 'user'
                                            ? "bg-emerald-600 text-white rounded-tr-none"
                                            : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5"
                                    )}
                                >
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    strong: ({ node, ...props }) => <span className="font-bold text-emerald-400" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="text-zinc-300" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="bg-zinc-800 rounded-2xl p-2 rounded-tl-none border border-white/5">
                                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 my-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <strong>Erro no Chat:</strong> {error.message}
                                <br />Verifique os logs da Railway para detalhes.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-3 border-t border-white/10 bg-zinc-950/50">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Digite sua pergunta..."
                                className="bg-zinc-900 border-zinc-700 focus:border-emerald-500"
                            />
                            <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
                    isOpen
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
}
