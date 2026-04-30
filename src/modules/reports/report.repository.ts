// src/modules/reports/report.repository.ts

import prisma from '../../config/prisma';

export class ReportRepository {

  // ─── SOMA POR TIPO (INCOME ou EXPENSE) ───────────────
  // Retorna o total de receitas ou despesas em um período
  // Usamos aggregate → o banco faz a soma, não o Node
  async sumByType(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    startDate: Date,
    endDate: Date
  ): Promise<number> {

    const result = await prisma.transaction.aggregate({
      // _sum → instrui o Prisma a calcular a soma
      // { amount: true } → some o campo 'amount'
      _sum: {
        amount: true,
      },

      // where → filtros da query (equivalente ao WHERE do SQL)
      where: {
        userId,
        type,

        // date → filtramos pelo campo date da transação
        // gte = "greater than or equal" (maior ou igual) → SQL: >=
        // lte = "less than or equal" (menor ou igual)   → SQL: <=
        // Juntos formam um intervalo: startDate <= date <= endDate
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // result._sum.amount pode ser null se não houver transações
    // O operador ?? é o "nullish coalescing" do TypeScript/JS
    // Se o valor da esquerda for null ou undefined, retorna o da direita
    // É diferente do ||: || retorna direita se esquerda for falsy (0, '', false)
    // ?? retorna direita APENAS se esquerda for null ou undefined
    // Aqui usamos ?? porque 0 é um valor válido (pode não ter gasto nada)
    return result._sum.amount ?? 0;
  }

  // ─── GASTOS AGRUPADOS POR CATEGORIA ──────────────────
  // Retorna quanto foi gasto em cada categoria no período
  // groupBy → agrupa registros por um campo e calcula agregações
  async expensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {

    // groupBy é uma das queries mais poderosas do Prisma
    // Equivalente SQL:
    // SELECT categoryId, COUNT(*), SUM(amount)
    // FROM transactions
    // WHERE userId = ? AND type = 'EXPENSE' AND date BETWEEN ? AND ?
    // GROUP BY categoryId
    const result = await prisma.transaction.groupBy({
      // by → por qual campo agrupar
      by: ['categoryId'],

      // where → mesmos filtros de antes
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },

      // _sum → soma o amount dentro de cada grupo
      _sum: { amount: true },

      // _count → conta quantos registros há em cada grupo
      _count: { id: true },

      // orderBy → ordena os grupos pelo maior total primeiro
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

    return prisma.transaction.findMany({
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