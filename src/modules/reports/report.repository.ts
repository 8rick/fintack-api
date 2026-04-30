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

  // ─── BUSCAR NOMES DAS CATEGORIAS ─────────────────────
  // groupBy retorna apenas os IDs das categorias
  // Precisamos de uma segunda query para buscar os nomes
  // Esse padrão se chama "N+1 query resolution"
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

  // ─── HISTÓRICO DOS ÚLTIMOS N MESES ───────────────────
  // Retorna as transações agrupadas por mês
  // Vamos buscar as transações brutas e agrupar no Node
  // porque SQLite tem suporte limitado a funções de data
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