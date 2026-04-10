import prisma from "../../config/prisma";

import { CreatingTransationDTO, UpdateTransactionDTO } from './transaction.types';

export class TransactionRepository {

   async create(data:CreatingTransationDTO) {
    return prisma.transactions.create({
        data,
     });
   };

   async findAllByUser(userId: string) {
     return prisma.transactions.findMany({
        where: { userId },
        orderBy: { date: 'desc'},
        include: {
            category: true, 
        },
     });
   }

   async findById(id: string, userId: string) {
    return prisma.transactions.findFirst({
        where: { id, userId},
        include: {
            category: true,
        },
    });
   };

   async update(id: string, userId: string, data: UpdateTransactionDTO) {
    return prisma.transactions.update({
        where: { id, userId},
        data,
    });
   };

   async delete(id: string, userId: string) {
    return prisma.transactions.delete({
        where: { id, userId}
    });
   };

   async findRecentForAiContext(userId: string, limit = 10){
    return prisma.transactions.findMany({
        where: {
            userId,
            type: 'EXPENSE',
        },
        orderBy: { date: 'desc'},
        take: limit,
        include: { category: true},
    });
   }
}