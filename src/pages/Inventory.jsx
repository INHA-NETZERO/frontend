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

const INITIAL_SUMMARY = {
  totalWasteKg: 0,
  totalWasteCarbonKg: 0,
  totalWasteCostKrw: 0,
};

const DEMO_INVENTORY_ITEMS = [
  {
    itemId: 1,
    itemName: "아메리카노 원두",
    category: "원재료",
    closingStock: 18,
    unit: "kg",
    orderedQty: 24,
    actualSales: 112,
    wasteQty: 0.4,
    wasteKg: 0.4,
    wasteCarbonKg: 2.1,
    wasteCostKrw: 9600,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 2,
    itemName: "우유",
    category: "유제품",
    closingStock: 2,
    unit: "L",
    orderedQty: 38,
    actualSales: 31,
    wasteQty: 1.5,
    wasteKg: 1.5,
    wasteCarbonKg: 2.4,
    wasteCostKrw: 4800,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 3,
    itemName: "바닐라 시럽",
    category: "시럽",
    closingStock: 7,
    unit: "병",
    orderedQty: 8,
    actualSales: 19,
    wasteQty: 0,
    wasteKg: 0,
    wasteCarbonKg: 0,
    wasteCostKrw: 0,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 4,
    itemName: "카라멜 시럽",
    category: "시럽",
    closingStock: 1,
    unit: "병",
    orderedQty: 6,
    actualSales: 17,
    wasteQty: 0,
    wasteKg: 0,
    wasteCarbonKg: 0,
    wasteCostKrw: 0,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 5,
    itemName: "휘핑크림",
    category: "유제품",
    closingStock: 4,
    unit: "개",
    orderedQty: 12,
    actualSales: 14,
    wasteQty: 1,
    wasteKg: 0.5,
    wasteCarbonKg: 1.2,
    wasteCostKrw: 3500,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 6,
    itemName: "크루아상",
    category: "베이커리",
    closingStock: 9,
    unit: "개",
    orderedQty: 28,
    actualSales: 21,
    wasteQty: 2,
    wasteKg: 0.3,
    wasteCarbonKg: 0.8,
    wasteCostKrw: 7000,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 7,
    itemName: "샌드위치",
    category: "푸드",
    closingStock: 2,
    unit: "개",
    orderedQty: 18,
    actualSales: 15,
    wasteQty: 1,
    wasteKg: 0.25,
    wasteCarbonKg: 0.7,
    wasteCostKrw: 5900,
    lastOrderDate: TARGET_DATE,
  },
  {
    itemId: 8,
    itemName: "테이크아웃 컵",
    category: "소모품",
    closingStock: 146,
    unit: "개",
    orderedQty: 200,
    actualSales: 128,
    wasteQty: 0,
    wasteKg: 0,
    wasteCarbonKg: 0,
    wasteCostKrw: 0,
    lastOrderDate: TARGET_DATE,
  },
];

const DEMO_SUMMARY = {
  totalWasteKg: 2.95,
  totalWasteCarbonKg: 7.2,
  totalWasteCostKrw: 30800,
};

function getInventoryStatus(item) {
  if ((item.closingStock ?? 0) <= 2) {
    return {
      status: "재고 부족",
      tone: "red",
    };
  }

  if ((item.wasteQty ?? 0) > 0) {
    return {
      status: "폐기 발생",
      tone: "orange",
    };
  }

  return {
    status: "정상",
    tone: "green",
  };
}

function transformInventoryItem(item) {
  const statusInfo = getInventoryStatus(item);

  return {
    id: item.itemId ?? item.id,
    item: item.itemName ?? item.item ?? "품목명 없음",
    category: item.category ?? "기타",
    stock: Number(item.closingStock ?? item.stock ?? 0),
    unit: item.unit ?? "개",
    orderedQty: Number(item.orderedQty ?? 0),
    actualSales: Number(item.actualSales ?? 0),
    wasteQty: Number(item.wasteQty ?? 0),
    wasteKg: Number(item.wasteKg ?? 0),
    wasteCarbonKg: Number(item.wasteCarbonKg ?? 0),
    wasteCostKrw: Number(item.wasteCostKrw ?? 0),
    lastOrderDate: item.lastOrderDate ?? TARGET_DATE,
    ...statusInfo,
  };
}

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState(
    DEMO_INVENTORY_ITEMS.map(transformInventoryItem)
  );
  const [summary, setSummary] = useState(DEMO_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [wasteForm, setWasteForm] = useState({
    itemId: "",
    quantity: 0,
    unit: "개",
    reason: "유통기한 경과",
    wasteDate: TARGET_DATE,
    memo: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadInventory = async () => {
      setLoading(true);
      setNotice("");

      try {
        const response = await api.get("/inventory", {
          params: {
            storeId: 1,
            date: TARGET_DATE,
          },
        });

        if (!isMounted) return;

        const data = response.data?.data ?? response.data;
        const items = Array.isArray(data?.items) ? data.items : [];

        if (items.length > 0) {
          setInventoryItems(items.map(transformInventoryItem));
          setSummary({
            ...INITIAL_SUMMARY,
            ...(data?.summary ?? {}),
          });
        } else {
          setInventoryItems(DEMO_INVENTORY_ITEMS.map(transformInventoryItem));
          setSummary(DEMO_SUMMARY);
          setNotice("조회된 데이터가 없어 시연용 재고 데이터를 표시합니다.");
        }
      } catch (requestError) {
        if (!isMounted) return;

        console.error("재고 조회 실패:", {
          status: requestError.response?.status,
          response: requestError.response?.data,
          message: requestError.message,
        });

        setInventoryItems(DEMO_INVENTORY_ITEMS.map(transformInventoryItem));
        setSummary(DEMO_SUMMARY);
        setNotice("서버 연결에 실패하여 시연용 재고 데이터를 표시합니다.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  const lowStockCount = useMemo(
    () => inventoryItems.filter((item) => item.tone === "red").length,
    [inventoryItems]
  );

  const wasteItemCount = useMemo(
    () => inventoryItems.filter((item) => item.wasteQty > 0).length,
    [inventoryItems]
  );

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return inventoryItems;

    return inventoryItems.filter(
      (item) =>
        item.item.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    );
  }, [inventoryItems, searchTerm]);

  const handleWasteChange = (field, value) => {
    setWasteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWasteSave = () => {
    const quantity = Number(wasteForm.quantity);

    if (!wasteForm.itemId) {
      alert("폐기 품목을 선택해주세요.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("폐기 수량을 0보다 크게 입력해주세요.");
      return;
    }

    setInventoryItems((prevItems) =>
      prevItems.map((item) => {
        if (String(item.id) !== String(wasteForm.itemId)) return item;

        const updatedWasteQty = item.wasteQty + quantity;
        const updatedItem = {
          ...item,
          wasteQty: updatedWasteQty,
          stock: Math.max(0, item.stock - quantity),
        };

        return {
          ...updatedItem,
          ...getInventoryStatus({
            closingStock: updatedItem.stock,
            wasteQty: updatedWasteQty,
          }),
        };
      })
    );

    setWasteForm((prev) => ({
      ...prev,
      itemId: "",
      quantity: 0,
      memo: "",
    }));

    alert("폐기 내역이 화면에 반영되었습니다.");
  };

  return (
    <div className="page">
      <PageHeader
        title="재고"
        description={`${TARGET_DATE} 기준 품목별 재고와 폐기 내역을 확인합니다.`}
      />

      {loading && (
        <section className="inventory-note">
          서버의 최신 재고 데이터를 확인하고 있습니다.
        </section>
      )}

      {notice && <section className="inventory-note">{notice}</section>}

      <div className="stats-grid">
        <StatCard
          label="전체 관리 품목"
          value={`${inventoryItems.length}개`}
          sub={`${TARGET_DATE} 재고 조회 기준`}
        />

        <StatCard
          label="재고 부족 품목"
          value={`${lowStockCount}개`}
          sub="기말 재고 2 이하 기준"
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
          value={`${Number(summary.totalWasteKg ?? 0).toFixed(2)}kg`}
          sub={`탄소 ${Number(summary.totalWasteCarbonKg ?? 0).toFixed(
            1
          )}kgCO₂e · ₩${Number(
            summary.totalWasteCostKrw ?? 0
          ).toLocaleString()}`}
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-title">
          <div>
            <h3>{TARGET_DATE} 품목별 재고 현황</h3>
            <p>기말 재고, 실제 판매량, 폐기량을 기준으로 상태를 표시합니다.</p>
          </div>

          <input
            className="table-search"
            type="search"
            placeholder="품목 또는 카테고리 검색"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
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
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
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
                      type="button"
                      className="soft-btn"
                      onClick={() => {
                        setWasteForm((prev) => ({
                          ...prev,
                          itemId: String(item.id),
                          unit: item.unit,
                        }));
                        document
                          .querySelector(".waste-input-panel")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      재고 수정
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">검색 결과가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="waste-input-panel">
        <div>
          <h3>조회일 폐기 내역 입력</h3>
          <p>
            {TARGET_DATE}에 발생한 품목별 폐기 수량과 사유를 입력합니다.
            저장하면 현재 화면에 즉시 반영됩니다.
          </p>
        </div>

        <div className="waste-form">
          <label>
            품목 선택
            <select
              value={wasteForm.itemId}
              onChange={(event) => {
                const selectedId = event.target.value;
                const selectedItem = inventoryItems.find(
                  (item) => String(item.id) === selectedId
                );

                setWasteForm((prev) => ({
                  ...prev,
                  itemId: selectedId,
                  unit: selectedItem?.unit ?? prev.unit,
                }));
              }}
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
              min="0"
              step="0.1"
              value={wasteForm.quantity}
              onChange={(event) =>
                handleWasteChange("quantity", event.target.value)
              }
            />
          </label>

          <label>
            단위
            <select
              value={wasteForm.unit}
              onChange={(event) => handleWasteChange("unit", event.target.value)}
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
              onChange={(event) =>
                handleWasteChange("reason", event.target.value)
              }
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
              onChange={(event) =>
                handleWasteChange("wasteDate", event.target.value)
              }
            />
          </label>

          <label>
            메모
            <textarea
              rows="3"
              placeholder="폐기 원인을 입력하세요."
              value={wasteForm.memo}
              onChange={(event) => handleWasteChange("memo", event.target.value)}
            />
          </label>

          <button
            type="button"
            className="confirm-order-btn"
            onClick={handleWasteSave}
          >
            폐기 내역 저장
          </button>

          <div className="waste-feedback">
            <strong>예상 탄소 영향</strong>
            <p>
              입력한 폐기 수량은 현재 재고 현황에 즉시 반영되며, 서버 저장은
              백엔드 API 연결 후 적용됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inventory;
