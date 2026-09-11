import React, { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CandleData } from './types';

export type PriceIndicatorKey =
  | 'sma05'
  | 'sma20'
  | 'sma60'
  | 'volume';

export type SmaPeriodKey =
  | 'sma05'
  | 'sma20'
  | 'sma60';

interface PriceChartProps {
  chartDataList: CandleData[];
  visibleCount?: number;

  optionsOpen: boolean;
  onToggleOptions: () => void;

  enabledIndicators: Record<PriceIndicatorKey, boolean>;

  onToggleIndicator: (
    indicator: PriceIndicatorKey
  ) => void;

  smaPeriods: Record<SmaPeriodKey, number>;

  onSmaPeriodChange: (
    indicator: SmaPeriodKey,
    value: number
  ) => void;
}

interface PriceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const DEFAULT_VISIBLE_COUNT = 29;

const SMA_BASE_PERIODS: Record<SmaPeriodKey, number> = {
  sma05: 5,
  sma20: 20,
  sma60: 60,
};

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

  optionsOpen,
  onToggleOptions,

  enabledIndicators,
  onToggleIndicator,

  smaPeriods,
  onSmaPeriodChange,
}: PriceChartProps): React.JSX.Element {

  const visibleData = useMemo(() => {
    if (
      !Array.isArray(chartDataList) ||
      chartDataList.length === 0
    ) {
      return [];
    }

    const safeVisibleCount =
      Number.isFinite(visibleCount) &&
        visibleCount > 0
        ? Math.floor(visibleCount)
        : DEFAULT_VISIBLE_COUNT;

    return chartDataList
      .slice(-safeVisibleCount)
      .map((item) => {
        const isDoji =
          item.open === item.close;

        const openClose = [
          Math.min(item.open, item.close),
          Math.max(item.open, item.close),
        ];

        if (isDoji) {
          openClose[1] =
            openClose[0] + 1;
        }

        return {
          ...item,
          openClose,
          highLow: [
            item.low,
            item.high,
          ],
          isUp:
            item.close >= item.open,
        };
      });
  }, [chartDataList, visibleCount]);

  const priceDomain =
    useMemo<[number, number]>(() => {
      if (visibleData.length === 0) {
        return [0, 1];
      }

      const priceValues: number[] = [];

      visibleData.forEach((item) => {
        priceValues.push(
          item.low,
          item.high
        );

        if (
          enabledIndicators.sma05 &&
          typeof item.sma05 === 'number'
        ) {
          priceValues.push(item.sma05);
        }

        if (
          enabledIndicators.sma20 &&
          typeof item.sma20 === 'number'
        ) {
          priceValues.push(item.sma20);
        }

        if (
          enabledIndicators.sma60 &&
          typeof item.sma60 === 'number'
        ) {
          priceValues.push(item.sma60);
        }
      });

      const min = Math.min(
        ...priceValues
      );

      const max = Math.max(
        ...priceValues
      );

      const range =
        Math.max(1, max - min);

      const padding =
        range * 0.08;

      return [
        Math.floor(min - padding),
        Math.ceil(max + padding),
      ];
    }, [
      visibleData,
      enabledIndicators.sma05,
      enabledIndicators.sma20,
      enabledIndicators.sma60,
    ]);

  const volumeMax = useMemo(() => {
    if (visibleData.length === 0) {
      return 1;
    }

    return Math.max(
      1,
      ...visibleData.map((item) =>
        Number.isFinite(item.volume)
          ? item.volume
          : 0
      )
    );
  }, [visibleData]);

  const xAxisTicks = useMemo(() => {
    if (visibleData.length === 0) {
      return [];
    }

    const firstDate =
      visibleData[0].date;

    const lastDate =
      visibleData[
        visibleData.length - 1
      ].date;

    return firstDate === lastDate
      ? [firstDate]
      : [firstDate, lastDate];
  }, [visibleData]);

  const renderSmaOption = (
    indicator: SmaPeriodKey,
    label: string
  ) => {
    const baseValue =
      SMA_BASE_PERIODS[indicator];

    const currentValue =
      smaPeriods[indicator];

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '220px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            minWidth: '75px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={
              enabledIndicators[
              indicator
              ]
            }
            onChange={() =>
              onToggleIndicator(
                indicator
              )
            }
          />

          {label}
        </label>

        <span
          style={{
            fontSize: '12px',
            color: '#6c757d',
          }}
        >
          기간
        </span>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {baseValue}
        </span>

        <span>/</span>

        <input
          type="number"
          min={1}
          value={currentValue}
          onChange={(event) => {
            const value =
              Number(
                event.target.value
              );

            if (
              Number.isFinite(value) &&
              value > 0
            ) {
              onSmaPeriodChange(
                indicator,
                Math.floor(value)
              );
            }
          }}
          style={{
            width: '55px',
            padding: '4px 6px',
            border:
              '1px solid #ced4da',
            borderRadius: '5px',
            fontSize: '12px',
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '12px',
        border:
          '1px solid #dee2e6',
      }}
    >
      {/* =====================================================
          1행 : 제목 + 선택버튼 + 최근 데이터 개수
         ===================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            whiteSpace: 'nowrap',
          }}
        >
          차트 1 : 가격
        </h3>

        <button
          type="button"
          onClick={onToggleOptions}
          style={{
            border:
              '1px solid #0d6efd',
            borderRadius: '7px',
            padding: '6px 10px',
            backgroundColor: '#fff',
            color: '#0d6efd',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          보조지표 선택{' '}
          {optionsOpen ? '▲' : '▼'}
        </button>

        <div
          style={{
            flex: 1,
          }}
        />

        <span
          style={{
            fontSize: '12px',
            color: '#6c757d',
            whiteSpace: 'nowrap',
          }}
        >
          최근 {visibleData.length}개
        </span>
      </div>

      {/* =====================================================
          차트 1 선택 영역
         ===================================================== */}
      {optionsOpen && (
        <div
          style={{
            padding: '12px',
            marginBottom: '12px',
            border:
              '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor:
              '#f8f9fa',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px 18px',
              alignItems: 'center',
            }}
          >
            {renderSmaOption(
              'sma05',
              'SMA 5'
            )}

            {renderSmaOption(
              'sma20',
              'SMA 20'
            )}

            {renderSmaOption(
              'sma60',
              'SMA 60'
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                minWidth: '150px',
              }}
            >
              <input
                type="checkbox"
                checked={
                  enabledIndicators.volume
                }
                onChange={() =>
                  onToggleIndicator(
                    'volume'
                  )
                }
              />

              거래량

              <span
                style={{
                  fontSize: '12px',
                  color: '#868e96',
                }}
              >
                파라미터 없음
              </span>
            </label>
          </div>
        </div>
      )}

      {/* =====================================================
          데이터가 없는 경우
         ===================================================== */}
      {visibleData.length === 0 ? (
        <div
          style={{
            height: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            color: '#888',
          }}
        >
          가격 데이터가 없습니다.
        </div>
      ) : (
        <>
          {/* =================================================
              OHLC + SMA
             ================================================= */}
          <ResponsiveContainer
            width="100%"
            height={310}
          >
            <ComposedChart
              data={visibleData}
              syncId="stock-chart-sync"
              margin={{
                top: 10,
                right: 20,
                left: 5,
                bottom: 0,
              }}
              barGap={-6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              {enabledIndicators.volume ? (
                <XAxis
                  dataKey="date"
                  hide
                />
              ) : (
                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  interval={0}
                  tick={{
                    fontSize: 10,
                  }}
                />
              )}

              <YAxis
                domain={priceDomain}
                width={68}
                tickFormatter={(
                  value
                ) =>
                  Number(
                    value
                  ).toLocaleString()
                }
              />

              <Tooltip
                content={
                  <PriceTooltip />
                }
              />

              {/* 저가 ~ 고가 */}
              <Bar
                name="저가-고가"
                dataKey="highLow"
                barSize={2}
                tooltipType="none"
              >
                {visibleData.map(
                  (entry, index) => (
                    <Cell
                      key={`high-low-${index}`}
                      fill={
                        entry.isUp
                          ? '#dc3545'
                          : '#0d6efd'
                      }
                    />
                  )
                )}
              </Bar>

              {/* 시가 ~ 종가 */}
              <Bar
                name="시가-종가"
                dataKey="openClose"
                barSize={10}
              >
                {visibleData.map(
                  (entry, index) => (
                    <Cell
                      key={`open-close-${index}`}
                      fill={
                        entry.isUp
                          ? '#dc3545'
                          : '#0d6efd'
                      }
                    />
                  )
                )}
              </Bar>

              {/* SMA는 가격 차트에서만 표시 */}
              {enabledIndicators.sma05 && (
                <Line
                  type="linear"
                  dataKey="sma05"
                  name="SMA 5"
                  stroke="#f59f00"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}

              {enabledIndicators.sma20 && (
                <Line
                  type="linear"
                  dataKey="sma20"
                  name="SMA 20"
                  stroke="#12b886"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}

              {enabledIndicators.sma60 && (
                <Line
                  type="linear"
                  dataKey="sma60"
                  name="SMA 60"
                  stroke="#7950f2"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* =================================================
              거래량
             ================================================= */}
          {enabledIndicators.volume && (
            <ResponsiveContainer
              width="100%"
              height={120}
            >
              <ComposedChart
                data={visibleData}
                syncId="stock-chart-sync"
                margin={{
                  top: 0,
                  right: 20,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  interval={0}
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  width={68}
                  domain={[
                    0,
                    volumeMax,
                  ]}
                  tickFormatter={(
                    value
                  ) => {
                    const numericValue =
                      Number(value);

                    if (
                      numericValue >=
                      1_000_000
                    ) {
                      return `${(
                        numericValue /
                        1_000_000
                      ).toFixed(1)}M`;
                    }

                    if (
                      numericValue >=
                      1_000
                    ) {
                      return `${(
                        numericValue /
                        1_000
                      ).toFixed(0)}K`;
                    }

                    return `${numericValue}`;
                  }}
                />

                <Tooltip
                  formatter={(
                    value: any
                  ) => [
                      Number(
                        value
                      ).toLocaleString(
                        'ko-KR'
                      ),
                      '거래량',
                    ]}
                  labelFormatter={(
                    label
                  ) =>
                    `일자: ${label}`
                  }
                />

                <Bar
                  name="거래량"
                  dataKey="volume"
                  barSize={10}
                >
                  {visibleData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`volume-${index}`}
                        fill={
                          entry.isUp
                            ? '#dc3545'
                            : '#0d6efd'
                        }
                      />
                    )
                  )}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}