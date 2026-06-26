import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import { Calendar, CloudRain, Sparkles, Leaf, Cloud, Wallet, TrendingDown } from "lucide-react";

function Home() {
  const recommendations = [
    {
      item: "우유",
      status: "과잉 가능",
      reason: "비 예보와 최근 동일 요일 판매 감소를 반영했습니다.",
      change: "-15%",
    },
    {
      item: "샌드위치",
      status: "과잉 가능",
      reason: "강수 예보에 따른 신선식품 수요 감소를 반영했습니다.",
      change: "-10%",
    },
    {
      item: "아이스컵",
      status: "적정",
      reason: "판매 추세가 안정적이라 현재 계획을 유지합니다.",
      change: "유지",
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="홈"
        description="오늘의 상황과 핵심 성과 요약 · 2026.06.26 (금)"
      />

      <section className="weather-strip">
        <span><Calendar size={16} /> 2026.06.26 금요일</span>
        <span><CloudRain size={16} /> 비 · 22°C</span>
        <span>강수 확률 70%</span>
        <strong>자동 발주 없음 · 의사결정 참고용</strong>
      </section>

      <section className="home-insight upgraded">
        <div className="insight-left">
          <div className="insight-top">
            <span className="sparkle-icon">
              <Sparkles size={18} />
            </span>
            <strong>오늘의 발주 인사이트</strong>
            <span className="badge yellow">LLM</span>
          </div>

          <h3>비 예보로 신선식품 발주량 조정이 필요합니다.</h3>

          <p>
            오늘은 비 예보로 방문 고객이 감소할 가능성이 있습니다. 우유와 샌드위치
            발주량을 평소보다 줄이고, 따뜻한 음료 관련 품목은 현재 수준을 유지하는
            것을 권장합니다.
          </p>

          <div className="badge-row">
            <span className="badge green">숫자 · Calculation Engine</span>
            <span className="badge yellow">설명 · LLM</span>
            <span className="muted-small">
              LLM은 결과를 설명하며 수치를 직접 계산하지 않습니다.
            </span>
          </div>
        </div>

        <div className="insight-right">
          <div className="mini-risk-card red">
            <span>부족 가능</span>
            <strong>1개</strong>
          </div>

          <div className="mini-risk-card orange">
            <span>과잉 가능</span>
            <strong>2개</strong>
          </div>

          <div className="mini-risk-card green">
            <span>예상 폐기 감소</span>
            <strong>4.8kg</strong>
          </div>

          <button className="primary-green-btn insight-btn">
            AI에게 이유 물어보기
          </button>
        </div>
      </section>

      <section className="section-title-row">
        <div>
          <h3>오늘의 절감 성과</h3>
          <p>추천 발주를 반영했을 때의 예상 절감 효과입니다.</p>
        </div>
        <span>마지막 업데이트 2026.06.26 18:30 · 데이터 정상</span>
      </section>

      <div className="stats-grid">
        <StatCard
          label="오늘 예상 폐기 감소량"
          value="4.8kg"
          sub="어제 대비 12% 개선"
          description="최근 7일 평균보다 높은 절감 효과입니다."
          badge="+12%"
          icon={<Leaf size={20} />}
        />

        <StatCard
          label="오늘 예상 탄소 절감량"
          value="7.2kgCO₂e"
          sub="자동차 약 25km 배출량"
          description="추천 발주 반영 시 기대되는 탄소 절감량입니다."
          badge="+9%"
          icon={<Cloud size={20} />}
        />

        <StatCard
          label="이번 달 누적 절감 원가"
          value="₩384,000"
          sub="지난달 대비 18% 증가"
          description="폐기 비용과 과잉 발주 비용을 함께 반영했습니다."
          badge="+18%"
          icon={<Wallet size={20} />}
          tone="orange"
        />

        <StatCard
          label="이번 달 누적 탄소 절감량"
          value="128.4kgCO₂e"
          sub="지난달 대비 14% 증가"
          description="월간 누적 기준 잠재 회피 배출량입니다."
          badge="+14%"
          icon={<TrendingDown size={20} />}
        />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>예상 폐기 감소 비교</h3>
              <p>오늘 · 어제 · 지난주 같은 요일</p>
            </div>
          </div>

          <div className="bar-compare">
            <div>
              <span>오늘</span>
              <strong>4.8 kg</strong>
              <div className="bar"><i style={{ width: "100%" }} /></div>
            </div>
            <div>
              <span>어제</span>
              <strong>4.3 kg</strong>
              <div className="bar"><i style={{ width: "86%" }} /></div>
            </div>
            <div>
              <span>지난주 같은 요일</span>
              <strong>4.0 kg</strong>
              <div className="bar"><i style={{ width: "80%" }} /></div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>오늘의 주요 추천</h3>
              <p>추천 우선순위 상위 3개 품목</p>
            </div>
          </div>

          <div className="recommend-list">
            {recommendations.map((item) => (
              <div className="recommend-card" key={item.item}>
                <div>
                  <strong>{item.item}</strong>
                  <span className={item.status === "적정" ? "status green" : "status orange"}>
                    {item.status}
                  </span>
                  <p>{item.reason}</p>
                </div>
                <b>{item.change}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel history-panel">
        <div className="panel-title">
          <h3>최근 발주 이력</h3>
          <button className="text-btn">전체 보기</button>
        </div>

        <table className="simple-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>확정 품목 수</th>
              <th>예상 절감 원가</th>
              <th>예상 탄소 절감량</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>06.25</td>
              <td>8개</td>
              <td>₩41,200</td>
              <td>7.6 kgCO₂e</td>
              <td><button className="soft-btn">상세 보기</button></td>
            </tr>
            <tr>
              <td>06.24</td>
              <td>7개</td>
              <td>₩35,800</td>
              <td>6.9 kgCO₂e</td>
              <td><button className="soft-btn">상세 보기</button></td>
            </tr>
            <tr>
              <td>06.23</td>
              <td>9개</td>
              <td>₩48,500</td>
              <td>8.4 kgCO₂e</td>
              <td><button className="soft-btn">상세 보기</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Home;