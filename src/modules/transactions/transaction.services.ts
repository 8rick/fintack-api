import { TransactionRepository } from "./transaction.repository";
import { CreatingTransationDTO, UpdateTransactionDTO } from './transaction.types';

export class TransactionService{

    private repository = new TransactionRepository();

    async create(data: CreatingTransationDTO) {

        if(data.amount <= 0){
            throw new Error('O valor da transação deve ser positivo.');
        }

        if(!['INCOME', 'EXPENSE'].includes(data.type)) {
            throw new Error('Tipo inválido. Use INCOME ou EXPENSE.');
        }

        const transaction = await this.repository.create(data);
        return transaction;
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