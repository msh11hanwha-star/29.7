/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  DRINK_MENU, 
  SIZE_OPTIONS, 
  EXTRA_OPTIONS, 
  INITIAL_FORM_DATA 
} from '../constants/cafeData';
import { OrderFormData, CafeOrder, CupSize } from '../types/cafe';
import { Coffee, RotateCcw, CheckCircle2, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';

interface OrderFormProps {
  onOrderSuccess: (order: CafeOrder) => Promise<void> | void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderSuccess }) => {
  // 주문서 입력 상태 관리 (이름, 전화번호, 음료, 사이즈, 옵션, 수량, 요청사항)
  const [formData, setFormData] = useState<OrderFormData>({ ...INITIAL_FORM_DATA });

  // 유효성 검사 에러 메시지 알림 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 주문 성공 확인 메시지 상태
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력 필드 참조 (유효성 검사 실패 시 자동 포커스용)
  const nameInputRef = useRef<HTMLInputElement>(null);
  const drinkSelectRef = useRef<HTMLSelectElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // 1. 선택된 음료 정보 객체 조회
  const selectedDrink = useMemo(() => {
    return DRINK_MENU.find((drink) => drink.id === formData.selectedDrinkId) || null;
  }, [formData.selectedDrinkId]);

  // 2. 선택된 사이즈 추가 금액 계산
  const sizeExtraPrice = useMemo(() => {
    const sizeObj = SIZE_OPTIONS.find((s) => s.id === formData.size);
    return sizeObj ? sizeObj.extraPrice : 0;
  }, [formData.size]);

  // 3. 선택된 추가 옵션들의 총 추가 금액 계산
  const optionsExtraPrice = useMemo(() => {
    return formData.selectedOptions.reduce((acc, optId) => {
      const opt = EXTRA_OPTIONS.find((o) => o.id === optId);
      return acc + (opt ? opt.extraPrice : 0);
    }, 0);
  }, [formData.selectedOptions]);

  // 4. 음료 1잔당 단가 계산 (음료가 선택되지 않았을 경우 0원)
  const unitPrice = useMemo(() => {
    if (!selectedDrink) return 0;
    return selectedDrink.price + sizeExtraPrice + optionsExtraPrice;
  }, [selectedDrink, sizeExtraPrice, optionsExtraPrice]);

  // 5. 실시간 예상 총 금액 계산 (단가 * 수량)
  // 음료, 사이즈, 추가옵션, 수량이 변경될 때마다 자동 갱신
  const estimatedTotalPrice = useMemo(() => {
    if (!selectedDrink) return 0;
    return unitPrice * formData.quantity;
  }, [selectedDrink, unitPrice, formData.quantity]);

  // 6. 이름 입력 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, customerName: e.target.value }));
    if (errorMessage && e.target.value.trim() !== '') {
      setErrorMessage(null);
    }
  };

  // 7. 전화번호 입력 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
  };

  // 8. 음료 드롭다운 선택 핸들러
  const handleDrinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, selectedDrinkId: e.target.value }));
    if (errorMessage && e.target.value !== '') {
      setErrorMessage(null);
    }
  };

  // 9. 사이즈 라디오 버튼 변경 핸들러
  const handleSizeChange = (size: CupSize) => {
    setFormData((prev) => ({ ...prev, size }));
  };

  // 10. 추가 옵션 체크박스 토글 핸들러
  const handleOptionToggle = (optionId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedOptions.includes(optionId);
      const updated = isSelected
        ? prev.selectedOptions.filter((id) => id !== optionId)
        : [...prev.selectedOptions, optionId];
      return { ...prev, selectedOptions: updated };
    });
  };

  // 11. 수량 변경 핸들러 (최소 1, 최대 10 제한)
  const handleQuantityChange = (val: number) => {
    const validQty = Math.min(10, Math.max(1, isNaN(val) ? 1 : val));
    setFormData((prev) => ({ ...prev, quantity: validQty }));
  };

  // 12. 요청사항 텍스트 영역 변경 핸들러
  const handleRequestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, requests: e.target.value }));
  };

  // 13. 다시 작성 (초기화) 버튼 핸들러
  const handleReset = () => {
    // 모든 폼 상태와 에러/성공 메시지를 기본값으로 리셋
    setFormData({ ...INITIAL_FORM_DATA });
    setErrorMessage(null);
    setSuccessMessage(null);
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  // 14. 주문하기 버튼 클릭 시 유효성 검사 및 주문 접수 처리
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 에러 상태 초기화
    setErrorMessage(null);

    // [유효성 검사 1] 이름이 비어있으면 "이름을 입력해주세요" 알림
    if (!formData.customerName || formData.customerName.trim() === '') {
      setErrorMessage('이름을 입력해주세요');
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }

    // [유효성 검사 2] 음료를 선택하지 않았으면 "음료를 선택해주세요" 알림
    if (!formData.selectedDrinkId || !selectedDrink) {
      setErrorMessage('음료를 선택해주세요');
      if (drinkSelectRef.current) {
        drinkSelectRef.current.focus();
      }
      return;
    }

    // 선택된 추가 옵션 한글 이름 배열 구성
    const selectedOptionNames = formData.selectedOptions
      .map((optId) => EXTRA_OPTIONS.find((o) => o.id === optId)?.name)
      .filter(Boolean) as string[];

    // 옵션 텍스트 형식: " (샷 추가)" 또는 " (샷 추가, 크림 추가)" 또는 ""
    const optionsText = selectedOptionNames.length > 0
      ? ` (${selectedOptionNames.join(', ')})`
      : '';

    // 주문 확인 메시지 텍스트 조합:
    // "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
    const confirmationText = `${formData.customerName.trim()}님, ${selectedDrink.name} ${formData.size}사이즈${optionsText} ${formData.quantity}잔, 총 ${estimatedTotalPrice.toLocaleString('ko-KR')}원 주문이 접수되었습니다!`;

    // 주문 객체 생성 및 상위 콜백 호출
    const newOrder: CafeOrder = {
      id: `ORDER-${Date.now().toString().slice(-6)}`,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim() || '미입력',
      drinkName: selectedDrink.name,
      size: formData.size,
      options: selectedOptionNames,
      quantity: formData.quantity,
      requests: formData.requests.trim() || '요청사항 없음',
      unitPrice: unitPrice,
      totalPrice: estimatedTotalPrice,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setIsSubmitting(true);
    try {
      await onOrderSuccess(newOrder);
      setSuccessMessage(confirmationText);
    } catch (error) {
      console.error('주문 저장 오류:', error);
      setErrorMessage('주문 저장에 실패했습니다. Supabase 설정과 테이블 권한을 확인해주세요.');
      return;
    } finally {
      setIsSubmitting(false);
    }

    // 주문 확인 메시지로 부드럽게 스크롤
    setTimeout(() => {
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto bg-white rounded-2xl shadow-lg border border-[#e8d8c8] p-6 sm:p-8 transition-all">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#f0e4d7]">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-[#6b4226]" />
          <h2 className="text-xl font-bold text-[#6b4226]">주문서 작성</h2>
        </div>
        <span className="text-xs text-[#8c674b] bg-[#faf6f0] px-2.5 py-1 rounded-full border border-[#ebdccd]">
          ☕ 당일 로스팅
        </span>
      </div>

      {/* 에러 알림 배너 (유효성 검사 실패 시 표시) */}
      {errorMessage && (
        <div 
          role="alert" 
          className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2.5 text-sm animate-pulse"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} noValidate className="space-y-5">
        {/* 1. 이름 (필수, text) */}
        <div>
          <label 
            htmlFor="customer-name" 
            className="block text-sm font-semibold text-[#4a3525] mb-1.5"
          >
            1. 이름 <span className="text-red-500">* (필수)</span>
          </label>
          <input
            id="customer-name"
            ref={nameInputRef}
            type="text"
            required
            value={formData.customerName}
            onChange={handleNameChange}
            placeholder="주문자 성함을 입력해주세요 (예: 홍길동)"
            className="custom-input w-full p-[10px] rounded-[8px] border border-[#d8c3b0] bg-[#fdfbf9] text-[#332211] text-sm placeholder:text-[#ab9482] transition duration-200"
          />
        </div>

        {/* 2. 전화번호 (tel) */}
        <div>
          <label 
            htmlFor="phone-number" 
            className="block text-sm font-semibold text-[#4a3525] mb-1.5"
          >
            2. 전화번호 <span className="text-xs font-normal text-[#8c674b]">(선택)</span>
          </label>
          <input
            id="phone-number"
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="연락처를 입력해주세요 (예: 010-1234-5678)"
            className="custom-input w-full p-[10px] rounded-[8px] border border-[#d8c3b0] bg-[#fdfbf9] text-[#332211] text-sm placeholder:text-[#ab9482] transition duration-200"
          />
        </div>

        {/* 3. 음료 선택 (드롭다운) */}
        <div>
          <label 
            htmlFor="drink-select" 
            className="block text-sm font-semibold text-[#4a3525] mb-1.5"
          >
            3. 음료 선택 <span className="text-red-500">* (필수)</span>
          </label>
          <div className="relative">
            <select
              id="drink-select"
              ref={drinkSelectRef}
              value={formData.selectedDrinkId}
              onChange={handleDrinkChange}
              className="custom-select w-full p-[10px] rounded-[8px] border border-[#d8c3b0] bg-[#fdfbf9] text-[#332211] text-sm appearance-none pr-10 transition duration-200 cursor-pointer"
            >
              <option value="">-- 음료를 선택해주세요 --</option>
              {DRINK_MENU.map((drink) => (
                <option key={drink.id} value={drink.id}>
                  {drink.emoji} {drink.name} ({drink.price.toLocaleString('ko-KR')}원)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6b4226]">
              ▼
            </div>
          </div>
          {selectedDrink && (
            <p className="mt-1 text-xs text-[#8c674b]">
              💡 {selectedDrink.description}
            </p>
          )}
        </div>

        {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
        <div>
          <label className="block text-sm font-semibold text-[#4a3525] mb-2">
            4. 사이즈 <span className="text-xs font-normal text-[#8c674b]">(기본 선택: M)</span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {SIZE_OPTIONS.map((sizeOpt) => {
              const inputId = `size-${sizeOpt.id}`;
              const isChecked = formData.size === sizeOpt.id;
              return (
                <label
                  key={sizeOpt.id}
                  htmlFor={inputId}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-all select-none ${
                    isChecked 
                      ? 'border-[#6b4226] bg-[#f4ebe1] text-[#6b4226] font-bold shadow-xs' 
                      : 'border-[#e2d5c8] bg-white text-[#553b28] hover:border-[#c8b3a0]'
                  }`}
                >
                  <input
                    type="radio"
                    id={inputId}
                    name="coffee-size"
                    value={sizeOpt.id}
                    checked={isChecked}
                    onChange={() => handleSizeChange(sizeOpt.id)}
                    className="accent-[#6b4226] cursor-pointer"
                  />
                  <span>
                    {sizeOpt.name} {sizeOpt.extraPrice > 0 ? `(+${sizeOpt.extraPrice.toLocaleString('ko-KR')}원)` : '(+0원)'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
        <div>
          <label className="block text-sm font-semibold text-[#4a3525] mb-2">
            5. 추가 옵션 <span className="text-xs font-normal text-[#8c674b]">(중복 선택 가능)</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {EXTRA_OPTIONS.map((option) => {
              const inputId = `option-${option.id}`;
              const isChecked = formData.selectedOptions.includes(option.id);
              return (
                <label
                  key={option.id}
                  htmlFor={inputId}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-all select-none ${
                    isChecked 
                      ? 'border-[#6b4226] bg-[#f4ebe1] text-[#6b4226] font-bold shadow-xs' 
                      : 'border-[#e2d5c8] bg-white text-[#553b28] hover:border-[#c8b3a0]'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={inputId}
                    value={option.id}
                    checked={isChecked}
                    onChange={() => handleOptionToggle(option.id)}
                    className="accent-[#6b4226] cursor-pointer rounded"
                  />
                  <span>
                    {option.name} {option.extraPrice > 0 ? `(+${option.extraPrice.toLocaleString('ko-KR')}원)` : '(+0원)'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
        <div>
          <label 
            htmlFor="order-quantity" 
            className="block text-sm font-semibold text-[#4a3525] mb-1.5"
          >
            6. 수량 <span className="text-xs font-normal text-[#8c674b]">(최소 1잔 ~ 최대 10잔)</span>
          </label>
          <div className="flex items-center gap-3 max-w-[200px]">
            <button
              type="button"
              onClick={() => handleQuantityChange(formData.quantity - 1)}
              disabled={formData.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d8c3b0] bg-[#faf6f0] text-[#6b4226] font-bold text-lg hover:bg-[#ede0d4] active:bg-[#e2cebe] disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="수량 감소"
            >
              -
            </button>
            <input
              id="order-quantity"
              type="number"
              min={1}
              max={10}
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              className="custom-input w-full p-[10px] text-center font-bold text-base rounded-[8px] border border-[#d8c3b0] bg-[#fdfbf9] text-[#332211] transition duration-200"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              disabled={formData.quantity >= 10}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d8c3b0] bg-[#faf6f0] text-[#6b4226] font-bold text-lg hover:bg-[#ede0d4] active:bg-[#e2cebe] disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
        </div>

        {/* 7. 요청사항 (textarea) */}
        <div>
          <label 
            htmlFor="order-requests" 
            className="block text-sm font-semibold text-[#4a3525] mb-1.5"
          >
            7. 요청사항 <span className="text-xs font-normal text-[#8c674b]">(선택)</span>
          </label>
          <textarea
            id="order-requests"
            rows={3}
            value={formData.requests}
            onChange={handleRequestsChange}
            placeholder="바리스타에게 전할 요청사항이 있다면 적어주세요. (예: 얼음 조금만, 종이 빨대 등)"
            className="custom-textarea w-full p-[10px] rounded-[8px] border border-[#d8c3b0] bg-[#fdfbf9] text-[#332211] text-sm placeholder:text-[#ab9482] transition duration-200 resize-none"
          />
        </div>

        {/* 실시간 단가 및 옵션 계산 요약 (친절한 가이드) */}
        <div className="p-3 bg-[#faf6f0] rounded-xl border border-[#ebdccd] text-xs text-[#70533d] space-y-1">
          <div className="flex justify-between items-center">
            <span>선택 음료 기본가</span>
            <span className="font-semibold">
              {selectedDrink ? `${selectedDrink.price.toLocaleString('ko-KR')}원` : '음료 미선택 (0원)'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>사이즈 ({formData.size}) & 옵션 추가금</span>
            <span className="font-semibold">
              +{(sizeExtraPrice + optionsExtraPrice).toLocaleString('ko-KR')}원
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#e2d5c8] text-[#553b28]">
            <span>1잔당 단가</span>
            <span className="font-bold">{unitPrice.toLocaleString('ko-KR')}원</span>
          </div>
        </div>

        {/* 
          실시간 예상 금액 표시 영역:
          주문하기 버튼 바로 위에 큰 글씨(24px), 갈색(#6b4226), 굵게, 가운데 정렬
        */}
        <div className="py-2 text-center bg-[#fdfbf9] border border-[#ebdccd] rounded-xl shadow-inner">
          <span className="text-xs text-[#8c674b] uppercase tracking-wider block font-medium">
            실시간 계산 금액
          </span>
          <div className="text-[24px] text-[#6b4226] font-bold text-center mt-0.5">
            예상 금액: {estimatedTotalPrice.toLocaleString('ko-KR')}원
          </div>
        </div>

        {/* 8. 주문하기 버튼 & 9. 다시 작성 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* 주문하기 버튼: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게 */}
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-[#6b4226] hover:bg-[#805030] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>주문하기</span>
          </button>

          {/* 다시 작성 버튼: 모든 입력과 금액 초기화 */}
          <button
            type="button"
            onClick={handleReset}
            className="sm:w-36 flex items-center justify-center gap-2 bg-[#f4ebe1] hover:bg-[#ebdccd] active:scale-[0.99] text-[#6b4226] font-semibold py-3.5 px-4 rounded-xl border border-[#d8c3b0] transition duration-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 작성</span>
          </button>
        </div>
      </form>

      {/* 
        주문 확인 메시지:
        연두색 배경, 초록 글씨, 둥근 모서리
        형식: "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
      */}
      {successMessage && (
        <div 
          ref={confirmationRef}
          role="status"
          className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-[8px] shadow-sm animate-fade-in flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-green-900 mb-1 flex items-center gap-1.5">
              <span>주문 접수 완료</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
            </h4>
            <p className="text-sm font-medium leading-relaxed">
              {successMessage}
            </p>
            <p className="mt-1.5 text-xs text-green-700">
              ☕ 카운터에서 신선하게 준비 후 호명해 드리겠습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
