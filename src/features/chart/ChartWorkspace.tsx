import React, {
  useRef,
  useState,
  useEffect
} from 'react';

import PriceChart from './PriceChart';

import type {
  PriceIndicatorKey,
  SmaPeriodKey,
} from './PriceChart';

import IndicatorChart from './IndicatorChart';

import type {
  IndicatorKey,
} from './IndicatorChart';

import type {
  CandleData,
} from './types';


interface ChartWorkspaceProps {
  chartDataList: CandleData[];
  visibleCount?: number;
}


/*
 * =========================================================
 * 파라미터 정의
 * =========================================================
 */
interface ParameterDefinition {
  key: string;
  label: string;
  baseValue: number;
}


/*
 * =========================================================
 * 보조지표 선택항목 정의
 * =========================================================
 */
interface IndicatorDefinition {
  key: IndicatorKey;

  label: string;

  parameters:
  ParameterDefinition[];
}


/*
 * =========================================================
 * 각각의 차트 2~4 상태
 * =========================================================
 */
interface IndicatorPanel {
  id: number;

  indicators:
  IndicatorKey[];

  selectorOpen:
  boolean;

  parameterValues:
  Record<string, number>;
}

interface IndexConfigResponse {
  SMA_SHORT_WINDOW: number;
  SMA_MEDIUM_WINDOW: number;
  SMA_LONG_WINDOW: number;

  MACD_FAST_PERIOD: number;
  MACD_SLOW_PERIOD: number;
  MACD_SIGNAL_PERIOD: number;

  RSI_PERIOD: number;
  MFI_PERIOD: number;
  SIGMA_PERIOD: number;
  ADX_PERIOD: number;
  CCI_PERIOD: number;
  EOM_PERIOD: number;
}

const MAX_CHART_COUNT =
  4;


/*
 * =========================================================
 * 차트 2~4에서 선택 가능한 지표
 *
 * SMA 제외
 * MACD Hist 제외
 *
 * Signal은 별도의 선택항목으로 관리
 * =========================================================
 */
const INDICATOR_DEFINITIONS:
  IndicatorDefinition[] = [

    /*
     * -------------------------------------------------------
     * MACD
     * -------------------------------------------------------
     *
     * MACD 본지표:
     * Fast / Slow
     *
     * Signal:
     * Signal 기간
     */
    {
      key: 'MACD',
      label: 'MACD',

      parameters: [
        {
          key: 'fast',
          label: 'Fast',
          baseValue: 12,
        },

        {
          key: 'slow',
          label: 'Slow',
          baseValue: 26,
        },
      ],
    },

    {
      key: 'MACD_SIGNAL',
      label: 'MACD Signal',

      parameters: [
        {
          key: 'signal',
          label: 'Signal',
          baseValue: 9,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * OBV
     * -------------------------------------------------------
     */
    {
      key: 'OBV',
      label: 'OBV',
      parameters: [],
    },


    /*
     * -------------------------------------------------------
     * RSI
     * -------------------------------------------------------
     */
    {
      key: 'RSI',
      label: 'RSI',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * MFI
     * -------------------------------------------------------
     */
    {
      key: 'MFI',
      label: 'MFI',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },

    {
      key: 'MFI_SIGNAL',
      label: 'MFI Signal',

      parameters: [
        {
          key: 'signalPeriod',
          label: 'Signal',
          baseValue: 14,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * SIGMA
     * -------------------------------------------------------
     */
    {
      key: 'SIGMA',
      label: 'SIGMA',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },

    {
      key: 'SIGMA_SIGNAL',
      label: 'SIGMA Signal',

      parameters: [
        {
          key: 'signalPeriod',
          label: 'Signal',
          baseValue: 14,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * ADX
     * -------------------------------------------------------
     */
    {
      key: 'ADX',
      label: 'ADX',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },

    {
      key: 'DI_PLUS',
      label: 'DI+',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },

    {
      key: 'DI_MINUS',
      label: 'DI-',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * CCI
     * -------------------------------------------------------
     */
    {
      key: 'CCI',
      label: 'CCI',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 20,
        },
      ],
    },

    {
      key: 'CCI_SIGNAL',
      label: 'CCI Signal',

      parameters: [
        {
          key: 'signalPeriod',
          label: 'Signal',
          baseValue: 20,
        },
      ],
    },


    /*
     * -------------------------------------------------------
     * EOM
     * -------------------------------------------------------
     */
    {
      key: 'EOM',
      label: 'EOM',

      parameters: [
        {
          key: 'period',
          label: '기간',
          baseValue: 14,
        },
      ],
    },
  ];

  const getBackendBaseValue = (
  indicator: IndicatorKey,
  parameterKey: string,
  config: IndexConfigResponse
): number => {

  switch (indicator) {

    case 'MACD':
      if (parameterKey === 'fast') {
        return config.MACD_FAST_PERIOD;
      }

      if (parameterKey === 'slow') {
        return config.MACD_SLOW_PERIOD;
      }

      break;

    case 'MACD_SIGNAL':
      return config.MACD_SIGNAL_PERIOD;

    case 'RSI':
      return config.RSI_PERIOD;

    case 'MFI':
      return config.MFI_PERIOD;

    case 'SIGMA':
      return config.SIGMA_PERIOD;

    case 'ADX':
    case 'DI_PLUS':
    case 'DI_MINUS':
      return config.ADX_PERIOD;

    case 'CCI':
      return config.CCI_PERIOD;

    case 'EOM':
      return config.EOM_PERIOD;
  }

  return 0;
};

/*
 * =========================================================
 * 범례 표시 정보
 *
 * 실제 변수명은 변경하지 않고
 * 화면의 범례에서만 Signal을 -S로 표시합니다.
 * =========================================================
 */
const LEGEND_DEFINITIONS: Record<
  IndicatorKey,
  {
    label: string;
    stroke: string;
    isSignal: boolean;
  }
> = {
  MACD: {
    label: 'MACD',
    stroke: '#0d6efd',
    isSignal: false,
  },

  MACD_SIGNAL: {
    label: 'MACD-S',
    stroke: '#7950f2',
    isSignal: true,
  },

  OBV: {
    label: 'OBV',
    stroke: '#6f42c1',
    isSignal: false,
  },

  RSI: {
    label: 'RSI',
    stroke: '#198754',
    isSignal: false,
  },

  MFI: {
    label: 'MFI',
    stroke: '#0f30ec',
    isSignal: false,
  },

  MFI_SIGNAL: {
    label: 'MFI-S',
    stroke: '#4dabf7',
    isSignal: true,
  },

  SIGMA: {
    label: 'SIGMA',
    stroke: '#e72929',
    isSignal: false,
  },

  SIGMA_SIGNAL: {
    label: 'SIGMA-S',
    stroke: '#fd7e14',
    isSignal: true,
  },

  ADX: {
    label: 'ADX',
    stroke: '#fd7e14',
    isSignal: false,
  },

  DI_PLUS: {
    label: 'DI+',
    stroke: '#20c997',
    isSignal: false,
  },

  DI_MINUS: {
    label: 'DI-',
    stroke: '#dc3545',
    isSignal: false,
  },

  CCI: {
    label: 'CCI',
    stroke: '#6610f2',
    isSignal: false,
  },

  CCI_SIGNAL: {
    label: 'CCI-S',
    stroke: '#e64980',
    isSignal: true,
  },

  EOM: {
    label: 'EOM',
    stroke: '#f5a614',
    isSignal: false,
  },
};

// 기본값 객체 추가
const DEFAULT_INDEX_CONFIG: IndexConfigResponse = {
  SMA_SHORT_WINDOW: 5,
  SMA_MEDIUM_WINDOW: 20,
  SMA_LONG_WINDOW: 60,

  MACD_FAST_PERIOD: 12,
  MACD_SLOW_PERIOD: 26,
  MACD_SIGNAL_PERIOD: 9,

  RSI_PERIOD: 14,
  MFI_PERIOD: 14,
  SIGMA_PERIOD: 20,
  ADX_PERIOD: 14,
  CCI_PERIOD: 20,
  EOM_PERIOD: 14,
};


/*
 * =========================================================
 * 새 차트 생성 시
 * 모든 현재값을 기초값으로 초기화
 * =========================================================
 */
function createDefaultParameterValues():
  Record<string, number> {

  const values:
    Record<string, number> = {};


  INDICATOR_DEFINITIONS.forEach(
    (indicator) => {

      indicator.parameters.forEach(
        (parameter) => {

          const fullKey =
            `${indicator.key}.${parameter.key}`;

          values[fullKey] =
            parameter.baseValue;
        }
      );
    }
  );


  return values;
}


/*
 * =========================================================
 * ChartWorkspace
 * =========================================================
 */
export default function ChartWorkspace({
  chartDataList,
  visibleCount = 29,
}: ChartWorkspaceProps):
  React.JSX.Element {

    const [indexConfig, setIndexConfig] =
  useState<IndexConfigResponse>(DEFAULT_INDEX_CONFIG);

  useEffect(() => {
  const loadIndexConfig = async () => {
    try {
      const response = await fetch('/api/index-config');

      if (!response.ok) {
        throw new Error(
          `지표 설정 조회 실패: ${response.status}`
        );
      }

      const data: IndexConfigResponse =
        await response.json();

      console.log(
        '📊 백엔드 지표 설정:',
        data
      );

      setIndexConfig(data);

    } catch (error) {
      console.error(
        '❌ 지표 설정 조회 실패. 기본값을 사용합니다.',
        error
      );
    }
  };

  loadIndexConfig();
}, []);

  /*
   * =========================================================
   * 차트 1 상태
   * =========================================================
   */
  const [
    priceOptionsOpen,
    setPriceOptionsOpen,
  ] = useState(false);


  /*
   * 기본값
   *
   * SMA = OFF
   * 거래량 = ON
   */
  const [
    priceIndicators,
    setPriceIndicators,
  ] = useState<
    Record<
      PriceIndicatorKey,
      boolean
    >
  >({
    sma05: false,
    sma20: false,
    sma60: false,
    volume: true,
  });


  /*
   * SMA 현재값
   */
  const [
    smaPeriods,
    setSmaPeriods,
  ] = useState<
    Record<
      SmaPeriodKey,
      number
    >
  >({
    sma05: 5,
    sma20: 20,
    sma60: 60,
  });
  useEffect(() => {
  setSmaPeriods({
    sma05: indexConfig.SMA_SHORT_WINDOW,
    sma20: indexConfig.SMA_MEDIUM_WINDOW,
    sma60: indexConfig.SMA_LONG_WINDOW,
  });
}, [
  indexConfig.SMA_SHORT_WINDOW,
  indexConfig.SMA_MEDIUM_WINDOW,
  indexConfig.SMA_LONG_WINDOW,
]);


  /*
   * =========================================================
   * 차트 2~4 상태
   * =========================================================
   */
  const [
    indicatorPanels,
    setIndicatorPanels,
  ] = useState<
    IndicatorPanel[]
  >([]);


  const nextPanelId =
    useRef(1);


  const totalChartCount =
    1 +
    indicatorPanels.length;


  const canAddChart =
    totalChartCount <
    MAX_CHART_COUNT;


  /*
   * =========================================================
   * 차트 1 보조지표 ON / OFF
   * =========================================================
   */
  const handlePriceIndicatorToggle =
    (
      indicator:
        PriceIndicatorKey
    ) => {

      setPriceIndicators(
        (prev) => ({
          ...prev,

          [indicator]:
            !prev[indicator],
        })
      );
    };


  /*
   * =========================================================
   * 차트 1 SMA 현재값 변경
   * =========================================================
   */
  const handleSmaPeriodChange =
    (
      indicator:
        SmaPeriodKey,

      value: number
    ) => {

      if (
        !Number.isFinite(
          value
        ) ||
        value <= 0
      ) {
        return;
      }


      setSmaPeriods(
        (prev) => ({
          ...prev,

          [indicator]:
            Math.floor(
              value
            ),
        })
      );
    };


  /*
   * =========================================================
   * 차트 추가
   * =========================================================
   */
  const handleAddChart = () => {

    if (!canAddChart) {
      return;
    }


    const newPanel:
      IndicatorPanel = {

      id:
        nextPanelId.current,

      indicators: [],

      selectorOpen: false,

      parameterValues:
        createDefaultParameterValues(),
    };


    nextPanelId.current +=
      1;


    setIndicatorPanels(
      (prev) => [
        ...prev,
        newPanel,
      ]
    );
  };


  /*
   * =========================================================
   * 차트 삭제
   * =========================================================
   */
  const handleDeleteChart =
    (
      panelId: number
    ) => {

      setIndicatorPanels(
        (prev) =>
          prev.filter(
            (panel) =>
              panel.id !==
              panelId
          )
      );
    };


  /*
   * =========================================================
   * 보조지표 선택영역 열기 / 닫기
   * =========================================================
   */
  const handleSelectorToggle =
    (
      panelId: number
    ) => {

      setIndicatorPanels(
        (prev) =>
          prev.map(
            (panel) => {

              if (
                panel.id !==
                panelId
              ) {
                return panel;
              }


              return {
                ...panel,

                selectorOpen:
                  !panel.selectorOpen,
              };
            }
          )
      );
    };


  /*
   * =========================================================
   * 지표 선택 / 해제
   * =========================================================
   */
  const handleIndicatorToggle =
    (
      panelId: number,

      indicator:
        IndicatorKey
    ) => {

      setIndicatorPanels(
        (prev) =>
          prev.map(
            (panel) => {

              if (
                panel.id !==
                panelId
              ) {
                return panel;
              }


              const alreadySelected =
                panel.indicators.includes(
                  indicator
                );


              /*
               * 이미 선택된 경우 제거
               */
              if (
                alreadySelected
              ) {
                return {
                  ...panel,

                  indicators:
                    panel.indicators.filter(
                      (item) =>
                        item !==
                        indicator
                    ),
                };
              }


              /*
               * 선택되지 않은 경우 추가
               */
              return {
                ...panel,

                indicators: [
                  ...panel.indicators,
                  indicator,
                ],
              };
            }
          )
      );
    };


  /*
   * =========================================================
   * 현재 파라미터 값 변경
   * =========================================================
   */
  const handleParameterChange =
    (
      panelId: number,

      indicator:
        IndicatorKey,

      parameterKey:
        string,

      value: number
    ) => {

      if (
        !Number.isFinite(
          value
        ) ||
        value <= 0
      ) {
        return;
      }


      const fullKey =
        `${indicator}.${parameterKey}`;


      setIndicatorPanels(
        (prev) =>
          prev.map(
            (panel) => {

              if (
                panel.id !==
                panelId
              ) {
                return panel;
              }


              return {
                ...panel,

                parameterValues: {
                  ...panel.parameterValues,

                  [fullKey]:
                    Math.floor(
                      value
                    ),
                },
              };
            }
          )
      );
    };


  return (
    <div
      style={{
        display: 'flex',
        flexDirection:
          'column',
        gap: '12px',
      }}
    >

      {/* =====================================================
          전체 차트 제어
         ===================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: '#6c757d',
          }}
        >
          총 {totalChartCount}개
          {' / '}
          최대 {MAX_CHART_COUNT}개
        </div>


        <button
          type="button"

          onClick={
            handleAddChart
          }

          disabled={
            !canAddChart
          }

          style={{
            border: 'none',
            borderRadius:
              '8px',
            padding:
              '8px 14px',

            cursor:
              canAddChart
                ? 'pointer'
                : 'not-allowed',

            backgroundColor:
              canAddChart
                ? '#0d6efd'
                : '#adb5bd',

            color: '#fff',
            fontWeight: 700,
          }}
        >
          + 차트 추가
        </button>
      </div>


      {/* =====================================================
          차트 1
         ===================================================== */}
      <PriceChart
        chartDataList={
          chartDataList
        }

        visibleCount={
          visibleCount
        }

        optionsOpen={
          priceOptionsOpen
        }

        onToggleOptions={() =>
          setPriceOptionsOpen(
            (prev) =>
              !prev
          )
        }

        enabledIndicators={
          priceIndicators
        }

        onToggleIndicator={
          handlePriceIndicatorToggle
        }

        smaPeriods={
          smaPeriods
        }

        onSmaPeriodChange={
          handleSmaPeriodChange
        }
      />


      {/* =====================================================
          차트 2 ~ 4
         ===================================================== */}
      {indicatorPanels.map(
        (
          panel,
          index
        ) => {

          const displayChartNumber =
            index + 2;


          return (
            <div
              key={panel.id}

              style={{
                padding:
                  '14px',

                border:
                  '1px solid #dee2e6',

                borderRadius:
                  '12px',

                backgroundColor:
                  '#fff',
              }}
            >

              {/* =============================================
                  1행
                  차트명 + 선택버튼 + 삭제
                 ============================================= */}
              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: '10px',

                  marginBottom:
                    '10px',
                }}
              >
                <h3
                  style={{
                    margin: 0,

                    fontSize:
                      '16px',

                    whiteSpace:
                      'nowrap',
                  }}
                >
                  차트{' '}
                  {
                    displayChartNumber
                  }
                  {' : '}
                  보조지표
                </h3>


                <button
                  type="button"

                  onClick={() =>
                    handleSelectorToggle(
                      panel.id
                    )
                  }

                  style={{
                    border:
                      '1px solid #0d6efd',

                    borderRadius:
                      '7px',

                    padding:
                      '6px 10px',

                    backgroundColor:
                      '#fff',

                    color:
                      '#0d6efd',

                    cursor:
                      'pointer',

                    fontWeight:
                      700,

                    fontSize:
                      '12px',
                  }}
                >
                  보조지표 선택{' '}

                  {panel.selectorOpen
                    ? '▲'
                    : '▼'}
                </button>


                <div
                  style={{
                    flex: 1,
                  }}
                />


                <button
                  type="button"

                  onClick={() =>
                    handleDeleteChart(
                      panel.id
                    )
                  }

                  style={{
                    border:
                      '1px solid #dc3545',

                    borderRadius:
                      '7px',

                    padding:
                      '6px 10px',

                    backgroundColor:
                      '#fff',

                    color:
                      '#dc3545',

                    cursor:
                      'pointer',

                    fontWeight:
                      700,

                    fontSize:
                      '12px',
                  }}
                >
                  삭제
                </button>
              </div>

              {/* =============================================
                2행 : 선택된 지표 범례

                Signal은 범례에서만
                MACD-S / MFI-S / SIGMA-S / CCI-S
                형식으로 축약 표시
              ============================================= */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',

                  /*
                   * 범례는 반드시 한 줄 유지
                   */
                  whiteSpace: 'nowrap',

                  /*
                   * 폭이 부족해도 줄바꿈하지 않음
                   */
                  overflow: 'visible',

                  minHeight: '24px',
                  marginBottom: '8px',

                  fontSize: '11px',
                }}
              >
                {panel.indicators.length === 0 ? (
                  <span
                    style={{
                      color: '#adb5bd',
                    }}
                  >
                    선택된 보조지표 없음
                  </span>
                ) : (
                  panel.indicators.map(
                    (indicatorKey) => {
                      const legend =
                        LEGEND_DEFINITIONS[
                        indicatorKey
                        ];

                      if (!legend) {
                        return null;
                      }

                      return (
                        <div
                          key={indicatorKey}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            flexShrink: 0,
                          }}
                        >
                          {/* 범례 선 */}
                          <span
                            style={{
                              display: 'inline-block',
                              width: '22px',

                              borderTop:
                                legend.isSignal
                                  ? `1px dashed ${legend.stroke}`
                                  : `2px solid ${legend.stroke}`,
                            }}
                          />

                          {/* 범례 이름 */}
                          <span
                            style={{
                              color:
                                legend.stroke,

                              fontWeight:
                                legend.isSignal
                                  ? 500
                                  : 700,
                            }}
                          >
                            {legend.label}
                          </span>
                        </div>
                      );
                    }
                  )
                )}
              </div>


              {/* =============================================
                  보조지표 선택영역
                 ============================================= */}
              {panel.selectorOpen && (

                <div
                  style={{
                    padding:
                      '12px',

                    border:
                      '1px solid #dee2e6',

                    borderRadius:
                      '8px',

                    backgroundColor:
                      '#f8f9fa',

                    marginBottom:
                      '12px',
                  }}
                >

                  {INDICATOR_DEFINITIONS.map(
                    (
                      indicator
                    ) => {

                      const checked =
                        panel.indicators.includes(
                          indicator.key
                        );


                      return (
                        <div
                          key={
                            indicator.key
                          }

                          style={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            flexWrap:
                              'wrap',

                            gap:
                              '8px',

                            minHeight:
                              '38px',

                            borderBottom:
                              '1px solid #e9ecef',
                          }}
                        >

                          {/* ===============================
                              지표 선택 체크박스
                             =============================== */}
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',

                              /*
                               * 모든 지표명의 시작 위치를 동일하게 맞춤
                               * MACD / MFI / SIGMA / SIGMA Signal 등
                               * 모두 좌측 정렬
                               */
                              justifyContent: 'flex-start',
                              textAlign: 'left',

                              gap: '5px',

                              /*
                               * Signal 이름까지 들어갈 충분한 고정 폭
                               *
                               * 이 폭 뒤에서 모든 파라미터 표시가
                               * 동일한 위치에서 시작합니다.
                               */
                              width: '125px',
                              minWidth: '125px',

                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            <input
                              type="checkbox"

                              checked={
                                checked
                              }

                              onChange={() =>
                                handleIndicatorToggle(
                                  panel.id,
                                  indicator.key
                                )
                              }
                            />

                            {
                              indicator.label
                            }
                          </label>


                          {/* ===============================
                              파라미터가 없는 경우
                             =============================== */}
                          {indicator
                            .parameters
                            .length ===
                            0 ? (

                            <span
                              style={{
                                fontSize:
                                  '12px',

                                color:
                                  '#868e96',
                              }}
                            >
                              파라미터 없음
                            </span>

                          ) : (

                            /*
                             * =============================
                             * 기초값 / 현재값
                             * =============================
                             */
                            indicator.parameters.map(
                              (
                                parameter
                              ) => {

                                const fullKey =
                                  `${indicator.key}.${parameter.key}`;


                                const currentValue =
                                  panel
                                    .parameterValues[
                                  fullKey
                                  ];


                                return (
                                  <div
                                    key={
                                      fullKey
                                    }

                                    style={{
                                      display:
                                        'flex',

                                      alignItems:
                                        'center',

                                      gap:
                                        '5px',
                                    }}
                                  >

                                    <span
                                      style={{
                                        fontSize:
                                          '12px',

                                        color:
                                          '#6c757d',
                                      }}
                                    >
                                      {
                                        parameter.label
                                      }
                                    </span>


                                    {/* 기초값 */}
                                    <span
                                      style={{
                                        fontSize:
                                          '12px',

                                        fontWeight:
                                          700,
                                      }}
                                    >
                                      {
                                        parameter.baseValue
                                      }
                                    </span>


                                    <span>
                                      /
                                    </span>


                                    {/* 현재값 */}
                                    <input
                                      type="number"

                                      min={1}

                                      value={
                                        currentValue ??
                                        parameter.baseValue
                                      }

                                      onChange={(
                                        event
                                      ) =>
                                        handleParameterChange(
                                          panel.id,
                                          indicator.key,
                                          parameter.key,
                                          Number(
                                            event
                                              .target
                                              .value
                                          )
                                        )
                                      }

                                      style={{
                                        width:
                                          '55px',

                                        padding:
                                          '4px 6px',

                                        border:
                                          '1px solid #ced4da',

                                        borderRadius:
                                          '5px',

                                        fontSize:
                                          '12px',
                                      }}
                                    />
                                  </div>
                                );
                              }
                            )
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}


              {/* =============================================
                  실제 보조지표 그래프
                 ============================================= */}
              <IndicatorChart
                chartDataList={
                  chartDataList
                }

                selectedIndicators={
                  panel.indicators
                }

                visibleCount={
                  visibleCount
                }
              />
            </div>
          );
        }
      )}
    </div>
  );
}