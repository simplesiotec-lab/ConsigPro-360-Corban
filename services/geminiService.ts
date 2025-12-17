
// Fix: Import only necessary items from @google/genai, avoiding deprecated Schema type
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// Fix: Use plain object for responseSchema as per guidelines
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    baseIR: {
      type: Type.NUMBER,
      description: "O valor numérico encontrado EXATAMENTE no campo 'VALOR BASE PENSÃO I.R.' ou 'BASE CÁLCULO DO I.R.' no rodapé do contracheque. Retorne apenas o número.",
    },
    contrachequeData: {
      type: Type.OBJECT,
      properties: {
        servidor: { type: Type.STRING, description: "Nome completo do servidor/pensionista" },
        matricula: { type: Type.STRING, description: "Matrícula SIAPE (ex: 1160815/2774526)" },
        orgao: { type: Type.STRING, description: "Órgão pagador" },
        competencia: { type: Type.STRING, description: "Mês/Ano de referência" }
      }
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Descrição/Rubrica (ex: 34228 - EMPREST BCO PRIVADOS - PAN)" },
          value: { type: Type.NUMBER, description: "Valor da Parcela (R$)" },
          bank: { type: Type.STRING, description: "Nome do banco (ex: PAN, BANRISUL, BMG)" },
          contract: { type: Type.STRING, description: "Número do Contrato" },
          installmentIndex: { type: Type.STRING, description: "Parcela (ex: 44/96)" },
          startDate: { type: Type.STRING, description: "Início (MM/AAAA)" },
          endDate: { type: Type.STRING, description: "Fim (MM/AAAA)" },
        },
      },
      description: "Lista de todas as consignações vigentes encontradas no extrato.",
    },
  },
  required: ["baseIR", "items"],
};

export const analyzeFinancialDocuments = async (
  contrachequeFile: File | null,
  extratoFile: File | null
): Promise<ExtractedData> => {
  const parts = [];

  if (contrachequeFile) {
    const b64 = await fileToGenerativePart(contrachequeFile);
    parts.push({
      inlineData: { data: b64, mimeType: contrachequeFile.type },
    });
  }

  if (extratoFile) {
    const b64 = await fileToGenerativePart(extratoFile);
    parts.push({
      inlineData: { data: b64, mimeType: extratoFile.type },
    });
  }

  const prompt = `
    Analise os documentos SIAPE anexados (Contracheque e Extrato de Consignações).
    
    REGRAS DE EXTRAÇÃO:
    1. Localize no CONTRACHEQUE o campo "VALOR BASE PENSÃO I.R." (se for pensionista) OU "BASE CÁLCULO DO I.R." (se não for). Este valor é a base para todos os cálculos.
    2. No EXTRATO DE CONSIGNAÇÕES, identifique a tabela "Demonstrativo de uso da margem".
    3. Extraia cada linha individualmente, capturando:
       - Número do Contrato
       - Rubrica completa (ex: EMPREST BCO PRIVADOS...)
       - Banco (extraído da rubrica)
       - Parcela (ex: 44/96)
       - Valor da Parcela (R$)
       - Datas de Início e Fim.
    
    Certifique-se de não pular nenhum empréstimo ou amortização de cartão.
  `;

  try {
    // Fix: Call generateContent with model and contents (parts) directly as per instructions
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    // Fix: Access response.text property (not a method)
    const text = response.text;
    if (!text) throw new Error("IA não retornou dados.");
    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao processar PDF. Certifique-se de que os campos 'VALOR BASE PENSÃO I.R.' e as tabelas de empréstimos estão visíveis.");
  }
};

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
