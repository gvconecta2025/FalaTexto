export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { text, modo } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API da DeepSeek não configurada no servidor Vercel.' });
    }

    let systemPrompt = '';

    if (modo === 'estruturar') {
        systemPrompt = 'Você é um redator profissional e organizador de ideias. Sua tarefa é pegar a transcrição de um ditado de voz bruto e organizá-lo com começo (introdução do assunto), meio (desenvolvimento dos argumentos) e fim (conclusão das ideias) estruturado estritamente em parágrafos fluidos. REQUISITO ABSOLUTO: Devolva APENAS o texto limpo e organizado. Você está terminantemente PROIBIDO de incluir qualquer meta-texto, introduções suas, saudações ou comentários como "Aqui está o texto organizado". Você também está PROIBIDO de criar títulos ou etiquetas de seção como "Introdução:", "Desenvolvimento:" ou "Conclusão:". O resultado deve ser apenas os parágrafos de texto puro prontos para cópia. Não invente nenhuma informação fora do que foi falado.';
    } else {
        systemPrompt = 'Você é um revisor editorial ortográfico e gramatical experiente. Sua tarefa é pegar um texto gerado por transcrição de voz (ditado bruto) e inseri-lo no formato perfeito. Adicione pontos, vírgulas e pontos de interrogação baseados no contexto. REQUISITO ABSOLUTO: Devolva APENAS o texto corrigido. Não inclua nenhuma saudação, comentário ou meta-texto explicativo antes ou depois do texto. O resultado deve ser exclusivamente o texto puro pronto para cópia.';
    }

    try {
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
                temperature: 0.2
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Erro na API DeepSeek' });
        }

        const correctedText = data.choices[0].message.content.trim();
        return res.status(200).json({ correctedText });

    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor de processamento.' });
    }
}
