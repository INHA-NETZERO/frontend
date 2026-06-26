import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import api from "../services/api";

function getOneYearAgoDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const TARGET_DATE = getOneYearAgoDate();

function getInventoryStatus(item) {
  if ((item.closingStock ?? 0) <= 2) {
    return { status: "재고 부족", tone: "red" };
  }

  if ((item.wasteQty ?? 0) > 0) {
    return { status: "폐기 발생", tone: "orange" };
  }

  return { status: "정상", tone: "green" };
}

function transformInventoryItem(item) {
  const statusInfo = getInventoryStatus(item);

  return {
    id: item.itemId,
    item: item.itemName,
    category: item.category,
    stock: item.closingStock ?? 0,
    unit: item.unit,
    orderedQty: item.orderedQty ?? 0,
    actualSales: item.actualSales ?? 0,
    wasteQty: item.wasteQty ?? 0,
    wasteKg: item.wasteKg ?? 0,
    wasteCarbonKg: item.wasteCarbonKg ?? 0,
    wasteCostKrw: item.wasteCostKrw ?? 0,
    lastOrderDate: item.lastOrderDate ?? "-",
    expiry: "-",
    ...statusInfo,
  };
}

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [summary, setSummary] = useState({
    totalWasteKg: 0,
    totalWasteCarbonKg: 0,
    totalWasteCostKrw: 0,
  });
  const [loading, setLoading] = useState(true);

  const [wasteForm, setWasteForm] = useState({
    itemId: "",
    quantity: 0,
    unit: "개",
    reason: "유통기한 경과",
    wasteDate: TARGET_DATE,
    memo: "",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await api.get("/inventory", {
        params: {
          storeId: 1,
          date: TARGET_DATE,
        },
      });

      const data = response.data.data;
      setInventoryItems(data.items.map(transformInventoryItem));
      setSummary(data.summary);
    } catch (error) {
      console.error("재고 조회 실패:", error);
      alert("재고 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = useMemo(() => {
    return inventoryItems.filter((item) => item.tone === "red").length;
  }, [inventoryItems]);

  const wasteItemCount = useMemo(() => {
    return inventoryItems.filter((item) => item.wasteQty > 0).length;
  }, [inventoryItems]);

  const handleWasteChange = (field, value) => {
    setWasteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWasteSave = () => {
    alert(
      "현재 백엔드 명세에 실제 폐기 저장 API가 없어 화면 입력까지만 가능합니다."
    );
  };

  if (loading) {
    return <div className="page">재고 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="page">
      <PageHeader
        title="재고"
        description={`${TARGET_DATE} 기준 품목별 재고와 폐기 내역을 확인합니다.`}
      />

      <div className="stats-grid">
        <StatCard
          label="전체 관리 품목"
          value={`${inventoryItems.length}개`}
          sub={`${TARGET_DATE} 재고 조회 기준`}
        />
        <StatCard
          label="재고 부족 품목"
          value={`${lowStockCount}개`}
          sub="기말재고 2 이하 기준"
          tone="orange"
        />
        <StatCard
          label="폐기 발생 품목"
          value={`${wasteItemCount}개`}
          sub={`${TARGET_DATE} 폐기 수량 기준`}
          tone="red"
        />

        <StatCard
          label="조회일 실제 폐기량"
          value={`${summary?.totalWasteKg ?? 0}kg`}
          sub={`탄소 ${summary?.totalWasteCarbonKg ?? 0}kgCO₂e`}
        />
      </div>

      <section className="inventory-note">
        {TARGET_DATE} 기준 재고 원장 데이터를 조회하고 있습니다. 재고 수정과 폐기
        내역 저장은 별도 API 연동이 필요합니다.
      </section>

      <section className="panel inventory-panel">
        <div className="panel-title">
          <div>
            <h3>품목별 재고 현황</h3>
            <p>기말재고, 실제 판매량, 폐기량을 기준으로 상태를 표시합니다.</p>
          </div>
          <input className="table-search" placeholder="품목 검색" />
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>품목</th>
              <th>카테고리</th>
              <th>기말 재고</th>
              <th>단위</th>
              <th>실판매</th>
              <th>폐기 수량</th>
              <th>폐기 탄소</th>
              <th>상태</th>
              <th>최근 발주일</th>
              <th>수정</th>
            </tr>
          </thead>

          <tbody>
            {inventoryItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.item}</strong>
                </td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>{item.unit}</td>
                <td>{item.actualSales}</td>
                <td>{item.wasteQty}</td>
                <td>{item.wasteCarbonKg}kgCO₂e</td>
                <td>
                  <span className={`status ${item.tone}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.lastOrderDate}</td>
                <td>
                  <button
                    className="soft-btn"
                    onClick={() =>
                      alert("현재 백엔드 명세에 재고 수정 API가 없습니다.")
                    }
                  >
                    재고 수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="waste-input-panel">
        <div>
          <h3>폐기 내역 입력</h3>
          <p>
            조회일에 발생한 품목별 폐기 수량과 사유를 입력합니다. 현재는 저장 API가
            연결되지 않아 서버에는 반영되지 않습니다.
          </p>
        </div>

        <div className="waste-form">
          <label>
            품목 선택
            <select
              value={wasteForm.itemId}
              onChange={(e) => handleWasteChange("itemId", e.target.value)}
            >
              <option value="">품목 선택</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item}
                </option>
              ))}
            </select>
          </label>

          <label>
            폐기 수량
            <input
              type="number"
              value={wasteForm.quantity}
              onChange={(e) => handleWasteChange("quantity", e.target.value)}
            />
          </label>

          <label>
            단위
            <select
              value={wasteForm.unit}
              onChange={(e) => handleWasteChange("unit", e.target.value)}
            >
              <option>개</option>
              <option>kg</option>
              <option>봉</option>
              <option>병</option>
              <option>L</option>
            </select>
          </label>

          <label>
            폐기 사유
            <select
              value={wasteForm.reason}
              onChange={(e) => handleWasteChange("reason", e.target.value)}
            >
              <option>유통기한 경과</option>
              <option>품질 저하</option>
              <option>판매 부진</option>
              <option>제조 과정 손실</option>
              <option>매진 후 폐기</option>
              <option>기타</option>
            </select>
          </label>

          <label>
            폐기 날짜
            <input
              type="date"
              value={wasteForm.wasteDate}
              onChange={(e) => handleWasteChange("wasteDate", e.target.value)}
            />
          </label>

          <label>
            메모
            <textarea
              rows="3"
              placeholder="폐기 원인을 입력하세요."
              value={wasteForm.memo}
              onChange={(e) => handleWasteChange("memo", e.target.value)}
            />
          </label>

          <button className="confirm-order-btn" onClick={handleWasteSave}>
            폐기 내역 저장
          </button>

          <div className="waste-feedback">
            <strong>예상 탄소 영향</strong>
            <p>
              입력 후 예상 폐기량 및 탄소 절감량이 다음 분석에 반영됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inventory;