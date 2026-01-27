'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sendMessage } from '@/app/actions/chat-actions';
// Simples markdown render (ou use react-markdown se preferir)
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isPending?: boolean;
}

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', content: 'Olá! Sou seu assistente financeiro pessoal. Como posso ajudar com seu dinheiro hoje?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Focus input on open
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
        };

        const pendingMsg: Message = {
            id: 'pending',
            role: 'assistant',
            content: '',
            isPending: true,
        };

        setMessages(prev => [...prev, userMsg, pendingMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Call the robust API Route instead of the Server Action
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({
                        role: m.role,
                        content: m.content || ''
                    })),
                    context: 'general' // Default context for floating chat
                })
            });

            if (!response.ok) throw new Error('API return error');

            const data = await response.json();

            setMessages(prev => prev.filter(m => m.id !== 'pending'));

            if (data.error) {
                setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: `Erro: ${data.error}` }]);
            } else {
                if (data.sessionId) setSessionId(data.sessionId);

                const assistantMsg: Message = {
                    id: Date.now().toString() + '-bot',
                    role: 'assistant',
                    content: data.content || "Entendido."
                };
                setMessages(prev => [...prev, assistantMsg]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== 'pending'));
            setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Desculpe, tive um problema de conexão. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Removed unused confirmEntry logic since the main ChatWidget handles intents via the API now.
    // If we want to keep OCR/Actions in FloatingChat, we would need to port the logic from ChatWidget.
    // However, the user issue is just "it doesn't work". Making it chat is step 1.
    // Since FloatingChat is "Global", maybe simple chat is enough, or the API handles intents automatically (it does!).
    // The API response `data.content` handles the "Action Executed" message.

    // We keep handleImageSelect just in case we want to re-enable, but for now the focus is text chat fixing.
    // Actually, confirmEntry was used for OCR results. I will comment it out if it isn't used by handleSend.
    // It seems handleSend is PURE chat.

    // confirmEntry was for OCR. Since we are fixing the CHAT, we leave OCR as is for now or ignore if not called.
    const confirmEntry = async () => { }; // Stub to prevent undefined reference if UI calls it

    return (
        <>
            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 transition-all duration-300",
                    isOpen ? "rotate-90 bg-slate-800 hover:bg-slate-700" : "bg-gradient-to-r from-emerald-500 to-indigo-600 hover:scale-105 animate-in fade-in zoom-in"
                )}
            >
                {isOpen ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white animate-pulse" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md bg-opacity-95">

                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Assistente Financeiro</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-emerald-400">Online & Contextualizado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center",
                                    msg.role === 'user' ? "bg-slate-700" : "bg-indigo-500/20"
                                )}>
                                    {msg.role === 'user' ? <User className="h-4 w-4 text-slate-300" /> : <Sparkles className="h-4 w-4 text-indigo-400" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-slate-800 text-white rounded-tr-none"
                                        : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                                )}>
                                    {msg.isPending ? (
                                        <div className="flex items-center gap-1 h-5">
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 text-sm">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                                                    a: ({ node, ...props }) => <a {...props} className="text-indigo-400 hover:underline" target="_blank" />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pergunte sobre seus gastos, objetivos..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-all"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-600 mt-2">
                            O assistente utiliza seus dados financeiros para responder.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
