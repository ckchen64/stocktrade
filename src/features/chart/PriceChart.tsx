import React, { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CandleData } from './types';

interface PriceChartProps {
  chartDataList: CandleData[];
  visibleCount?: number;
}

interface PriceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const DEFAULT_VISIBLE_COUNT = 29;

function PriceTooltip({
  active,
  payload,
  label,
}: PriceTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0]?.payload;

  if (!row) {
    return null;
  }

  const formatPrice = (value: number) =>
    Number(value).toLocaleString('ko-KR');

  return (
    <div
      style={{
        minWidth: '150px',
        padding: '10px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
        textAlign: 'left',
        fontSize: '12px',
        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          marginBottom: '4px',
          fontWeight: 700,
          color: '#343a40',
        }}
      >
        {String(label ?? row.date)}
      </div>

      <div>시가: {formatPrice(row.open)}</div>
      <div>고가: {formatPrice(row.high)}</div>
      <div>저가: {formatPrice(row.low)}</div>
      <div>종가: {formatPrice(row.close)}</div>
    </div>
  );
}

export default function PriceChart({
  chartDataList,
  visibleCount = DEFAULT_VISIBLE_COUNT,
}: PriceChartProps): React.JSX.Element {
  const visibleData = useMemo(() => {
    if (!Array.isArray(chartDataList) || chartDataList.length === 0) {
      return [];
    }

    const safeVisibleCount =
      Number.isFinite(visibleCount) && visibleCount > 0
        ? Math.floor(visibleCount)
        : DEFAULT_VISIBLE_COUNT;

    return chartDataList.slice(-safeVisibleCount).map((item) => {
      const isDoji = item.open === item.close;

      const openClose = [
        Math.min(item.open, item.close),
        Math.max(item.open, item.close),
      ];

      // 시가와 종가가 같은 십자형(Doji)도 화면에서 보이도록 최소 높이를 확보합니다.
      if (isDoji) {
        openClose[1] = openClose[0] + 1;
      }

      return {
        ...item,
        openClose,
        highLow: [item.low, item.high],
        isUp: item.close >= item.open,
      };
    });
  }, [chartDataList, visibleCount]);

  const priceDomain = useMemo<[number, number]>(() => {
    if (visibleData.length === 0) {
      return [0, 1];
    }

    const lows = visibleData.map((item) => item.low);
    const highs = visibleData.map((item) => item.high);

    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const range = Math.max(1, max - min);
    const padding = range * 0.08;

    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [visibleData]);

  const volumeMax = useMemo(() => {
    if (visibleData.length === 0) {
      return 1;
    }

    return Math.max(
      1,
      ...visibleData.map((item) =>
        Number.isFinite(item.volume) ? item.volume : 0
      )
    );
  }, [visibleData]);

  const xAxisTicks = useMemo(() => {
    if (visibleData.length === 0) {
      return [];
    }

    const firstDate = visibleData[0].date;
    const lastDate = visibleData[visibleData.length - 1].date;

    return firstDate === lastDate ? [firstDate] : [firstDate, lastDate];
  }, [visibleData]);

  if (visibleData.length === 0) {
    return (
      <div
        style={{
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          border: '1px solid #dee2e6',
          borderRadius: '12px',
          backgroundColor: '#fff',
        }}
      >
        가격 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #dee2e6',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
          }}
        >
          가격 차트
        </h3>

        <span
          style={{
            fontSize: '12px',
            color: '#6c757d',
          }}
        >
          최근 {visibleData.length}개
        </span>
      </div>

      {/* =========================================================
          1. OHLC 캔들 차트
          - highLow: 저가 ~ 고가
          - openClose: 시가 ~ 종가
          ========================================================= */}
      <ResponsiveContainer width="100%" height={310}>
        <ComposedChart
          data={visibleData}
          syncId="stock-chart-sync"
          margin={{ top: 10, right: 20, left: 5, bottom: 0 }}
          barGap={-6}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />

          <YAxis
            domain={priceDomain}
            width={68}
            tickFormatter={(value) => Number(value).toLocaleString()}
          />

          <Tooltip content={<PriceTooltip />} />

          {/* 저가 ~ 고가의 바늘선 */}
          <Bar
            name="저가-고가"
            dataKey="highLow"
            barSize={2}
            tooltipType="none"
          >
            {visibleData.map((entry, index) => (
              <Cell
                key={`high-low-${index}`}
                fill={entry.isUp ? '#dc3545' : '#0d6efd'}
              />
            ))}
          </Bar>

          {/* 시가 ~ 종가의 캔들 몸통 */}
          <Bar name="시가-종가" dataKey="openClose" barSize={10}>
            {visibleData.map((entry, index) => (
              <Cell
                key={`open-close-${index}`}
                fill={entry.isUp ? '#dc3545' : '#0d6efd'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>

      {/* =========================================================
          2. 거래량 막대 차트
          - 가격 캔들과 동일한 X축(date)을 사용
          - X축 글자는 현재 구간의 시작일/종료일만 표시
          ========================================================= */}
      <ResponsiveContainer width="100%" height={120}>
        <ComposedChart
          data={visibleData}
          syncId="stock-chart-sync"
          margin={{ top: 0, right: 20, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="date"
            ticks={xAxisTicks}
            interval={0}
            tick={{ fontSize: 10 }}
          />

          <YAxis
            width={68}
            domain={[0, volumeMax]}
            tickFormatter={(value) => {
              const numericValue = Number(value);

              if (numericValue >= 1_000_000) {
                return `${(numericValue / 1_000_000).toFixed(1)}M`;
              }

              if (numericValue >= 1_000) {
                return `${(numericValue / 1_000).toFixed(0)}K`;
              }

              return `${numericValue}`;
            }}
          />

          <Tooltip
            formatter={(value: any) => [
              Number(value).toLocaleString('ko-KR'),
              '거래량',
            ]}
            labelFormatter={(label) => `일자: ${label}`}
          />

          <Bar name="거래량" dataKey="volume" barSize={10}>
            {visibleData.map((entry, index) => (
              <Cell
                key={`volume-${index}`}
                fill={entry.isUp ? '#dc3545' : '#0d6efd'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
