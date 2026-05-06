import { fakerPT_BR as faker } from '@faker-js/faker';

export interface UserData {
  nome: string;
  matricula: string;
  email: string;
  cpf: string;
}

export function gerarDadosUsuario(): UserData {
  return {
    nome: faker.person.fullName(),
    // Matrícula de 8 dígitos
    matricula: faker.string.numeric(8),
    // Email válido (sem acentos/espaços para não quebrar validações chatas)
    email: faker.internet.email().toLowerCase(),
    // CPF com 11 dígitos
    cpf: faker.string.numeric(11)
  };
}
