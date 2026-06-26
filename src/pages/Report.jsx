import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import api from "../services/api";
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
import { Leaf, Cloud, Wallet, TrendingUp } from "lucide-react";

function Report() {
  const [series, setSeries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const carEquivalentKm = 213;

  useEffect(() => {
  loadReport();
    }, []);

    const loadReport = async () => {
    try {
        const [seriesRes, summaryRes] = await Promise.all([
        api.get("/carbon/savings", {
            params: {
            storeId: 1,
            from: "2026-06-01",
            to: "2026-06-30",
            },
        }),
        api.get("/carbon/savings/summary", {
            params: {
            storeId: 1,
            },
        }),
        ]);

        setSeries(seriesRes.data.data.series);
        setSummary(summaryRes.data.data);
    } finally {
        setLoading(false);
    }
    };
    if (loading) {
    return <div>리포트를 불러오는 중...</div>;
    }

  return (
    <div className="page">
      <PageHeader
        title="리포트"
        description="폐기 감소, 원가 절감, 탄소 절감 성과를 월간 기준으로 확인합니다."
      />

      <div className="report-filter-row">
        <div>
            <strong>월간 성과 리포트</strong>
            <span>폐기 감소 · 원가 절감 · 탄소 절감 성과 요약</span>
        </div>

        <select>
            <option>2026년 6월</option>
            <option>2026년 5월</option>
            <option>2026년 4월</option>
        </select>
        </div>

      <div className="stats-grid report-stats-grid">
        <StatCard
            label="월간 폐기 감소량"
            value="72.8kg"
            sub="지난달 대비 16% 개선"
            description="발주 추천으로 감소한 예상 폐기량"
            badge="+16%"
            icon={<Leaf size={20} />}
            tone="waste"
        />

        <StatCard
            label="월간 폐기율"
            value="5.2%"
            sub="목표 6% 이하 달성"
            description="전체 판매 대비 폐기 비율"
            badge="목표"
            icon={<TrendingUp size={20} />}
            tone="sky"
        />

        <StatCard
            label="월간 절감 원가"
            value="₩384,000"
            sub="누적 절감 기준"
            description="폐기 감소로 절약된 비용"
            badge="+18%"
            icon={<Wallet size={20} />}
            tone="cost"
        />

        <StatCard
            label="월간 탄소 절감량"
            value="128.4kgCO₂e"
            sub={`자동차 약 ${carEquivalentKm}km 주행 배출량`}
            description="잠재 회피 탄소배출량"
            badge="+14%"
            icon={<Cloud size={20} />}
            tone="carbon"
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