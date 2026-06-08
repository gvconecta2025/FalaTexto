export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { text, modo } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API da DeepSeek não configurada no servidor Vercel.' });
    }

    // Definição dos dois prompts baseados no botão clicado
    let systemPrompt = '';

    if (modo === 'estruturar') {
        systemPrompt = 'Você é um redator profissional e organizador de ideias. Sua tarefa é pegar a transcrição de um ditado de voz bruto e organizá-lo com começo (introdução do assunto), meio (agrupamento lógico e desenvolvimento dos argumentos) e fim (conclusão das ideias). IMPORTANTE: Você está estritamente proibido de inventar, criar ou alucinar qualquer informação nova. Sua função é exclusivamente organizar, estruturar e dar fluidez para o que foi explicitamente proposto no texto falado pelo autor.';
    } else {
        systemPrompt = 'Você é um revisor editorial ortográfico e gramatical experiente. Sua tarefa é pegar um texto gerado por transcrição de voz (ditado bruto) e inseri-lo no formato perfeito. Adicione pontos, vírgulas e identifique perguntas no contexto adicionando o ponto de interrogação correspondente. Corrija maiúsculas e minúsculas. Mantenha estritamente as palavras e o vocabulário originais do autor, apenas corrija a estrutura de pontuação e fonemas errados do ditado.';
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
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3
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
