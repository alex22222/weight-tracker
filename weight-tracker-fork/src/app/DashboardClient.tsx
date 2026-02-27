'use client';

import { useState, useTransition } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trash2, Plus, Settings, TrendingDown, TrendingUp, Minus, Activity, Target, Scale, Calendar } from 'lucide-react';

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

export default function DashboardClient(props: DashboardClientProps) {
  // 简化的 Dashboard 组件
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">体重管理 Dashboard</h1>
        <p className="text-slate-600">Dashboard 美化版本开发中...</p>
      </div>
    </div>
  );
}
