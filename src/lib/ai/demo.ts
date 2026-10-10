import type { AiAnalysis } from "./schema";
import type { AnalyzeInput, VisionProvider } from "./provider";

/**
 * Provedor de DEMONSTRACAO.
 *
 * Nao realiza nenhuma chamada de rede e NAO analisa a imagem recebida.
 * Retorna um exemplo fixo e claramente identificado como ficticio (isDemo = true).
 * Serve para exercitar a interface e os calculos sem chave de API.
 */
export const demoProvider: VisionProvider = {
  id: "demo",
  isDemo: true,
  async analyze(_input: AnalyzeInput): Promise<AiAnalysis> {
    return {
      foods: [
        {
          name: "Arroz branco cozido",
          estimatedGrams: 150,
          preparation: ["cozido"],
          confidence: 0.4,
          notes: "EXEMPLO FICTÍCIO de demonstração.",
        },
        {
          name: "Feijao carioca cozido",
          estimatedGrams: 100,
          preparation: ["cozido"],
          confidence: 0.35,
          notes: "EXEMPLO FICTÍCIO de demonstração.",
        },
        {
          name: "Frango, peito, grelhado",
          estimatedGrams: 120,
          preparation: ["grelhado"],
          confidence: 0.35,
          notes: "EXEMPLO FICTÍCIO de demonstração.",
        },
      ],
      uncertainties: [
        "Dados de demonstração: os alimentos e porções acima são fictícios.",
        "As porções reais podem ser bem diferentes destes valores.",
      ],
      notDeterminable: [
        "Óleo usado no preparo",
        "Temperos e sal",
        "Quantidade exata de cada porção",
      ],
    };
  },
};
