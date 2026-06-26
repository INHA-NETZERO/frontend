import api from "./api";

const getOneYearAgoDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const ORDER_TARGET_DATE = getOneYearAgoDate();

/**
 * 발주 추천 목록 조회
 *
 * GET /api/v1/recommendations
 */
export const fetchOrderAnalysis = async (
  storeId = 1,
  date = ORDER_TARGET_DATE
) => {
  try {
    const response = await api.get("/recommendations", {
      params: {
        storeId,
        date,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("발주 추천 조회 실패:", error);
    throw error;
  }
};

/**
 * 품목별 추천 목록
 */
export const getOrderItems = async (
  storeId = 1,
  date = ORDER_TARGET_DATE
) => {
  const data = await fetchOrderAnalysis(storeId, date);
  return data.items;
};

/**
 * 발주 추천 상세 조회
 */
export const getOrderDetail = async (id) => {
  try {
    const response = await api.get(`/recommendations/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("상세 조회 실패:", error);
    throw error;
  }
};

/**
 * 실제 발주량 저장
 */
export const saveActualOrder = async (payload) => {
  try {
    const response = await api.put(
      "/recommendations/actual",
      payload,
      {
        headers: {
          "X-API-Key": "demo-key",
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("실제 발주량 저장 실패:", error);
    throw error;
  }
};