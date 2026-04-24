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

    async expensesByCategory(
        userId: string,
        startDate: Date,
        endDate: Date
    ) {

        const result = await prisma.transactions.groupBy({
            by: ['categoryId'],

            where: {
                userId,
                type: 'EXPENSE',
                date: { gte: startDate, lte: endDate },
            },

            _sum: { amount: true },

            _count: { id: true },


            orderBy: {
        _sum: { amount: 'desc' },
          },
        });
        return result;
    }

    async findCategoriesByIds(categoryIds: string[]) {

    return prisma.category.findMany({
      where: {
        // in → equivalente ao SQL: WHERE id IN ('id1', 'id2', 'id3')
        // Busca todos os registros cujo id está no array
        id: { in: categoryIds },
      },
      // select → especifica quais campos retornar
      // Equivalente ao SELECT id, name FROM categories
      // Sem select, viria todos os campos (incluindo userId, createdAt)
      select: {
        id: true,
        name: true,
      },
    });
  }

   async transactionsInPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {

    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      // select → trazemos só o que precisamos para montar o histórico
      // Menos campos = menos dados trafegando = mais rápido
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}
