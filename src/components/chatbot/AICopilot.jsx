import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { generateAssistantResponse } from "../../services/assistantService";

const initialMessages = [
  {
    role: "assistant",
    text: "안녕하세요. 오늘의 발주 추천, 재고 위험, 탄소 절감 효과를 근거 데이터 기반으로 설명해드릴게요.",
  },
  {
    role: "user",
    text: "오늘 우유 발주량을 왜 줄이라고 했어?",
  },
  {
    role: "assistant",
    text: "우유는 현재 재고 12개, 예상 수요 18개, 기존 발주 예정량 20개를 기준으로 계산했을 때 과잉 가능성이 있습니다. 비 예보와 최근 동일 요일 판매 감소 패턴을 반영해 추천 발주량은 8개입니다.",
    chips: ["수요예측", "발주추천", "탄소절감", "오늘 날씨"],
    evidence: [
      {
        label: "수요예측",
        value: "18개",
        detail: "오늘 예상 수요",
        tone: "blue",
      },
      {
        label: "추천 발주",
        value: "8개",
        detail: "Calculation Engine",
        tone: "green",
      },
      {
        label: "탄소절감",
        value: "2.1kg",
        detail: "잠재 회피 배출량",
        tone: "orange",
      },
      {
        label: "날씨",
        value: "비 70%",
        detail: "방문 수요 감소",
        tone: "purple",
      },
    ],
  },
];

const suggestedQuestions = [
  "오늘 가장 위험한 품목은?",
  "탄소 절감량은 어떻게 계산돼?",
  "우유 추천 근거 알려줘",
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
            assistantResponse.content ||
            "응답을 불러오지 못했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        type="button"
        className="copilot-fab"
        onClick={() => setOpen(true)}
      >
        <Sparkles size={20} />
        AI Copilot
      </button>

      {open && (
        <div className="copilot-panel">
          <div className="copilot-header">
            <div>
              <span className="copilot-icon">
                <Bot size={18} />
              </span>

              <div>
                <strong>AI Copilot</strong>
                <p>근거 기반 발주 설명</p>
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

          <div className="copilot-body" ref={bodyRef}>
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={
                  msg.role === "user"
                    ? "chat-msg user"
                    : "chat-msg assistant"
                }
              >
                <p>{msg.text}</p>

                {msg.chips && (
                  <div className="chat-chips">
                    {msg.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                )}

                {msg.evidence && (
                  <div className="evidence-grid">
                    {msg.evidence.map((item) => (
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
              placeholder="발주 추천 이유를 물어보세요"
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
            LLM은 결과를 설명하며 수치를 직접 계산하지 않습니다.
          </p>
        </div>
      )}
    </>
  );
}

export default AICopilot;