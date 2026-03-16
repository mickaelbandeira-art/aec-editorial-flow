
import { useFeedback } from "@/hooks/useFlowrev";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart, Activity, ThumbsUp, ThumbsDown, Star, MessageCircle, TrendingUp } from "lucide-react";

export function FeedbackDashboard() {
    const { data: feedbacks, isLoading } = useFeedback();

    if (isLoading) return <div className="p-8 text-center bg-slate-50 min-h-screen flex items-center justify-center animate-pulse text-slate-400">Carregando insights...</div>;
    if (!feedbacks) return null;

    // --- Metrics Calculation ---

    // NPS
    const npsFeedbacks = feedbacks.filter(f => f.type === 'nps');
    const promoters = npsFeedbacks.filter(f => (f.score || 0) >= 9).length;
    const detractors = npsFeedbacks.filter(f => (f.score || 0) <= 6).length;
    const totalNps = npsFeedbacks.length;
    const npsScore = totalNps > 0 ? Math.round(((promoters - detractors) / totalNps) * 100) : 0;

    // CSAT
    const csatFeedbacks = feedbacks.filter(f => f.type === 'csat');
    const positiveCsat = csatFeedbacks.filter(f => (f.score || 0) >= 4).length;
    const csatScore = csatFeedbacks.length > 0 ? Math.round((positiveCsat / csatFeedbacks.length) * 100) : 0;

    // Sentiment
    const positiveSentiments = feedbacks.filter(f => f.sentiment === 'positive').length;
    const negativeSentiments = feedbacks.filter(f => f.sentiment === 'negative').length;
    // const neutralSentiments = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const totalSentiments = feedbacks.length;
    const sentimentScore = totalSentiments > 0 ? Math.round((positiveSentiments / totalSentiments) * 100) : 0; // % Positive


    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-slate-900 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Central de <span className="text-primary italic">Feedback</span></h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Insights estratégicos baseados na voz do cliente e parceiros.
                    </p>
                </div>
                <div className="flex gap-2">
                    <a
                        href="/flowrev/pesquisa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-none border-2 border-slate-900 bg-white text-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] transition-all h-10 px-6 py-2 text-xs font-black uppercase tracking-widest"
                    >
                        Coletar Novo Feedback
                    </a>
                </div>
            </div>

            {/* Top Cards (Metrics) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">NPS</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{npsScore}</div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Zona de Excelência</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Satisfação</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{csatScore}%</div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Média positiva</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Sentimento</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{sentimentScore}%</div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Comentários positivos</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Volume</CardTitle>
                        <MessageCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{feedbacks.length}</div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Últimos 30 dias</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: AI Analysis & Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Summarization Block */}
                    <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[6px_6px_0_0_rgba(15,23,42,1)] overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✨</span>
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest leading-none">Resumo Inteligente (AI Stats)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-4 bg-emerald-50 p-4 border-2 border-emerald-200">
                                    <ThumbsUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-emerald-900 tracking-widest italic mb-1">Pontos Fortes</h4>
                                        <p className="text-xs text-slate-700 leading-relaxed">A qualidade da revista impressa e a agilidade no atendimento foram os pontos mais elogiados pelos clientes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 bg-blue-50 p-4 border-2 border-blue-200">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-blue-900 tracking-widest italic mb-1">Tendências</h4>
                                        <p className="text-xs text-slate-700 leading-relaxed">Aumento na demanda por notificações mais claras sobre prazos. Usuários 'Supervisores' mencionaram facilidade no novo fluxo.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 bg-red-50 p-4 border-2 border-red-200">
                                    <ThumbsDown className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-red-900 tracking-widest italic mb-1">Atenção Necessária</h4>
                                        <p className="text-xs text-slate-700 leading-relaxed">Alguns relatos de dificuldade no download de arquivos finais e eventuais atrasos na etapa de textuais.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* List of Feedbacks */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Comentários Recentes</h3>
                        <div className="space-y-4">
                            {feedbacks.map((f) => (
                                <div key={f.id} className="bg-white p-5 rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] transition-all flex gap-4">
                                    {/* Sentiment Indicator */}
                                    <div className={`shrink-0 w-2 ${f.sentiment === 'positive' ? 'bg-emerald-400' :
                                        f.sentiment === 'negative' ? 'bg-red-400' : 'bg-slate-300'
                                        } border-r-2 border-slate-900`} />

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <Badge className="rounded-none border-2 border-slate-900 bg-slate-100 text-slate-900 font-black uppercase text-[9px] tracking-widest">
                                                    {f.role}
                                                </Badge>
                                                <Badge variant="outline" className="rounded-none border border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                    {f.category}
                                                </Badge>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(f.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-900 leading-relaxed font-bold italic">"{f.comment}"</p>

                                        {f.tags && f.tags.length > 0 && (
                                            <div className="flex gap-2 pt-1">
                                                {f.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        {f.type === 'nps' && <span className={`text-sm font-black w-10 h-10 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${f.score && f.score >= 9 ? 'bg-emerald-400 text-slate-900' : f.score && f.score <= 6 ? 'bg-red-400 text-white' : 'bg-yellow-400 text-slate-900'}`}>{f.score}</span>}
                                        {f.type === '5_star' && <span className="flex items-center gap-1 font-black text-xs text-yellow-600 bg-yellow-50 px-2 py-1 border border-yellow-200"><Star className="fill-current w-3 h-3" /> {f.score}</span>}
                                        {f.type === 'like_dislike' && (f.score === 1 ? <div className="p-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-600"><ThumbsUp className="w-5 h-5" /></div> : <div className="p-2 bg-red-50 border-2 border-red-200 text-red-600"><ThumbsDown className="w-5 h-5" /></div>)}

                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black leading-none mt-1">{f.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Topics Cloud & Filters */}
                <div className="space-y-8">
                    <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white leading-none">Tópicos em Alta</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {['qualidade', 'atendimento', 'prazo', 'sistema', 'fotos', 'agilidade'].map(topic => (
                                    <Badge key={topic} className="rounded-none border-2 border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:translate-y-[-1px] transition-all px-3 py-1.5 text-xs font-black uppercase tracking-widest cursor-pointer">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white leading-none">Distribuição por Canal</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">NPS (Email)</span>
                                        <span className="text-slate-900">45%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-none">
                                        <div className="bg-blue-500 h-2 rounded-none border-r-2 border-slate-900" style={{ width: '45%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">CSAT (Plataforma)</span>
                                        <span className="text-slate-900">30%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-none">
                                        <div className="bg-emerald-400 h-2 rounded-none border-r-2 border-slate-900" style={{ width: '30%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">CES (Bot)</span>
                                        <span className="text-slate-900">25%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-none">
                                        <div className="bg-purple-400 h-2 rounded-none border-r-2 border-slate-900" style={{ width: '25%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
