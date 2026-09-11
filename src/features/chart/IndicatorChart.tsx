import React, { useMemo } from 'react';

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type { CandleData } from './types';


/*
 * =========================================================
 * 차트 2~4에서 선택 가능한 보조지표
 * =========================================================
 *
 * MACD Hist는 사용하지 않습니다.
 */
export type IndicatorKey =
    | 'MACD'
    | 'MACD_SIGNAL'
    | 'OBV'
    | 'RSI'
    | 'MFI'
    | 'MFI_SIGNAL'
    | 'SIGMA'
    | 'SIGMA_SIGNAL'
    | 'ADX'
    | 'DI_PLUS'
    | 'DI_MINUS'
    | 'CCI'
    | 'CCI_SIGNAL'
    | 'EOM';


interface IndicatorChartProps {
    chartDataList: CandleData[];

    selectedIndicators: IndicatorKey[];

    visibleCount?: number;
}


/*
 * =========================================================
 * 각 지표의 화면 표시 정보
 * =========================================================
 */
interface IndicatorDisplayDefinition {
    key: IndicatorKey;

    /*
     * CandleData 안에서 실제 데이터가 들어있는 필드명
     */
    dataKey: keyof CandleData;

    label: string;

    /*
     * 같은 그룹은 동일한 min/max로 정규화합니다.
     */
    group: string;

    /*
     * Signal 여부
     *
     * true이면 본지표 굵기의 1/2로 출력합니다.
     */
    isSignal: boolean;

    /*
     * 선 색상
     */
    stroke: string;
}


/*
 * =========================================================
 * 지표 정의
 * =========================================================
 */
const INDICATOR_DISPLAY_DEFINITIONS:
    IndicatorDisplayDefinition[] = [

        // -------------------------------------------------------
        // MACD 그룹
        // -------------------------------------------------------
        {
            key: 'MACD',
            dataKey: 'macd',
            label: 'MACD',
            group: 'MACD',
            isSignal: false,
            stroke: '#0d6efd',
        },

        {
            key: 'MACD_SIGNAL',
            dataKey: 'macdSignal',
            label: 'MACD Signal',
            group: 'MACD',
            isSignal: true,
            stroke: '#7950f2',
        },



        // -------------------------------------------------------
        // OBV
        // -------------------------------------------------------
        {
            key: 'OBV',
            dataKey: 'obv',
            label: 'OBV',
            group: 'OBV',
            isSignal: false,
            stroke: '#6f42c1',
        },


        // -------------------------------------------------------
        // RSI
        // -------------------------------------------------------
        {
            key: 'RSI',
            dataKey: 'rsi',
            label: 'RSI',
            group: 'RSI',
            isSignal: false,
            stroke: '#198754',
        },


        // -------------------------------------------------------
        // MFI 그룹
        // -------------------------------------------------------
        {
            key: 'MFI',
            dataKey: 'mfi',
            label: 'MFI',
            group: 'MFI',
            isSignal: false,
            stroke: '#0f30ec',
        },

        {
            key: 'MFI_SIGNAL',
            dataKey: 'mfiSignal',
            label: 'MFI Signal',
            group: 'MFI',
            isSignal: true,
            stroke: '#4dabf7',
        },


        // -------------------------------------------------------
        // SIGMA 그룹
        // -------------------------------------------------------
        {
            key: 'SIGMA',
            dataKey: 'sigma',
            label: 'SIGMA',
            group: 'SIGMA',
            isSignal: false,
            stroke: '#e72929',
        },

        {
            key: 'SIGMA_SIGNAL',
            dataKey: 'sigmaSignal',
            label: 'SIGMA Signal',
            group: 'SIGMA',
            isSignal: true,
            stroke: '#fd7e14',
        },


        // -------------------------------------------------------
        // ADX 그룹
        // -------------------------------------------------------
        {
            key: 'ADX',
            dataKey: 'adx',
            label: 'ADX',
            group: 'ADX',
            isSignal: false,
            stroke: '#fd7e14',
        },

        {
            key: 'DI_PLUS',
            dataKey: 'diPlus',
            label: 'DI+',
            group: 'ADX',
            isSignal: false,
            stroke: '#20c997',
        },

        {
            key: 'DI_MINUS',
            dataKey: 'diMinus',
            label: 'DI-',
            group: 'ADX',
            isSignal: false,
            stroke: '#dc3545',
        },


        // -------------------------------------------------------
        // CCI 그룹
        // -------------------------------------------------------
        {
            key: 'CCI',
            dataKey: 'cci',
            label: 'CCI',
            group: 'CCI',
            isSignal: false,
            stroke: '#6610f2',
        },

        {
            key: 'CCI_SIGNAL',
            dataKey: 'cciSignal',
            label: 'CCI Signal',
            group: 'CCI',
            isSignal: true,
            stroke: '#e64980',
        },


        // -------------------------------------------------------
        // EOM
        // -------------------------------------------------------
        {
            key: 'EOM',
            dataKey: 'eom',
            label: 'EOM',
            group: 'EOM',
            isSignal: false,
            stroke: '#f5a614',
        },
    ];


/*
 * =========================================================
 * IndicatorKey → 정의 찾기
 * =========================================================
 */
function getDefinition(
    indicatorKey: IndicatorKey
): IndicatorDisplayDefinition | undefined {

    return INDICATOR_DISPLAY_DEFINITIONS.find(
        (definition) =>
            definition.key === indicatorKey
    );
}


/*
 * =========================================================
 * 숫자 유효성 검사
 * =========================================================
 */
function isValidNumber(
    value: unknown
): value is number {

    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );
}


/*
 * =========================================================
 * Tooltip 원래 값 출력
 * =========================================================
 */
interface IndicatorTooltipProps {
    active?: boolean;

    payload?: any[];

    label?: string | number;

    selectedIndicators: IndicatorKey[];
}


function IndicatorTooltip({
    active,
    payload,
    label,
    selectedIndicators,
}: IndicatorTooltipProps):
    React.JSX.Element | null {

    if (
        !active ||
        !payload ||
        payload.length === 0
    ) {
        return null;
    }


    /*
     * normalizeData를 만들 때
     * 원래 CandleData 필드를 그대로 유지했기 때문에
     * payload의 row에서 raw 값을 직접 꺼낼 수 있습니다.
     */
    const row =
        payload[0]?.payload;

    if (!row) {
        return null;
    }


    const formatValue = (
        value: unknown
    ) => {

        if (!isValidNumber(value)) {
            return '-';
        }

        /*
         * 아주 큰 값은 천 단위 구분,
         * 소수값은 적당히 소수점 표시
         */
        if (
            Math.abs(value) >= 1000
        ) {
            return value.toLocaleString(
                'ko-KR',
                {
                    maximumFractionDigits: 2,
                }
            );
        }

        return value.toLocaleString(
            'ko-KR',
            {
                maximumFractionDigits: 4,
            }
        );
    };


    return (
        <div
            style={{
                minWidth: '170px',
                padding: '10px 12px',
                backgroundColor:
                    'rgba(255,255,255,0.97)',
                border:
                    '1px solid #ced4da',
                borderRadius: '8px',
                boxShadow:
                    '0 2px 8px rgba(0,0,0,0.12)',
                fontSize: '12px',
                textAlign: 'left',
            }}
        >
            <div
                style={{
                    fontWeight: 700,
                    marginBottom: '7px',
                    color: '#343a40',
                }}
            >
                {String(
                    label ??
                    row.date
                )}
            </div>


            {selectedIndicators.map(
                (indicatorKey) => {

                    const definition =
                        getDefinition(
                            indicatorKey
                        );

                    if (!definition) {
                        return null;
                    }

                    const rawValue =
                        row[
                        definition.dataKey
                        ];

                    return (
                        <div
                            key={
                                indicatorKey
                            }
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'space-between',
                                gap: '14px',
                                lineHeight: 1.7,
                            }}
                        >
                            <span>
                                {
                                    definition.label
                                }
                            </span>

                            <strong>
                                {
                                    formatValue(
                                        rawValue
                                    )
                                }
                            </strong>
                        </div>
                    );
                }
            )}
        </div>
    );
}


/*
 * =========================================================
 * 실제 IndicatorChart
 * =========================================================
 */
export default function IndicatorChart({
    chartDataList,
    selectedIndicators,
    visibleCount = 29,
}: IndicatorChartProps):
    React.JSX.Element {

    /*
     * ---------------------------------------------------------
     * 최근 N개 데이터만 사용
     * ---------------------------------------------------------
     */
    const visibleData =
        useMemo(() => {

            if (
                !Array.isArray(
                    chartDataList
                ) ||
                chartDataList.length ===
                0
            ) {
                return [];
            }


            const safeVisibleCount =
                Number.isFinite(
                    visibleCount
                ) &&
                    visibleCount > 0
                    ? Math.floor(
                        visibleCount
                    )
                    : 29;


            return chartDataList.slice(
                -safeVisibleCount
            );

        }, [
            chartDataList,
            visibleCount,
        ]);


    /*
     * ---------------------------------------------------------
     * X축은 시작일 / 종료일만 표시
     * ---------------------------------------------------------
     */
    const xAxisTicks =
        useMemo(() => {

            if (
                visibleData.length ===
                0
            ) {
                return [];
            }

            const firstDate =
                visibleData[0].date;

            const lastDate =
                visibleData[
                    visibleData.length - 1
                ].date;

            if (
                firstDate ===
                lastDate
            ) {
                return [
                    firstDate,
                ];
            }

            return [
                firstDate,
                lastDate,
            ];

        }, [visibleData]);


    /*
     * ---------------------------------------------------------
     * 그룹별 min / max 계산
     *
     * 핵심:
     *
     * 예)
     *
     * MACD
     * MACD Signal
     *
     * 두 값을 따로 정규화하지 않습니다.
     *
     * 최근 29개의
     *
     * MACD + MACD Signal
     *
     * 전체 값에서 하나의 min/max를 구합니다.
     *
     * 따라서 두 선의 교차 관계가 유지됩니다.
     *
     * 중요한 점:
     * 화면에서 Signal을 선택하지 않았더라도
     * 같은 그룹의 전체 값을 기준으로 계산합니다.
     *
     * 이렇게 해야 Signal ON/OFF 시
     * 본지표의 스케일이 갑자기 바뀌지 않습니다.
     * ---------------------------------------------------------
     */
    const groupRanges =
        useMemo(() => {

            const result:
                Record<
                    string,
                    {
                        min: number;
                        max: number;
                    }
                > = {};


            const groups =
                Array.from(
                    new Set(
                        INDICATOR_DISPLAY_DEFINITIONS.map(
                            (definition) =>
                                definition.group
                        )
                    )
                );


            groups.forEach(
                (group) => {

                    const groupDefinitions =
                        INDICATOR_DISPLAY_DEFINITIONS.filter(
                            (definition) =>
                                definition.group ===
                                group
                        );


                    const values:
                        number[] = [];


                    visibleData.forEach(
                        (row) => {

                            groupDefinitions.forEach(
                                (definition) => {

                                    const value =
                                        row[
                                        definition.dataKey
                                        ];

                                    if (
                                        isValidNumber(
                                            value
                                        )
                                    ) {
                                        values.push(
                                            value
                                        );
                                    }
                                }
                            );
                        }
                    );


                    if (
                        values.length === 0
                    ) {
                        result[group] = {
                            min: 0,
                            max: 1,
                        };

                        return;
                    }


                    result[group] = {
                        min:
                            Math.min(
                                ...values
                            ),

                        max:
                            Math.max(
                                ...values
                            ),
                    };
                }
            );


            return result;

        }, [visibleData]);


    /*
     * ---------------------------------------------------------
     * 0~100 화면 표시용 정규화
     * ---------------------------------------------------------
     *
     * DB의 원래 값은 변경하지 않습니다.
     *
     * normalized_XXX 필드만 화면용으로
     * 임시 생성합니다.
     * ---------------------------------------------------------
     */
    const normalizedData =
        useMemo(() => {

            return visibleData.map(
                (row) => {

                    const normalizedRow:
                        Record<
                            string,
                            any
                        > = {
                        ...row,
                    };


                    INDICATOR_DISPLAY_DEFINITIONS.forEach(
                        (definition) => {

                            const rawValue =
                                row[
                                definition.dataKey
                                ];


                            const normalizedKey =
                                `normalized_${definition.key}`;


                            if (
                                !isValidNumber(
                                    rawValue
                                )
                            ) {
                                normalizedRow[
                                    normalizedKey
                                ] = null;

                                return;
                            }


                            const range =
                                groupRanges[
                                definition.group
                                ];


                            if (!range) {
                                normalizedRow[
                                    normalizedKey
                                ] = null;

                                return;
                            }


                            const difference =
                                range.max -
                                range.min;


                            /*
                             * 모든 값이 동일하면 중앙 50에 표시
                             */
                            if (
                                difference === 0
                            ) {
                                normalizedRow[
                                    normalizedKey
                                ] = 50;

                                return;
                            }


                            const normalized =
                                (
                                    (
                                        rawValue -
                                        range.min
                                    ) /
                                    difference
                                ) *
                                100;


                            normalizedRow[
                                normalizedKey
                            ] = normalized;
                        }
                    );


                    return normalizedRow;
                }
            );

        }, [
            visibleData,
            groupRanges,
        ]);


    /*
     * ---------------------------------------------------------
     * 선택된 지표가 없는 경우
     * ---------------------------------------------------------
     */
    if (
        selectedIndicators.length ===
        0
    ) {
        return (
            <div
                style={{
                    minHeight: '160px',
                    display: 'flex',
                    alignItems:
                        'center',
                    justifyContent:
                        'center',
                    border:
                        '1px dashed #ced4da',
                    borderRadius: '8px',
                    color: '#868e96',
                    fontSize: '13px',
                }}
            >
                표시할 보조지표를
                선택해 주세요.
            </div>
        );
    }


    /*
     * ---------------------------------------------------------
     * 데이터가 없는 경우
     * ---------------------------------------------------------
     */
    if (
        normalizedData.length ===
        0
    ) {
        return (
            <div
                style={{
                    minHeight: '160px',
                    display: 'flex',
                    alignItems:
                        'center',
                    justifyContent:
                        'center',
                    border:
                        '1px dashed #ced4da',
                    borderRadius: '8px',
                    color: '#868e96',
                    fontSize: '13px',
                }}
            >
                보조지표 데이터가
                없습니다.
            </div>
        );
    }


    /*
     * ---------------------------------------------------------
     * 실제 차트
     * ---------------------------------------------------------
     */
    return (
        <div
            style={{
                width: '100%',
                height: '250px',
            }}
        >
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <LineChart
                    data={
                        normalizedData
                    }
                    syncId="stock-chart-sync"
                    margin={{
                        top: 10,
                        right: 20,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                    />


                    <XAxis
                        dataKey="date"
                        ticks={
                            xAxisTicks
                        }
                        interval={0}
                        tick={{
                            fontSize: 10,
                        }}
                    />


                    {/*
            화면용 정규화 값은
            항상 0~100
          */}
                    <YAxis
                        domain={[
                            0,
                            100,
                        ]}
                        ticks={[
                            0,
                            25,
                            50,
                            75,
                            100,
                        ]}
                        width={42}
                        tick={{
                            fontSize: 10,
                        }}
                    />


                    {/*
            Tooltip에는
            normalize 값이 아니라
            원래 raw 값을 출력
          */}
                    <Tooltip
                        content={
                            <IndicatorTooltip
                                selectedIndicators={
                                    selectedIndicators
                                }
                            />
                        }
                    />


                    {/*
            선택된 지표만 선을 그림
          */}
                    {selectedIndicators.map(
                        (indicatorKey) => {

                            const definition =
                                getDefinition(
                                    indicatorKey
                                );

                            if (
                                !definition
                            ) {
                                return null;
                            }


                            const normalizedKey =
                                `normalized_${definition.key}`;


                            /*
                             * 본지표 = 2
                             * Signal = 1
                             *
                             * 즉 정확히 1/2 굵기
                             */
                            const strokeWidth =
                                definition.isSignal
                                    ? 1
                                    : 2;


                            return (
                                <Line
                                    key={
                                        indicatorKey
                                    }

                                    type="linear"

                                    dataKey={
                                        normalizedKey
                                    }

                                    name={
                                        definition.label
                                    }

                                    stroke={
                                        definition.stroke
                                    }

                                    strokeWidth={
                                        strokeWidth
                                    }

                                    dot={false}

                                    connectNulls={
                                        false
                                    }

                                    /*
                                     * Signal은 본지표와
                                     * 같은 색을 사용하되
                                     * 얇은 점선으로 구분
                                     */
                                    strokeDasharray={
                                        definition.isSignal
                                            ? '5 3'
                                            : undefined
                                    }

                                    isAnimationActive={
                                        false
                                    }
                                />
                            );
                        }
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}