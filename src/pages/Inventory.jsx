import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";

const inventoryItems = [
  {
    item: "우유",
    category: "유제품",
    stock: 12,
    unit: "개",
    expiry: "1일",
    status: "폐기 임박",
    tone: "red",
  },
  {
    item: "생크림",
    category: "유제품",
    stock: 6,
    unit: "개",
    expiry: "2일",
    status: "주의",
    tone: "orange",
  },
  {
    item: "샌드위치",
    category: "신선식품",
    stock: 6,
    unit: "개",
    expiry: "1일",
    status: "폐기 임박",
    tone: "red",
  },
  {
    item: "샐러드",
    category: "신선식품",
    stock: 3,
    unit: "개",
    expiry: "오늘",
    status: "폐기 임박",
    tone: "red",
  },
  {
    item: "크루아상",
    category: "베이커리",
    stock: 4,
    unit: "개",
    expiry: "2일",
    status: "주의",
    tone: "orange",
  },
  {
    item: "식빵",
    category: "베이커리",
    stock: 5,
    unit: "봉",
    expiry: "3일",
    status: "주의",
    tone: "orange",
  },
  {
    item: "원두",
    category: "원재료",
    stock: 4,
    unit: "kg",
    expiry: "60일",
    status: "여유",
    tone: "green",
  },
  {
    item: "아이스컵",
    category: "소모품",
    stock: 80,
    unit: "개",
    expiry: "장기",
    status: "여유",
    tone: "green",
  },
];

function Inventory() {
  return (
    <div className="page">
      <PageHeader
        title="재고"
        description="품목별 현재 재고와 유통기한을 확인하고 실제 폐기 내역을 기록합니다."
      />

      <div className="stats-grid">
        <StatCard label="전체 관리 품목" value="10개" sub="직접 입력 기준" />
        <StatCard label="재고 부족 품목" value="2개" sub="전일 대비 1개 감소" tone="orange" />
        <StatCard label="폐기 임박 품목" value="3개" sub="오늘 또는 1일 이내" tone="red" />
        <StatCard label="오늘 실제 폐기량" value="2.3kg" sub="직접 입력 기준" />
      </div>

      <section className="inventory-note">
        현재 재고는 사용자가 직접 입력·수정하는 값입니다. 시스템이 재고를 자동
        인식하지 않습니다.
      </section>

      <section className="panel inventory-panel">
        <div className="panel-title">
          <div>
            <h3>품목별 재고 현황</h3>
            <p>유통기한 컬럼은 날짜 대신 잔여일 기준으로 표시합니다.</p>
          </div>
          <input className="table-search" placeholder="품목 검색" />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>품목</th>
              <th>카테고리</th>
              <th>현재 재고</th>
              <th>단위</th>
              <th>유통기한</th>
              <th>상태</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => (
              <tr key={item.item}>
                <td>
                  <strong>{item.item}</strong>
                </td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>{item.unit}</td>
                <td>
                  <span className={`expiry-badge ${item.tone}`}>
                    {item.expiry}
                  </span>
                </td>
                <td>
                  <span className={`status ${item.tone}`}>{item.status}</span>
                </td>
                <td>
                  <button className="soft-btn">수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="waste-input-panel">
        <div>
          <h3>오늘 실제 폐기 입력</h3>
          <p>
            실제로 버린 수량을 기록하면 다음 수요예측과 발주 추천 보정에 반영됩니다.
          </p>
        </div>

        <div className="waste-form">
          <label>
            품목 선택
            <select>
              <option>우유</option>
              <option>샌드위치</option>
              <option>샐러드</option>
              <option>크루아상</option>
            </select>
          </label>

          <label>
            폐기 수량
            <input type="number" defaultValue="0" />
          </label>

          <label>
            단위
            <select>
              <option>개</option>
              <option>kg</option>
              <option>봉</option>
              <option>병</option>
            </select>
          </label>

          <label>
            폐기 사유
            <select>
              <option>유통기한 경과</option>
              <option>품질 저하</option>
              <option>판매 부진</option>
              <option>제조 과정 손실</option>
              <option>기타</option>
            </select>
          </label>

          <label>
            폐기 날짜
            <input type="date" defaultValue="2026-06-26" />
          </label>

          <button className="confirm-order-btn">저장</button>
        </div>
      </section>
    </div>
  );
}

export default Inventory;