/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// 페이지 상단 카페 로고 및 헤더 컴포넌트
export const CafeHeader: React.FC = () => {
  return (
    <header className="text-center pt-6 pb-4">
      {/* 1. 카페 로고: ☕ 이모지 크게 */}
      <div 
        className="inline-flex items-center justify-center w-20 h-20 bg-[#f4ebe1] border border-[#e8d8c8] rounded-full shadow-inner mb-3 text-5xl select-none transform hover:scale-105 transition-transform"
        aria-label="바이브 카페 엠블럼"
      >
        ☕
      </div>

      {/* 2. 카페 이름: 바이브 카페 */}
      <h1 className="text-3xl font-extrabold text-[#6b4226] tracking-tight">
        바이브 카페
      </h1>

      {/* 3. 부제: "당신의 하루에 바이브를 더하다" */}
      <p className="mt-1 text-sm text-[#8c674b] font-medium tracking-wide">
        당신의 하루에 바이브를 더하다
      </p>

      {/* 따뜻한 감성의 구분선 */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="h-[1px] w-12 bg-[#dcc9b8]"></span>
        <span className="text-xs text-[#b89c84]">✨ FRESH ROASTED COFFEE ✨</span>
        <span className="h-[1px] w-12 bg-[#dcc9b8]"></span>
      </div>
    </header>
  );
};
