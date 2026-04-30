
import prisma from '../../config/prisma';

export class ReportRepository {

  
  async sumByType(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    startDate: Date,
    endDate: Date
  ): Promise<number> {

    const result = await prisma.transactions.aggregate({
     
      _sum: {
        amount: true,
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
     
        id: { in: categoryIds },
      },
      
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

    return prisma.transactions.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}