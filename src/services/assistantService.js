import api from "./api";
import { assistantData } from "../data/mockData";

export const generateAssistantResponse = async (userMessage) => {
  try {
    const response = await api.post("/chat", {
      storeId: 1,
      date: "2026-06-27",
      question: userMessage,
    });

    return {
      role: "assistant",
      content: response.data.data.answer,
      groundedOn: response.data.data.groundedOn,
      cacheHit: response.data.data.cacheHit,
      llmLatencyMs: response.data.data.llmLatencyMs,
      tokens: response.data.data.tokens,
    };
  } catch (error) {
    console.error("챗봇 응답 실패:", error);

    return {
      role: "assistant",
      content: "챗봇 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
};

export const getSuggestedQuestions = () => assistantData.suggestedQuestions;
export const getSystemMessage = () => assistantData.systemMessage;
export const getSampleResponse = (type) => assistantData.sampleResponses[type];