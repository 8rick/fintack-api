export interface CreateUserDTO {
    name: string;
    email: string;
    password: string
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    user: {
        id: string;
        email: string;
        password: string;
    };
}