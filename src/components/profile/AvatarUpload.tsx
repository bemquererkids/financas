'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { Camera, Upload, X, User, Check } from 'lucide-react';
import { updateUserAvatar, removeUserAvatar } from '@/app/actions/user-actions';

interface AvatarUploadProps {
    currentAvatar?: string | null;
    userName: string;
}

export function AvatarUpload({ currentAvatar, userName }: AvatarUploadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Efeito para iniciar o vídeo quando a stream estiver pronta
    useEffect(() => {
        if (isCameraActive && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
        }
    }, [isCameraActive, stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 300, height: 300 }
            });
            setStream(mediaStream);
            setIsCameraActive(true);
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 300, 300);
            setPreview(canvas.toDataURL('image/jpeg', 0.8));
        }
        stopCamera();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const saveAvatar = () => {
        if (!preview) return;
        startTransition(async () => {
            const result = await updateUserAvatar(preview);
            if (result.success) {
                setPreview(null);
                setIsOpen(false);
            } else {
                alert('Erro ao salvar avatar. Verifique sua conexão e tente novamente.');
            }
        });
    };

    const handleRemove = () => {
        startTransition(async () => {
            await removeUserAvatar();
            setPreview(null);
            setIsOpen(false);
        });
    };

    const closeModal = () => {
        stopCamera();
        setPreview(null);
        setIsOpen(false);
    };

    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <>
            {/* Avatar Display */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative group"
            >
                {currentAvatar ? (
                    <img
                        src={currentAvatar}
                        alt={userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:border-emerald-500 transition-colors"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 group-hover:border-emerald-400 transition-colors">
                        {initials || <User className="h-5 w-5" />}
                    </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-3 w-3 text-white" />
                </div>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

                    <div className="relative bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Foto de Perfil</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="flex justify-center mb-6">
                            {isCameraActive ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-40 h-40 rounded-full object-cover border-4 border-emerald-500"
                                />
                            ) : preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-40 h-40 rounded-full object-cover border-4 border-emerald-500"
                                />
                            ) : currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt={userName}
                                    className="w-40 h-40 rounded-full object-cover border-4 border-white/20"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center border-4 border-white/10">
                                    <User className="h-16 w-16 text-slate-500" />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {isCameraActive ? (
                                <button
                                    onClick={capturePhoto}
                                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Camera className="h-5 w-5" />
                                    Tirar Foto
                                </button>
                            ) : preview ? (
                                <button
                                    onClick={saveAvatar}
                                    disabled={isPending}
                                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Check className="h-5 w-5" />
                                    {isPending ? 'Salvando...' : 'Salvar Foto'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={startCamera}
                                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Camera className="h-5 w-5" />
                                        Tirar Foto
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Upload className="h-5 w-5" />
                                        Escolher da Galeria
                                    </button>
                                    {currentAvatar && (
                                        <button
                                            onClick={handleRemove}
                                            disabled={isPending}
                                            className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                            Remover Foto
                                        </button>
                                    )}
                                </>
                            )}

                            {(isCameraActive || preview) && (
                                <button
                                    onClick={() => {
                                        stopCamera();
                                        setPreview(null);
                                    }}
                                    className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
