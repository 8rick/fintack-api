import prisma from "../../config/prisma";
import  { CreateUserDTO }  from './user.type';

export class UserRepository {

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {email},
        });
    };


   async findById(id: string) {
    return prisma.user.findUnique({
        where: { id },
     });
   };

   async create(data: CreateUserDTO & { password: string}) {
     return prisma.user.create({
        data,
     });
   };
}