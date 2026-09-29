/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { SUPABASE_SQL_CREATE_TABLE, SUPABASE_SQL_INSERT_MOCK } from '../constants/cafeData';

// Supabase SQL Editor 전용 쿼리문 섹션 (테이블 생성 및 테스트 INSERT문)
export const SupabaseSqlSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'insert'>('create');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (sql: string, key: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentSql = activeTab === 'create' ? SUPABASE_SQL_CREATE_TABLE : SUPABASE_SQL_INSERT_MOCK;

  return (
    <div className="w-full max-w-[520px] mx-auto mt-6 bg-white border border-[#dcc9b8] rounded-2xl shadow-md overflow-hidden transition-all">
      {/* 아코디언 토글 헤더 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#f8f3ed] hover:bg-[#f2e7db] text-left transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6b4226] text-white flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#6b4226]">
              Supabase SQL Editor 쿼리 모음
            </h3>
            <p className="text-xs text-[#8c674b]">
              cafe_menu 테이블 생성 DDL & 테스트 INSERT문 바로 복사
            </p>
          </div>
        </div>
        <div className="text-[#6b4226]">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* 펼쳐지는 SQL 쿼리 상세 영역 */}
      {isOpen && (
        <div className="p-4 border-t border-[#ebdccd] space-y-3 bg-[#faf6f0]">
          <div className="flex items-center justify-between gap-2">
            {/* 탭 버튼 */}
            <div className="flex gap-1.5 p-1 bg-[#ebdccd] rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === 'create' 
                    ? 'bg-[#6b4226] text-white shadow-xs' 
                    : 'text-[#6b4226] hover:bg-[#dfcdbb]'
                }`}
              >
                1. cafe_menu 테이블 생성
              </button>
              <button
                onClick={() => setActiveTab('insert')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === 'insert' 
                    ? 'bg-[#6b4226] text-white shadow-xs' 
                    : 'text-[#6b4226] hover:bg-[#dfcdbb]'
                }`}
              >
                2. 1건 가짜 데이터 INSERT
              </button>
            </div>

            {/* 현재 탭 복사 버튼 */}
            <button
              onClick={() => handleCopy(currentSql, activeTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#6b4226] text-white rounded-lg hover:bg-[#835332] active:scale-95 transition shadow-xs cursor-pointer"
            >
              {copied === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>복사완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SQL 복사</span>
                </>
              )}
            </button>
          </div>

          {/* 컬럼 매핑 설명 안내 */}
          {activeTab === 'create' ? (
            <p className="text-[11px] text-[#70533d] leading-normal">
              📌 <strong>주문서 항목 매핑:</strong> <code>customer_name</code>(이름), <code>phone_number</code>(전화번호), <code>drink_name</code>(음료), <code>size</code>(사이즈), <code>extra_options</code>(추가옵션 배열), <code>quantity</code>(수량), <code>requests</code>(요청사항), <code>unit_price</code>(단가), <code>total_price</code>(예상 총금액)
            </p>
          ) : (
            <p className="text-[11px] text-[#70533d] leading-normal">
              📌 <strong>테스트 데이터:</strong> 홍길동님의 카페라떼 M사이즈 (샷 추가) 1잔, 5,000원 샘플 1건이 즉시 삽입됩니다.
            </p>
          )}

          {/* 코드 블록 */}
          <div className="relative">
            <pre className="p-3 bg-[#1e1916] text-[#e8d5c4] rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-64 border border-[#3b302a]">
              <code>{currentSql}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
