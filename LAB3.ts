/**
 * ts/ex3_servidor.ts
 * Conceitos: arrays numéricos, objetos, funções, enum, narrowing, média móvel simples
 */

// 1) Leituras simples + média
const leiturasC: number[] = [22.5, 23.1, 24.0, 25.2, 26.5];
const mediaTemp = Number((leiturasC.reduce((a, b) => a + b, 0) / leiturasC.length).toFixed(2));
console.log('1) Média (°C):', mediaTemp);

// 2) Objeto de leitura + conversão C↔F
type Leitura = { timestamp: string; tempC: number };
function cToF(c: number): number { return Number((c * 9/5 + 32).toFixed(2)); }
const l1: Leitura = { timestamp: new Date().toISOString(), tempC: 25.3 };
console.log('2) Leitura:', l1, '=> °F:', cToF(l1.tempC));

// 3) Enum de alerta + função de status
enum Alerta { Ok = 'OK', Atenção = 'ATENCAO', Crítico = 'CRITICO' }
function classificar(tC: number): Alerta {
  if (tC >= 28) return Alerta.Crítico;
  if (tC >= 25) return Alerta.Atenção;
  return Alerta.Ok;
}
console.log('3) Status:', leiturasC.map(t => ({ t, status: classificar(t) })));

// 4) Moving Average (média móvel simples) com janela N
function mediaMovel(valores: number[], janela: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < valores.length; i++) {
    const ini = Math.max(0, i - janela + 1);
    const slice = valores.slice(ini, i + 1);
    out.push(Number((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2)));
  }
  return out;
}
console.log('4) Média móvel (janela=3):', mediaMovel(leiturasC, 3));

// 5) União de unidade + narrowing
type Unidade = 'C' | 'F';
function formatTemp(valor: number, unidade: Unidade): string {
  if (unidade === 'C') return `${valor.toFixed(1)} °C`;
  return `${valor.toFixed(1)} °F`;
}
console.log('5) Format:', formatTemp(25.35, 'C'), formatTemp(cToF(25.35), 'F'));

export {};
