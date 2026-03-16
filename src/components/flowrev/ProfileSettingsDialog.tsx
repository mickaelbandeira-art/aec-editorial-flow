import { useState, useRef } from 'react';
import { useAuthStore, useCurrentUser } from '@/hooks/usePermission';
import { useUploadAvatar, useUpdateUserProfile, useUpdatePassword } from '@/hooks/useFlowrev';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, User, Settings, Shield, Mail, Key, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSettingsDialog({ children }: { children?: React.ReactNode }) {
    const { data: user } = useCurrentUser();
    const [open, setOpen] = useState(false);
    
    // Profile State
    const [apelido, setApelido] = useState(user?.apelido || '');
    const [loginRede, setLoginRede] = useState(user?.login_rede || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // Security State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: uploadAvatar, isPending: isUploading } = useUploadAvatar();
    const { mutateAsync: updateUserProfile, isPending: isUpdatingProfile } = useUpdateUserProfile();
    const { mutateAsync: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();

    // Reset state when dialog opens based on current user data
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && user) {
            setApelido(user.apelido || '');
            setLoginRede(user.login_rede || '');
            setPreviewUrl(user.avatar_url || null);
            setFileToUpload(null);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione apenas imagens.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 2MB.");
            return;
        }

        setFileToUpload(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            let finalAvatarUrl = user.avatar_url;

            if (fileToUpload) {
                finalAvatarUrl = await uploadAvatar(fileToUpload);
            }

            if (apelido !== user.apelido || loginRede !== user.login_rede || finalAvatarUrl !== user.avatar_url) {
                await updateUserProfile({
                    userId: user.id,
                    apelido: apelido,
                    login_rede: loginRede,
                    avatar_url: finalAvatarUrl
                });
                toast.success("Perfil atualizado com sucesso!");
            } else {
                toast.info("Nenhuma alteração de perfil para salvar.");
            }
            // We don't close the dialog automatically just in case they want to change password too
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar perfil.");
        }
    };

    const handleSavePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Preencha as senhas.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        try {
            await updatePassword(newPassword);
            toast.success("Senha atualizada com sucesso!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || "Erro ao alterar a senha.");
        }
    };

    const isSavingProfile = isUploading || isUpdatingProfile;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors">
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-none border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] p-0 bg-white">
                <DialogHeader className="p-6 bg-slate-50 border-b-2 border-slate-900">
                    <DialogTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                        <User className="h-5 w-5" /> Configurações da Conta
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="perfil" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none p-0 border-b-2 border-slate-900 h-10 bg-slate-100">
                        <TabsTrigger 
                            value="perfil" 
                            className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:shadow-none font-black tracking-widest uppercase text-[10px]"
                        >
                            Aba Perfil
                        </TabsTrigger>
                        <TabsTrigger 
                            value="conta" 
                            className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:shadow-none font-black tracking-widest uppercase text-[10px]"
                        >
                            <Shield className="w-3 h-3 mr-1" /> Segurança
                        </TabsTrigger>
                    </TabsList>

                    {/* PERFIL TAB */}
                    <TabsContent value="perfil" className="p-6 m-0 space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-24 w-24 border-4 border-slate-900 rounded-none shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-transform group-hover:scale-105">
                                    <AvatarImage src={previewUrl || undefined} className="object-cover" />
                                    <AvatarFallback className="bg-slate-100 text-slate-900 font-black text-2xl rounded-none">
                                        {apelido?.substring(0, 2).toUpperCase() || user?.nome?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-transparent p-1">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                Clique na imagem para alterar<br/>(Max 2MB)
                            </p>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Readonly Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-2 border-slate-200">
                                <div>
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nome Completo</Label>
                                    <p className="text-xs font-bold text-slate-900 mt-1 uppercase truncate">{user?.nome}</p>
                                </div>
                                <div>
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Matrícula</Label>
                                    <p className="text-xs font-bold text-slate-900 mt-1 uppercase font-mono">{user?.matricula}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Email Corporativo</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-3 w-3 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-900 uppercase truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nível de Acesso (Cargo)</Label>
                                    <p className="text-xs font-black text-slate-900 mt-1 uppercase bg-yellow-100 px-2 py-0.5 w-max border border-yellow-300">
                                        {user?.role?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="space-y-3 pt-2">
                                <Label htmlFor="apelido" className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    <UserCircle className="w-3 h-3" /> Apelido / Nome de Exibição
                                </Label>
                                <Input 
                                    id="apelido" 
                                    value={apelido} 
                                    onChange={(e) => setApelido(e.target.value)} 
                                    placeholder="Como você quer ser chamado?"
                                    className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 focus-visible:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all h-10 font-bold px-4 text-xs"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="loginRede" className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    <Key className="w-3 h-3" /> Login de Rede
                                </Label>
                                <Input 
                                    id="loginRede" 
                                    value={loginRede} 
                                    onChange={(e) => setLoginRede(e.target.value)} 
                                    placeholder="Ex: a.joao.silva"
                                    className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 focus-visible:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all h-10 font-bold px-4 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                                className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] font-bold uppercase tracking-wider text-[10px]"
                                disabled={isSavingProfile}
                            >
                                Fechar
                            </Button>
                            <Button 
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="rounded-none border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:translate-y-px hover:shadow-[1px_1px_0_0_rgba(15,23,42,1)] font-bold uppercase tracking-wider text-[10px] transition-all"
                            >
                                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {isSavingProfile ? "Salvando..." : "Salvar Perfil"}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* SEGURANÇA TAB */}
                    <TabsContent value="conta" className="p-6 m-0 space-y-6">
                        <div className="bg-red-50 border-2 border-red-900 p-4 mb-4">
                            <h4 className="text-red-900 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mb-1">
                                <Shield className="w-3 h-3" /> Alteração de Senha
                            </h4>
                            <p className="text-red-800 text-[10px] font-bold">
                                Utilize este formulário para modificar sua senha de acesso ao sistema Editoral Flow. A nova senha entrará em vigor imediatamente.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="newPass" className="text-xs font-black uppercase tracking-widest text-slate-900">
                                    Nova Senha
                                </Label>
                                <Input 
                                    id="newPass" 
                                    type="password"
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 focus-visible:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all h-10 font-bold px-4"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="confirmPass" className="text-xs font-black uppercase tracking-widest text-slate-900">
                                    Confirmar Nova Senha
                                </Label>
                                <Input 
                                    id="confirmPass" 
                                    type="password"
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 focus-visible:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all h-10 font-bold px-4"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                                className="rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] font-bold uppercase tracking-wider text-[10px]"
                                disabled={isUpdatingPassword}
                            >
                                Fechar
                            </Button>
                            <Button 
                                onClick={handleSavePassword}
                                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                                className="rounded-none border-2 border-slate-900 bg-red-600 hover:bg-red-700 text-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:translate-y-px hover:shadow-[1px_1px_0_0_rgba(15,23,42,1)] font-bold uppercase tracking-wider text-[10px] transition-all"
                            >
                                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
