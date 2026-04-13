export type TransactionType = 'INCOME' | 'EXPENSE';

export interface CreatingTransationDTO {
    descrption?: string;
    amount: number;
    type: TransactionType;
    date?: Date;
    categoryId?: string;
    userId: string;
}

export interface UpdateTransactionDTO {
    description?: string;
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    data?: Date;
    categoryId?: string;
    aiSuggestion?: string 
}