import api from "./api";

export async function uploadDailySalesCsv(file, storeId = 1) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("storeId", storeId);

  const response = await api.post("/ingest/sales/daily", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-API-Key": "demo-key",
    },
  });

  return response.data.data;
}