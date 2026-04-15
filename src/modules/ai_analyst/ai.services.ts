import OpenAI from "openai";
import { AiAnalysisInput, AiAnalysisOutput, AiCategorizationInput } from "./ai.types";

export class AiService {

    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private model = 'gpt-4o-mini';

    async analyzeSpending(input: AiAnalysisInput): Promise<AiAnalysisInput> {

        const spendingBreaKdown = Object.entries(input.spedingByCategory)

          .map(([category, amount]) => {

            const percentage = ((amount / input.totalSpent) * 100).toFixed(1);

            return `-${category}: R${amount.toFixed(2)} (${percentage}%)`;
          })

          .join('\n');

        const transactionsList = input.transictions
           .slice(0, 10)
           .map(t => `- ${t.date}: ${t.description} - R${t.amount.toFixed(2)} (${t.category})`) 
           .join(`\n`);
           
        const completion = await this.client.chat.completions.create({
            model: this.model,

            temperature: 0.7,

            max_tokens: 1000,

            messages: [
              {

                role: 'system',
                content: `Você é um consultor financeiro pessoal especializado
                em finanças para brasileiros. Sua comunicação é direta, empática e prática.

REGRAS IMPORTANTES:
- Responda SEMPRE em JSON válido, sem texto fora do JSON
- Use valores em Reais (R$)
- Seja específico e actionable nas sugestões
- Não julgue os gastos, apenas analise e sugira melhorias

Formato de resposta obrigatório:
{
  "summary": "resumo geral em 2-3 frases",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["sugestão concreta 1", "sugestão concreta 2", "sugestão concreta 3"],
  "biggestExpenseCategory": "nome da categoria"
}`,
              },
                {
          
          role: 'user',
          content: `Analise os gastos do usuário dos últimos ${input.periodDays} dias:

          TOTAL GASTO: R$${input.totalSpent.toFixed(2)}

          GASTOS POR CATEGORIA:
          ${spendingBreaKdown}

          TRANSAÇÕES RECENTES:
          ${transactionsList}

          Forneça uma análise detalhada com insights e sugestões de economia.`,
         },
        ],
      });

      const responseText = completion.choices[0].message.content || '{}';

      try{
        const parsed = JSON.parse(responseText) as AiAnalysisOutput;
        return parsed;
      } catch {
         return {
            summary: responseText,
            insights: [],
            suggestions: [],
            biggestExpenseCategory: 'Não indetificado',
         };
      }
    } 

    async categorizeTransaction(input: AiCategorizationInput): Promise<string> {

        const completion = await this.client.chat.completions.create({
            model: this.model,
            temperature: 0,

            max_tokens: 50,
            messages: [
                {
                    role: 'system',
                    content: `Você é um classificador financeiro. 
                      Dado uma descrição de transação e uma lista de categorias disponíveis,
                      responda APENAS com o nome exato de uma das categorias fornecidas.
                      Não escreva mais nada além do nome da categoria.`,
                },

                {
                    role: 'user',
                    content: `Transação: "${input.description}" no valor de R${input.amount.toFixed(2)}
                    
                     Categorias disponíveis: ${input.avaliableCategory.join(', ')}
                     Qual categoria melhor descreve essa transação?`,
                    
                },
            ],  
        });

        return completion.choices[0].message.content?.trim() || 'Outros';
    }
}