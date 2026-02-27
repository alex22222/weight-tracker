'use client';

import { useState, useTransition } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Trash2, Plus, Settings, TrendingDown, TrendingUp, Minus, Activity, Target, Scale, Calendar, ChevronRight, User, LogOut } from 'lucide-react';

interface WeightEntry {
  id: number;
  weight: number;
  note: string | null;
  date: Date;
  createdAt: Date;
}

interface UserSettings {
  height: number;
  targetWeight: number;
}

interface ChartData {
  date: string;
  weight: number;
}

interface DashboardClientProps {
  entries: WeightEntry[];
  settings: UserSettings;
  currentWeight: number;
  bmi: number;
  bmiInfo: { label: string; color: string };
  weightDiff: number;
  chartData: ChartData[];
}

// BMI 颜色映射
const getBMIColor = (bmi: number) => {
  if (bmi <= 0) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
  if (bmi < 18.5) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
  if (bmi < 24) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
  if (bmi < 28) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
  return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
};

// 趋势图标
const TrendIcon = ({ diff }: { diff: number }) => {
  if (diff > 0) return <TrendingUp className="w-4 h-4" />;
  if (diff < 0) return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
};

export default function DashboardClient({
  entries: initialEntries,
  settings: initialSettings,
  currentWeight: initialCurrentWeight,
  bmi: initialBmi,
  bmiInfo: initialBmiInfo,
  weightDiff: initialWeightDiff,
  chartData: initialChartData,
}: DashboardClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [settings, setSettings] = useState(initialSettings);
  const [currentWeight, setCurrentWeight] = useState(initialCurrentWeight);
  const [bmi, setBmi] = useState(initialBmi);
  const [bmiInfo, setBmiInfo] = useState(initialBmiInfo);
  const [weightDiff, setWeightDiff] = useState(initialWeightDiff);
  const [chartData, setChartData] = useState(initialChartData);

  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPending, startTransition] = useTransition();
  const [showSettings, setShowSettings] = useState(false);
  const [height, setHeight] = useState(String(settings.height));
  const [targetWeight, setTargetWeight] = useState(String(settings.targetWeight));

  const bmiColors = getBMIColor(bmi);

  const calculateBMI = (w: number, h: number) => {
    if (h <= 0 || w <= 0) return 0;
    return Number((w / ((h / 100) * (h / 100))).toFixed(2));
  };

  const getBMICategory = (b: number) => {
    if (b < 18.5) return { label: '偏瘦', color: 'text-blue-500' };
    if (b < 24) return { label: '正常', color: 'text-emerald-500' };
    if (b < 28) return { label: '超重', color: 'text-yellow-500' };
    return { label: '肥胖', color: 'text-red-500' };
  };

  const handleAddEntry = async () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      alert('请输入有效的体重值');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/weight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: weightNum, note, date: new Date(date) }),
        });

        if (res.ok) {
          const newEntry = await res.json();
          const updatedEntries = [newEntry, ...entries];
          setEntries(updatedEntries);
          setCurrentWeight(weightNum);
          const newBmi = calculateBMI(weightNum, settings.height);
          setBmi(newBmi);
          setBmiInfo(getBMICategory(newBmi));
          setWeightDiff(weightNum - settings.targetWeight);

          const newChartData = [...updatedEntries].reverse().slice(-7).map(e => ({
            date: new Date(e.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            weight: e.weight,
          }));
          setChartData(newChartData);

          setWeight('');
          setNote('');
          setDate(new Date().toISOString().split('T')[0]);
        }
      } catch (error) {
        console.error('Error adding entry:', error);
        alert('添加失败，请重试');
      }
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/weight?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          const updatedEntries = entries.filter(e => e.id !== id);
          setEntries(updatedEntries);

          if (updatedEntries.length > 0) {
            const latest = updatedEntries[0];
            setCurrentWeight(latest.weight);
            const newBmi = calculateBMI(latest.weight, settings.height);
            setBmi(newBmi);
            setBmiInfo(getBMICategory(newBmi));
            setWeightDiff(latest.weight - settings.targetWeight);

            const newChartData = [...updatedEntries].reverse().slice(-7).map(e => ({
              date: new Date(e.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
              weight: e.weight,
            }));
            setChartData(newChartData);
          } else {
            setCurrentWeight(0);
            setBmi(0);
            setBmiInfo({ label: '暂无数据', color: 'text-slate-400' });
            setWeightDiff(0);
            setChartData([]);
          }
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('删除失败，请重试');
      }
    });
  };

  const handleUpdateSettings = async () => {
    const heightNum = parseFloat(height);
    const targetNum = parseFloat(targetWeight);

    if (isNaN(heightNum) || heightNum <= 0 || isNaN(targetNum) || targetNum <= 0) {
      alert('请输入有效的数值');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ height: heightNum, targetWeight: targetNum }),
        });

        if (res.ok) {
          const newSettings = await res.json();
          setSettings(newSettings);

          if (currentWeight > 0) {
            const newBmi = calculateBMI(currentWeight, heightNum);
            setBmi(newBmi);
            setBmiInfo(getBMICategory(newBmi));
            setWeightDiff(currentWeight - targetNum);
          }

          setShowSettings(false);
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        alert('更新失败，请重试');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* 顶部导航 */}
      <header className="glass sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">体重管理器</h1>
                <p className="text-xs text-slate-500">Weight Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-slate-100 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 当前体重 */}
          <div className="stat-card card-hover animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">当前体重</span>
              </div>
              {weightDiff !== 0 && (
                <span className={`badge ${weightDiff > 0 ? 'badge-danger' : 'badge-success'}`}>
                  <TrendIcon diff={weightDiff} />
                  <span className="ml-1">{Math.abs(weightDiff).toFixed(1)} kg</span>
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-800">
                {currentWeight > 0 ? currentWeight.toFixed(1) : '--'}
              </span>
              <span className="text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">目标: {settings.targetWeight} kg</p>
          </div>

          {/* BMI */}
          <div className={`stat-card card-hover animate-fade-in delay-100 border-2 ${bmiColors.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${bmiColors.bg} rounded-xl flex items-center justify-center`}>
                  <Target className={`w-5 h-5 ${bmiColors.text}`} />
                </div>
                <span className="text-sm font-medium text-slate-600">BMI 指数</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${bmiColors.text}`}>
                {bmi > 0 ? bmi : '--'}
              </span>
            </div>
            <p className={`text-xs mt-2 ${bmiColors.text}`}>{bmiInfo.label}</p>
          </div>

          {/* 目标体重 */}
          <div className="stat-card card-hover animate-fade-in delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">目标体重</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-800">{settings.targetWeight}</span>
              <span className="text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">身高: {settings.height} cm</p>
          </div>
        </div>

        {/* 添加记录表单 */}
        <div className="glass rounded-2xl p-6 animate-fade-in delay-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            记录体重
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例如: 70.5"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">备注 (可选)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如: 早餐后"
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddEntry}
                disabled={isPending || !weight}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    添加记录
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 图表 */}
        {chartData.length > 0 && (
          <div className="chart-container animate-fade-in delay-400">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">体重趋势</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)} kg`, '体重']}
                  />
                  <ReferenceLine y={settings.targetWeight} stroke="#10b981" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        <div className="glass rounded-2xl p-6 animate-fade-in delay-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">历史记录</h2>
            <span className="text-sm text-slate-500">共 {entries.length} 条记录</span>
          </div>

          {showSettings && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="font-medium text-slate-800 mb-3">个人设置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">身高 (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">目标体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateSettings}
                disabled={isPending}
                className="btn-primary mt-4"
              >
                {isPending ? '保存中...' : '保存设置'}
              </button>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Scale className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>暂无记录，点击上方"添加记录"开始追踪您的体重</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>体重</th>
                    <th>备注</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        {new Date(entry.date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="font-medium">{entry.weight.toFixed(1)} kg</td>
                      <td className="text-slate-500">{entry.note || '-'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="btn-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
