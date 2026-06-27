import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import {
  fetchOrderAnalysis,
  ORDER_TARGET_DATE,
} from "../services/orderService";

const DECISION = {
  ACCEPT: "accept",
  ADJUST: "adjust",
  EXCLUDE: "exclude",
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const roundToOne = (value) => Math.round(toNumber(value) * 10) / 10;

const formatNumber = (value) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(toNumber(value)));

const formatCurrency = (value) => `₩${formatNumber(value)}`;

const formatKg = (value) => `${roundToOne(value).toFixed(1)}kg`;

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getDateBefore = (dateString, days) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

const getForecast = (item) => toNumber(item?.horizonForecast?.p50);

const getWasteSaving = (item) =>
  toNumber(
    item?.expectedWasteAvoidedKg ??
      item?.wasteAvoidedKg ??
      item?.waste ??
      0,
  );

const getCarbonSaving = (item) =>
  toNumber(
    item?.expectedCarbonSavingKg ??
      item?.carbonSavingKg ??
      item?.carbonAvoidedKg ??
      item?.carbon ??
      0,
  );

const getCostSaving = (item) =>
  toNumber(
    item?.expectedCostSavingKrw ??
      item?.expectedCostSavingKRW ??
      item?.expectedCostSaving ??
      item?.costSavingKrw ??
      item?.costSaving ??
      0,
  );

const getInitialHistory = () => [
  {
    id: "history-1",
    date: getDateBefore(ORDER_TARGET_DATE, 2),
    itemCount: 8,
    planDifference: -32,
    costSaving: 41200,
    carbonSaving: 7.6,
    status: "확정됨",
    details: [],
  },
  {
    id: "history-2",
    date: getDateBefore(ORDER_TARGET_DATE, 3),
    itemCount: 7,
    planDifference: -24,
    costSaving: 35800,
    carbonSaving: 6.9,
    status: "확정됨",
    details: [],
  },
];

function Order() {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState(getInitialHistory);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedHistory(null);
        setShowConfirmModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await fetchOrderAnalysis(1, ORDER_TARGET_DATE);
      const items = Array.isArray(data?.items) ? data.items : [];

      setOrderItems(
        items.map((item, index) => ({
          ...item,
          clientId: item.itemId ?? item.id ?? `${item.itemName}-${index}`,
          onHand: toNumber(item.onHand ?? item.onHandk),
          planned: toNumber(item.planned),
          decision: DECISION.ACCEPT,
          finalQuantity: toNumber(item.recommendedQuantity),
        })),
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("발주 데이터를 불러오지 못했습니다.");
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (clientId, updates) => {
    setConfirmed(false);
    setOrderItems((currentItems) =>
      currentItems.map((item) =>
        item.clientId === clientId ? { ...item, ...updates } : item,
      ),
    );
  };

  const handleNumberChange = (clientId, field, value) => {
    const numericValue = Math.max(0, toNumber(value));
    updateItem(clientId, { [field]: numericValue });
  };

  const handleDecision = (item, decision) => {
    const nextQuantity =
      decision === DECISION.EXCLUDE
        ? 0
        : decision === DECISION.ACCEPT
          ? toNumber(item.recommendedQuantity)
          : toNumber(item.finalQuantity || item.recommendedQuantity);

    updateItem(item.clientId, {
      decision,
      finalQuantity: nextQuantity,
    });
  };

  const summary = useMemo(() => {
    const includedItems = orderItems.filter(
      (item) => item.decision !== DECISION.EXCLUDE,
    );

    const totalConfirmed = includedItems.reduce(
      (sum, item) => sum + toNumber(item.finalQuantity),
      0,
    );

    const totalPlanned = includedItems.reduce(
      (sum, item) => sum + toNumber(item.planned),
      0,
    );

    return {
      includedItems,
      selectedCount: includedItems.length,
      totalConfirmed,
      planDifference: totalConfirmed - totalPlanned,
      costSaving: includedItems.reduce(
        (sum, item) => sum + getCostSaving(item),
        0,
      ),
      wasteSaving: includedItems.reduce(
        (sum, item) => sum + getWasteSaving(item),
        0,
      ),
      carbonSaving: includedItems.reduce(
        (sum, item) => sum + getCarbonSaving(item),
        0,
      ),
    };
  }, [orderItems]);

  const handleOpenConfirm = () => {
    if (summary.selectedCount === 0) {
      window.alert("확정할 품목을 한 개 이상 선택해 주세요.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = () => {
    const confirmedDetails = summary.includedItems.map((item) => ({
      itemName: item.itemName,
      category: item.category,
      planned: toNumber(item.planned),
      recommendedQuantity: toNumber(item.recommendedQuantity),
      finalQuantity: toNumber(item.finalQuantity),
      decision: item.decision,
    }));

    const newHistory = {
      id: `history-${Date.now()}`,
      date: ORDER_TARGET_DATE,
      itemCount: summary.selectedCount,
      planDifference: summary.planDifference,
      costSaving: summary.costSaving,
      carbonSaving: summary.carbonSaving,
      status: "확정됨",
      details: confirmedDetails,
    };

    setHistory((currentHistory) => [
      newHistory,
      ...currentHistory.filter((record) => record.date !== ORDER_TARGET_DATE),
    ]);
    setConfirmed(true);
    setShowConfirmModal(false);
  };

  if (loading) {
    return <div className="page">발주 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="page">
      <style>{`
        .order-action-button {
          cursor: pointer;
        }

        .order-action-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .order-adjust-input {
          width: 72px;
          margin-bottom: 4px;
          text-align: center;
        }

        .order-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.46);
        }

        .order-modal {
          width: min(620px, 100%);
          max-height: 82vh;
          overflow-y: auto;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
        }

        .order-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-modal-header h3 {
          margin: 0;
        }

        .order-modal-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 10px;
          background: #f3f4f6;
          cursor: pointer;
          font-size: 20px;
        }

        .order-modal-body {
          padding: 22px 24px;
        }

        .order-modal-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .order-modal-summary > div {
          padding: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f8fafc;
        }

        .order-modal-summary span {
          display: block;
          margin-bottom: 5px;
          color: #64748b;
          font-size: 13px;
        }

        .order-modal-summary strong {
          font-size: 17px;
        }

        .order-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 24px 22px;
        }

        .order-history-detail-list {
          margin-top: 18px;
          border-top: 1px solid #e5e7eb;
        }

        .order-history-detail-row {
          display: grid;
          grid-template-columns: minmax(120px, 1fr) repeat(3, minmax(72px, auto));
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eef2f7;
          font-size: 14px;
        }

        .order-empty-detail {
          margin-top: 18px;
          padding: 16px;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          text-align: center;
        }

        .order-confirmed-message {
          margin: 14px 0 0;
          color: #15803d;
          font-weight: 700;
          text-align: right;
        }

        @media (max-width: 640px) {
          .order-modal-summary {
            grid-template-columns: 1fr;
          }

          .order-history-detail-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <PageHeader
        title="발주"
        description={`${ORDER_TARGET_DATE} 기준 재고와 발주 예정량을 검토합니다.`}
      />

      {errorMessage && (
        <section className="panel">
          <p>{errorMessage}</p>
          <button className="soft-btn" type="button" onClick={loadOrders}>
            다시 불러오기
          </button>
        </section>
      )}

      <section className="panel order-panel">
        <div className="panel-title">
          <div>
            <h3>품목별 발주 검토</h3>
            <p>조회 기준일의 재고와 기존 발주 예정량을 입력해 추천값과 비교합니다.</p>
          </div>
          <span>기준일 재고·발주 예정량은 직접 입력</span>
        </div>

        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th>품목</th>
                <th>예상 수요</th>
                <th>기준일 재고</th>
                <th>기존 발주 예정량</th>
                <th>추천 발주량</th>
                <th>추가 필요량</th>
                <th>예상 폐기 감소</th>
                <th>예상 탄소 절감</th>
                <th>상태</th>
                <th>추천 근거</th>
                <th>사용자 결정</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan="11">표시할 발주 품목이 없습니다.</td>
                </tr>
              ) : (
                orderItems.map((item) => (
                  <tr key={item.clientId}>
                    <td>
                      <strong>{item.itemName}</strong>
                      <p>{item.category}</p>
                    </td>
                    <td>{formatNumber(getForecast(item))}</td>
                    <td>
                      <input
                        className="mini-input"
                        type="number"
                        min="0"
                        value={item.onHand}
                        onChange={(event) =>
                          handleNumberChange(
                            item.clientId,
                            "onHand",
                            event.target.value,
                          )
                        }
                        aria-label={`${item.itemName} 기준일 재고`}
                      />
                    </td>
                    <td>
                      <input
                        className="mini-input"
                        type="number"
                        min="0"
                        value={item.planned}
                        onChange={(event) =>
                          handleNumberChange(
                            item.clientId,
                            "planned",
                            event.target.value,
                          )
                        }
                        aria-label={`${item.itemName} 기존 발주 예정량`}
                      />
                    </td>
                    <td className="recommended-order">
                      {item.decision === DECISION.ADJUST ? (
                        <>
                          <input
                            className="mini-input order-adjust-input"
                            type="number"
                            min="0"
                            value={item.finalQuantity}
                            onChange={(event) =>
                              handleNumberChange(
                                item.clientId,
                                "finalQuantity",
                                event.target.value,
                              )
                            }
                            aria-label={`${item.itemName} 조정 발주량`}
                            autoFocus
                          />
                          <span>조정 수량</span>
                        </>
                      ) : (
                        <>
                          <strong>{formatNumber(item.recommendedQuantity)}</strong>
                          <span>
                            {item.decision === DECISION.EXCLUDE
                              ? "발주 제외"
                              : "시스템 추천"}
                          </span>
                        </>
                      )}
                    </td>
                    <td>{formatNumber(item.extra)}</td>
                    <td>{formatKg(getWasteSaving(item))}</td>
                    <td>{formatKg(getCarbonSaving(item))}</td>
                    <td>
                      <span className={`status ${item.tone ?? ""}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="reason-cell">
                      {item?.rationale?.interpolation ??
                        item?.rationale?.reason ??
                        "추천 근거가 없습니다."}
                    </td>
                    <td>
                      <div className="decision-buttons">
                        <button
                          type="button"
                          className={
                            item.decision === DECISION.ACCEPT ? "selected" : ""
                          }
                          onClick={() =>
                            handleDecision(item, DECISION.ACCEPT)
                          }
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          className={
                            item.decision === DECISION.ADJUST ? "selected" : ""
                          }
                          onClick={() =>
                            handleDecision(item, DECISION.ADJUST)
                          }
                        >
                          조정
                        </button>
                        <button
                          type="button"
                          className={
                            item.decision === DECISION.EXCLUDE ? "selected" : ""
                          }
                          onClick={() =>
                            handleDecision(item, DECISION.EXCLUDE)
                          }
                        >
                          제외
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="order-summary-card">
        <div>
          <span>선택 품목</span>
          <strong>{summary.selectedCount}개</strong>
        </div>
        <div>
          <span>총 확정 수량</span>
          <strong>{formatNumber(summary.totalConfirmed)}</strong>
        </div>
        <div>
          <span>기존 계획 대비</span>
          <strong
            className={summary.planDifference < 0 ? "red-text" : undefined}
          >
            {summary.planDifference > 0 ? "+" : ""}
            {formatNumber(summary.planDifference)}
          </strong>
        </div>
        <div>
          <span>예상 절감 원가</span>
          <strong>{formatCurrency(summary.costSaving)}</strong>
        </div>
        <div>
          <span>예상 폐기 감소</span>
          <strong>{formatKg(summary.wasteSaving)}</strong>
        </div>
        <div>
          <span>예상 탄소 절감</span>
          <strong>{formatKg(summary.carbonSaving)}</strong>
        </div>

        <button
          className="confirm-order-btn order-action-button"
          type="button"
          onClick={handleOpenConfirm}
          disabled={orderItems.length === 0}
        >
          {confirmed ? "발주안 확정 완료" : "발주안 확정"}
        </button>
      </section>

      {confirmed && (
        <p className="order-confirmed-message">
          {formatDate(ORDER_TARGET_DATE)} 발주안이 이력에 추가되었습니다.
        </p>
      )}

      <section className="panel history-panel">
        <div className="panel-title">
          <h3>발주 이력</h3>
        </div>

        <table className="simple-table">
          <thead>
            <tr>
              <th>확정 날짜</th>
              <th>품목 수</th>
              <th>계획 대비 변경</th>
              <th>절감 원가</th>
              <th>탄소 절감</th>
              <th>상태</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.date)}</td>
                <td>{record.itemCount}개</td>
                <td className={record.planDifference < 0 ? "red-text" : undefined}>
                  {record.planDifference > 0 ? "+" : ""}
                  {formatNumber(record.planDifference)}
                </td>
                <td>{formatCurrency(record.costSaving)}</td>
                <td>{formatKg(record.carbonSaving)}</td>
                <td>
                  <span className="status green">{record.status}</span>
                </td>
                <td>
                  <button
                    className="soft-btn order-action-button"
                    type="button"
                    onClick={() => setSelectedHistory(record)}
                  >
                    상세 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showConfirmModal && (
        <div
          className="order-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div
            className="order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-order-title"
          >
            <div className="order-modal-header">
              <h3 id="confirm-order-title">발주안 확정</h3>
              <button
                className="order-modal-close"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="order-modal-body">
              <p>
                아래 내용으로 {formatDate(ORDER_TARGET_DATE)} 발주안을
                확정하시겠습니까?
              </p>
              <div className="order-modal-summary">
                <div>
                  <span>선택 품목</span>
                  <strong>{summary.selectedCount}개</strong>
                </div>
                <div>
                  <span>총 확정 수량</span>
                  <strong>{formatNumber(summary.totalConfirmed)}</strong>
                </div>
                <div>
                  <span>기존 계획 대비</span>
                  <strong>
                    {summary.planDifference > 0 ? "+" : ""}
                    {formatNumber(summary.planDifference)}
                  </strong>
                </div>
                <div>
                  <span>예상 탄소 절감</span>
                  <strong>{formatKg(summary.carbonSaving)}</strong>
                </div>
              </div>
            </div>

            <div className="order-modal-actions">
              <button
                className="soft-btn"
                type="button"
                onClick={() => setShowConfirmModal(false)}
              >
                취소
              </button>
              <button
                className="confirm-order-btn"
                type="button"
                onClick={handleConfirmOrder}
              >
                확정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedHistory && (
        <div
          className="order-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedHistory(null);
            }
          }}
        >
          <div
            className="order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
          >
            <div className="order-modal-header">
              <h3 id="history-detail-title">발주 이력 상세</h3>
              <button
                className="order-modal-close"
                type="button"
                onClick={() => setSelectedHistory(null)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="order-modal-body">
              <div className="order-modal-summary">
                <div>
                  <span>확정 날짜</span>
                  <strong>{formatDate(selectedHistory.date)}</strong>
                </div>
                <div>
                  <span>품목 수</span>
                  <strong>{selectedHistory.itemCount}개</strong>
                </div>
                <div>
                  <span>계획 대비 변경</span>
                  <strong>
                    {selectedHistory.planDifference > 0 ? "+" : ""}
                    {formatNumber(selectedHistory.planDifference)}
                  </strong>
                </div>
                <div>
                  <span>절감 원가</span>
                  <strong>{formatCurrency(selectedHistory.costSaving)}</strong>
                </div>
                <div>
                  <span>탄소 절감</span>
                  <strong>{formatKg(selectedHistory.carbonSaving)}</strong>
                </div>
                <div>
                  <span>상태</span>
                  <strong>{selectedHistory.status}</strong>
                </div>
              </div>

              {selectedHistory.details?.length > 0 ? (
                <div className="order-history-detail-list">
                  <div className="order-history-detail-row">
                    <strong>품목</strong>
                    <strong>기존 계획</strong>
                    <strong>추천</strong>
                    <strong>확정</strong>
                  </div>
                  {selectedHistory.details.map((detail, index) => (
                    <div
                      className="order-history-detail-row"
                      key={`${detail.itemName}-${index}`}
                    >
                      <span>
                        <strong>{detail.itemName}</strong>
                        {detail.category ? ` · ${detail.category}` : ""}
                      </span>
                      <span>{formatNumber(detail.planned)}</span>
                      <span>{formatNumber(detail.recommendedQuantity)}</span>
                      <span>{formatNumber(detail.finalQuantity)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="order-empty-detail">
                  이전 이력의 품목별 상세 데이터는 제공되지 않았습니다.
                </div>
              )}
            </div>

            <div className="order-modal-actions">
              <button
                className="confirm-order-btn"
                type="button"
                onClick={() => setSelectedHistory(null)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;
