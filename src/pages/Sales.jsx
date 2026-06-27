import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import api from "../services/api";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getKoreanDayOfWeek = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  return days[date.getDay()];
};

const SALES_TARGET_DATE = getOneYearAgoDate();
const SALES_TARGET_DAY = getKoreanDayOfWeek(SALES_TARGET_DATE);

const previewRows = [
  {
    date: SALES_TARGET_DATE,
    day: SALES_TARGET_DAY,
    item: "우유",
    type: "원재료",
    qty: 11,
    event: "아니오",
    newMenu: "아니오",
    soldOut: "예",
    soldOutTime: "15:30",
    memo: "비 예보로 방문 감소",
  },
  {
    date: SALES_TARGET_DATE,
    day: SALES_TARGET_DAY,
    item: "샌드위치",
    type: "완제품",
    qty: 23,
    event: "예",
    newMenu: "아니오",
    soldOut: "아니오",
    soldOutTime: "",
    memo: "점심 수요 증가",
  },
  {
    date: SALES_TARGET_DATE,
    day: SALES_TARGET_DAY,
    item: "말차라떼",
    type: "음료",
    qty: 15,
    event: "아니오",
    newMenu: "예",
    soldOut: "아니오",
    soldOutTime: "",
    memo: "신메뉴 반응 확인",
  },
];

function BoolBadge({ value }) {
  return (
    <span className={value === "예" ? "bool-badge yes" : "bool-badge no"}>
      {value}
    </span>
  );
}

function Sales() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const menuMetaList = previewRows.map((row) => ({
    itemName: row.item,
    event_flag: row.event === "예",
    new_flag: row.newMenu === "예",
    soldout_flag: row.soldOut === "예",
    soldout_time: row.soldOut === "예" ? row.soldOutTime : null,
  }));

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUploadReview = async () => {
    if (!selectedFile) {
      alert("CSV 파일을 선택해주세요.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("storeId", "1");
      formData.append("items", JSON.stringify(menuMetaList));

      const response = await api.post("/ingest/sales/daily", formData, {
        headers: {
          "X-API-Key": import.meta.env.VITE_API_KEY || "demo-key",
        },
      });

      const accepted = response.data?.data?.accepted ?? 0;
      const rejected = response.data?.data?.rejected ?? 0;
      const appliedDate =
        response.data?.data?.appliedDate ?? SALES_TARGET_DATE;

      alert(
        `${appliedDate} 판매 데이터 업로드 완료\n반영 ${accepted}건 · 거부 ${rejected}건`
      );
    } catch (error) {
      console.error("판매 데이터 업로드 실패:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.error?.message ??
        "판매 데이터 업로드에 실패했습니다.";

      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="판매 데이터"
        description={`${SALES_TARGET_DATE} 기준 하루치 판매 CSV를 업로드하고 품목별 판매 상황을 검토합니다.`}
      />

      <section className="upload-flow">
        <div className="flow-step active">
          <UploadCloud size={18} />
          <span>파일 선택</span>
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <FileCheck2 size={18} />
          <span>검토</span>
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <AlertTriangle size={18} />
          <span>오류 확인</span>
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <CheckCircle2 size={18} />
          <span>등록 완료</span>
        </div>
      </section>

      <section className="sales-upload-hero">
        <div className="sales-upload-left">
          <div className="upload-icon">
            <UploadCloud size={32} />
          </div>

          <div>
            <span className="section-kicker">Daily Sales CSV</span>

            <h3>{SALES_TARGET_DATE} 판매 데이터를 업로드하세요</h3>

            <p>
              날짜, 품목, 판매수량과 함께 행사·신메뉴·재고소진 여부 및
              매진 시각을 검토합니다. CSV의 날짜는 조회 기준일인{" "}
              {SALES_TARGET_DATE}로 입력해주세요.
            </p>
          </div>

          <label className="file-drop upgraded">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
            />

            <strong>
              {selectedFile
                ? selectedFile.name
                : "CSV 파일을 선택하거나 끌어다 놓으세요"}
            </strong>

            <span>
              지원 형식: .csv · {SALES_TARGET_DATE} 하루치 판매 데이터
            </span>
          </label>

          <button
            type="button"
            className="confirm-order-btn sales-upload-btn"
            onClick={handleUploadReview}
            disabled={uploading}
          >
            {uploading ? "업로드 중..." : "업로드 검토"}
          </button>
        </div>

        <div className="sales-requirement-card">
          <div className="requirement-header">
            <strong>필수 컬럼</strong>
            <span>9개</span>
          </div>

          <div className="required-list upgraded">
            {[
              "날짜",
              "요일",
              "품목",
              "구분",
              "판매수량",
              "행사",
              "신메뉴",
              "재고소진",
              "매진시각",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="optional-box upgraded">
            <strong>선택 컬럼</strong>
            <span>비고_시나리오</span>
          </div>
        </div>
      </section>

      <section className="panel sales-preview-panel">
        <div className="panel-title">
          <div>
            <h3>{SALES_TARGET_DATE} 업로드 데이터 미리보기</h3>
            <p>백엔드 업로드 형식에 맞는 하루치 판매 데이터 예시입니다.</p>
          </div>

          <span>예시 3행</span>
        </div>

        <div className="sales-table-wrap">
          <table className="sales-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>요일</th>
                <th>품목</th>
                <th>구분</th>
                <th>판매수량</th>
                <th>행사</th>
                <th>신메뉴</th>
                <th>재고소진</th>
                <th>매진시각</th>
                <th>비고_시나리오</th>
              </tr>
            </thead>

            <tbody>
              {previewRows.map((row) => (
                <tr key={`${row.date}-${row.item}`}>
                  <td>{row.date}</td>
                  <td>{row.day}</td>

                  <td>
                    <strong>{row.item}</strong>
                  </td>

                  <td>{row.type}</td>
                  <td>{row.qty}</td>

                  <td>
                    <BoolBadge value={row.event} />
                  </td>

                  <td>
                    <BoolBadge value={row.newMenu} />
                  </td>

                  <td>
                    <BoolBadge value={row.soldOut} />
                  </td>

                  <td>{row.soldOut === "예" ? row.soldOutTime : "-"}</td>
                  <td>{row.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="upload-result-grid">
        <div className="result-card success">
          <CheckCircle2 size={22} />

          <div>
            <strong>검토 완료 예시</strong>
            <p>accepted 128행 · rejected 0행 · 업로드 가능</p>
          </div>
        </div>

        <div className="result-card error">
          <AlertTriangle size={22} />

          <div>
            <strong>오류 예시</strong>

            <ul>
              <li>필수 항목 판매수량 값이 비어 있습니다.</li>
              <li>
                행사, 신메뉴, 재고소진은 예 또는 아니오만 입력할 수
                있습니다.
              </li>
              <li>
                재고소진이 ‘예’인 경우 매진시각을 반드시 입력해야 합니다.
              </li>
              <li>{SALES_TARGET_DATE} 이외의 날짜가 포함되어 있습니다.</li>
              <li>여러 날짜의 데이터가 포함되어 있습니다.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sales;
