import prisma from "../../config/prisma";

export class ReportRepository {

    async sumByType(
        userId: string,
        type: 'INCOME' | 'EXPENSE',
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        
        const result = await prisma.transactions.aggregate({
            _sum: {
                amount: true
            },

            where: {
                userId,
                type,

                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        return result._sum.amount ?? 0;
    }
}