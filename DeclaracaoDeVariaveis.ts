/**
 * Exemplos de declaração de variáveis em TypeScript
 * Do simples ao avançado — tudo em um único arquivo.
 * Exemplos utilizados pelo professor Eduardo Popovici
 */

// 1) Inferência de tipo (o TS deduz o tipo)
let idade = 18;              // number
const nome = 'Eduardo';      // string
let ativo = true;            // boolean
console.log('1) Inferência:', { idade, nome, ativo });

// 2) Tipos explícitos (declaração com anotação)
let taxa: number = 12.5;
const mensagem: string = 'Olá, mundo';
let habilitado: boolean = false;
console.log('2) Explícitos:', { taxa, mensagem, habilitado });

// 3) Arrays tipados
const placas: string[] = ['ABC1D23', 'XYZ9K88'];
const notas: Array<number> = [8, 9, 10]; // forma genérica equivalente
console.log('3) Arrays:', { placas, notas });

// 4) Tupla (comprimento e tipos fixos)
const coordenada: [number, number] = [23.5, -46.6];
console.log('4) Tupla:', coordenada);

// 5) Objeto com alias de tipo
type Veiculo = { placa: string; modelo: string; ano: number };
const carro: Veiculo = { placa: 'ABC1D23', modelo: 'Onix', ano: 2020 };
console.log('5) Objeto + type:', carro);

// 6) União de tipos (um OU outro)
let id: number | string = 42;
id = '42'; // válido
console.log('6) União:', id);

// 7) Literais e readonly
type StatusTicket = 'ABERTO' | 'FECHADO';
const statusTicket: StatusTicket = 'ABERTO';
const PI = 3.14159 as const; // literal number (readonly)
const config = { tema: 'dark', versao: 1 } as const; // propriedades readonly
console.log('7) Literais/readonly:', { statusTicket, PI, config });

// 8) Enum (conjunto nomeado)
enum TipoVeiculo { Carro = 'carro', Moto = 'moto', Caminhao = 'caminhao' }
const tipo: TipoVeiculo = TipoVeiculo.Carro;
console.log('8) Enum:', tipo);

// 9) Genéricos em coleções (Map/Set com tipos)
const tabelaPrecos = new Map<string, number>();
tabelaPrecos.set('carro', 12.5).set('moto', 8.0).set('caminhao', 20);
console.log('9) Map genérico:', Array.from(tabelaPrecos.entries()));

// 10) 'as const' + typeof + indexed access
const cores = ['vermelho', 'azul'] as const;
type Cor = typeof cores[number]; // 'vermelho' | 'azul'
const minhaCor: Cor = 'azul';
console.log('10) as const:', { cores: [...cores], minhaCor });

// 11) Interface com opcional e readonly
interface Usuario {
  readonly id: string;
  nome: string;
  email?: string; // opcional
}
const u: Usuario = { id: 'u1', nome: 'Ana' };
// u.id = 'u2'; // <- ERRO se descomentar (readonly)
console.log('11) Interface:', u);

// 12) Funções tipadas
function soma(a: number, b: number): number { return a + b; }
const somar: (x: number, y: number) => number = (x, y) => x + y;
console.log('12) Funções:', soma(2, 3), somar(5, 7));

// 13) Função genérica
function identidade<T>(valor: T): T { return valor; }
console.log('13) Genérica:', identidade<string>('ok'), identidade<number>(99));

// 14) Type narrowing (refinamento por checagem de tipo)
function formatarId(val: number | string): string {
  if (typeof val === 'number') return val.toString().padStart(3, '0');
  return val.toUpperCase();
}
console.log('14) Narrowing:', formatarId(7), formatarId('abc'));

export {}; // mantém este arquivo como módulo (evita conflitos em compostos)
