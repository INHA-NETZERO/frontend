import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import api from "../services/api";

function Home() {
  const [dashboard, setDashboard] = useState(null);
  const [carbon, setCarbon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    setLoading(true);

    const [dashboardResult, carbonResult, summaryResult] =
      await Promise.allSettled([
        api.get("/dashboard/summary", {
          params: { storeId: 1 },
        }),
        api.get("/carbon/today", {
          params: { storeId: 1 },
        }),
        api.get("/carbon/savings/summary", {
          params: { storeId: 1 },
        }),
      ]);

    const failedRequests = [];

    if (dashboardResult.status === "fulfilled") {
      setDashboard(dashboardResult.value.data.data);
    } else {
      failedRequests.push({
        name: "dashboard/summary",
        error: dashboardResult.reason,
      });
    }

    if (carbonResult.status === "fulfilled") {
      setCarbon(carbonResult.value.data.data);
    } else {
      failedRequests.push({
        name: "carbon/today",
        error: carbonResult.reason,
      });
    }

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value.data.data);
    } else {
      failedRequests.push({
        name: "carbon/savings/summary",
        error: summaryResult.reason,
      });
    }

    failedRequests.forEach(({ name, error }) => {
      console.error(`[Home API 실패] ${name}`, {
        requestUrl: `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    });

    if (failedRequests.length === 3) {
      alert("홈 데이터를 불러오지 못했습니다.");
    }

    setLoading(false);
  };

  const todayWasteReduction =
    carbon?.byItem?.reduce((sum, item) => sum + (item.wasteAvoidedKg ?? 0), 0) ??
    0;

  if (loading) {
    return <div className="page">홈 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="page">
      <PageHeader
        title="홈"
        description="오늘의 발주 상태와 폐기·탄소 절감 효과를 한눈에 확인하세요."
      />

      <section className="hero-card">
        <div>
          <span className="section-kicker">오늘의 발주 인사이트</span>
          <h2>오늘 확인할 발주 품목은 {dashboard?.today?.dueItemCount ?? 0}개입니다.</h2>
          <p>
            추천 발주량을 반영하면 오늘 약{" "}
            <strong>{carbon?.potentialSavingKg ?? 0}kgCO₂e</strong>의 잠재 탄소
            절감이 예상됩니다.
          </p>

          <div className="source-badges">
            <span>숫자·추천량: Calculation Engine</span>
            <span>설명·요약: LLM</span>
          </div>
        </div>

        <button className="confirm-order-btn">AI에게 이유 물어보기</button>
      </section>

      <div className="stats-grid">
        <StatCard
          label="발주 확인 품목"
          value={`${dashboard?.today?.dueItemCount ?? 0}개`}
          sub="오늘 발주 도래 품목"
        />
        <StatCard
          label="오늘 잠재 탄소 절감"
          value={`${carbon?.potentialSavingKg ?? 0}kgCO₂e`}
          sub={`최소 보장 ${carbon?.guaranteedSavingKg ?? 0}kgCO₂e`}
          tone="green"
        />
        <StatCard
          label="오늘 예상 폐기 감소"
          value={`${todayWasteReduction.toFixed(1)}kg`}
          sub="품목별 폐기 회피량 합계"
          tone="orange"
        />
        <StatCard
          label="이번 달 누적 탄소"
          value={`${summary?.totalPotentialKg ?? 0}kgCO₂e`}
          sub={`최소 보장 ${summary?.totalGuaranteedKg ?? 0}kgCO₂e`}
        />
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>오늘의 추천 발주</h3>
            <p>백엔드 추천 발주 목록을 기준으로 표시합니다.</p>
          </div>
          <span>{dashboard?.orderGuide?.length ?? 0}개 품목</span>
        </div>

        <div className="recommend-list">
          {dashboard?.orderGuide?.map((item) => (
            <div className="recommend-card" key={item.itemId}>
              <div>
                <strong>{item.itemName}</strong>
                <p>
                  추천 발주량 {item.recommendedQuantity}
                  {item.unit}
                </p>
              </div>
              <button className="soft-btn">발주에서 확인</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>오늘의 탄소 절감 포인트</h3>
            <p>추천 발주량을 반영했을 때의 추정치입니다.</p>
          </div>
        </div>

        <div className="carbon-summary">
          <div>
            <span>최소 보장 절감</span>
            <strong>{carbon?.guaranteedSavingKg ?? 0}kgCO₂e</strong>
          </div>
          <div>
            <span>잠재 절감</span>
            <strong>{carbon?.potentialSavingKg ?? 0}kgCO₂e</strong>
          </div>
          <div>
            <span>회피 폐기 비용</span>
            <strong>{carbon?.wasteCostAvoidedKrw?.toLocaleString() ?? 0}원</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;