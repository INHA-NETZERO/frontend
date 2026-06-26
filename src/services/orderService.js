import api from "./api";

/**
 * 발주 추천 목록 조회
 *
 * GET /api/v1/recommendations
 */
export const fetchOrderAnalysis = async (
  storeId = 1,
  date = new Date().toISOString().split("T")[0]
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
  date = new Date().toISOString().split("T")[0]
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