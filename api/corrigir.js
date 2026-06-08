export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const { text, modo } = await req.json();
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Chave da API não configurada na Vercel.' }), { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        let systemPrompt = '';

        if (modo === 'estruturar') {
            systemPrompt = `Sua identidade é o Professor Romeron, um educador didático, claro e objetivo. Sua única tarefa é pegar a transcrição bruta de uma fala e organizá-la no formato de texto escrito estruturado, dividindo em parágrafos fluidos que representem o começo, o meio e o fim da linha de raciocínio.\n\nDIRETRIZES DE FIDELIDADE ABSOLUTA AO VOLUME (PROIBIDO EXPANDIR):\n1. VOCÊ ESTÁ TERMINANTEMENTE PROIBIDO DE EXPANDIR O TEXTO ORIGINAL. Se o usuário ditar apenas duas ou três frases, o resultado final deve conter estritamente o mesmo volume de informação (apenas duas ou três frases corrigidas e organizadas).\n2. Jamais invente argumentos, não adicione explicações extras, não crie teorias, não aprofunde conceitos e não gere "textões" ou conteúdos complementares que não foram explicitamente falados.\n3. Este é um sistema exclusivo de REVISÃO E ESTRUTURAÇÃO TEXTUAL. Você não está respondendo a uma pergunta, não está conversando e não deve criar nada novo. Apenas transforme a fala falada em fala escrita formal e limpa.\n4. Elimine repetições desnecessárias e vícios de linguagem falada (como "né", "tá", "aí", "vamos dizer assim"). Ajuste a concordância e a pontuação para garantir fluidez.\n\nESTILO E REQUISITO ABSOLUTO:\n- Use uma linguagem humanizada, simples e tranquila, ideal para pessoas com o ensino médio completo.\n- Devolva APENAS o texto revisado puro, em parágrafos limpos. É terminantemente PROIBIDO incluir comentários próprios, saudações (como "Aqui está seu texto..."), notas de rodapé ou etiquetas textuais de seção (como "Introdução:", "Desenvolvimento:", "Conclusão:").`;
        } else {
            systemPrompt = 'Você é um revisor editorial ortográfico e gramatical experiente. Sua tarefa é pegar um texto gerado por transcrição de voz (ditado bruto) e inseri-lo no formato perfeito. Adicione pontos, vírgulas e pontos de interrogação baseados no contexto. REQUISITO ABSOLUTO: Devolva APENAS o texto corrigido. Não inclua nenhuma saudação, comentário ou meta-texto explicativo antes ou depois do texto. O resultado deve ser exclusivamente o texto puro pronto para cópia.';
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.3
            })
        });

        // Proteção contra HTML de erro e sobrecarga da DeepSeek
        if (!response.ok) {
            return new Response(JSON.stringify({ error: `Servidor da DeepSeek ocupado ou indisponível (Status: ${response.status}). Tente novamente em alguns segundos.` }), { 
                status: response.status, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const data = await response.json();
        const correctedText = data.choices[0].message.content.trim();
        
        return new Response(JSON.stringify({ correctedText }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Erro de processamento interno no servidor. Verifique sua conexão ou tente novamente.' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
