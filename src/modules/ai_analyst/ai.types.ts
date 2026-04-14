export interface AiAnalysisInput {
    totalSpent: number;

    periodDays: number;

    spedingByCategory: Record<string, number>;

    transictions: Array<{
        description: string;
        amount: number;
        category: string;
        date: string;
    }>;
}

//O que a IA vai retornar depois da análise
export interface AiAnalysisOutput {
  // Resumo geral dos gastos
    summary: string;

   // Array de insights — observações sobre o comportamento
    insights: string[];

    // Array de sugestões concretas de economia
    suggestions: string[];

     // Categoria onde o usuário mais gasta
    biggestExpenseCategory: string;
}

// Tipo para categorização automática de uma transação
export interface AiCategorizationInput {
    description: string;
    amount: number;
    avaliableCategory: string[];
}