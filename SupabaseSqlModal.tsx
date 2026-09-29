/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Database, Code, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_CREATE_TABLE, SUPABASE_SQL_INSERT_MOCK } from '../constants/cafeData';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Supabase SQL Editor용 쿼리 확인 및 원클릭 복사 모달
export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'create' | 'insert' | 'all' | null>(null);

  if (!isOpen) return null;

  // 클립보드 복사 함수
  const copyToClipboard = (text: string, type: 'create' | 'insert' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const allSql = `${SUPABASE_SQL_CREATE_TABLE}\n\n${SUPABASE_SQL_INSERT_MOCK}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="bg-[#faf6f0] border border-[#dcc9b8] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-modal-title"
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#6b4226] text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#f4ebe1]" />
            <h2 id="supabase-modal-title" className="text-lg font-bold">
              Supabase SQL Editor 쿼리문
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#f4ebe1] hover:text-white text-2xl leading-none px-2 rounded hover:bg-[#57351e] transition-colors"
            aria-label="닫기"
          >
            &times;
          </button>
        </div>

        {/* 안내 내용 */}
        <div className="px-6 py-4 overflow-y-auto space-y-5 text-sm text-[#4a3525]">
          <div className="bg-[#fff9f2] p-3 rounded-lg border border-[#e8d8c8] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#6b4226] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#5a4232]">
              Supabase 프로젝트 콘솔 &gt; <strong>SQL Editor</strong>에서 아래 쿼리를 붙여넣고 <strong>[Run]</strong> 버튼을 누르면 <code>cafe_menu</code> 테이블과 테스트 데이터가 즉시 생성됩니다.
            </p>
          </div>

          {/* 전체 쿼리 복사 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={() => copyToClipboard(allSql, 'all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6b4226] text-white rounded-md hover:bg-[#835332] transition-colors"
            >
              {copiedType === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  전체 쿼리 복사완료!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  전체 SQL (테이블 생성 + INSERT) 한번에 복사
                </>
              )}
            </button>
          </div>

          {/* 1. 테이블 생성 쿼리문 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#6b4226]">
                <Code className="w-4 h-4" />
                <span>1. cafe_menu 테이블 생성 쿼리 (DDL)</span>
              </div>
              <button
                onClick={() => copyToClipboard(SUPABASE_SQL_CREATE_TABLE, 'create')}
                className="flex items-center gap-1 text-xs text-[#6b4226] hover:text-[#835332] font-semibold bg-[#ebdccd] px-2.5 py-1 rounded hover:bg-[#dfcdbb] transition"
              >
                {copiedType === 'create' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-[#241d19] text-[#ecd8c6] rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-[#3e322b]">
              {SUPABASE_SQL_CREATE_TABLE}
            </pre>
          </div>

          {/* 2. 가짜 데이터 INSERT 쿼리문 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#6b4226]">
                <Code className="w-4 h-4" />
                <span>2. 테스트용 1건 가짜 데이터 INSERT 쿼리</span>
              </div>
              <button
                onClick={() => copyToClipboard(SUPABASE_SQL_INSERT_MOCK, 'insert')}
                className="flex items-center gap-1 text-xs text-[#6b4226] hover:text-[#835332] font-semibold bg-[#ebdccd] px-2.5 py-1 rounded hover:bg-[#dfcdbb] transition"
              >
                {copiedType === 'insert' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-[#241d19] text-[#ecd8c6] rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-[#3e322b]">
              {SUPABASE_SQL_INSERT_MOCK}
            </pre>
          </div>
        </div>

        {/* 모달 하단 닫기 */}
        <div className="px-6 py-3 bg-[#f2e7db] border-t border-[#e2d5c8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#c8b3a0] text-[#6b4226] font-medium text-xs rounded-lg hover:bg-[#faf6f0] transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
