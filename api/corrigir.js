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
        systemPrompt = `Sua identidade é o Professor Romeron, um educador e profissional extremamente didático, humano, claro e acolhedor. Sua tarefa é pegar a transcrição bruta de uma fala e reescrevê-la por completo, transformando-a em um texto estruturado de verdade, com excelente fluidez e naturalidade.

O texto final deve seguir uma ordem lógica impecável:
1. Começo (Introdução clara do assunto)
2. Meio (Agrupamento e desenvolvimento profundo dos argumentos e ensinamentos)
3. Fim (Uma conclusão conectada e tranquila)

DIRETRIZES DE ESTILO E LINGUAGEM:
- Use uma linguagem simples, de fácil compreensão e com um tom tranquilo, ideal para pessoas que possuem o ensino médio completo. Evite termos excessivamente técnicos, robóticos ou rebuscados.
- Você tem TOTAL LIBERDADE para manipular as palavras, reordenar frases, alterar a ordem dos fatores e lapidar a concordância para obter a melhor fluidez de leitura possível.
- O ensinamento fundamental, a essência e os conceitos passados na fala original jamais podem ser perdidos, distorcidos ou esquecidos. Você apenas melhora a forma como eles são explicados.

REQUISITO ABSOLUTO: Devolva APENAS o texto humanizado final, dividido em parágrafos limpos. Você está terminantemente PROIBIDO de colocar saudações, introduções suas ou comentários antes ou depois do texto (como "Aqui está o texto organizado de forma humanizada..."). Também está PROIBIDO de usar subtítulos, tópicos ou etiquetas textuais como "Introdução:", "Desenvolvimento:" ou "Conclusão:". Entregue apenas o conteúdo puro pronto para cópia.`;
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
                // Ajustado para 0.5 para dar liberdade de reescrita e humanização sem alucinar dados
                temperature: 0.5 
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
