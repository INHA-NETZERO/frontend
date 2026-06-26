import PageHeader from "../components/common/PageHeader";

const orderItems = [
  {
    item: "우유",
    category: "유제품",
    demand: 18,
    stock: 12,
    planned: 20,
    recommended: 8,
    extra: 0,
    waste: "1.4kg",
    carbon: "2.1kgCO₂e",
    status: "과잉 가능",
    tone: "orange",
    reason: "비 예보와 최근 동일 요일 판매 감소를 반영했습니다.",
  },
  {
    item: "샌드위치",
    category: "신선식품",
    demand: 14,
    stock: 6,
    planned: 15,
    recommended: 9,
    extra: 0,
    waste: "1.2kg",
    carbon: "1.8kgCO₂e",
    status: "과잉 가능",
    tone: "orange",
    reason: "강수 예보로 신선식품 수요 감소가 예상됩니다.",
  },
  {
    item: "샐러드",
    category: "신선식품",
    demand: 10,
    stock: 3,
    planned: 8,
    recommended: 7,
    extra: 0,
    waste: "0.7kg",
    carbon: "1.1kgCO₂e",
    status: "적정",
    tone: "green",
    reason: "최근 판매 추이를 반영한 적정 수준입니다.",
  },
  {
    item: "크루아상",
    category: "베이커리",
    demand: 12,
    stock: 4,
    planned: 6,
    recommended: 9,
    extra: 2,
    waste: "0.6kg",
    carbon: "0.9kgCO₂e",
    status: "부족 가능",
    tone: "red",
    reason: "최근 3일 평균 판매량 증가로 추가 발주를 권장합니다.",
  },
];

function Order() {
  return (
    <div className="page">
      <PageHeader
        title="발주"
        description="현재 재고와 발주 예정량을 검토하고 최종 발주를 결정합니다."
      />

      <section className="panel order-panel">
        <div className="panel-title">
          <div>
            <h3>품목별 발주 검토</h3>
            <p>현재 재고와 기존 발주 예정량을 입력하면 추천값과 비교합니다.</p>
          </div>
          <span>현재 재고·발주 예정량은 직접 입력</span>
        </div>

        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th>품목</th>
                <th>예상 수요</th>
                <th>현재 재고</th>
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
              {orderItems.map((item) => (
                <tr key={item.item}>
                  <td>
                    <strong>{item.item}</strong>
                    <p>{item.category}</p>
                  </td>
                  <td>{item.demand}</td>
                  <td>
                    <input className="mini-input" defaultValue={item.stock} />
                  </td>
                  <td>
                    <input className="mini-input" defaultValue={item.planned} />
                  </td>
                  <td className="recommended-order">
                    <strong>{item.recommended}</strong>
                    <span>시스템 추천</span>
                  </td>
                  <td>{item.extra}</td>
                  <td>{item.waste}</td>
                  <td>{item.carbon}</td>
                  <td>
                    <span className={`status ${item.tone}`}>{item.status}</span>
                  </td>
                  <td className="reason-cell">{item.reason}</td>
                  <td>
                    <div className="decision-buttons">
                      <button className="selected">수락</button>
                      <button>조정</button>
                      <button>제외</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="order-summary-card">
        <div>
          <span>선택 품목</span>
          <strong>4개</strong>
        </div>
        <div>
          <span>총 확정 수량</span>
          <strong>33</strong>
        </div>
        <div>
          <span>기존 계획 대비</span>
          <strong className="red-text">-7</strong>
        </div>
        <div>
          <span>예상 절감 원가</span>
          <strong>₩40,800</strong>
        </div>
        <div>
          <span>예상 폐기 감소</span>
          <strong>5.1kg</strong>
        </div>
        <div>
          <span>예상 탄소 절감</span>
          <strong>8.0kg</strong>
        </div>

        <button className="confirm-order-btn">발주안 확정</button>
      </section>

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
            <tr>
              <td>06.25</td>
              <td>8개</td>
              <td className="red-text">-32</td>
              <td>₩41,200</td>
              <td>7.6</td>
              <td><span className="status green">확정됨</span></td>
              <td><button className="soft-btn">상세 보기</button></td>
            </tr>
            <tr>
              <td>06.24</td>
              <td>7개</td>
              <td className="red-text">-24</td>
              <td>₩35,800</td>
              <td>6.9</td>
              <td><span className="status green">확정됨</span></td>
              <td><button className="soft-btn">상세 보기</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Order;