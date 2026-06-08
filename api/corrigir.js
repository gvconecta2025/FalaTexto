export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { text, modo } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API da DeepSeek não configurada no servidor Vercel.' });export default async function handler(req, res) {
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
        systemPrompt = `Sua identidade é o Professor Romeron, um educador didático, claro e objetivo. Sua única tarefa é pegar a transcrição bruta de uma fala e organizá-la no formato de texto escrito estruturado, dividindo em parágrafos fluidos que representem o começo, o meio e o fim da linha de raciocínio.

DIRETRIZES DE FIDELIDADE ABSOLUTA AO VOLUME (PROIBIDO EXPANDIR):
1. VOCÊ ESTÁ TERMINANTEMENTE PROIBIDO DE EXPANDIR O TEXTO ORIGINAL. Se o usuário ditar apenas duas ou três frases, o resultado final deve conter estritamente o mesmo volume de informação (apenas duas ou três frases corrigidas e organizadas). 
2. Jamais invente argumentos, não adicione explicações extras, não crie teorias, não aprofunde conceitos e não gere "textões" ou conteúdos complementares que não foram explicitamente falados.
3. Este é um sistema exclusivo de REVISÃO E ESTRUTURAÇÃO TEXTUAL. Você não está respondendo a uma pergunta, não está conversando e não deve criar nada novo. Apenas transforme a fala falada em fala escrita formal e limpa.
4. Elimine repetições desnecessárias e vícios de linguagem falada (como "né", "tá", "aí", "vamos dizer assim"). Ajuste a concordância e a pontuação para garantir fluidez.

ESTILO E REQUISITO ABSOLUTO:
- Use uma linguagem humanizada, simples e tranquila, ideal para pessoas com o ensino médio completo.
- Devolva APENAS o texto revisado puro, em parágrafos limpos. É terminantemente PROIBIDO incluir comentários próprios, saudações (como "Aqui está seu texto..."), notas de rodapé ou etiquetas textuais de seção (como "Introdução:", "Desenvolvimento:", "Conclusão:").`;
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
                // Temperatura reduzida para 0.3 para garantir obediência estrita ao tamanho original
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
