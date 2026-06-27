import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import api from "../services/api";

const STORE_ID = 1;

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const HOME_TARGET_DATE = getOneYearAgoDate();

const DEMO_DATA = {
  dashboard: {
    today: {
      targetDate: HOME_TARGET_DATE,
      dueItemCount: 4,
    },
    orderGuide: [
      {
        itemId: 1,
        itemName: "우유",
        recommendedQuantity: 18,
        unit: "L",
        reason: "예상 판매량과 현재 재고를 반영한 추가 필요량입니다.",
      },
      {
        itemId: 2,
        itemName: "콜드브루 원액",
        recommendedQuantity: 8,
        unit: "병",
        reason: "기준일 수요 증가 가능성을 반영했습니다.",
      },
      {
        itemId: 3,
        itemName: "샌드위치",
        recommendedQuantity: 14,
        unit: "개",
        reason: "과잉 재고 위험을 낮추도록 보수적으로 추천했습니다.",
      },
      {
        itemId: 4,
        itemName: "크루아상",
        recommendedQuantity: 20,
        unit: "개",
        reason: "요일별 판매 패턴과 폐기 이력을 반영했습니다.",
      },
    ],
  },
  carbon: {
    targetDate: HOME_TARGET_DATE,
    guaranteedSavingKg: 5.8,
    potentialSavingKg: 9.6,
    wasteCostAvoidedKrw: 42500,
    byItem: [
      {
        itemId: 1,
        itemName: "우유",
        wasteAvoidedKg: 2.4,
        potentialSavingKg: 3.1,
      },
      {
        itemId: 2,
        itemName: "콜드브루 원액",
        wasteAvoidedKg: 1.2,
        potentialSavingKg: 2.0,
      },
      {
        itemId: 3,
        itemName: "샌드위치",
        wasteAvoidedKg: 1.8,
        potentialSavingKg: 2.7,
      },
      {
        itemId: 4,
        itemName: "크루아상",
        wasteAvoidedKg: 1.1,
        potentialSavingKg: 1.8,
      },
    ],
  },
  summary: {
    periodDays: 30,
    totalPotentialKg: 218.4,
    totalGuaranteedKg: 146.7,
  },
};

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const formatNumber = (value, maximumFractionDigits = 1) =>
  Number(value ?? 0).toLocaleString("ko-KR", {
    maximumFractionDigits,
  });

function Home() {
  const [dashboard, setDashboard] = useState(null);
  const [carbon, setCarbon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackSections, setFallbackSections] = useState([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHome = async () => {
      setLoading(true);
      setFallbackSections([]);

      const requestConfig = {
        params: {
          storeId: STORE_ID,
          targetDate: HOME_TARGET_DATE,
        },
      };

      const [dashboardResult, carbonResult, summaryResult] =
        await Promise.allSettled([
          api.get("/dashboard/summary", requestConfig),
          api.get("/carbon/today", requestConfig),
          api.get("/carbon/savings/summary", requestConfig),
        ]);

      if (!isMounted) {
        return;
      }

      const failedSections = [];

      const resolveResult = (result, sectionName, fallbackData) => {
        if (result.status === "fulfilled") {
          const responseData = getResponseData(result.value);

          if (responseData !== null && responseData !== undefined) {
            return responseData;
          }
        }

        failedSections.push(sectionName);

        if (result.status === "rejected") {
          const requestError = result.reason;

          console.error(`[Home API 실패] ${sectionName}`, {
            requestUrl: `${requestError?.config?.baseURL ?? ""}${
              requestError?.config?.url ?? ""
            }`,
            status: requestError?.response?.status,
            response: requestError?.response?.data,
            message: requestError?.message,
          });
        }

        return fallbackData;
      };

      setDashboard(
        resolveResult(
          dashboardResult,
          "발주 요약",
          DEMO_DATA.dashboard
        )
      );
      setCarbon(
        resolveResult(carbonResult, "탄소 절감", DEMO_DATA.carbon)
      );
      setSummary(
        resolveResult(summaryResult, "누적 절감", DEMO_DATA.summary)
      );
      setFallbackSections(failedSections);
      setLoading(false);
    };

    loadHome();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!aiModalOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAiModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [aiModalOpen]);

  const homeTargetDate =
    dashboard?.today?.targetDate ?? carbon?.targetDate ?? HOME_TARGET_DATE;

  const orderGuide = Array.isArray(dashboard?.orderGuide)
    ? dashboard.orderGuide
    : [];
  const carbonByItem = Array.isArray(carbon?.byItem) ? carbon.byItem : [];
  const summaryPeriodDays = Number(summary?.periodDays ?? 30);

  const todayWasteReduction = useMemo(
    () =>
      carbonByItem.reduce(
        (sum, item) => sum + Number(item?.wasteAvoidedKg ?? 0),
        0
      ),
    [carbonByItem]
  );

  const aiInsight = useMemo(() => {
    const highestOrderItem = [...orderGuide].sort(
      (a, b) =>
        Number(b?.recommendedQuantity ?? 0) -
        Number(a?.recommendedQuantity ?? 0)
    )[0];

    return {
      headline: `${homeTargetDate}에는 ${Number(
        dashboard?.today?.dueItemCount ?? orderGuide.length
      )}개 품목의 발주 확인이 필요합니다.`,
      orderReason: highestOrderItem
        ? `${highestOrderItem.itemName}은(는) ${formatNumber(
            highestOrderItem.recommendedQuantity
          )}${highestOrderItem.unit ?? ""}로 가장 많은 추천 발주량이 산정되었습니다.`
        : "현재 확인 가능한 추천 발주 품목이 없습니다.",
      carbonReason: `추천 발주량을 반영하면 최소 ${formatNumber(
        carbon?.guaranteedSavingKg
      )}kgCO₂e, 최대 ${formatNumber(
        carbon?.potentialSavingKg
      )}kgCO₂e의 탄소 배출을 줄일 가능성이 있습니다.`,
      wasteReason: `품목별 추정치를 합산하면 약 ${formatNumber(
        todayWasteReduction
      )}kg의 폐기를 줄이고, 약 ${formatNumber(
        carbon?.wasteCostAvoidedKrw,
        0
      )}원의 폐기 비용을 피할 수 있습니다.`,
    };
  }, [
    carbon,
    dashboard,
    homeTargetDate,
    orderGuide,
    todayWasteReduction,
  ]);

  const moveToOrderPage = () => {
    window.location.assign("/order");
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="홈"
          description={`${HOME_TARGET_DATE} 기준 홈 데이터를 불러오고 있습니다.`}
        />

        <section className="panel" aria-live="polite">
          홈 데이터를 불러오는 중...
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="홈"
        description={`${homeTargetDate} 기준 발주 상태와 폐기·탄소 절감 효과를 한눈에 확인하세요.`}
      />

      {fallbackSections.length > 0 && (
        <section
          className="panel"
          role="status"
          style={{
            marginBottom: "16px",
            border: "1px solid #f0c36d",
            background: "#fff9e8",
          }}
        >
          <strong>일부 서버 데이터를 불러오지 못해 예시 데이터를 표시합니다.</strong>
          <p style={{ margin: "6px 0 0" }}>
            예시 적용 영역: {fallbackSections.join(", ")}
          </p>
        </section>
      )}

      <section className="hero-card">
        <div>
          <span className="section-kicker">
            {homeTargetDate} 기준 발주 인사이트
          </span>

          <h2>
            조회 기준일에 확인할 발주 품목은{" "}
            {Number(dashboard?.today?.dueItemCount ?? orderGuide.length)}개입니다.
          </h2>

          <p>
            추천 발주량을 반영하면 해당 기준일에 약{" "}
            <strong>{formatNumber(carbon?.potentialSavingKg)}kgCO₂e</strong>의
            잠재 탄소 절감이 예상됩니다.
          </p>

          <div className="source-badges">
            <span>숫자·추천량: Calculation Engine</span>
            <span>설명·요약: LLM</span>
          </div>
        </div>

        <button
          type="button"
          className="confirm-order-btn"
          onClick={() => setAiModalOpen(true)}
        >
          AI에게 이유 물어보기
        </button>
      </section>

      <div className="stats-grid">
        <StatCard
          label="발주 확인 품목"
          value={`${Number(
            dashboard?.today?.dueItemCount ?? orderGuide.length
          )}개`}
          sub={`${homeTargetDate} 발주 도래 품목`}
        />

        <StatCard
          label="기준일 잠재 탄소 절감"
          value={`${formatNumber(carbon?.potentialSavingKg)}kgCO₂e`}
          sub={`최소 보장 ${formatNumber(
            carbon?.guaranteedSavingKg
          )}kgCO₂e`}
          tone="green"
        />

        <StatCard
          label="기준일 예상 폐기 감소"
          value={`${formatNumber(todayWasteReduction)}kg`}
          sub="품목별 폐기 회피량 합계"
          tone="orange"
        />

        <StatCard
          label={`최근 ${summaryPeriodDays}일 누적 탄소`}
          value={`${formatNumber(summary?.totalPotentialKg)}kgCO₂e`}
          sub={`최소 보장 ${formatNumber(
            summary?.totalGuaranteedKg
          )}kgCO₂e`}
        />
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>{homeTargetDate} 추천 발주</h3>
            <p>예상 수요와 입력된 재고를 기준으로 산정된 참고값입니다.</p>
          </div>

          <span>{orderGuide.length}개 품목</span>
        </div>

        <div className="recommend-list">
          {orderGuide.length > 0 ? (
            orderGuide.map((item, index) => (
              <div
                className="recommend-card"
                key={item?.itemId ?? `${item?.itemName}-${index}`}
              >
                <div>
                  <strong>{item?.itemName ?? "품목명 없음"}</strong>

                  <p>
                    추천 발주량 {formatNumber(item?.recommendedQuantity)}
                    {item?.unit ?? ""}
                  </p>

                  {item?.reason && (
                    <small style={{ display: "block", marginTop: "6px" }}>
                      {item.reason}
                    </small>
                  )}
                </div>

                <button
                  type="button"
                  className="soft-btn"
                  onClick={moveToOrderPage}
                >
                  발주에서 확인
                </button>
              </div>
            ))
          ) : (
            <p>조회 기준일의 추천 발주 품목이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>{homeTargetDate} 탄소 절감 포인트</h3>
            <p>추천 발주량을 반영했을 때의 추정치입니다.</p>
          </div>
        </div>

        <div className="carbon-summary">
          <div>
            <span>최소 보장 절감</span>
            <strong>
              {formatNumber(carbon?.guaranteedSavingKg)}kgCO₂e
            </strong>
          </div>

          <div>
            <span>잠재 절감</span>
            <strong>{formatNumber(carbon?.potentialSavingKg)}kgCO₂e</strong>
          </div>

          <div>
            <span>회피 폐기 비용</span>
            <strong>
              {formatNumber(carbon?.wasteCostAvoidedKrw, 0)}원
            </strong>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <div className="panel-title">
            <div>
              <h3>품목별 예상 효과</h3>
              <p>폐기 감소량과 잠재 탄소 절감량을 품목별로 표시합니다.</p>
            </div>
          </div>

          <div className="recommend-list">
            {carbonByItem.length > 0 ? (
              carbonByItem.map((item, index) => (
                <div
                  className="recommend-card"
                  key={item?.itemId ?? `${item?.itemName}-${index}`}
                >
                  <div>
                    <strong>{item?.itemName ?? "품목명 없음"}</strong>
                    <p>
                      예상 폐기 감소 {formatNumber(item?.wasteAvoidedKg)}kg
                    </p>
                  </div>

                  <strong>
                    {formatNumber(
                      item?.potentialSavingKg ?? item?.carbonSavingKg
                    )}
                    kgCO₂e
                  </strong>
                </div>
              ))
            ) : (
              <p>표시할 품목별 탄소 절감 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {aiModalOpen && (
        <div
          role="presentation"
          onClick={() => setAiModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(15, 23, 42, 0.48)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-ai-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "20px",
              padding: "24px",
              background: "#ffffff",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.24)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <span className="section-kicker">AI 발주 설명</span>
                <h3 id="home-ai-title" style={{ marginTop: "8px" }}>
                  왜 이런 결과가 나왔나요?
                </h3>
              </div>

              <button
                type="button"
                aria-label="AI 설명 닫기"
                onClick={() => setAiModalOpen(false)}
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: "20px", lineHeight: 1.7 }}>
              <p>
                <strong>요약</strong>
                <br />
                {aiInsight.headline}
              </p>
              <p>
                <strong>발주량 산정 이유</strong>
                <br />
                {aiInsight.orderReason}
              </p>
              <p>
                <strong>탄소 절감 근거</strong>
                <br />
                {aiInsight.carbonReason}
              </p>
              <p>
                <strong>폐기 비용 효과</strong>
                <br />
                {aiInsight.wasteReason}
              </p>
              <small>
                추천 발주량은 실제 주문 확정값이 아니라 의사결정을 돕는 참고값입니다.
              </small>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                className="soft-btn"
                onClick={() => setAiModalOpen(false)}
              >
                닫기
              </button>
              <button
                type="button"
                className="confirm-order-btn"
                onClick={moveToOrderPage}
              >
                발주 페이지로 이동
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
