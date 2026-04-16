import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiAnalysisInput, AiAnalysisOutput, AiCategorizationInput } from "./ai.types";

export class AiService {

    private client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    constructor() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Chave Gemini carregada:', key ? `${key.substring(0, 8)}...` : 'UNDEFINED');
    // substring(0, 8) → mostra só os primeiros 8 caracteres
    // Suficiente para confirmar que carregou sem expor a chave inteira
  }

    private model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',

     systemInstruction: `Você é um consultor financeiro pessoal especializado 
em finanças para brasileiros. Sua comunicação é direta, empática e prática.

REGRAS IMPORTANTES:
- Responda SEMPRE em JSON válido, sem texto fora do JSON
- Não use markdown, não use blocos de código, não use crases
- Use valores em Reais (R$)
- Seja específico e actionable nas sugestões
- Não julgue os gastos, apenas analise e sugira melhorias`,
  });

    async analyzeSpending(input: AiAnalysisInput): Promise<AiAnalysisInput> {

        const spendingBreaKdown = Object.entries(input.spendingByCategory)

          .map(([category, amount]) => {

            const percentage = ((amount / input.totalSpent) * 100).toFixed(1);

            return `-${category}: R${amount.toFixed(2)} (${percentage}%)`;
          })

          .join('\n');

        const transactionsList = input.transictions
           .slice(0, 10)
           .map(t => `- ${t.date}: ${t.description} - R${t.amount.toFixed(2)} (${t.category})`) 
           .join(`\n`);
           
       const prompt = `Analise os gastos do usuário dos últimos ${input.periodDays} dias:

       TOTAL GASTO: ${input.totalSpent.toFixed(2)}

       GASTOS POR CATEGORIA:
       ${spendingBreaKdown}

       TRANSAÇÕES RECENTES:
       ${transactionsList}

       Responda APENAS com este JSON, sem nenhum texto antes ou depois:
{
  "summary": "resumo geral em 2-3 frases",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["sugestão concreta 1", "sugestão concreta 2", "sugestão concreta 3"],
  "biggestExpenseCategory": "nome da categoria com maior gasto"
}`;

      const result = await this.model.generateContent(prompt);

      const responseText = result.response.text();

      const cleanText = responseText
         .replace(/```json\n?/g, '')
         .replace(/```/g, '')
         .trim();

      try{
        return JSON.parse(cleanText) as AiAnalysisOutput;
      } catch {
         return {
            summary: cleanText,
            insights: [],
            suggestions: [],
            biggestExpenseCategory: 'Não identificado',
         };
      }
    } 

    async categorizeTransaction(input: AiCategorizationInput): Promise<string> {

        const categorizationModel = this.client.getGenerativeModel({
          model: 'gemini-1.5-flash',
      systemInstruction: `Você é um classificador financeiro.
Dado uma descrição de transação e uma lista de categorias,
responda APENAS com o nome exato de uma das categorias fornecidas.
Não escreva mais nada além do nome da categoria.`,

      generationConfig: {
        temperature: 0,      
        maxOutputTokens: 20, 
        },
      })
      
      const prompt = `Transação: "${input.description}" no valor de R$${input.amount.toFixed(2)}
Categorias disponíveis: ${input.avaliableCategory.join(', ')}
Qual categoria melhor descreve essa transação?`;

    const result = await categorizationModel.generateContent(prompt);
    return result.response.text().trim();


    }
}