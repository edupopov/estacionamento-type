/**
 * ts/ex1_alunos.ts
 * Conceitos: inferência, tipos explícitos, arrays, tuplas, objetos, união, enum, funções, Map
 */

// 1) Variáveis simples + inferência
const nomeAluno = 'Ana';
let nota1 = 8.5;     // number
let nota2 = 7;       // number
let aprovado = true; // boolean
console.log('1) Variáveis:', { nomeAluno, nota1, nota2, aprovado });

// 2) Tipos explícitos + função tipada (média)
function media(a: number, b: number): number {
  return Number(((a + b) / 2).toFixed(2));
}
const mediaAna = media(nota1, nota2);
console.log('2) Média de Ana:', mediaAna);

// 3) Array tipado + map/filter
const notas: number[] = [6, 7.5, 8, 9.2, 10];
const acimaDe8 = notas.filter(n => n >= 8);
const mediasAjustadas = notas.map(n => Math.min(n + 0.5, 10));
console.log('3) Arrays:', { acimaDe8, mediasAjustadas });

// 4) Tupla (nome, média) + ordenação
const registro: [string, number] = ['Edu', media(9, 8.5)];
console.log('4) Tupla (nome, média):', registro);

// 5) Type/Interface + lista de alunos
type Aluno = { id: string; nome: string; notas: number[] };
const alunos: Aluno[] = [
  { id: 'a1', nome: 'Ana',  notas: [8, 7.5, 9] },
  { id: 'a2', nome: 'Bia',  notas: [6, 6.5, 7] },
  { id: 'a3', nome: 'Cris', notas: [9.5, 8.5, 10] },
];

function mediaAluno(a: Aluno): number {
  const soma = a.notas.reduce((acc, n) => acc + n, 0);
  return Number((soma / a.notas.length).toFixed(2));
}
console.log('5) Médias:', alunos.map(a => ({ nome: a.nome, media: mediaAluno(a) })));

// 6) União de tipos + narrowing
type Id = number | string;
function formatarId(id: Id): string {
  return typeof id === 'number' ? id.toString().padStart(3, '0') : id.toUpperCase();
}
console.log('6) União:', formatarId(7), formatarId('a3'));

// 7) Enum de status + classificação por média
enum StatusAluno { Aprovado = 'APROVADO', Recuperacao = 'RECUPERAÇÃO', Reprovado = 'REPROVADO' }
function statusPorMedia(m: number): StatusAluno {
  if (m >= 7) return StatusAluno.Aprovado;
  if (m >= 5) return StatusAluno.Recuperacao;
  return StatusAluno.Reprovado;
}
console.log('7) Status:', alunos.map(a => ({ nome: a.nome, status: statusPorMedia(mediaAluno(a)) })));

// 8) Map<string, number> (nome → média)
const mediasPorNome = new Map<string, number>();
for (const a of alunos) mediasPorNome.set(a.nome, mediaAluno(a));
console.log('8) Map (nome→média):', Array.from(mediasPorNome.entries()));

export {};
