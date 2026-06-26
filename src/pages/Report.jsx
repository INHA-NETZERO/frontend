import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const wasteTrend = [
  { month: "1월", rate: 12 },
  { month: "2월", rate: 10 },
  { month: "3월", rate: 9 },
  { month: "4월", rate: 8 },
  { month: "5월", rate: 7 },
  { month: "6월", rate: 5 },
];

const carbonTrend = [
  { month: "1월", carbon: 42 },
  { month: "2월", carbon: 58 },
  { month: "3월", carbon: 76 },
  { month: "4월", carbon: 94 },
  { month: "5월", carbon: 111 },
  { month: "6월", carbon: 128 },
];

const costBreakdown = [
  { name: "유제품", value: 128000 },
  { name: "신선식품", value: 96000 },
  { name: "베이커리", value: 84000 },
  { name: "음료", value: 76000 },
];

function Report() {
  const carEquivalentKm = 213;

  return (
    <div className="page">
      <PageHeader
        title="리포트"
        description="폐기 감소, 원가 절감, 탄소 절감 성과를 월간 기준으로 확인합니다."
      />

      <div className="report-filter-row">
        <select>
          <option>2026년 6월</option>
          <option>2026년 5월</option>
          <option>2026년 4월</option>
        </select>
        <span>PDF 다운로드 기능은 제거되었습니다. CSV 추출은 백엔드 export API에서 처리합니다.</span>
      </div>

      <div className="stats-grid">
        <StatCard label="월간 폐기 감소량" value="72.8kg" sub="지난달 대비 16% 개선" />
        <StatCard label="월간 폐기율" value="5.2%" sub="목표 6% 이하 달성" />
        <StatCard label="월간 절감 원가" value="₩384,000" sub="누적 절감 기준" />
        <StatCard
          label="월간 탄소 절감량"
          value="128.4kgCO₂e"
          sub={`자동차 약 ${carEquivalentKm}km 주행 배출량`}
        />
      </div>

      <section className="carbon-comparison-card">
        <div>
          <span>🚗 일상 비유</span>
          <strong>
            이번 달 탄소 절감량은 자동차 약 {carEquivalentKm}km를 주행할 때
            발생하는 탄소배출량을 줄인 것과 같습니다.
          </strong>
        </div>
      </section>

      <div className="report-grid">
        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>월별 폐기율 추이</h3>
              <p>발주 추천 반영 후 폐기율 변화</p>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={wasteTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>월별 누적 탄소 절감</h3>
              <p>단위: kgCO₂e</p>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={carbonTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="carbon" radius={[10, 10, 0, 0]}>
                  {carbonTrend.map((entry) => (
                    <Cell key={entry.month} fill="#059669" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="report-grid">
        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>월별 절감 원가 구성</h3>
              <p>품목군별 폐기 비용 회피 효과</p>
            </div>
          </div>

          <div className="cost-bars">
            {costBreakdown.map((item) => (
              <div className="cost-row" key={item.name}>
                <div>
                  <span>{item.name}</span>
                  <strong>₩{item.value.toLocaleString()}</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${(item.value / 128000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel carbon-range-panel">
          <div className="panel-title">
            <div>
              <h3>탄소 절감 범위</h3>
              <p>보수적 절감량과 잠재 절감량을 구분합니다.</p>
            </div>
          </div>

          <div className="carbon-range">
            <div>
              <span>보수적 절감량</span>
              <strong>64.2kgCO₂e</strong>
              <p>실제 폐기 감소 기준</p>
            </div>

            <div>
              <span>잠재 절감량</span>
              <strong>128.4kgCO₂e</strong>
              <p>과잉 발주 회피 가능량 기준</p>
            </div>
          </div>

          <div className="range-bar">
            <i />
          </div>

          <p className="range-note">
            숫자는 Calculation Engine에서 계산하며, 리포트 설명 문구는 LLM이
            사용자가 이해하기 쉽게 변환합니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Report;