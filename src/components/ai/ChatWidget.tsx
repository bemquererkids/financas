
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, Loader2, Camera, Check, Mic, MicOff, Calendar, Tag, AlertCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatWidgetProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialInput?: string;
    onSuccess?: () => void;
    showUploads?: boolean;
    inputPlaceholder?: string;
    welcomeMessage?: string;
    context?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    'FOOD': 'Alimentação',
    'TRANSPORT': 'Transporte',
    'HOUSING': 'Moradia',
    'ENTERTAINMENT': 'Lazer',
    'HEALTH': 'Saúde',
    'EDUCATION': 'Educação',
    'SHOPPING': 'Compras',
    'SERVICES': 'Serviços',
    'SUBSCRIPTIONS': 'Assinaturas',
    'BANKING': 'Finanças',
    'OTHER': 'Outros'
};

export function ChatWidget({
    isOpen: externalIsOpen,
    onOpenChange,
    initialInput = '',
    onSuccess,
    showUploads = true,
    inputPlaceholder = 'Agende uma conta...',
    welcomeMessage,
    context = 'general'
}: ChatWidgetProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ id: string, role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState(initialInput);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [saveType, setSaveType] = useState<'TRANSACTION' | 'PAYABLE'>('TRANSACTION');
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;

    const toggleRecording = () => {
        if (!recognition) return toast.error('Navegador sem suporte a voz.');
        isRecording ? recognition.stop() : recognition.start();
    };

    // Initialize welcome message
    useEffect(() => {
        if (activeIsOpen && welcomeMessage && messages.length === 0) {
            setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMessage }]);
        }
    }, [activeIsOpen, welcomeMessage]);

    // Update input using a ref to track if it was manually changed? 
    // Or just simple useEffect when initialInput changes or isOpen changes.
    useEffect(() => {
        if (activeIsOpen && initialInput) {
            setInput(initialInput);
        }
    }, [initialInput, activeIsOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, extractedData, isLoading]);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'pt-BR';
            rec.onstart = () => setIsRecording(true);
            rec.onend = () => setIsRecording(false);
            rec.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsRecording(false);
            };
            rec.onerror = () => setIsRecording(false);
            setRecognition(rec);
        }
    }, []);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user' as const, content };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log('Sending message to API...');

            // Adiciona placeholder IMEDIATO
            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '...' }]);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content || ''
                    })),
                    context
                })
            });

            if (!response.ok) throw new Error('API return error');

            // MUDANÇA CRÍTICA: Lendo resposta como JSON simples e confiável
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Atualiza com a resposta final
            setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: data.content } : m
            ));

            if (data.content.includes('✅')) {
                toast.success('Agente atualizou os dados!');
                router.refresh(); /* Refresh server components */
                if (onSuccess) onSuccess(); /* Specific callback */
            }

        } catch (err) {
            console.error('Chat error:', err);
            // Remove a mensagem de placeholder em caso de erro ou mostra erro
            setMessages(prev => prev.filter(m => m.content !== '...'));
            toast.error('Erro de conexão com o Agente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target?.result as string;
            setIsProcessingImage(true);
            setExtractedData(null);

            try {
                const response = await fetch('/api/agent/ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                });

                const result = await response.json();
                if (!result.success) throw new Error(result.error);

                setExtractedData(result.data);
                const isPayableHint = result.data.description.toLowerCase().includes('boleto') ||
                    result.data.description.toLowerCase().includes('fatura') ||
                    new Date(result.data.date) > new Date();
                setSaveType(isPayableHint ? 'PAYABLE' : 'TRANSACTION');

                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: '📸 Analisando recibo...' }]);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsProcessingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const confirmEntry = async (useToday = false) => {
        if (!extractedData) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            const amountStr = extractedData.amount.toString().replace('.', ',');
            const finalDate = useToday ? new Date().toISOString().split('T')[0] : extractedData.date;

            if (saveType === 'TRANSACTION') {
                formData.append('amount', amountStr);
                formData.append('description', extractedData.description);
                formData.append('category', CATEGORY_LABELS[extractedData.category] || 'Outros');
                formData.append('type', 'EXPENSE');
                formData.append('date', finalDate);
                const { createTransaction } = await import('@/app/actions/transaction-actions');
                await createTransaction(formData);
                toast.success('Gasto registrado!');
            } else {
                formData.append('name', extractedData.description);
                formData.append('amount', amountStr);
                formData.append('dueDate', finalDate);
                const day = new Date(finalDate).getDate();
                formData.append('windowDay', (day <= 7 ? 7 : day <= 15 ? 15 : 30).toString());
                const { addPayable } = await import('@/app/actions/payment-actions');
                await addPayable(formData);
                toast.success('Conta agendada!');
            }
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '✅ Feito! Já atualizei tudo para você.' }]);
            setExtractedData(null);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error('Erro ao salvar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {activeIsOpen && (
                <Card className="w-[420px] h-[680px] bg-zinc-950 border-white/10 shadow-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 rounded-[2.5rem]">
                    <CardHeader className="bg-zinc-900/40 border-b border-white/5 p-6 flex flex-row items-center justify-between backdrop-blur-2xl">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                                <Bot className="h-7 w-7 text-zinc-950" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-black text-white uppercase tracking-tight">Agente Inteligente</CardTitle>
                                <div className="flex items-center gap-1 opacity-60">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ativo</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => (onOpenChange ? onOpenChange(false) : setIsOpen(false))} className="text-zinc-500 hover:text-white transition-all rounded-full">
                            <X className="h-6 w-6" />
                        </Button>
                    </CardHeader>

                    <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.03),transparent)] custom-scrollbar">
                        {messages.length === 0 && !extractedData && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                                <Bot className="h-12 w-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Como posso ajudar hoje?</p>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-4 duration-300", m.role === 'user' ? "justify-end" : "justify-start")}>
                                {m.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3 mt-1 shrink-0">
                                        <Bot className="h-4 w-4 text-emerald-500" />
                                    </div>
                                )}
                                <div className={cn("max-w-[85%] rounded-[2rem] px-6 py-4 text-[13px] leading-relaxed shadow-lg",
                                    m.role === 'user' ? "bg-zinc-800 text-white rounded-tr-none border border-white/5" : "bg-white/5 text-zinc-100 rounded-tl-none border border-white/10 backdrop-blur-md")}>
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        ))}

                        {extractedData && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Valor Detectado</p>
                                        <h2 className="text-4xl font-black text-white tracking-tighter">
                                            R$ {extractedData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </h2>
                                        <p className="text-sm text-zinc-400 font-medium mt-1">{extractedData.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                                        <button onClick={() => setSaveType('TRANSACTION')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", saveType === 'TRANSACTION' ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-white")}>
                                            Pago
                                        </button>
                                        <button onClick={() => setSaveType('PAYABLE')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", saveType === 'PAYABLE' ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-white")}>
                                            Agendar
                                        </button>
                                    </div>

                                    <Button onClick={() => confirmEntry()} className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-black h-14 rounded-2xl transition-all shadow-xl group">
                                        CONFIRMAR
                                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <button onClick={() => setExtractedData(null)} className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2 hover:text-zinc-400">Descartar</button>
                                </div>
                            </div>
                        )}

                        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                            <div className="flex items-center gap-4 bg-white/5 w-fit px-6 py-3 rounded-full border border-white/5 animate-pulse">
                                <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Agente pensando...</span>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-8 bg-zinc-950/90 border-t border-white/5 backdrop-blur-3xl">
                        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex w-full gap-4 items-center">
                            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                            <div className="flex gap-2">
                                {showUploads && (
                                    <>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-white bg-white/5 h-14 w-14 rounded-2xl border border-white/10" disabled={isLoading || isProcessingImage}>
                                            <Camera className="h-6 w-6" />
                                        </Button>
                                        <Button type="button" size="icon" variant="ghost" onClick={toggleRecording} className={cn("h-14 w-14 rounded-2xl transition-all bg-white/5 border border-white/10", isRecording ? "text-rose-500 animate-pulse" : "text-zinc-500 hover:text-white")} disabled={isLoading || isProcessingImage}>
                                            <Mic className="h-6 w-6" />
                                        </Button>
                                    </>
                                )}
                            </div>
                            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={inputPlaceholder} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6 focus:border-emerald-500/50 transition-all font-medium" disabled={isLoading || isProcessingImage} />
                            <Button type="submit" size="icon" className="bg-white hover:bg-zinc-200 h-14 w-14 shrink-0 rounded-2xl text-zinc-950 transition-all active:scale-95" disabled={isLoading || !input.trim() || isProcessingImage}>
                                <Send className="h-6 w-6" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {externalIsOpen === undefined && (
                <Button onClick={() => setIsOpen(!isOpen)} className={cn("h-20 w-20 rounded-[2.5rem] shadow-3xl transition-all relative z-10",
                    isOpen ? "bg-zinc-800" : "bg-emerald-500 hover:scale-105 shadow-emerald-500/20")}>
                    {isOpen ? <X className="h-8 w-8 text-white" /> : <MessageCircle className="h-9 w-9 text-zinc-950" />}
                </Button>
            )}
        </div>
    );
}
