

export interface MonthlySummary {
    totalIncome: number;

    totalExpense: number;

    balance: number;
    savingsRate: number;

    period: {
        month: string;
        year: number;
    };
}

