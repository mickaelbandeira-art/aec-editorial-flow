// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. Calculate Logic (Same as useDeadlineNotifications.ts)
        const now = new Date();
        // Adjust for Brazil Time (UTC-3) approximately for simplistic day checking
        // Ideally use timezone aware library, but for "day check" this suffices if run at e.g. 9 AM UTC
        const currentDay = now.getDate();

        let targetPhase = "";
        let deadlineDay = 0;
        let daysRes = 0;

        // Logic from useDeadlineNotifications
        if (currentDay >= 22 && currentDay <= 25) {
            targetPhase = "Insumos Textuais";
            deadlineDay = 25;
            daysRes = 25 - currentDay;
        } else if (currentDay >= 28 || currentDay === 1) {
            targetPhase = "Big Numbers";
            deadlineDay = 1;
            if (currentDay === 1) {
                daysRes = 0;
            } else {
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                daysRes = nextMonth.getDate() - currentDay + 1;
            }
        } else if (currentDay >= 6 && currentDay <= 9) {
            targetPhase = "Finalização da Produção";
            deadlineDay = 9;
            daysRes = 9 - currentDay;
        }

        if (!targetPhase) {
            return new Response(JSON.stringify({ message: "No deadlines today." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Fetch Users
        const { data: users, error: userError } = await supabase
            .from('flowrev_users')
            .select('email, nome, role')
            .in('role', ['supervisor', 'analista_pleno', 'coordenador', 'gerente']);

        if (userError || !users) {
            throw new Error("Failed to fetch users");
        }

        // 3. Send Emails
        const emailSubject = `⚠️ Prazo de ${targetPhase} - Vence dia ${deadlineDay}`;
        const emailBody = (nome: string) => `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Olá, ${nome}.</h2>
        <p>Este é um lembrete automático do FlowRev.</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Prazo de ${targetPhase}</h3>
            <p style="font-size: 16px;">
                Vence dia <strong>${deadlineDay}</strong> (${daysRes === 0 ? 'HOJE' : `faltam ${daysRes} dias`}).
            </p>
            <p><strong>⚠️ Fique atento aos finais de semana e feriados!</strong></p>
        </div>
        <p>Acesse o dashboard para verificar as pendências.</p>
        <a href="https://editorial-flow.vercel.app" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar FlowRev</a>
      </div>
    `;

        const emailsSent = [];

        for (const user of users) {
            if (!user.email) continue;

            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "FlowRev Atrasos <notificacoes@revistasinsumos.site>",
                    to: [user.email],
                    subject: emailSubject,
                    html: emailBody(user.nome || 'Usuário'),
                }),
            });

            if (res.ok) {
                emailsSent.push(user.email);
            } else {
                console.error(`Failed to send to ${user.email}`, await res.text());
            }

            // Rate Limit Protection: Wait 1 second between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return new Response(JSON.stringify({
            success: true,
            phase: targetPhase,
            emailsSent: emailsSent.length,
            recipients: emailsSent
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
