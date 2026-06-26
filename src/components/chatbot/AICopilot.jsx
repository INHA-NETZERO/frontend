
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { generateAssistantResponse } from "../../services/assistantService";

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const COPILOT_TARGET_DATE = getOneYearAgoDate();

const initialMessages = [
  {
    role: "assistant",
    text: `안녕하세요. ${COPILOT_TARGET_DATE} 기준 발주 추천, 재고 위험, 폐기 및 탄소 절감 효과를 근거 데이터 기반으로 설명해드릴게요.`,
  },
];

const suggestedQuestions = [
  `${COPILOT_TARGET_DATE}에 가장 위험한 품목은?`,
  "탄소 절감량은 어떻게 계산돼?",
  "우유 추천 발주량의 근거를 알려줘",
];

function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open || !bodyRef.current) {
      return;
    }

    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [open, messages, loading]);

  const handleSend = async (message = input) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const assistantResponse =
        await generateAssistantResponse(trimmedMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            assistantResponse?.content ||
            "응답을 불러오지 못했습니다. 다시 시도해주세요.",
          groundedOn: assistantResponse?.groundedOn,
        },
      ]);
    } catch (error) {
      console.error("챗봇 메시지 처리 실패:", {
        message: error.message,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "챗봇 응답을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        type="button"
        className="copilot-fab"
        aria-label="AI Copilot 열기"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Sparkles size={20} />
        AI Copilot
      </button>

      {open && (
        <section
          className="copilot-panel"
          aria-label="AI Copilot 대화창"
        >
          <div className="copilot-header">
            <div>
              <span className="copilot-icon">
                <Bot size={18} />
              </span>

              <div>
                <strong>AI Copilot</strong>
                <p>{COPILOT_TARGET_DATE} 기준 근거 기반 발주 설명</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="AI Copilot 닫기"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="copilot-badges">
            <span>계산: Calculation Engine</span>
            <span>설명: LLM</span>
          </div>

          <div
            className="copilot-body"
            ref={bodyRef}
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "chat-msg user"
                    : "chat-msg assistant"
                }
              >
                <p>{message.text}</p>

                {message.chips?.length > 0 && (
                  <div className="chat-chips">
                    {message.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                )}

                {message.evidence?.length > 0 && (
                  <div className="evidence-grid">
                    {message.evidence.map((item) => (
                      <div
                        className={`evidence-card ${item.tone}`}
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <p>답변을 생성하고 있습니다...</p>
              </div>
            )}

            <div className="suggested-questions">
              {suggestedQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  disabled={loading}
                  onClick={() => handleSend(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="copilot-footer">
            <input
              type="text"
              value={input}
              placeholder={`${COPILOT_TARGET_DATE} 발주 추천 이유를 물어보세요`}
              aria-label="챗봇 질문 입력"
              disabled={loading}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              aria-label="메시지 전송"
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
            >
              <Send size={17} />
            </button>
          </div>

          <p className="copilot-notice">
            LLM은 계산 결과를 설명하며 수치를 직접 산정하지 않습니다.
          </p>
        </section>
      )}
    </>
  );
}

export default AICopilot;

