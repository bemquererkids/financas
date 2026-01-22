'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Mail, Camera } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { toast } from 'sonner';

export function UserGreeting() {
    const { data: session, status } = useSession();
    const [isUploading, setIsUploading] = useState(false);

    const hour = new Date().getHours();
    let greeting = 'Olá';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Converter para base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                // Enviar para API
                const response = await fetch('/api/user/update-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 }),
                });

                if (response.ok) {
                    toast.success('Foto de perfil atualizada!');
                    // Recarregar sessão para atualizar a imagem
                    window.location.reload();
                } else {
                    const error = await response.json();
                    toast.error(error.error || 'Erro ao atualizar foto');
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erro ao fazer upload da foto');
        } finally {
            setIsUploading(false);
        }
    };

    if (status === "loading") {
        return <div className="h-10 w-32 bg-slate-800/50 animate-pulse rounded-full" />;
    }

    if (!session) {
        return (
            <Button
                onClick={() => signIn("google")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-2 shadow-lg shadow-emerald-500/20"
                size="sm"
            >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar com Google</span>
                <span className="sm:hidden">Entrar</span>
            </Button>
        );
    }

    const firstName = session.user?.name?.split(' ')[0] || 'Usuário';
    const userInitial = session.user?.name?.[0]?.toUpperCase() || 'U';

    return (
        <div className="flex items-center gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <button className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full">
                        {session.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/50 shadow-md group-hover:border-emerald-400 transition-all"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold border-2 border-white/10 group-hover:border-white/30 transition-all">
                                <span className="text-sm">{userInitial}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 z-[1000]">
                    <div className="space-y-4">
                        {/* Avatar e Upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-white/10">
                                        {userInitial}
                                    </div>
                                )}
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg"
                                >
                                    <Camera className="h-3 w-3 text-white" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg leading-tight">
                                    {session.user?.name || 'Usuário'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {greeting}, {firstName}!
                                </p>
                            </div>
                        </div>

                        {/* Informações */}
                        <div className="space-y-2 pt-2 border-t border-slate-700/50">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-emerald-400" />
                                <span className="text-slate-300">{session.user?.email}</span>
                            </div>
                        </div>

                        {/* Botão Sair */}
                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair da Conta
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-400 font-medium">{greeting},</p>
                <p className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
                    {firstName}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                title="Sair"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    );
}
