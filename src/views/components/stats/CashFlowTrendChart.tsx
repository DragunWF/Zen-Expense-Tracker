import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, {
  Path,
  Polyline,
  Circle as SvgCircle,
  Line,
  Text as SvgText,
} from "react-native-svg";
import { TrendPoint } from "../../../controllers/useStatsController";
import { APP_CONFIG } from "../../../core/constants";
import { formatAmount } from "../../../core/helpers";

interface CashFlowTrendChartProps {
  points: TrendPoint[];
}

const CHART_W = 320;
const CHART_H = 140;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

// Normalize a yNorm (0–1) to SVG Y coordinate (inverted, 0 at top)
function toSvgY(yNorm: number): number {
  return PAD_TOP + PLOT_H * (1 - yNorm);
}

function toSvgX(xNorm: number): number {
  return PAD_LEFT + xNorm * PLOT_W;
}

function buildPolylinePoints(
  pts: TrendPoint[],
  yKey: "yIncomeNorm" | "yExpensesNorm",
): string {
  return pts
    .map((p) => `${toSvgX(p.xNorm).toFixed(1)},${toSvgY(p[yKey]).toFixed(1)}`)
    .join(" ");
}

// Y-axis labels: compute 3 ticks
function buildYTicks(pts: TrendPoint[]): { yNorm: number; label: string }[] {
  const maxVal = Math.max(...pts.flatMap((p) => [p.income, p.expenses]), 1);
  return [0, 0.5, 1].map((n) => ({
    yNorm: n,
    label: `${APP_CONFIG.currencySymbol}${formatAmount(Math.round(maxVal * n))}`,
  }));
}

export default function CashFlowTrendChart({
  points,
}: CashFlowTrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <View className="mx-5 mb-6 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-4 items-center">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 self-start">
          Cash Flow Trends
        </Text>
        <Text className="text-slate-500 text-sm">No data for this period.</Text>
      </View>
    );
  }

  const incomePoints = buildPolylinePoints(points, "yIncomeNorm");
  const expensePoints = buildPolylinePoints(points, "yExpensesNorm");
  const yTicks = buildYTicks(points);
  const selectedPt = selectedIndex !== null ? points[selectedIndex] : null;

  return (
    <View className="mx-5 mb-6 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 pt-4 pb-4">
      {/* Section label */}
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
        Cash Flow Trends
      </Text>

      {/* Legend pills */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-row items-center">
          <View className="w-3 h-0.5 bg-emerald-400 mr-1.5" />
          <Text className="text-slate-400 text-[10px] font-semibold">
            Income
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-0.5 bg-rose-400 mr-1.5" />
          <Text className="text-slate-400 text-[10px] font-semibold">
            Expenses
          </Text>
        </View>
      </View>

      {/* SVG Line Chart */}
      <Svg
        width={CHART_W}
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      >
        {/* Y-axis grid lines + labels */}
        {yTicks.map(({ yNorm, label }) => {
          const y = toSvgY(yNorm);
          return (
            <React.Fragment key={yNorm}>
              <Line
                x1={PAD_LEFT}
                y1={y}
                x2={CHART_W - PAD_RIGHT}
                y2={y}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <SvgText
                x={PAD_LEFT - 4}
                y={y + 4}
                fill="#475569"
                fontSize={7}
                textAnchor="end"
              >
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={toSvgX(p.xNorm)}
            y={CHART_H - 4}
            fill="#475569"
            fontSize={7}
            textAnchor="middle"
          >
            {p.label}
          </SvgText>
        ))}

        {/* Income line */}
        <Polyline
          points={incomePoints}
          fill="none"
          stroke="#34d399"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Expense line */}
        <Polyline
          points={expensePoints}
          fill="none"
          stroke="#fb7185"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Interactive nodes — Income */}
        {points.map((p, i) => (
          <SvgCircle
            key={`income-node-${i}`}
            cx={toSvgX(p.xNorm)}
            cy={toSvgY(p.yIncomeNorm)}
            r={selectedIndex === i ? 5 : 3.5}
            fill={selectedIndex === i ? "#34d399" : "#0f172a"}
            stroke="#34d399"
            strokeWidth={2}
            onPress={() => setSelectedIndex(selectedIndex === i ? null : i)}
          />
        ))}

        {/* Interactive nodes — Expenses */}
        {points.map((p, i) => (
          <SvgCircle
            key={`exp-node-${i}`}
            cx={toSvgX(p.xNorm)}
            cy={toSvgY(p.yExpensesNorm)}
            r={selectedIndex === i ? 5 : 3.5}
            fill={selectedIndex === i ? "#fb7185" : "#0f172a"}
            stroke="#fb7185"
            strokeWidth={2}
            onPress={() => setSelectedIndex(selectedIndex === i ? null : i)}
          />
        ))}
      </Svg>

      {/* Tooltip card */}
      {selectedPt && (
        <View className="mt-2 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
            {selectedPt.label}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="text-emerald-400 text-xs font-bold">
                {APP_CONFIG.currencySymbol}
                {formatAmount(selectedPt.income)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
              <Text className="text-rose-400 text-xs font-bold">
                {APP_CONFIG.currencySymbol}
                {formatAmount(selectedPt.expenses)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
