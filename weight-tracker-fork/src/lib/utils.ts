// BMI 计算
export function calculateBMI(weight: number, height: number): number {
  if (height <= 0 || weight <= 0) return 0;
  return Number((weight / ((height / 100) * (height / 100))).toFixed(2));
}

// BMI 分类
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi <= 0) return { label: '暂无数据', color: 'text-slate-400' };
  if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-500' };
  if (bmi < 24) return { label: '正常', color: 'text-emerald-500' };
  if (bmi < 28) return { label: '超重', color: 'text-yellow-500' };
  return { label: '肥胖', color: 'text-red-500' };
}

// BMI 颜色配置
export function getBMIColors(bmi: number) {
  if (bmi <= 0) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
  if (bmi < 18.5) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
  if (bmi < 24) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
  if (bmi < 28) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
  return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
}

// 日期格式化
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 短日期格式
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

// 体重变化趋势
export function getWeightTrend(current: number, previous: number): {
  diff: number;
  percent: number;
  direction: 'up' | 'down' | 'same';
} {
  const diff = current - previous;
  const percent = previous > 0 ? (diff / previous) * 100 : 0;
  return {
    diff,
    percent: Number(percent.toFixed(2)),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
  };
}

// 生成图表数据
export function generateChartData(
  entries: Array<{ date: Date; weight: number }>,
  limit: number = 7
): Array<{ date: string; weight: number }> {
  return [...entries]
    .reverse()
    .slice(-limit)
    .map((e) => ({
      date: formatShortDate(e.date),
      weight: e.weight,
    }));
}

// 计算统计数据
export function calculateStats(entries: Array<{ weight: number }>) {
  if (entries.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const weights = entries.map((e) => e.weight);
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  return {
    avg: Number(avg.toFixed(1)),
    min,
    max,
    count: entries.length,
  };
}
