'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { OAuthErrorAlert } from '@/components/auth/OAuthErrorAlert';

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                // Verificar se é erro de credenciais (usuário não existe ou senha errada)
                if (result.error.includes('CredentialsSignin') || result.error === 'CredentialsSignin') {
                    setError('Conta não encontrada. Clique em "Criar conta grátis" abaixo para se cadastrar.');
                } else if (formData.email.includes('@gmail.com')) {
                    setError('Usuário do Gmail? Use o botão "Continuar com Google" abaixo');
                } else {
                    setError('Email ou senha incorretos');
                }
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20 mb-4">
                        <PiggyBank className="h-8 w-8 text-slate-900" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Entrar na Conta</h1>
                    <p className="text-slate-400">Acesse sua conta MyWallet</p>
                </div>

                {/* OAuth Error Alert */}
                <OAuthErrorAlert />

                {/* Form Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/50"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                                <Link href="/auth/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                                    Esqueceu?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white focus:ring-emerald-500/50"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold py-6 shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900/50 text-slate-400">ou</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => signIn('google', { callbackUrl })}
                        className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </Button>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Não tem uma conta?{' '}
                        <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Criar conta grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
