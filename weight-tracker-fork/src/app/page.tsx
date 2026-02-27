import { prisma } from "@/lib/db";
import { calculateBMI, getBMICategory } from "@/lib/utils";
import DashboardClient from "./DashboardClient";
import AuthWrapper from "./AuthWrapper";

async function getWeightEntries() {
  try {
    const entries = await prisma.weightEntry.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });
    return entries;
  } catch (error) {
    console.error("Error fetching weight entries:", error);
    return [];
  }
}

async function getUserSettings() {
  try {
    let settings = await prisma.userSettings.findFirst();
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          height: 170,
          targetWeight: 65,
        },
      });
    }
    return settings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return { height: 170, targetWeight: 65 };
  }
}

export default async function Home() {
  const entries = await getWeightEntries();
  const settings = await getUserSettings();
  
  const latestEntry = entries[0];
  const currentWeight = latestEntry?.weight || 0;
  const bmi = calculateBMI(currentWeight, settings.height);
  const bmiInfo = getBMICategory(bmi);
  const weightDiff = currentWeight - settings.targetWeight;
  
  // Prepare chart data (last 7 entries for visualization)
  const chartData = [...entries].reverse().slice(-7).map(entry => ({
    date: new Date(entry.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
  }));

  return (
    <AuthWrapper 
      entries={entries}
      settings={settings}
      currentWeight={currentWeight}
      bmi={bmi}
      bmiInfo={bmiInfo}
      weightDiff={weightDiff}
      chartData={chartData}
    />
  );
}