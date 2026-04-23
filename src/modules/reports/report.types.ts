

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

export interface CategoryReport {
    total: number;

    percentage: number;

    count: number
}

export interface MonthlyHistoy {
    month: string;

    year: number;

    income: number;
    
    expense: number;

    balance: number;
}

export interface ReportFilters {
    month?: number;
    year?: number;
}

