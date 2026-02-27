'use client';

import { useState } from 'react';
import LoginPage from './LoginPage';
import DashboardClient from './DashboardClient';

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

interface AuthWrapperProps {
  entries: WeightEntry[];
  settings: UserSettings;
  currentWeight: number;
  bmi: number;
  bmiInfo: { label: string; color: string };
  weightDiff: number;
  chartData: ChartData[];
}

export default function AuthWrapper(props: AuthWrapperProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <DashboardClient {...props} />;
}