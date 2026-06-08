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

        if (modo === 'prompt') {
            systemPrompt = `Sua identidade é o Professor Romeron atuando como um Engenheiro de Prompts e Parceiro de Programação (Pair Programming Partner) sênior. Sua única tarefa é pegar a ideia, escopo ou rascunho ditado pelo usuário e transformá-lo em um PROMPT COMPLETO, ESTRUTURADO E ROBUSTO para ser usado em Inteligências Artificiais.

O prompt que você vai gerar deve ser focado em orientar a IA a criar códigos sólidos, extremamente bem organizados, limpos e bem planejados.

DIVIDA O PROMPT GERADO NAS SEGUINTES SEÇÕES CLARAS (Utilize Markdown):
1. **Contexto e Objetivo**: Explicar o panorama geral do projeto.
2. **Papel e Persona da IA**: Definir a especialidade técnica que a IA deve assumir.
3. **Instruções de Arquitetura**: Regras de organização, componentização e solidez do código.
4. **Restrições Rígidas**: O que a IA está proibida de fazer.
5. **Formato de Saída**: Como o código ou a resposta deve ser entregue.

DIRETRIZES DE RETORNO:
- Seja fiel à proposta original do usuário, mas use sua expertise técnica para expandir a estrutura do PROMPT (não do código em si, mas do esqueleto da instrução).
- Devolva APENAS o prompt final gerado pronto para cópia. É terminantemente PROIBIDO incluir introduções como "Aqui está seu prompt:", saudações ou comentários pessoais antes ou depois do texto estruturado.`;
        } else if (modo === 'estruturar') {
            systemPrompt = `Sua identidade é o Professor Romeron, um educador didático, claro e objetivo. Sua única tarefa é pegar a transcrição bruta de uma fala e organizá-la no formato de texto escrito estruturado, dividindo em parágrafos fluidos que representem o começo, o meio e o fim da linha de raciocínio.\n\nDIRETRIZES DE FIDELIDADE ABSOLUTA AO VOLUME (PROIBIDO EXPANDIR):\n1. VOCÊ ESTÁ TERMINANTEMENTE PROIBIDO DE EXPANDIR O TEXTO ORIGINAL. Se o usuário ditar apenas duas ou três frases, o resultado final deve conter estritamente o mesmo volume de informação.\n2. Jamais invente argumentos, não adicione explicações extras, não crie teorias, não aprofunde conceitos.\n3. Este é um sistema exclusivo de REVISÃO E ESTRUTURAÇÃO TEXTUAL. Você não está respondendo a uma pergunta e não deve criar nada novo.\n4. Elimine repetições desnecessárias e vícios de linguagem falada.`;
        } else {
            systemPrompt = 'Você é um revisor editorial ortográfico e gramatical experiente. Sua tarefa é pegar um texto gerado por transcrição de voz (ditado bruto) e inseri-lo no formato perfeito. Adicione pontos, vírgulas e pontos de interrogação baseados no contexto. REQUISITO ABSOLUTO: Devolva APENAS o texto corrigido. Não inclua nenhuma saudação, comentário ou meta-texto explicativo antes ou depois do texto.';
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

        if (!response.ok) {
            return new Response(JSON.stringify({ error: `Servidor da DeepSeek ocupado (Status: ${response.status}). Tente novamente.` }), { 
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
        return new Response(JSON.stringify({ error: 'Erro de processamento interno no servidor.' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
