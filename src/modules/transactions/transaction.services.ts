import { TransactionRepository } from "./transaction.repository";
import { CreatingTransationDTO, UpdateTransactionDTO } from './transaction.types';
import { AiService } from "../ai_analyst/ai.services";
import { CategoryRepository } from "../categories/category.repository";
export class TransactionService{
    private repository = new TransactionRepository();

    private aiService = new AiService();

    async create(data: CreatingTransationDTO) {

        if(data.amount <= 0){
            throw new Error('O valor da transação deve ser positivo.');
        }
         if(!data.type) {
            throw new Error('O tipo de transação é obrigatório.');
         }

        const normalizedType = data.type.toUpperCase() as 'INCOME' | 'EXPENSE';

             //Lucro           //Dspesa
        if(!['INCOME', 'EXPENSE'].includes(normalizedType)) {
            throw new Error('Tipo inválido. Use INCOME ou EXPENSE.');
        }

        const transaction = await this.repository.create({
            ...data,
            type: normalizedType,
        });
        
        if(normalizedType === 'EXPENSE' && !data.categoryId) {

            //fire and forget
            this.categoriZarEmBackgorund(transaction.id, {
                description: data.description,
                amount: data.amount,
            }).catch(err => {
                console.error('Erro na categorização automática: ', err);
            });
        }

        return transaction;
    }


    private async categoriZarEmBackgorund(
        transactionId: string,
        data: { description: string; amount: number}
    ) {
        const categoriasPadrao = [
            'Alimentação', 'Transporte', 'Moradia', 'Saúde',
            'Lazer', 'Educação', 'Vestuário', 'Emergência', 'Outros',
        ];

        const categoriaSugerida = await this.aiService.categorizeTransaction({
            description: data.description,
            amount: data.amount,
            avaliableCategory: categoriasPadrao,
        });

        await this.repository.update(transactionId, {
            aiSuggestion: categoriaSugerida,
        });
    }

    async analyzeUserSpending(userId: string) {
        const transactions = await this.repository.findRecentForAiContext(userId, 20);

        if(transactions.length === 0) {
            throw new Error('Você prcisa passar pelo menos uma transação para análise.')
        }

        const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

        const spendingByCategory = transactions.reduce((acc, t) => {
            const categoria = t.category?.name || 'Sem categoria';
            acc[categoria] = (acc[categoria] || 0) + t.amount;
            return acc; 
        }, {} as Record<string, number>);

        const transactionsForAi = transactions.map(t => ({
            description: t.description,
            amount: t.amount,
            category: t.category?.name || 'Sem categoria',

           Date: t.date.toLocaleDateString('pt-BR'),
        }));

        const analysis = await this.aiService.analyzeSpending({
            totalSpent,
            periodDays: 30, 
            spendingByCategory,
            transictions: transactionsForAi,
        });

        return {
            analysis,
            data: {
                totalSpent,
                transictionCount: transactions.length,
                spendingByCategory,
            },
        };
    }

    
    async listByUser(userId: string) {
        return this.repository.findAllByUser(userId);
    }

    async getById(id: string, userId: string) {
        const transaction = await this.repository.findById(id, userId);

        if(!transaction) {
            throw new Error('Transação não encontrada.');
        }

        return transaction;
    }

    async update(id: string, userId: string, data: UpdateTransactionDTO) {
        await this.getById(id, userId);

        if(data.amount !== undefined && data.amount <= 0) {
            throw new Error('Valor da transição deve ser positivo.');
        }

        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string) {
        await this.getById(id, userId);
        return this.repository.delete(id, userId);
    }

   
}