/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CafeHeader } from './components/CafeHeader';
import { OrderForm } from './components/OrderForm';
import { RecentOrdersList } from './components/RecentOrdersList';
import { CafeOrder } from './types/cafe';
import {
  fetchRecentOrders,
  insertCafeOrder,
  clearCafeOrders,
  isSupabaseConfigured,
} from './lib/supabase';

export function App() {
  const [orders, setOrders] = useState<CafeOrder[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('연결 확인 중...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 주문 목록 로드 (Supabase 또는 로컬스토리지)
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const fetchedOrders = await fetchRecentOrders();
        setOrders(fetchedOrders);
        setConnectionStatus('Supabase 실시간 DB 연결됨');
      } catch (error) {
        console.error('Supabase 주문 목록 조회 실패:', error);
        setConnectionStatus('Supabase 연결 오류 (로컬 모드)');
        try {
          const saved = localStorage.getItem('vibe_cafe_orders');
          setOrders(saved ? JSON.parse(saved) : []);
        } catch {
          setOrders([]);
        }
      }
    } else {
      setConnectionStatus('로컬 스토리지 모드 (.env 설정 필요)');
      try {
        const saved = localStorage.getItem('vibe_cafe_orders');
        setOrders(saved ? JSON.parse(saved) : []);
      } catch {
        setOrders([]);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 로컬 스토리지 동기화 (Supabase 미연결 시)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem('vibe_cafe_orders', JSON.stringify(orders));
      } catch (e) {
        console.error('로컬스토리지 저장 실패:', e);
      }
    }
  }, [orders]);

  // 신규 주문 접수 핸들러
  const handleOrderSuccess = async (newOrder: CafeOrder) => {
    if (isSupabaseConfigured) {
      try {
        const savedOrder = await insertCafeOrder(newOrder);
        setOrders((prev) => [savedOrder, ...prev]);
      } catch (err) {
        console.error('주문 등록 오류:', err);
        // Supabase 에러 발생 시에도 UI에는 즉각 반영
        setOrders((prev) => [newOrder, ...prev]);
      }
    } else {
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  // 주문 기록 초기화 핸들러
  const handleClearOrders = async () => {
    if (window.confirm('정말 모든 주문 기록을 삭제하시겠습니까?')) {
      try {
        await clearCafeOrders();
      } catch (err) {
        console.error('주문 초기화 오류:', err);
      }
      setOrders([]);
      localStorage.removeItem('vibe_cafe_orders');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#3d2b1f] py-6 px-4 flex flex-col justify-between">
      {/* 상단 운영 상태 표시 */}
      <div className="w-full max-w-[520px] mx-auto flex items-center justify-between mb-2 px-1">
        <span className="text-xs text-[#a0846c]">
          {isLoading ? '데이터 로딩 중...' : `총 ${orders.length}건 접수`}
        </span>
        <span className="text-xs font-semibold text-[#8c674b] flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isSupabaseConfigured
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`}
          ></span>
          {connectionStatus}
        </span>
      </div>

      {/* 메인 컨테이너 (최대 너비 520px, 가운데 정렬) */}
      <main className="w-full max-w-[520px] mx-auto flex-1 flex flex-col">
        {/* 카페 로고 및 타이틀 헤더 */}
        <CafeHeader />

        {/* 핵심 주문서 작성 폼 컴포넌트 */}
        <OrderForm onOrderSuccess={handleOrderSuccess} />

        {/* 접수된 실시간 주문 목록 */}
        <RecentOrdersList
          orders={orders}
          onClearOrders={handleClearOrders}
          allowClear={true}
        />
      </main>

      {/* 푸터 영역 */}
      <footer className="w-full max-w-[520px] mx-auto text-center mt-10 pb-4 text-xs text-[#a0846c] border-t border-[#ebdccd] pt-4">
        <p className="font-medium">바이브 카페 (Vibe Cafe) &bull; 따뜻한 향기와 음악이 머무는 공간</p>
        <p className="mt-1 text-[11px] text-[#b89c84]">
          매일 아침 08:00 ~ 22:00 | 서울시 성수동 카페거리 | Tel: 02-1234-5678
        </p>
      </footer>
    </div>
  );
}

export default App;