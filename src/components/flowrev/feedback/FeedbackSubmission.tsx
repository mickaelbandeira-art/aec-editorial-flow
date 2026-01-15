
import { useState } from "react";
import { useSubmitFeedback } from "@/hooks/useFlowrev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, ThumbsUp, ThumbsDown, Smile } from "lucide-react";
import { toast } from "sonner";
import { Feedback } from "@/types/flowrev";

export function FeedbackSubmission() {
    const { mutate: submitFeedback, isPending } = useSubmitFeedback();

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        comment: "",
        rating: 0, // CSAT (Quality) 1-5
        nps: 10,   // NPS 0-10
        ces: 0,    // Effort 1-5
        liked: null as boolean | null, // Like/Dislike
    });

    const roles = [
        { value: "manager", label: "Gestor" },
        { value: "coordinator", label: "Coordenador" },
        { value: "supervisor", label: "Supervisor" },
        { value: "client", label: "Cliente" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.role || !formData.comment) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        if (formData.rating === 0) {
            toast.error("Por favor, avalie a qualidade da revista.");
            return;
        }

        // Construct the batch payload
        // We create separate entries for each metric to feed the dashboard correctly.
        // Although this creates more rows, it's the cleanest way given the current schema.

        const submissions: Partial<Feedback>[] = [];
        const baseData = {
            respondent_name: formData.name,
            role: formData.role,
            comment: formData.comment, // We attach the comment to all or just main? Let's attach to all or just '5_star'.
            // Attaching to all might duplicate comments in the list. Let's attach comment only to the '5_star' (CSAT) one as the "Main" entry.
            created_at: new Date().toISOString(),
            tags: ['pesquisa_completa']
        };

        // 1. CSAT (Quality) - The "Main" entry with the comment
        submissions.push({
            ...baseData,
            type: '5_star', // Mapping Quality to 5_star/CSAT equivalent
            score: formData.rating,
            sentiment: formData.rating >= 4 ? 'positive' : formData.rating <= 2 ? 'negative' : 'neutral',
            category: 'qualidade',
        });

        // 2. NPS
        submissions.push({
            respondent_name: formData.name,
            role: formData.role,
            type: 'nps',
            score: formData.nps,
            created_at: new Date().toISOString(),
            category: 'recomendacao',
            sentiment: formData.nps >= 9 ? 'positive' : formData.nps <= 6 ? 'negative' : 'neutral',
        });

        // 3. CES (Effort)
        if (formData.ces > 0) {
            submissions.push({
                respondent_name: formData.name,
                role: formData.role,
                type: 'ces',
                score: formData.ces,
                created_at: new Date().toISOString(),
                category: 'esforco',
                sentiment: formData.ces >= 4 ? 'positive' : formData.ces <= 2 ? 'negative' : 'neutral',
            });
        }

        // 4. Like/Dislike
        if (formData.liked !== null) {
            submissions.push({
                respondent_name: formData.name,
                role: formData.role,
                type: 'like_dislike',
                score: formData.liked ? 1 : 0,
                created_at: new Date().toISOString(),
                category: 'geral',
                sentiment: formData.liked ? 'positive' : 'negative',
            });
        }

        submitFeedback(submissions, {
            onSuccess: () => {
                toast.success("Obrigado! Seu feedback foi enviado com sucesso.");
                setFormData({
                    name: "",
                    role: "",
                    comment: "",
                    rating: 0,
                    nps: 10,
                    ces: 0,
                    liked: null
                });
            },
            onError: () => {
                toast.error("Erro ao enviar feedback. Tente novamente.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-0 shadow-xl bg-white my-8">
                <CardHeader className="text-center pb-6 border-b border-slate-100">
                    <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Smile className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Pesquisa de Satisfação</CardTitle>
                    <CardDescription className="text-base">
                        Sua opinião é fundamental para melhorarmos a qualidade das nossas Revistas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Identificação */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl">
                            <div className="space-y-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: João Silva"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Seu Cargo</Label>
                                <Select
                                    onValueChange={val => setFormData({ ...formData, role: val })}
                                    value={formData.role}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 2. Qualidade (CSAT/5 Star) */}
                        <div className="space-y-3">
                            <Label className="text-lg font-semibold text-slate-800 block text-center">Como você avalia a qualidade geral da revista?</Label>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className={`p-2 transition-all hover:scale-110 focus:outline-none rounded-full ${formData.rating >= star ? 'bg-yellow-50 text-yellow-400 ring-2 ring-yellow-400/20' : 'text-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <Star className={`h-10 w-10 ${formData.rating >= star ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between w-full max-w-[300px] mx-auto text-sm text-slate-400 px-2 font-medium">
                                <span>Ruim</span>
                                <span>Excelente</span>
                            </div>
                        </div>

                        {/* 3. NPS */}
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <Label className="text-lg font-semibold text-slate-800 block text-center">
                                Qual a probabilidade de você recomendar nosso trabalho?
                            </Label>
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        type="button"
                                        key={num}
                                        onClick={() => setFormData({ ...formData, nps: num })}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all
                                            ${formData.nps === num
                                                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between w-full max-w-lg mx-auto text-sm text-slate-400 px-2 font-medium">
                                <span>Jamais recomendaria</span>
                                <span>Com certeza</span>
                            </div>
                        </div>

                        {/* 4. CES (Effort) & Like/Dislike */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">

                            {/* CES */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-800 block">Facilidade do processo</Label>
                                <div className="space-y-2">
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <button
                                                type="button"
                                                key={level}
                                                onClick={() => setFormData({ ...formData, ces: level })}
                                                className={`flex-1 h-10 rounded text-sm font-medium transition-colors border
                                                    ${formData.ces === level
                                                        ? 'bg-purple-100 border-purple-200 text-purple-700'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                                        <span>Difícil</span>
                                        <span>Muito Fácil</span>
                                    </div>
                                </div>
                            </div>

                            {/* Like/Dislike */}
                            <div className="space-y-3 text-center md:text-left">
                                <Label className="text-base font-semibold text-slate-800 block">Avaliação geral</Label>
                                <div className="flex gap-4 justify-center md:justify-start">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, liked: true })}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all ${formData.liked === true ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <ThumbsUp className={`w-5 h-5 ${formData.liked === true ? 'fill-current' : ''}`} />
                                        Gostei
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, liked: false })}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all ${formData.liked === false ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <ThumbsDown className={`w-5 h-5 ${formData.liked === false ? 'fill-current' : ''}`} />
                                        Não gostei
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2 pt-6 border-t border-slate-100">
                            <Label htmlFor="comment" className="text-base font-semibold text-slate-800">Deixe seu comentário ou sugestão</Label>
                            <Textarea
                                id="comment"
                                placeholder="O que podemos melhorar no nosso processo?"
                                className="min-h-[120px] text-base"
                                value={formData.comment}
                                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl transition-all hover:scale-[1.01]"
                            disabled={isPending}
                        >
                            <Send className="w-5 h-5 mr-2" />
                            {isPending ? "Enviando Feedback..." : "Enviar Avaliação Completa"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
