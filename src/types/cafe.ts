/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 음료 메뉴 아이템 타입 정의
export interface DrinkMenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  emoji?: string;
}

// 음료 사이즈 타입 정의
export type CupSize = 'S' | 'M' | 'L';

export interface SizeOption {
  id: CupSize;
  name: string;
  extraPrice: number;
}

// 추가 옵션 타입 정의
export interface ExtraOption {
  id: string;
  name: string;
  extraPrice: number;
}

// 주문서 폼 상태 인터페이스
export interface OrderFormData {
  customerName: string;
  phoneNumber: string;
  selectedDrinkId: string;
  size: CupSize;
  selectedOptions: string[];
  quantity: number;
  requests: string;
}

// 저장된 주문 데이터 인터페이스
export interface CafeOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  drinkName: string;
  size: CupSize;
  options: string[];
  quantity: number;
  requests: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}
