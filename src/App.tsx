import React from 'react';
import StockExchangePage from './pages/StockExchangePage';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <StockExchangePage />
    </div>
  );
};









//구코드
// import React from 'react';
// // (VIT-UI-M1-1) 우리가 정밀하게 만들어둔 타입스크립트 주식 거래 창 파일을 불러옵니다.
// import StockExchange from './pages/StockExchange'; 

// function App(): React.JSX.Element {
//   return (
//     <div>
//       {/* (VIT-UI-M1-2) 리액트의 메인 무대에 주식 거래 창 컴포넌트를 정중앙에 배치합니다. */}
//       <StockExchange />
//     </div>
//   );
// }

// export default App;