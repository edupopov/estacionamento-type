# Sistema de Ticket de Estacionamento (TypeScript + Node.js)

Aplicativo **CLI** (linha de comando) para gerenciar **Entrada**, **Saída** e **Consulta por placa** de veículos (carro/moto/caminhão). Os dados são **persistidos em arquivos CSV** (e um TXT de resumo didático), ideal para aulas de **lógica de programação** com **TypeScript**.

---

## ✨ Recursos

* **Entrada**: placa, modelo, cor, horário de entrada (ISO), **valor da hora**.
* **Armazenamento**: `csv/entradas.csv`, `csv/ativos.csv`, `csv/saidas.csv` + `csv/resumo_diario.txt`.
* **Saída**: registra horário de saída, **calcula horas (arredonda para cima, mínimo 1h)** e **preço** (horas × valorHora).
* **Consulta por placa**: verifica se está **ATIVO** (no pátio) ou retorna a **última saída**.
* **Criação automática** de pastas e arquivos na primeira execução.

---

## 📁 Estrutura de pastas

```
estacionamento/
├─ js/            # arquivos .js gerados pelo TypeScript
├─ ts/            # código-fonte .ts (ex.: ts/index.ts)
├─ csv/           # base de dados em CSV + resumo TXT
├─ json/          # (opcional) configs auxiliares
├─ package.json
└─ tsconfig.json
```

### Arquivos CSV gerados

* `csv/entradas.csv`  → `entradaISO,placa,modelo,cor,valorHora`
* `csv/ativos.csv`    → `entradaISO,placa,modelo,cor,valorHora`
* `csv/saidas.csv`    → `entradaISO,saidaISO,placa,modelo,cor,valorHora,horas,preco`
* `csv/resumo_diario.txt` → log simples de entradas/saídas (texto)

---

## 🔧 Pré-requisitos

* **Node.js 16+** (recomendado 18 ou 20)
* **npm**

---

## 🚀 Instalação

Na **raiz** do projeto (onde está o `package.json`):

```bash
npm i -D typescript ts-node @types/node
```

Crie (ou confira) os scripts no **package.json**:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node js/index.js",
    "dev": "ts-node ts/index.ts"
  }
}
```

`tsconfig.json` mínimo recomendado:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "./ts",
    "outDir": "./js",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "lib": ["ES2020"]
  },
  "include": ["ts/**/*"]
}
```

> No VS Code, se aparecerem erros de tipos do Node, use **Ctrl+Shift+P → TypeScript: Restart TS Server**.

---

## ▶️ Como executar

Modo desenvolvimento (executa direto o TypeScript):

```bash
npm run dev
```

Transpilar e rodar o JS gerado:

```bash
npm run build && npm start
```

---

## 🖥️ Uso (menu de console)

1. **Entrada** → informe **placa**, **modelo**, **cor** e **valor da hora**. O sistema grava em `entradas.csv` e `ativos.csv`.
2. **Saída** → informe a **placa**. O sistema remove de `ativos.csv`, calcula **horas** (ceil, mínimo 1) e **preço**, e grava em `saidas.csv`.
3. **Consulta por placa** → primeiro busca em `ativos.csv`; se não encontrar, mostra a **última saída** de `saidas.csv`.
4. **Listar ativos** → imprime no console todos os veículos atualmente no pátio.

---

## 🗃️ Campos e formatos

* **Datas**: ISO (ex.: `2025-08-19T18:40:02.123Z`).
* **Placa**: armazenada em **maiúsculas**.
* **valorHora**: número decimal (ex.: `12.5`).
* **horas**: inteiro ≥ 1 (arredondado para cima a partir da diferença de horários).
* **preco**: `horas × valorHora` com 2 casas decimais.

---

## 🧹 Limpeza / Reset

Para reiniciar os dados, apague os CSVs dentro de `csv/` (eles serão recriados com cabeçalho na próxima execução):

```bash
rm -f csv/*.csv csv/resumo_diario.txt
```

*(No Windows, apague manualmente ou use `del` no PowerShell.)*

---

## 🧩 Extensões sugeridas (para aula)

* **Validação de placa (BR)** com regex.
* **Tarifas por tipo de veículo** (carro/moto/caminhão) e por período (diurno/noturno).
* **Relatórios**: faturamento por dia/mê

<img width="1745" height="921" alt="image" src="https://github.com/user-attachments/assets/815bd549-9cec-4612-8d7d-65b106f7e81e" />
<img width="1060" height="694" alt="image" src="https://github.com/user-attachments/assets/b58a8a29-26d1-429d-939d-7ace35d71159" />
