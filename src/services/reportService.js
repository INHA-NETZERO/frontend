import { reportData } from '../data/mockData';

export const fetchReport = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(reportData);
    }, 300);
  });
};

export const getReportKpis = () => reportData.kpis;
export const getItemBreakdown = () => reportData.itemBreakdown;
export const getMonthlyTrend = () => reportData.monthlyTrend;
export const getReportPeriod = () => reportData.period;