import api from "./api";

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const CHAT_TARGET_DATE = getOneYearAgoDate();

export const generateAssistantResponse = async (userMessage) => {
  try {
    const response = await api.post("/chat", {
      storeId: 1,
      date: CHAT_TARGET_DATE,
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
    console.error("챗봇 응답 실패:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    return {
      role: "assistant",
      content: "챗봇 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
};