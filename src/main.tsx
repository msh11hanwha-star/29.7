import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 런타임 에러 발생 시 흰 화면 대신 안내 화면을 보여주는 에러 바운더리
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React 애플리케이션 에러:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '40px auto', background: '#fff', borderRadius: '12px', border: '1px solid #e8d8c8', color: '#332211' }}>
          <h2 style={{ color: '#d9534f', marginTop: 0 }}>☕ 화면을 불러오는 중 오류가 발생했습니다</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>아래 내용을 확인해 주세요:</p>
          <pre style={{ background: '#faf6f0', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.error?.message || '알 수 없는 오류'}
          </pre>
          <button
            onClick={() => {
              localStorage.removeItem('vibe_cafe_orders');
              window.location.reload();
            }}
            style={{ marginTop: '12px', padding: '10px 16px', background: '#6b4226', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            데이터 초기화 후 다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
