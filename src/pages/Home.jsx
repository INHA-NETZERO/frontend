import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import api from "../services/api";

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const HOME_TARGET_DATE = getOneYearAgoDate();

function Home() {
  const [dashboard, setDashboard] = useState(null);
  const [carbon, setCarbon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadHome = async () => {
      setLoading(true);
      setError("");

      const [dashboardResult, carbonResult, summaryResult] =
        await Promise.allSettled([
          api.get("/dashboard/summary", {
            params: {
              storeId: 1,
            },
          }),
          api.get("/carbon/today", {
            params: {
              storeId: 1,
            },
          }),
          api.get("/carbon/savings/summary", {
            params: {
              storeId: 1,
            },
          }),
        ]);

      if (!isMounted) {
        return;
      }

      const failedRequests = [];

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data?.data ?? null);
      } else {
        setDashboard(null);

        failedRequests.push({
          name: "dashboard/summary",
          error: dashboardResult.reason,
        });
      }

      if (carbonResult.status === "fulfilled") {
        setCarbon(carbonResult.value.data?.data ?? null);
      } else {
        setCarbon(null);

        failedRequests.push({
          name: "carbon/today",
          error: carbonResult.reason,
        });
      }

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value.data?.data ?? null);
      } else {
        setSummary(null);

        failedRequests.push({
          name: "carbon/savings/summary",
          error: summaryResult.reason,
        });
      }

      failedRequests.forEach(({ name, error: requestError }) => {
        console.error(`[Home API 실패] ${name}`, {
          requestUrl: `${requestError.config?.baseURL ?? ""}${
            requestError.config?.url ?? ""
          }`,
          status: requestError.response?.status,
          response: requestError.response?.data,
          message: requestError.message,
        });
      });

      if (failedRequests.length === 3) {
        setError("홈 데이터를 불러오지 못했습니다.");
      }

      setLoading(false);
    };

    loadHome();

    return () => {
      isMounted = false;
    };
  }, []);

  const homeTargetDate =
    dashboard?.today?.targetDate ??
    carbon?.targetDate ??
    HOME_TARGET_DATE;

  const todayWasteReduction =
    carbon?.byItem?.reduce(
      (sum, item) => sum + Number(item.wasteAvoidedKg ?? 0),
      0
    ) ?? 0;

  const orderGuide = dashboard?.orderGuide ?? [];
  const summaryPeriodDays = summary?.periodDays ?? 30;

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="홈"
          description={`${HOME_TARGET_DATE} 기준 홈 데이터를 불러오고 있습니다.`}
        />

        <section className="panel">홈 데이터를 불러오는 중...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="홈"
          description={`${HOME_TARGET_DATE} 기준 발주 및 탄소 절감 현황입니다.`}
        />

        <section className="panel">{error}</section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="홈"
        description={`${homeTargetDate} 기준 발주 상태와 폐기·탄소 절감 효과를 한눈에 확인하세요.`}
      />

      <section className="hero-card">
        <div>
          <span className="section-kicker">
            {homeTargetDate} 기준 발주 인사이트
          </span>

          <h2>
            조회 기준일에 확인할 발주 품목은{" "}
            {dashboard?.today?.dueItemCount ?? 0}개입니다.
          </h2>

          <p>
            추천 발주량을 반영하면 해당 기준일에 약{" "}
            <strong>{carbon?.potentialSavingKg ?? 0}kgCO₂e</strong>의 잠재
            탄소 절감이 예상됩니다.
          </p>

          <div className="source-badges">
            <span>숫자·추천량: Calculation Engine</span>
            <span>설명·요약: LLM</span>
          </div>
        </div>

        <button type="button" className="confirm-order-btn">
          AI에게 이유 물어보기
        </button>
      </section>

      <div className="stats-grid">
        <StatCard
          label="발주 확인 품목"
          value={`${dashboard?.today?.dueItemCount ?? 0}개`}
          sub={`${homeTargetDate} 발주 도래 품목`}
        />

        <StatCard
          label="기준일 잠재 탄소 절감"
          value={`${carbon?.potentialSavingKg ?? 0}kgCO₂e`}
          sub={`최소 보장 ${carbon?.guaranteedSavingKg ?? 0}kgCO₂e`}
          tone="green"
        />

        <StatCard
          label="기준일 예상 폐기 감소"
          value={`${todayWasteReduction.toFixed(1)}kg`}
          sub="품목별 폐기 회피량 합계"
          tone="orange"
        />

        <StatCard
          label={`최근 ${summaryPeriodDays}일 누적 탄소`}
          value={`${summary?.totalPotentialKg ?? 0}kgCO₂e`}
          sub={`최소 보장 ${summary?.totalGuaranteedKg ?? 0}kgCO₂e`}
        />
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>{homeTargetDate} 추천 발주</h3>
            <p>백엔드 추천 발주 목록을 기준으로 표시합니다.</p>
          </div>

          <span>{orderGuide.length}개 품목</span>
        </div>

        <div className="recommend-list">
          {orderGuide.length > 0 ? (
            orderGuide.map((item) => (
              <div className="recommend-card" key={item.itemId}>
                <div>
                  <strong>{item.itemName}</strong>

                  <p>
                    추천 발주량 {item.recommendedQuantity}
                    {item.unit}
                  </p>
                </div>

                <button type="button" className="soft-btn">
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
            <strong>{carbon?.guaranteedSavingKg ?? 0}kgCO₂e</strong>
          </div>

          <div>
            <span>잠재 절감</span>
            <strong>{carbon?.potentialSavingKg ?? 0}kgCO₂e</strong>
          </div>

          <div>
            <span>회피 폐기 비용</span>
            <strong>
              {Number(carbon?.wasteCostAvoidedKrw ?? 0).toLocaleString(
                "ko-KR"
              )}
              원
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;