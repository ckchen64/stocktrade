create database stockdb;
drop database coffee ;
show databases;

use stockdb;  
show tables;
commit;

-- 1. 데이터가 누락 없이 500개 근처로 다 입금되었는지 확인
SELECT COUNT(*) FROM daily_stock_price;
SELECT * FROM daily_stock_price;
SELECT * FROM trade_history;
SELECT * FROM virtual_account;
SELECT * FROM asset;

-- 2. 리액트 화면에 띄울 상위 5일치 날짜 정산 데이터가 잘 정돈되었는지 확인
SELECT * FROM daily_stock_price ORDER BY trade_date ASC LIMIT 5;

-- (DB-CSV-Q1-1) 보내주신 sm.csv의 리얼 데이터 모양을 저격한 마스터 주입 스크립트입니다.
-- [csv]파일 import하기
LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\sm.csv'
INTO TABLE daily_stock_price
FIELDS TERMINATED BY ',' 
-- ⭕ (DB-CSV-OPT1) 데이터 양옆의 쌍따옴표(")를 컴퓨터가 자동으로 깨끗하게 벗겨내고 읽도록 지정합니다!
OPTIONALLY ENCLOSED BY '"' 
LINES TERMINATED BY '\r\n' 
-- ⭕ (DB-CSV-OPT2) 핵심 2: 제목줄(1번)과 빈 콤마줄(2번)까지 총 [2줄]을 완벽하게 건너뛰고 진짜 데이터부터 시작합니다!
IGNORE 2 LINES 

(@v_trade_date, @v_close_price, @v_volume) 
SET 
    stock_code = '005930', 
    
    -- 퍼센트 오타 없이 슬래시(/) 날짜 모양을 완벽한 데이터베이스 날짜 포맷으로 변환합니다.
    trade_date = STR_TO_DATE(TRIM(@v_trade_date), '%Y/%m/%d'),
    
    -- 따옴표가 벗겨진 상태의 종가 글자에서 남은 쉼표(,)를 지우고 순수 숫자로 바꿉니다.
    close_price = REPLACE(TRIM(@v_close_price), ',', '');


	-- table 교체하기
	-- 1단계: 실전 6개 컬럼 규격의 테이블 생성 (CREATE TABLE)
	-- (DB-REAL-Q1-1) [순차] 보내주신 엑셀 구조를 100% 수용하는 완벽한 테이블을 생성합니다.
-- USE stockdb; -- 혹은 내 주식 DB 이름

-- DROP TABLE IF EXISTS daily_stock_price; -- 기존 테이블이 있다면 깨끗하게 밀어버리기

-- CREATE TABLE daily_stock_price (
--     id BIGINT AUTO_INCREMENT,
--     stock_code VARCHAR(10) NOT NULL,
--     trade_date DATE NOT NULL,                  -- 엑셀의 '일시' 매핑 (DB-REAL-T1)
--     open_price INT NOT NULL,                   -- 엑셀의 '시가' 매핑 (DB-REAL-T1)
--     high_price INT NOT NULL,                   -- 엑셀의 '고가' 매핑 (DB-REAL-T1)
--     low_price INT NOT NULL,                    -- 엑셀의 '저가' 매핑 (DB-REAL-T1)
--     close_price INT NOT NULL,                  -- 엑셀의 '종가' 매핑 (DB-REAL-T1)
--     volume BIGINT NOT NULL,                    -- 엑셀의 '<거래량>' 매핑 (DB-REAL-T1)
--     PRIMARY KEY (id)
-- );

	-- 2단계: 실전 데이터 100% 무결성 초고속 주입 (LOAD DATA)
-- (DB-REAL-Q1-2) 보내주신 데이터의 줄바꿈(\r\n)과 하이픈 날짜 포맷(%Y-%m-%d)을 저격한 마스터 주입문입니다.
-- LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\sm.csv'
-- INTO TABLE daily_stock_price
-- FIELDS TERMINATED BY ',' 
-- LINES TERMINATED BY '\r\n' 
-- IGNORE 1 LINES -- 1번째 줄의 제목(일시, 시가...)은 가볍게 건너뜁니다.
-- 엑셀에 적힌 순서 그대로 변수 상자에 차례대로 낚아챕니다.
-- (@v_trade_date, @v_open_price, @v_high_price, @v_low_price, @v_close_price, @v_volume) 
-- SET 
--     stock_code = '005930', -- 종목코드는 삼성전자로 자동 합체 주입
    
    -- ⚠️ 핵심: 보내주신 이미지의 날짜 모양인 하이픈 기호('%Y-%m-%d')로 완벽하게 포맷 변환하여 골인시킵니다.
--     trade_date = STR_TO_DATE(TRIM(@v_trade_date), '%Y-%m-%d'),
    
    -- 각 가격과 거래량을 깨끗하게 공백만 다듬어(TRIM) 정수방에 집어넣습니다.
--     open_price = TRIM(@v_open_price),
--     high_price = TRIM(@v_high_price),
--     low_price = TRIM(@v_low_price),
--     close_price = TRIM(@v_close_price),
--     volume = TRIM(@v_volume); 
    
    -- (DB-REAL-Q1-3) 데이터가 누락 없이 완벽한 행으로 다 충전되었는지 카운트 체크
-- SELECT COUNT(*) FROM daily_stock_price;




USE stockdb;

-- 기존 테이블이 있다면 삭제 후 재생성 (필요 시 주석 해제)
-- DROP TABLE IF EXISTS daily_stock_price;

CREATE TABLE daily_stock_price (
    id BIGINT AUTO_INCREMENT,
    stock_code VARCHAR(10) NOT NULL,
    stock_name VARCHAR(50) NOT NULL,           -- 💡 종목명 컬럼 추가
    trade_date DATE NOT NULL,
    open_price INT NOT NULL,
    high_price INT NOT NULL,
    low_price INT NOT NULL,
    close_price INT NOT NULL,
    volume BIGINT NOT NULL,
    
    -- 📊 보조지표 연산 결과 저장 컬럼들
    sma05 DOUBLE,
    sma20 DOUBLE,
    sma60 DOUBLE,
    rsi DOUBLE,
    mfi DOUBLE,
    obv DOUBLE,
    macd DOUBLE,
    macd_signal DOUBLE,
    macd_hist DOUBLE,
    sigma DOUBLE,
    adx DOUBLE,
    di_plus DOUBLE,
    di_minus DOUBLE,
    cci DOUBLE,
    cci_signal DOUBLE,
    eom DOUBLE,
    
    PRIMARY KEY (id),
    -- 💡 실시간 캔들 수신 시 (종목코드 + 거래일자) 기준 Upsert 속도 향상 및 중복 방지
    UNIQUE KEY uq_stock_date (stock_code, trade_date)
);

-- CSV 초고속 로드 (종목명 매핑 추가)
LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\sm.csv'
INTO TABLE daily_stock_price
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\r\n' 
IGNORE 1 LINES
(@v_trade_date, @v_open_price, @v_high_price, @v_low_price, @v_close_price, @v_volume) 
SET 
    stock_code = '005930', 
    stock_name = '삼성전자', -- 💡 동적 사용자 설정 주입 파라미터 적용 지점
    trade_date = STR_TO_DATE(TRIM(@v_trade_date), '%Y-%m-%d'),
    open_price = TRIM(@v_open_price),
    high_price = TRIM(@v_high_price),
    low_price = TRIM(@v_low_price),
    close_price = TRIM(@v_close_price),
    volume = TRIM(@v_volume);

-- 날짜 순서대로 정렬하여 상위 5일치 장부가 똑바로 입금되었는지 최종 스캔
SELECT * FROM daily_stock_price ORDER BY trade_date ;
    
    
    -- (SIM-HIST-Q1) 매매 기록 영수증을 누적 보관할 전용 테이블을 생성합니다.
USE stockdb; 

CREATE TABLE trade_history (
    id BIGINT AUTO_INCREMENT,                  -- 영수증 고유 번호 (자동 증가)
    trade_date DATE NOT NULL,                  -- ⚠️ 실제 오늘 날짜가 아닌, '당시 시뮬레이션 가상 날짜'
    trade_type VARCHAR(10) NOT NULL,           -- BUY 또는 SELL
    price INT NOT NULL,                        -- 내가 체결 요청한 단가
    quantity INT NOT NULL,                     -- 내가 체결 요청한 수량
    total_amount INT NOT NULL,                 -- 총 거래 금액 (단가 * 수량)
    PRIMARY KEY (id)
);


-- 1. 기존 테이블이 존재한다면 삭제 (초기화용)
DROP TABLE IF EXISTS stock_index_config;

SELECT * FROM stock_index_config ;

-- 2. 보조지표 동적 설정 테이블 생성
CREATE TABLE stock_index_config (
    config_key   VARCHAR(50)  NOT NULL COMMENT '설정 키 (JPA 레포지토리 ID)',
    int_value    INT          NULL     COMMENT '정수형 설정값',
    double_value DOUBLE       NULL     COMMENT '실수형 설정값',
    description  VARCHAR(255) NULL     COMMENT '지표 파라미터 설명',
    PRIMARY KEY (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO stock_index_config (config_key, int_value, double_value, description) VALUES

-- [시스템 인프라 설정]
('MAX_LOOKBACK_WINDOW', 200, NULL, '지표 연산을 위해 DB에서 가져올 최대 과거 데이터 개수 (안정적인 MACD/ADX 연산용)'),

-- [1층: 메인 주가 차트 지표]
('SMA_SHORT_WINDOW',    5,   NULL, '단기 이동평균선 기간 (SMA 05)'),
('SMA_MEDIUM_WINDOW',   20,  NULL, '중기 이동평균선 기간 (SMA 20)'),
('SMA_LONG_WINDOW',     60,  NULL, '장기 이동평균선 기간 (SMA 60)'),

-- [2층: 보조지표 패널 A]
('RSI_PERIOD',          14,  NULL, 'RSI (상대강도지수) 계산 기간'),
('MFI_PERIOD',          14,  NULL, 'MFI (자금흐름지수) 계산 기간'),
('MACD_FAST',           12,  NULL, 'MACD 단기 지수이동평균(EMA) 기간'),
('MACD_SLOW',           26,  NULL, 'MACD 장기 지수이동평균(EMA) 기간'),
('MACD_SIGNAL',         9,   NULL, 'MACD 시그널선 평활화 기간'),

-- [3층: 보조지표 패널 B]
('CCI_PERIOD',          20,  NULL, 'CCI (상품채널지수) 계산 기간'),
('CCI_SIGNAL',          9,   NULL, 'CCI 시그널선 평활화 기간'),
('SIGMA_PERIOD',        20,  NULL, 'SIGMA 변동성(표준편차) 산출 기준 기간'),
('SIGMA_MULTIPLIER',    NULL, 2.0,  'SIGMA 상하한선 이격 표준편차 가중치 승수'),

-- [4층: 보조지표 패널 C]
('ADX_PERIOD',          14,  NULL, 'ADX / DMI (방향성지수) 웰스 와일더 계산 기간');

-- (참고용) 나중에 OBV 시그널 이동평균선을 차트에 추가하고 싶어질 때만 넣는 값
-- INSERT INTO stock_index_config (config_key, int_value, double_value, description) 
-- VALUES ('OBV_SIGNAL_PERIOD', 9, NULL, 'OBV 선을 평활화하기 위한 OBV 시그널 이동평균선 기간');