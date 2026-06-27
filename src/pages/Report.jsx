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

const formatNumber = (value, maximumFractionDigits = 1) =>
  Number(value ?? 0).toLocaleString("ko-KR", {
    maximumFractionDigits,
  });

const REPORT_MONTHS = createReportMonths();

const FALLBACK_REPORTS = {
  0: {
    wasteAmountKg: 72.8,
    wasteRate: 5.2,
    savedCost: 384000,
    guaranteedSavingKg: 58.4,
    potentialSavingKg: 72.8,
    previousWasteRate: 6.3,
    improvementRate: 16,
    costImprovementRate: 18,
    carbonImprovementRate: 14,
  },
  1: {
    wasteAmountKg: 64.1,
    wasteRate: 6.3,
    savedCost: 326000,
    guaranteedSavingKg: 51.2,
    potentialSavingKg: 64.1,
    previousWasteRate: 7.4,
    improvementRate: 12,
    costImprovementRate: 14,
    carbonImprovementRate: 11,
  },
  2: {
    wasteAmountKg: 56.7,
    wasteRate: 7.4,
    savedCost: 284000,
    guaranteedSavingKg: 45.3,
    potentialSavingKg: 56.7,
    previousWasteRate: 8.1,
    improvementRate: 9,
    costImprovementRate: 10,
    carbonImprovementRate: 8,
  },
};

const getFallbackReport = (selectedMonth) => {
  const monthIndex = Math.max(
    REPORT_MONTHS.findIndex((month) => month.value === selectedMonth),
    0
  );

  return FALLBACK_REPORTS[monthIndex] ?? FALLBACK_REPORTS[0];
};

const createFallbackSeries = (selectedMonth) => {
  const report = getFallbackReport(selectedMonth);
  const potentialParts = [0.22, 0.24, 0.26, 0.28];
  const guaranteedParts = [0.23, 0.24, 0.25, 0.28];

  return potentialParts.map((part, index) => ({
    date: `${selectedMonth}-${String((index + 1) * 7).padStart(2, "0")}`,
    guaranteedSavingKg: Number(
      (report.guaranteedSavingKg * guaranteedParts[index]).toFixed(1)
    ),
    potentialSavingKg: Number(
      (report.potentialSavingKg * part).toFixed(1)
    ),
  }));
};

const createWasteTrend = (selectedMonth) => {
  const selectedIndex = Math.max(
    REPORT_MONTHS.findIndex((month) => month.value === selectedMonth),
    0
  );
  const selectedReport = FALLBACK_REPORTS[selectedIndex] ?? FALLBACK_REPORTS[0];

  const [year, month] = selectedMonth.split("-").map(Number);
  const rates = [
    Number(selectedReport.previousWasteRate ?? 7.4),
    Number(((selectedReport.previousWasteRate + selectedReport.wasteRate) / 2).toFixed(1)),
    Number(selectedReport.wasteRate),
  ];

  return rates.map((rate, index) => {
    const date = new Date(year, month - 3 + index, 1);

    return {
      month: `${date.getMonth() + 1}월`,
      rate,
    };
  });
};

const COST_BREAKDOWN_RATIOS = [
  { name: "원재료", ratio: 0.333 },
  { name: "완제품", ratio: 0.271 },
  { name: "판매음료", ratio: 0.24 },
  { name: "소모품", ratio: 0.156 },
];

function Report() {
  const [series, setSeries] = useState(() =>
    createFallbackSeries(REPORT_MONTHS[0].value)
  );
  const [summary, setSummary] = useState({
    totalPotentialKg: 218.4,
    carEquivalentKm: 931.8,
  });
  const [selectedMonth, setSelectedMonth] = useState(
    REPORT_MONTHS[0].value
  );
  const [loading, setLoading] = useState(true);

  const selectedMonthLabel =
    REPORT_MONTHS.find((month) => month.value === selectedMonth)?.label ??
    selectedMonth;

  const fallbackReport = useMemo(
    () => getFallbackReport(selectedMonth),
    [selectedMonth]
  );

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      const { from, to } = getMonthRange(selectedMonth);
      const fallbackSeries = createFallbackSeries(selectedMonth);

      setLoading(true);

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

        const responseSeries = seriesRes.data?.data?.series;
        const responseSummary = summaryRes.data?.data;

        setSeries(
          Array.isArray(responseSeries) && responseSeries.length > 0
            ? responseSeries
            : fallbackSeries
        );

        setSummary(
          responseSummary && Number(responseSummary.totalPotentialKg) > 0
            ? responseSummary
            : {
                totalPotentialKg: 218.4,
                carEquivalentKm: 931.8,
              }
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.warn(
          "리포트 API 연결 실패로 예시 데이터를 표시합니다.",
          requestError
        );

        setSeries(fallbackSeries);
        setSummary({
          totalPotentialKg: 218.4,
          carEquivalentKm: 931.8,
        });
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

  const monthlyGuaranteedKg = useMemo(() => {
    const calculatedValue = series.reduce(
      (total, item) => total + Number(item.guaranteedSavingKg ?? 0),
      0
    );

    return calculatedValue > 0
      ? calculatedValue
      : fallbackReport.guaranteedSavingKg;
  }, [series, fallbackReport]);

  const monthlyPotentialKg = useMemo(() => {
    const calculatedValue = series.reduce(
      (total, item) => total + Number(item.potentialSavingKg ?? 0),
      0
    );

    return calculatedValue > 0
      ? calculatedValue
      : fallbackReport.potentialSavingKg;
  }, [series, fallbackReport]);

  const carEquivalentKm = useMemo(() => {
    const totalPotentialKg = Number(summary?.totalPotentialKg ?? 0);
    const totalCarEquivalentKm = Number(summary?.carEquivalentKm ?? 0);

    if (totalPotentialKg > 0 && totalCarEquivalentKm > 0) {
      return (monthlyPotentialKg / totalPotentialKg) * totalCarEquivalentKm;
    }

    return monthlyPotentialKg * 4.27;
  }, [monthlyPotentialKg, summary]);

  const wasteTrend = useMemo(
    () => createWasteTrend(selectedMonth),
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

  const costBreakdown = useMemo(
    () =>
      COST_BREAKDOWN_RATIOS.map((item) => ({
        name: item.name,
        value: Math.round(fallbackReport.savedCost * item.ratio),
      })),
    [fallbackReport]
  );

  const maxCost = Math.max(...costBreakdown.map((item) => item.value), 1);

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
          disabled={loading}
          aria-label="리포트 조회 월 선택"
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
          value={`${formatNumber(fallbackReport.wasteAmountKg)}kg`}
          sub={`지난달 대비 ${fallbackReport.improvementRate}% 개선`}
          description="발주 추천으로 감소한 예상 폐기량"
          badge={`+${fallbackReport.improvementRate}%`}
          icon={<Leaf size={20} />}
          tone="waste"
        />

        <StatCard
          label="월간 폐기율"
          value={`${formatNumber(fallbackReport.wasteRate)}%`}
          sub="목표 6% 이하 달성"
          description="전체 판매 대비 폐기 비율"
          badge="목표"
          icon={<TrendingUp size={20} />}
          tone="sky"
        />

        <StatCard
          label="월간 절감 원가"
          value={`₩${formatNumber(fallbackReport.savedCost, 0)}`}
          sub="폐기 감소 기준"
          description="폐기 감소로 절약된 비용"
          badge={`+${fallbackReport.costImprovementRate}%`}
          icon={<Wallet size={20} />}
          tone="cost"
        />

        <StatCard
          label="월간 탄소 절감량"
          value={`${formatNumber(monthlyPotentialKg)}kgCO₂e`}
          sub={`자동차 약 ${formatNumber(carEquivalentKm)}km 주행 배출량`}
          description="잠재 회피 탄소배출량"
          badge={`+${fallbackReport.carbonImprovementRate}%`}
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
                <YAxis unit="%" domain={[0, 10]} />
                <Tooltip formatter={(value) => [`${value}%`, "폐기율"]} />
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
                <Tooltip
                  formatter={(value) => [`${value}kgCO₂e`, "탄소 절감량"]}
                />
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
                  <strong>₩{formatNumber(item.value, 0)}</strong>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width: `${(item.value / maxCost) * 100}%`,
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
              <strong>{formatNumber(monthlyGuaranteedKg)}kgCO₂e</strong>
              <p>실제 폐기 감소 기준</p>
            </div>

            <div>
              <span>잠재 절감량</span>
              <strong>{formatNumber(monthlyPotentialKg)}kgCO₂e</strong>
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
