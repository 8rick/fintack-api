import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "./user.repository";
import { CreateUserDTO, AuthResponseDTO, LoginDTO } from "./user.type";

export class UserService {
  private repository = new UserRepository();

  async register(data: CreateUserDTO): Promise<AuthResponseDTO> {

 
    if (!data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (data.password.length < 6) {
      throw new Error("Senha deve ter no mínimo 6 caracteres");
    }

    if (data.name.length < 3) {
      throw new Error("Nome deve ter no mínimo 3 caracteres");
    }

   
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Este email já está em uso.");
    }


    const hashedPassword = await bcrypt.hash(data.password, 10);


    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });

  
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
     const user = await this.repository.findByEmail(data.email);

     if(!user) {
        throw new Error('Email ou senha incorretos.');
     }

     const passwordHash = await bcrypt.compare(data.password, user.password);

     if(!passwordHash) {
        throw new Error('Emmail ou senhas incorretos.');
     }

     const token = this.generateToken(user.id);

     return {
        token, 
        user: {
            id: user.id, 
            name: user.name,
            email: user.email,
        },
     };
  }

    private generateToken(userId: string): string {
     const secret = process.env.JWT_SECRET!;
     const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

     return jwt.sign({ userId }, secret, { expiresIn });
    }
}