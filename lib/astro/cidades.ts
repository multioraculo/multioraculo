/**
 * Cidade de nascimento em coordenadas, sem sair do produto.
 *
 * A base é o cities15000 do GeoNames (toda cidade acima de quinze mil
 * habitantes, 34.145 delas), podada para seis campos e embarcada no
 * repositório. Dados do GeoNames, licença CC BY 4.0, https://www.geonames.org/
 *
 * É uma escolha e não uma economia: geocodificar por serviço externo faria o
 * local de nascimento de cada pessoa sair daqui, e deixaria o cadastro
 * dependente de uma rede que pode estar fora no dia. O resto do motor
 * astronômico já é assim, calculado aqui dentro, e o fuso sai das próprias
 * coordenadas pelo caelus-birth.
 *
 * Só o servidor carrega isto. O navegador recebe no máximo oito linhas por
 * busca, pela /api/cidades.
 */
import base from "./cidades.json"

export type Cidade = {
  nome: string
  /** ISO 3166-1 alfa-2 */
  pais: string
  /** estado, província ou região; vazio onde o país não tem divisão declarada */
  regiao: string
  lat: number
  lon: number
  populacao: number
}

type Linha = [string, string, string, number, number, number]

const LINHAS = (base as unknown as { cidades: Linha[] }).cidades

export const FONTE_CIDADES = (base as unknown as { fonte: string }).fonte

/**
 * Letras que não são acento e sim outra letra, então o NFD não desmonta:
 * quem escreve "tromso" está procurando Tromsø, e quem escreve "reykjavik"
 * não vai digitar o þ.
 */
const LETRAS_PROPRIAS: Record<string, string> = {
  ø: "o", œ: "oe", æ: "ae", ß: "ss", đ: "d", ð: "d", ł: "l", þ: "th", ı: "i", ŋ: "n", ħ: "h", ŧ: "t",
}

/** Sem acento, sem caixa, sem pontuação: "São Paulo" e "sao paulo" são a mesma busca. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[øœæßđðłþıŋħŧ]/g, (l) => LETRAS_PROPRIAS[l] ?? l)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// o índice normalizado é montado uma vez por processo, na primeira busca
let indice: string[] | null = null
function nomesNormalizados(): string[] {
  if (!indice) indice = LINHAS.map((l) => normalizar(l[0]))
  return indice
}

const daLinha = (l: Linha): Cidade => ({ nome: l[0], pais: l[1], regiao: l[2], lat: l[3], lon: l[4], populacao: l[5] })

/**
 * As cidades que respondem à busca, as maiores primeiro.
 *
 * Quem escreve "são paulo" quer São Paulo antes de São Paulo de Olivença, e
 * por isso o começo do nome vale mais do que o meio, e a população desempata.
 * A busca aceita "cidade, estado" e "cidade, país" separados por vírgula.
 */
export function buscarCidades(consulta: string, limite = 8): Cidade[] {
  // a vírgula é separada ANTES de normalizar, que é quando ela ainda existe
  const partes = consulta.split(",")
  const alvo = normalizar(partes[0])
  const filtro = normalizar(partes.slice(1).join(" "))
  if (alvo.length < 2) return []

  const nomes = nomesNormalizados()
  const achados: Array<{ linha: Linha; peso: number; passouNoFiltro: boolean }> = []

  for (let i = 0; i < LINHAS.length; i++) {
    const nome = nomes[i]
    let peso = 0
    if (nome === alvo) peso = 3
    else if (nome.startsWith(alvo)) peso = 2
    else if (nome.includes(alvo)) peso = 1
    if (!peso) continue

    const linha = LINHAS[i]
    const regiao = normalizar(linha[2])
    const pais = normalizar(linha[1])
    const passouNoFiltro = !filtro || regiao.startsWith(filtro) || regiao.includes(filtro) || pais === filtro
    achados.push({ linha, peso, passouNoFiltro })
  }

  // a base guarda o nome do estado por extenso, e não a sigla: quem escreve
  // "santa cruz, rs" merece ver as Santa Cruz em vez de ver nada. O filtro
  // ordena quando reconhece, e é ignorado quando não reconhece nenhuma.
  const filtrados = achados.filter((a) => a.passouNoFiltro)
  const lista = filtrados.length ? filtrados : achados

  lista.sort((a, b) => b.peso - a.peso || b.linha[5] - a.linha[5])
  return lista.slice(0, limite).map((a) => daLinha(a.linha))
}

/** "São Paulo · São Paulo · BR", que é o que fica gravado no cadastro. */
export function rotuloDaCidade(cidade: Cidade): string {
  return [cidade.nome, cidade.regiao, cidade.pais].filter(Boolean).join(" · ")
}
