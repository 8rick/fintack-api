import prisma from "../../config/prisma";


export class CategoryRepository {
    async findAllByUser(userId: string) {
        return prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc'},
        });
    }

    async create(data: { name: string; userId: string}) {
        return prisma.category.create({data});
    }
}