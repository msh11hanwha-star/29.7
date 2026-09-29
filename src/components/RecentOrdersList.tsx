/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CafeOrder } from '../types/cafe';
import { Clock, Coffee, Receipt, Trash2 } from 'lucide-react';

interface RecentOrdersListProps {
  orders: CafeOrder[];
  onClearOrders: () => void;
  allowClear?: boolean;
}

// 실시간 접수된 주문 내역 및 영수증 리스트
export const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders, onClearOrders, allowClear = true }) => {
  if (orders.length === 0) return null;

  return (
    <div className="w-full max-w-[520px] mx-auto mt-6 bg-[#faf6f0] border border-[#e2d5c8] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#dcc9b8] mb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#6b4226]" />
          <h3 className="font-bold text-sm text-[#6b4226]">접수된 실시간 주문 내역 ({orders.length}건)</h3>
        </div>
        {allowClear && <button
          onClick={onClearOrders}
          className="flex items-center gap-1 text-xs text-[#8c674b] hover:text-red-600 transition"
          title="내역 비우기"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>기록 지우기</span>
        </button>}
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {orders.map((order) => (
          <div 
            key={order.id}
            className="p-3 bg-white rounded-xl border border-[#ebdccd] shadow-xs text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between text-[#8c674b]">
              <span className="font-mono font-semibold text-[#6b4226]">{order.id}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.createdAt}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="font-bold text-[#332211]">
                {order.customerName} 고객님
              </span>
              <span className="font-bold text-[#6b4226]">
                {order.totalPrice.toLocaleString('ko-KR')}원
              </span>
            </div>

            <div className="text-[#553b28] flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#8c674b]" />
              <span>
                {order.drinkName} ({order.size}사이즈) &times; {order.quantity}잔
              </span>
            </div>

            {order.options.length > 0 && (
              <div className="text-[11px] text-[#8c674b] pl-5">
                옵션: {order.options.join(', ')}
              </div>
            )}

            {order.requests && order.requests !== '요청사항 없음' && (
              <div className="text-[11px] text-[#70533d] bg-[#f8f3ed] p-1.5 rounded mt-1">
                요청: {order.requests}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
