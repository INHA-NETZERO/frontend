import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import api from "../services/api";
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
import { Cloud, Leaf, TrendingUp, Wallet } from "lucide-react";

const getOneYearAgoMonth = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const createReportMonths = () => {
  const [baseYear, baseMonth] = getOneYearAgoMonth()
    .split("-")
    .map(Number);

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(baseYear, baseMonth - 1 - index, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return {
      value: `${year}-${month}`,
      label: `${year}년 ${date.getMonth() + 1}월`,
    };
  });
};

const getMonthRange = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    from: `${monthValue}-01`,
    to: `${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
};

const getPreviousMonths = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  const rates = [7.4, 6.3, 5.2];

  return rates.map((rate, index) => {
    const date = new Date(year, month - 3 + index, 1);

    return {
      month: `${date.getMonth() + 1}월`,
      rate,
    };
  });
};

const formatNumber = (value, maximumFractionDigits = 1) =>
  Number(value ?? 0).toLocaleString("ko-KR", {
    maximumFractionDigits,
  });

const REPORT_MONTHS = createReportMonths();

const costBreakdown = [
  {
    name: "원재료",
    value: 128000,
  },
  {
    name: "완제품",
    value: 104000,
  },
  {
    name: "판매음료",
    value: 92000,
  },
  {
    name: "소모품",
    value: 60000,
  },
];

function Report() {
  const [series, setSeries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    REPORT_MONTHS[0].value
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedMonthLabel =
    REPORT_MONTHS.find((month) => month.value === selectedMonth)?.label ??
    selectedMonth;

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      const { from, to } = getMonthRange(selectedMonth);

      setLoading(true);
      setError("");

      try {
        const [seriesRes, summaryRes] = await Promise.all([
          api.get("/carbon/savings", {
            params: {
              storeId: 1,
              from,
              to,
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

        setSeries(seriesRes.data?.data?.series ?? []);
        setSummary(summaryRes.data?.data ?? null);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error("리포트 조회 실패:", {
          status: requestError.response?.status,
          response: requestError.response?.data,
          message: requestError.message,
        });

        setSeries([]);
        setSummary(null);
        setError("리포트 데이터를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const monthlyGuaranteedKg = useMemo(
    () =>
      series.reduce(
        (total, item) => total + Number(item.guaranteedSavingKg ?? 0),
        0
      ),
    [series]
  );

  const monthlyPotentialKg = useMemo(
    () =>
      series.reduce(
        (total, item) => total + Number(item.potentialSavingKg ?? 0),
        0
      ),
    [series]
  );

  const carEquivalentKm = useMemo(() => {
    const totalPotentialKg = Number(summary?.totalPotentialKg ?? 0);
    const totalCarEquivalentKm = Number(summary?.carEquivalentKm ?? 0);

    if (totalPotentialKg <= 0 || monthlyPotentialKg <= 0) {
      return 0;
    }

    return (
      (monthlyPotentialKg / totalPotentialKg) *
      totalCarEquivalentKm
    );
  }, [monthlyPotentialKg, summary]);

  const wasteTrend = useMemo(
    () => getPreviousMonths(selectedMonth),
    [selectedMonth]
  );

  const carbonTrend = useMemo(
    () => [
      {
        month: selectedMonthLabel,
        carbon: Number(monthlyPotentialKg.toFixed(1)),
      },
    ],
    [monthlyPotentialKg, selectedMonthLabel]
  );

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="리포트"
          description={`${selectedMonthLabel} 성과 데이터를 불러오고 있습니다.`}
        />

        <section className="panel">
          리포트를 불러오는 중...
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="리포트"
          description={`${selectedMonthLabel} 폐기 감소, 원가 절감, 탄소 절감 성과를 확인합니다.`}
        />

        <div className="report-filter-row">
          <div>
            <strong>{selectedMonthLabel} 성과 리포트</strong>
            <span>폐기 감소 · 원가 절감 · 탄소 절감 성과 요약</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {REPORT_MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <section className="panel">
          {error}
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="리포트"
        description={`${selectedMonthLabel} 폐기 감소, 원가 절감, 탄소 절감 성과를 확인합니다.`}
      />

      <div className="report-filter-row">
        <div>
          <strong>{selectedMonthLabel} 성과 리포트</strong>
          <span>폐기 감소 · 원가 절감 · 탄소 절감 성과 요약</span>
        </div>

        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          {REPORT_MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
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
          sub="폐기 감소 기준"
          description="폐기 감소로 절약된 비용"
          badge="+18%"
          icon={<Wallet size={20} />}
          tone="cost"
        />

        <StatCard
          label="월간 탄소 절감량"
          value={`${formatNumber(monthlyPotentialKg)}kgCO₂e`}
          sub={`자동차 약 ${formatNumber(
            carEquivalentKm
          )}km 주행 배출량`}
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
            {selectedMonthLabel} 탄소 절감량은 자동차 약{" "}
            {formatNumber(carEquivalentKm)}km를 주행할 때 발생하는
            탄소배출량을 줄인 것과 같습니다.
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
              <h3>선택 월 누적 탄소 절감</h3>
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
                  <strong>₩{item.value.toLocaleString("ko-KR")}</strong>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width: `${(item.value / 128000) * 100}%`,
                    }}
                  />
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
              <strong>
                {formatNumber(monthlyGuaranteedKg)}kgCO₂e
              </strong>
              <p>실제 폐기 감소 기준</p>
            </div>

            <div>
              <span>잠재 절감량</span>
              <strong>
                {formatNumber(monthlyPotentialKg)}kgCO₂e
              </strong>
              <p>과잉 발주 회피 가능량 기준</p>
            </div>
          </div>

          <div className="range-bar">
            <i
              style={{
                width:
                  monthlyPotentialKg > 0
                    ? `${Math.min(
                        (monthlyGuaranteedKg / monthlyPotentialKg) * 100,
                        100
                      )}%`
                    : "0%",
              }}
            />
          </div>

          <p className="range-note">
            숫자는 Calculation Engine에서 계산하며, 리포트 설명 문구는
            LLM이 사용자가 이해하기 쉽게 변환합니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Report;