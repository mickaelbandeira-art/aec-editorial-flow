
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
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Central de Feedback de Clientes</h1>
                <p className="text-slate-500">
                    Insights estratégicos baseados na voz do cliente e parceiros.
                </p>
                <div className="flex gap-2 mt-2">
                    <a href="/flowrev/pesquisa" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        Coletar Novo Feedback (Link Público)
                    </a>
                </div>
            </div>

            {/* Top Cards (Metrics) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">NPS (Net Promoter Score)</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{npsScore}</div>
                        <p className="text-xs text-slate-400 mt-1">Zona de Excelência</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">CSAT (Satisfação)</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{csatScore}%</div>
                        <p className="text-xs text-slate-400 mt-1">Média positiva</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Sentimento Global</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{sentimentScore}%</div>
                        <p className="text-xs text-slate-400 mt-1">Comentários positivos</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total de Feedbacks</CardTitle>
                        <MessageCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{feedbacks.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Últimos 30 dias</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: AI Analysis & Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Summarization Block */}
                    <Card className="border-0 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">✨</span>
                                <CardTitle className="text-lg text-indigo-900">Resumo Inteligente (AI Insights)</CardTitle>
                            </div>
                            <CardDescription className="text-indigo-700/80">
                                Análise automática dos principais tópicos abordados pelos usuários.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg">
                                    <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm text-slate-800">Pontos Fortes</h4>
                                        <p className="text-sm text-slate-600">A qualidade da revista impressa e a agilidade no atendimento foram os pontos mais elogiados pelos clientes (Gestores e Clientes Finais).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm text-slate-800">Tendências</h4>
                                        <p className="text-sm text-slate-600">Aumento na demanda por notificações mais claras sobre prazos. Usuários 'Supervisores' mencionaram facilidade no novo fluxo de aprovação.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg">
                                    <ThumbsDown className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm text-slate-800">Atenção Necessária</h4>
                                        <p className="text-sm text-slate-600">Alguns relatos de dificuldade no download de arquivos finais e eventuais atrasos na etapa de textuais.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* List of Feedbacks */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Comentários Recentes</h3>
                        <div className="space-y-3">
                            {feedbacks.map((f) => (
                                <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 hover:border-blue-200 transition-colors">
                                    {/* Sentiment Indicator */}
                                    <div className={`shrink-0 w-1 rounded-full ${f.sentiment === 'positive' ? 'bg-emerald-500' :
                                        f.sentiment === 'negative' ? 'bg-red-500' : 'bg-slate-300'
                                        }`} />

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 capitalize">
                                                    {f.role}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] font-normal text-slate-400 capitalize border-slate-200">
                                                    {f.category}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">"{f.comment}"</p>

                                        {f.tags && f.tags.length > 0 && (
                                            <div className="flex gap-2 pt-1">
                                                {f.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                        {f.type === 'nps' && <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg ${f.score && f.score >= 9 ? 'bg-emerald-100 text-emerald-700' : f.score && f.score <= 6 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{f.score}</span>}
                                        {f.type === '5_star' && <span className="flex text-yellow-500 text-sm"><Star className="fill-current w-4 h-4" /> {f.score}</span>}
                                        {f.type === 'like_dislike' && (f.score === 1 ? <ThumbsUp className="w-5 h-5 text-green-500" /> : <ThumbsDown className="w-5 h-5 text-red-500" />)}

                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{f.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Topics Cloud & Filters */}
                <div className="space-y-6">
                    <Card className="bg-white border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-800">Tópicos em Alta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {['qualidade', 'atendimento', 'prazo', 'sistema', 'fotos', 'agilidade'].map(topic => (
                                    <Badge key={topic} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer px-3 py-1.5 text-sm font-normal capitalize">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-800">Distribuição por Canal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">NPS (Email)</span>
                                    <span className="font-semibold text-slate-900">45%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">CSAT (Plataforma)</span>
                                    <span className="font-semibold text-slate-900">30%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">CES (Bot)</span>
                                    <span className="font-semibold text-slate-900">25%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
