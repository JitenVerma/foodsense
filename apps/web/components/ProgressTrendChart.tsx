"use client";

import { useEffect, useState } from "react";

import type { ProgressRange } from "@foodsense/shared";

interface ProgressTrendChartProps {
  progress: ProgressRange;
}

interface SeriesDefinition {
  key: "calories_kcal" | "protein_g" | "carbs_g" | "fat_g";
  label: string;
  color: string;
}

const CALORIE_SERIES: SeriesDefinition = {
  key: "calories_kcal",
  label: "Calories",
  color: "var(--color-brand-highlight)",
};

const MACRO_SERIES: SeriesDefinition[] = [
  {
    key: "protein_g",
    label: "Protein",
    color: "var(--color-brand-accent)",
  },
  {
    key: "carbs_g",
    label: "Carbs",
    color: "var(--color-brand-secondary)",
  },
  {
    key: "fat_g",
    label: "Fat",
    color: "#ff8c42",
  },
];

function formatTickLabel(date: string, period: ProgressRange["period"]) {
  const [, month, day] = date.split("-");
  if (period === "weekly") {
    return `${day}/${month}`;
  }

  return Number(day) % 5 === 0 || day === "01" ? `${day}/${month}` : "";
}

function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  const firstPoint = points[0]!;
  const rest = points.slice(1);
  return `M ${firstPoint.x} ${firstPoint.y} ${rest
    .map((point) => `L ${point.x} ${point.y}`)
    .join(" ")}`;
}

function roundUpAxisMax(value: number, minimum: number) {
  const target = Math.max(minimum, value);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = magnitude / 2;
  return Math.ceil(target / step) * step;
}

function createChartGeometry(pointsCount: number) {
  const width = 920;
  const height = 220;
  const padding = { top: 24, right: 20, bottom: 40, left: 56 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const denominator = Math.max(1, pointsCount - 1);

  return {
    width,
    height,
    padding,
    innerWidth,
    innerHeight,
    xForIndex(index: number) {
      return padding.left + (index / denominator) * innerWidth;
    },
  };
}

function renderAxisLabel(value: number, unit?: string) {
  return unit ? `${Math.round(value)}${unit}` : `${Math.round(value)}`;
}

function MetricChart(props: {
  title: string;
  subtitle: string;
  unitLabel: string;
  series: SeriesDefinition[];
  progress: ProgressRange;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  maxValue: number;
}) {
  const {
    title,
    subtitle,
    unitLabel,
    series,
    progress,
    activeIndex,
    setActiveIndex,
    maxValue,
  } = props;
  const gridLines = 4;
  const geometry = createChartGeometry(progress.days.length);
  const yForValue = (value: number) =>
    geometry.padding.top +
    geometry.innerHeight -
    (value / Math.max(1, maxValue)) * geometry.innerHeight;

  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[rgba(6,10,24,0.72)] p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="arcade-label text-[var(--color-text-muted)]">{title}</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{unitLabel}</p>
      </div>

      <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="h-auto w-full">
        {Array.from({ length: gridLines + 1 }, (_, index) => {
          const ratio = index / gridLines;
          const y = geometry.padding.top + geometry.innerHeight * ratio;
          const axisValue = maxValue * (1 - ratio);

          return (
            <g key={index}>
              <line
                x1={geometry.padding.left}
                y1={y}
                x2={geometry.width - geometry.padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.09)"
                strokeDasharray="4 8"
              />
              <text
                x={geometry.padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize="11"
              >
                {renderAxisLabel(axisValue, unitLabel)}
              </text>
            </g>
          );
        })}

        <line
          x1={geometry.padding.left}
          y1={geometry.height - geometry.padding.bottom}
          x2={geometry.width - geometry.padding.right}
          y2={geometry.height - geometry.padding.bottom}
          stroke="rgba(255,255,255,0.2)"
        />

        {progress.days.map((day, index) => {
          const x = geometry.xForIndex(index);
          const label = formatTickLabel(day.date, progress.period);

          return (
            <g key={day.date}>
              <text
                x={x}
                y={geometry.height - geometry.padding.bottom + 22}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="11"
              >
                {label}
              </text>
              <rect
                x={x - geometry.innerWidth / Math.max(progress.days.length * 2, 6)}
                y={geometry.padding.top}
                width={geometry.innerWidth / Math.max(progress.days.length, 6)}
                height={geometry.innerHeight}
                fill="transparent"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              />
            </g>
          );
        })}

        {series.map((entry) => {
          const points = progress.days.map((day, index) => ({
            x: geometry.xForIndex(index),
            y: yForValue(day.macroTotals[entry.key]),
          }));
          const activePoint = points[activeIndex];

          return (
            <g key={entry.key}>
              <path
                d={buildPath(points)}
                fill="none"
                stroke={entry.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, index) => (
                <circle
                  key={`${entry.key}:${progress.days[index]?.date ?? index}`}
                  cx={point.x}
                  cy={point.y}
                  r={activeIndex === index ? 5 : 3}
                  fill={entry.color}
                  stroke="rgba(5,7,18,0.95)"
                  strokeWidth="2"
                />
              ))}
              {activePoint ? (
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="8"
                  fill="transparent"
                  stroke={entry.color}
                  strokeWidth="2"
                  opacity="0.5"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ProgressTrendChart({ progress }: ProgressTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState(progress.days.length - 1);
  const activeDay = progress.days[activeIndex] ?? progress.days.at(-1);
  const calorieMax = roundUpAxisMax(
    Math.max(...progress.days.map((day) => day.macroTotals.calories_kcal), 0),
    400,
  );
  const macroMax = roundUpAxisMax(
    Math.max(
      ...progress.days.flatMap((day) => [
        day.macroTotals.protein_g,
        day.macroTotals.carbs_g,
        day.macroTotals.fat_g,
      ]),
      0,
    ),
    40,
  );

  useEffect(() => {
    setActiveIndex(Math.max(0, progress.days.length - 1));
  }, [progress.days.length, progress.endDate, progress.period]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
        {[CALORIE_SERIES, ...MACRO_SERIES].map((series) => (
          <span
            key={series.key}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <MetricChart
            title="Calories"
            subtitle="Daily calorie intake on its own axis."
            unitLabel="kcal"
            series={[CALORIE_SERIES]}
            progress={progress}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            maxValue={calorieMax}
          />
          <MetricChart
            title="Macros"
            subtitle="Protein, carbs, and fat share a grams-based axis."
            unitLabel="g"
            series={MACRO_SERIES}
            progress={progress}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            maxValue={macroMax}
          />
        </div>

        {activeDay ? (
          <div className="h-fit rounded-2xl border border-[var(--color-border-subtle)] bg-[rgba(10,16,34,0.95)] p-4 text-sm shadow-[0_18px_42px_rgba(0,0,0,0.28)]">
            <p className="arcade-label text-[var(--color-brand-highlight)]">{activeDay.date}</p>
            <div className="mt-3 grid gap-2 text-[var(--color-text-secondary)]">
              <p className="flex items-center justify-between gap-4">
                <span>Calories</span>
                <span className="text-[var(--color-text-primary)]">
                  {activeDay.macroTotals.calories_kcal} kcal
                </span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Protein</span>
                <span className="text-[var(--color-text-primary)]">
                  {activeDay.macroTotals.protein_g} g
                </span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Carbs</span>
                <span className="text-[var(--color-text-primary)]">
                  {activeDay.macroTotals.carbs_g} g
                </span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Fat</span>
                <span className="text-[var(--color-text-primary)]">
                  {activeDay.macroTotals.fat_g} g
                </span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Meals logged</span>
                <span className="text-[var(--color-text-primary)]">{activeDay.mealCount}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>XP earned</span>
                <span className="text-[var(--color-text-primary)]">+{activeDay.xpEarned}</span>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
