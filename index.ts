/**
 * SISTEMA DE TICKET DE ESTACIONAMENTO (SIMPLIFICADO E COMENTADO)
 * Entrada  -> Placa, Modelo, Cor, Hora de Entrada (ISO), Valor da Hora
 * Armaz.   -> CSV (entradas, ativos, saídas) + TXT de resumo (didático)
 * Saída    -> Hora de Saída, Horas (ceil), Preço (horas x valorHora)
 * Consulta -> Por Placa (checa ATIVOS, senão mostra última SAÍDA)
 *
 * Coloque este arquivo em: ts/index.ts
 */

//Essas quatro linhas importam módulos nativos do Node.js e fazem alguns aliases (apelidos) úteis
// Importa todo o namespace do módulo path.
// Serve para manipular caminhos de arquivo sem depender de barra normal/invertida (Windows/Linux).
// É um módulo puro (não acessa disco), só lida com strings de caminhos.
import * as path from 'path';

// Importa a API promises do fs (file system) e renomeia para fs.
// Você ganha funções assíncronas com await: fs.readFile, fs.writeFile, fs.appendFile, fs.mkdir, fs.access etc.
import { promises as fs } from 'fs';

// Importa o módulo readline (interface de leitura linha a linha no terminal).
// Usado para criar readline.createInterface({ input, output }) e fazer perguntas ao usuário.
// É a versão “clássica” baseada em callbacks; no projeto, envolvemos em Promise para usar await. (Alternativa moderna: 'readline/promises'.)
import * as readline from 'readline';

// Importa do módulo process (também nativo) os streams padrão e faz alias:
// process.stdin → input (entrada do teclado/terminal)
// process.stdout → output (saída do console)
// Usamos esses streams ao criar a interface do readline.
import { stdin as input, stdout as output } from 'process';

/* ---------------------- Tipos ---------------------- */
interface VeiculoAtivo {
  entradaISO: string;
  placa: string;
  modelo: string;
  cor: string;
  valorHora: number;
}
interface VeiculoSaida extends VeiculoAtivo {
  saidaISO: string;
  horas: number;
  preco: number;
}

/* ------------------- Pastas/Arquivos ---------------- */
const ROOT = path.resolve('.');
const DIR = {
  ts: path.join(ROOT, 'ts'),
  js: path.join(ROOT, 'js'),
  csv: path.join(ROOT, 'csv'),
  json: path.join(ROOT, 'json'),
};
const ARQ = {
  entradas: path.join(DIR.csv, 'entradas.csv'), // histórico
  ativos:   path.join(DIR.csv, 'ativos.csv'),   // dentro do pátio
  saidas:   path.join(DIR.csv, 'saidas.csv'),   // histórico de saídas
  resumo:   path.join(DIR.csv, 'resumo_diario.txt'), // TXT didático
};
const CAB = {
  entradas: 'entradaISO,placa,modelo,cor,valorHora\n',
  ativos:   'entradaISO,placa,modelo,cor,valorHora\n',
  saidas:   'entradaISO,saidaISO,placa,modelo,cor,valorHora,horas,preco\n',
};

/* -------------- Prepara ambiente (pastas/arquivos) -------------- */
async function preparaAmbiente(): Promise<void> {
  await fs.mkdir(DIR.ts,   { recursive: true });
  await fs.mkdir(DIR.js,   { recursive: true });
  await fs.mkdir(DIR.csv,  { recursive: true });
  await fs.mkdir(DIR.json, { recursive: true });

  await criaSeNaoExiste(ARQ.entradas, CAB.entradas);
  await criaSeNaoExiste(ARQ.ativos,   CAB.ativos);
  await criaSeNaoExiste(ARQ.saidas,   CAB.saidas);
  await criaSeNaoExiste(ARQ.resumo,   'RESUMO DIÁRIO DO ESTACIONAMENTO\n');
}
async function criaSeNaoExiste(caminho: string, conteudo: string): Promise<void> {
  try { await fs.access(caminho); }
  catch { await fs.writeFile(caminho, conteudo, 'utf8'); }
}

/* -------------------- Util CSV ---------------------- */
// Escapa vírgula/aspas/quebra de linha quando necessário
function csvSafe(s: string): string {
  return (/,|"|\n/.test(s)) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function ativoToCsv(v: VeiculoAtivo): string {
  return [v.entradaISO, v.placa, v.modelo, v.cor, String(v.valorHora)]
    .map(csvSafe).join(',') + '\n';
}
function saidaToCsv(s: VeiculoSaida): string {
  return [
    s.entradaISO, s.saidaISO, s.placa, s.modelo, s.cor,
    String(s.valorHora), String(s.horas), String(s.preco)
  ].map(csvSafe).join(',') + '\n';
}
// Split CSV respeitando aspas
function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else { q = false; } }
      else { cur += ch; }
    } else {
      if (ch === '"') q = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/* --------------- Repositório CSV -------------------- */
async function lerAtivos(): Promise<VeiculoAtivo[]> {
  const raw: string = await fs.readFile(ARQ.ativos, 'utf8');
  const linhas: string[] = raw.split(/\r?\n/).filter(Boolean).slice(1); // pula cabeçalho
  return linhas.map((l: string) => {
    const [entradaISO, placa, modelo, cor, valorHora] = splitCsv(l);
    return { entradaISO, placa, modelo, cor, valorHora: Number(valorHora) } as VeiculoAtivo;
  });
}
async function escreverAtivos(lista: VeiculoAtivo[]): Promise<void> {
  const corpo: string = lista.map(ativoToCsv).join('');
  await fs.writeFile(ARQ.ativos, CAB.ativos + corpo, 'utf8');
}

/* ------------------- Casos de uso ------------------- */
// ENTRADA: registra histórico + adiciona a ATIVOS + escreve no TXT
async function registrarEntrada(dados: {
  placa: string; modelo: string; cor: string; valorHora: number;
}): Promise<VeiculoAtivo> {
  const reg: VeiculoAtivo = {
    entradaISO: new Date().toISOString(),
    placa: dados.placa.toUpperCase().trim(),
    modelo: dados.modelo.trim(),
    cor: dados.cor.trim(),
    valorHora: dados.valorHora,
  };
  await fs.appendFile(ARQ.entradas, ativoToCsv(reg), 'utf8');
  await fs.appendFile(ARQ.ativos,   ativoToCsv(reg), 'utf8');
  await fs.appendFile(ARQ.resumo, `ENTRADA ${reg.placa} às ${reg.entradaISO}\n`, 'utf8');
  return reg;
}

// SAÍDA: tira de ATIVOS, calcula horas/preço e registra no histórico
async function registrarSaida(placa: string): Promise<VeiculoSaida | null> {
  const placaU = placa.toUpperCase().trim();
  const ativos: VeiculoAtivo[] = await lerAtivos();
  const idx: number = ativos.findIndex((v: VeiculoAtivo) => v.placa === placaU);
  if (idx === -1) return null;

  const base: VeiculoAtivo = ativos[idx];
  const saidaISO: string = new Date().toISOString();

  const ms: number = Date.parse(saidaISO) - Date.parse(base.entradaISO);
  const horas: number = Math.max(1, Math.ceil(ms / 3_600_000)); // mínimo 1h
  const preco: number = Number((horas * base.valorHora).toFixed(2));

  const saida: VeiculoSaida = { ...base, saidaISO, horas, preco };

  await escreverAtivos(ativos.filter((_, i: number) => i !== idx));
  await fs.appendFile(ARQ.saidas, saidaToCsv(saida), 'utf8');
  await fs.appendFile(
    ARQ.resumo,
    `SAÍDA   ${saida.placa} às ${saida.saidaISO} | ${saida.horas}h x ${base.valorHora} = ${saida.preco}\n`,
    'utf8'
  );
  return saida;
}

// CONSULTA: procura em ATIVOS; se não achar, retorna a última SAÍDA
async function consultarPlaca(placa: string): Promise<
  | { status: 'ATIVO'; registro: VeiculoAtivo }
  | { status: 'SAIU';  registro: VeiculoSaida }
  | { status: 'NAO_ENCONTRADO' }
> {
  const placaU = placa.toUpperCase().trim();

  const ativos: VeiculoAtivo[] = await lerAtivos();
  const a = ativos.find((v: VeiculoAtivo) => v.placa === placaU);
  if (a) return { status: 'ATIVO', registro: a };

  const raw: string = await fs.readFile(ARQ.saidas, 'utf8');
  const linhas: string[] = raw.split(/\r?\n/).filter(Boolean).slice(1);

  const saidas: VeiculoSaida[] = linhas
    .map((l: string) => {
      const [entradaISO, saidaISO, p, modelo, cor, valorHora, horas, preco] = splitCsv(l);
      return {
        entradaISO, saidaISO, placa: p, modelo, cor,
        valorHora: Number(valorHora), horas: Number(horas), preco: Number(preco)
      } as VeiculoSaida;
    })
    .filter((s: VeiculoSaida) => s.placa === placaU)
    .sort((x: VeiculoSaida, y: VeiculoSaida) => x.saidaISO.localeCompare(y.saidaISO));

  const ultima: VeiculoSaida | undefined = saidas.pop();
  if (ultima) return { status: 'SAIU', registro: ultima };

  return { status: 'NAO_ENCONTRADO' };
}

/* ----------------- UI de Console -------------------- */
const rl = readline.createInterface({ input, output });

// Wrap para usar Promises com readline clássico
function ask(q: string): Promise<string> {
  return new Promise<string>((resolve) => rl.question(q, resolve));
}

function imprimeAtivo(v: VeiculoAtivo): void {
  console.log(`  Placa:        ${v.placa}`);
  console.log(`  Modelo:       ${v.modelo}`);
  console.log(`  Cor:          ${v.cor}`);
  console.log(`  Entrada:      ${v.entradaISO}`);
  console.log(`  Valor Hora:   R$ ${v.valorHora.toFixed(2)}`);
}
function imprimeSaida(s: VeiculoSaida): void {
  imprimeAtivo(s);
  console.log(`  Saída:        ${s.saidaISO}`);
  console.log(`  Horas:        ${s.horas}`);
  console.log(`  Preço a pagar:R$ ${s.preco.toFixed(2)}`);
}

/* --------------------- Main ------------------------ */
async function main(): Promise<void> {
  await preparaAmbiente();

  console.log('===============================');
  console.log('  SISTEMA DE TICKET (SIMPLES)  ');
  console.log('===============================');

  let loop = true;
  while (loop) {
    console.log('\nMenu:');
    console.log('1) Entrada');
    console.log('2) Saída');
    console.log('3) Consulta por placa');
    console.log('4) Listar ativos');
    console.log('5) Sair');

    const op: string = (await ask('Escolha: ')).trim();

    try {
      if (op === '1') {
        // ENTRADA
        const placa  = await ask('Placa: ');
        const modelo = await ask('Modelo: ');
        const cor    = await ask('Cor: ');
        const vHora  = Number((await ask('Valor da hora (ex: 12.5): ')).replace(',', '.'));

        if (!placa || !modelo || !cor || !Number.isFinite(vHora) || vHora <= 0) {
          console.log('Dados inválidos.');
        } else {
          const reg = await registrarEntrada({ placa, modelo, cor, valorHora: Number(vHora.toFixed(2)) });
          console.log('\n>> ENTRADA REGISTRADA'); imprimeAtivo(reg);
        }

      } else if (op === '2') {  // <<< corrigido: removido parêntese extra
        // SAÍDA
        const placa = await ask('Placa para saída: ');
        const s = await registrarSaida(placa);
        if (!s) console.log('Veículo não encontrado nos ATIVOS.');
        else { console.log('\n>> SAÍDA REGISTRADA'); imprimeSaida(s); }

      } else if (op === '3') {
        // CONSULTA
        const placa = await ask('Placa para consulta: ');
        const r = await consultarPlaca(placa);
        if (r.status === 'ATIVO')      { console.log('Status: ATIVO'); imprimeAtivo(r.registro); }
        else if (r.status === 'SAIU')  { console.log('Status: SAIU (último)'); imprimeSaida(r.registro); }
        else                           { console.log('Veículo não encontrado.'); }

      } else if (op === '4') {
        // LISTAGEM
        const ativos: VeiculoAtivo[] = await lerAtivos();
        if (ativos.length === 0) console.log('Nenhum veículo no pátio.');
        else { console.log(`Ativos (${ativos.length}):`); ativos.forEach((v) => imprimeAtivo(v)); }

      } else if (op === '5') {
        loop = false;

      } else {
        console.log('Opção inválida.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Erro:', e?.message ?? err);
    }
  }

  rl.close();
  console.log('Encerrado.');
}

main();
