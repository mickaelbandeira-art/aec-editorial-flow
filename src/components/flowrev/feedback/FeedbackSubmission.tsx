
import { useState } from "react";
import { useSubmitFeedback } from "@/hooks/useFlowrev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, ThumbsUp, Smile } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FeedbackSubmission() {
    const { mutate: submitFeedback, isPending } = useSubmitFeedback();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        rating: 0, // 5-Star for quality
        nps: 10, // NPS
        comment: "",
    });

    const roles = [
        { value: "manager", label: "Gestor" },
        { value: "coordinator", label: "Coordenador" },
        { value: "supervisor", label: "Supervisor" },
        { value: "client", label: "Cliente Final" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.role || !formData.comment) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // We will submit 2 feedbacks internally to capture both metrics if needed, 
        // OR just one main entry. The requirement is to answer questions.
        // Let's optimize: Submit as '5_star' type with extra metadata if supported,
        // or just pick the main metric. Let's submit as '5_star' (Satisfação Geral)
        // and put NPS in tags or separate entry?
        // Simpler: Just one entry 'general_survey' (we might need a new type or abuse '5_star').
        // Let's use '5_star' as the primary type and store NPS in comment or implicit?
        // Actually, let's just make it a flexible submission.
        // Users usually want ONE record per submission. I'll stick to '5_star' for "Quality"
        // and map NPS to score if they choose NPS.
        // Let's treat this as a "Satisfação Geral" (5_star) submission.

        submitFeedback({
            respondent_name: formData.name,
            role: formData.role,
            type: '5_star',
            score: formData.rating,
            comment: formData.comment,
            sentiment: formData.rating >= 4 ? 'positive' : formData.rating <= 2 ? 'negative' : 'neutral',
            category: 'geral',
            tags: ['pesquisa_site']
        }, {
            onSuccess: () => {
                toast.success("Feedback enviado com sucesso! Obrigado.");
                // Reset or redirect
                setFormData({ name: "", role: "", rating: 0, nps: 10, comment: "" });
                // Optional: navigate back after delay?
                // navigate('/flowrev/feedback');
            },
            onError: () => {
                toast.error("Erro ao enviar feedback.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-0 shadow-xl bg-white">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Smile className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Pesquisa de Satisfação</CardTitle>
                    <CardDescription>
                        Sua opinião é fundamental para melhorarmos a qualidade das nossas Revistas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Identificação */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: João Silva"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Seu Cargo / Papel</Label>
                                <Select
                                    onValueChange={val => setFormData({ ...formData, role: val })}
                                    value={formData.role}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione seu perfil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Perguntas */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="space-y-3">
                                <Label className="text-base">Como você avalia a qualidade geral das entregas?</Label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className={`p-1 transition-transform hover:scale-110 focus:outline-none ${formData.rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                        >
                                            <Star className="h-8 w-8 fill-current" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 px-2">
                                    <span>Ruim</span>
                                    <span>Excelente</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="comment">Deixe seu comentário ou sugestão</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="O que podemos melhorar?"
                                    className="min-h-[100px]"
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            disabled={isPending}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {isPending ? "Enviando..." : "Enviar Feedback"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
