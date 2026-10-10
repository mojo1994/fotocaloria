import { FoodRef, FoodRefSchema } from "./schema";

/**
 * Base de referencia nutricional EMBUTIDA (MVP, funciona offline).
 *
 * Origem: Tabela Brasileira de Composicao de Alimentos (TACO), 4a edicao
 * revisada e ampliada, NEPA/UNICAMP, 2011.
 *
 * IMPORTANTE:
 * - A TACO NAO oferece API publica gratuita. Por isso os valores foram
 *   embutidos como um subconjunto estatico, sem dependencia de servicos externos.
 * - Os numeros abaixo sao valores de REFERENCIA por 100 g de parte comestivel.
 *   Eles representam alimentos genericos, nao a porcao vista na foto.
 * - Pequenas divergencias em relacao a edicao oficial sao possiveis; sempre
 *   trate o resultado como ESTIMATIVA.
 * - A lista e intencionalmente curta: itens fora dela sao sinalizados como
 *   "sem correspondencia confiavel" em vez de receber um valor inventado.
 */
export const TACO_SOURCE = "TACO 4a ed. (NEPA/UNICAMP, 2011) - valor de referencia por 100 g";

const RAW: FoodRef[] = [
  {
    id: "arroz-branco-cozido",
    name: "Arroz branco cozido",
    keywords: ["arroz", "arroz branco", "arroz cozido", "white rice"],
    group: "Cereais",
    per100g: { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2 },
    source: TACO_SOURCE,
  },
  {
    id: "arroz-integral-cozido",
    name: "Arroz integral cozido",
    keywords: ["arroz integral", "brown rice"],
    group: "Cereais",
    per100g: { kcal: 124, protein: 2.6, carbs: 25.8, fat: 1.0 },
    source: TACO_SOURCE,
  },
  {
    id: "feijao-carioca-cozido",
    name: "Feijão carioca cozido",
    keywords: ["feijao", "feijao carioca", "feijao preto", "beans"],
    group: "Leguminosas",
    per100g: { kcal: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
    source: TACO_SOURCE,
  },
  {
    id: "macarrao-cozido",
    name: "Macarrão cozido",
    keywords: ["macarrao", "massa", "espaguete", "pasta", "noodles"],
    group: "Cereais",
    per100g: { kcal: 122, protein: 3.9, carbs: 24.5, fat: 0.9 },
    source: TACO_SOURCE,
  },
  {
    id: "pao-frances",
    name: "Pão francês",
    keywords: ["pao", "pao frances", "pao de sal", "bread"],
    group: "Cereais",
    per100g: { kcal: 300, protein: 8.0, carbs: 58.6, fat: 3.1 },
    source: TACO_SOURCE,
  },
  {
    id: "frango-peito-grelhado",
    name: "Frango, peito, sem pele, grelhado",
    keywords: ["frango", "peito de frango", "file de frango", "chicken"],
    group: "Carnes",
    per100g: { kcal: 159, protein: 32.0, carbs: 0, fat: 2.5 },
    source: TACO_SOURCE,
  },
  {
    id: "carne-bovina-grelhada",
    name: "Carne bovina, patinho, grelhado",
    keywords: ["carne", "carne bovina", "bife", "patinho", "beef", "steak"],
    group: "Carnes",
    per100g: { kcal: 219, protein: 35.9, carbs: 0, fat: 7.3 },
    source: TACO_SOURCE,
  },
  {
    id: "ovo-cozido",
    name: "Ovo de galinha, cozido",
    keywords: ["ovo", "ovos", "ovo cozido", "egg"],
    group: "Ovos",
    per100g: { kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5 },
    source: TACO_SOURCE,
  },
  {
    id: "peixe-tilapia-grelhada",
    name: "Tilápia, filé, grelhado",
    keywords: ["peixe", "tilapia", "file de peixe", "fish"],
    group: "Pescados",
    per100g: { kcal: 128, protein: 26.2, carbs: 0, fat: 2.7 },
    source: TACO_SOURCE,
  },
  {
    id: "batata-cozida",
    name: "Batata inglesa, cozida",
    keywords: ["batata", "batata cozida", "potato"],
    group: "Vegetais",
    per100g: { kcal: 52, protein: 1.2, carbs: 11.9, fat: 0 },
    source: TACO_SOURCE,
  },
  {
    id: "batata-frita",
    name: "Batata inglesa, frita",
    keywords: ["batata frita", "fritas", "french fries", "chips"],
    group: "Vegetais",
    per100g: { kcal: 267, protein: 5.0, carbs: 35.6, fat: 13.2 },
    source: TACO_SOURCE,
  },
  {
    id: "alface-crespa",
    name: "Alface, crespa, crua",
    keywords: ["alface", "salada", "lettuce"],
    group: "Vegetais",
    per100g: { kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2 },
    source: TACO_SOURCE,
  },
  {
    id: "tomate-cru",
    name: "Tomate, cru",
    keywords: ["tomate", "tomates", "tomato"],
    group: "Vegetais",
    per100g: { kcal: 15, protein: 1.1, carbs: 3.1, fat: 0.2 },
    source: TACO_SOURCE,
  },
  {
    id: "queijo-minas-frescal",
    name: "Queijo, minas, frescal",
    keywords: ["queijo", "queijo minas", "cheese"],
    group: "Laticinios",
    per100g: { kcal: 264, protein: 17.4, carbs: 3.2, fat: 20.2 },
    source: TACO_SOURCE,
  },
  {
    id: "leite-integral",
    name: "Leite de vaca, integral",
    keywords: ["leite", "leite integral", "milk"],
    group: "Laticinios",
    per100g: { kcal: 61, protein: 2.9, carbs: 4.7, fat: 3.2 },
    source: TACO_SOURCE,
  },
  {
    id: "iogurte-natural",
    name: "Iogurte, natural, integral",
    keywords: ["iogurte", "yogurt", "yoghurt"],
    group: "Laticinios",
    per100g: { kcal: 51, protein: 4.1, carbs: 1.9, fat: 3.0 },
    source: TACO_SOURCE,
  },
  {
    id: "azeite-oliva",
    name: "Azeite de oliva",
    keywords: ["azeite", "azeite de oliva", "olive oil"],
    group: "Oleos",
    per100g: { kcal: 884, protein: 0, carbs: 0, fat: 100 },
    source: TACO_SOURCE,
  },
  {
    id: "oleo-soja",
    name: "Óleo de soja",
    keywords: ["oleo", "oleo de soja", "oil"],
    group: "Oleos",
    per100g: { kcal: 884, protein: 0, carbs: 0, fat: 100 },
    source: TACO_SOURCE,
  },
  {
    id: "banana-prata",
    name: "Banana, prata, crua",
    keywords: ["banana", "banana prata", "banana"],
    group: "Frutas",
    per100g: { kcal: 98, protein: 1.3, carbs: 26.0, fat: 0.1 },
    source: TACO_SOURCE,
  },
  {
    id: "maca",
    name: "Maçã, com casca, crua",
    keywords: ["maca", "apple"],
    group: "Frutas",
    per100g: { kcal: 56, protein: 0.3, carbs: 15.2, fat: 0 },
    source: TACO_SOURCE,
  },
  {
    id: "laranja-pera",
    name: "Laranja, pera, crua",
    keywords: ["laranja", "orange"],
    group: "Frutas",
    per100g: { kcal: 37, protein: 1.0, carbs: 8.9, fat: 0.1 },
    source: TACO_SOURCE,
  },
  {
    id: "chocolate-ao-leite",
    name: "Chocolate, ao leite",
    keywords: ["chocolate", "chocolate ao leite"],
    group: "Doces",
    per100g: { kcal: 540, protein: 7.2, carbs: 59.6, fat: 30.3 },
    source: TACO_SOURCE,
  },
];

/** Base validada em tempo de modulo. Falha rapido se os dados ficarem invalidos. */
export const FOOD_DATABASE: readonly FoodRef[] = Object.freeze(
  RAW.map((food) => FoodRefSchema.parse(food)),
);

export function listFoods(): readonly FoodRef[] {
  return FOOD_DATABASE;
}

export function findFoodById(id: string): FoodRef | undefined {
  return FOOD_DATABASE.find((food) => food.id === id);
}
