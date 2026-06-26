// 현재는 Mock 데이터 사용
// 나중에 fetch로 교체 가능

import { orderAnalysisData } from '../data/mockData';

/**
 * 발주 분석 데이터 조회
 * 
 * 현재: Mock 데이터 반환
 * 나중에: API 호출로 교체
 * 
 * @param {Object} conditions - 분석 조건 (날씨, 행사 등)
 * @returns {Object} 발주 분석 결과
 */
export const fetchOrderAnalysis = async (conditions) => {
  // TODO: 나중에 이렇게 변경
  // const response = await fetch('https://api.zero-waste.com/analysis', {
  //   method: 'POST',
  //   body: JSON.stringify(conditions)
  // });
  // return response.json();

  // 현재는 Mock 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(orderAnalysisData);
    }, 300); // 네트워크 지연 시뮬레이션
  });
};

/**
 * 품목별 분석 데이터
 */
export const getOrderItems = () => {
  return orderAnalysisData.items;
};

/**
 * 위험 요소 데이터
 */
export const getOrderRisks = () => {
  return orderAnalysisData.risks;
};

/**
 * 발주 요약
 */
export const getOrderSummary = () => {
  return orderAnalysisData.summary;
};

/**
 * AI 인사이트
 */
export const getOrderInsights = () => {
  return orderAnalysisData.insights;
};