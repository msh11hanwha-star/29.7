import { CafeOrder } from '../types/cafe';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// URL 유효성 검사
function cleanUrl(urlStr: string): string {
  if (!urlStr) return '';
  let cleaned = urlStr.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

const supabaseUrl = cleanUrl(rawUrl);
const supabaseAnonKey = rawKey;

// Supabase가 유효하게 설정되었는지 검증
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  supabaseAnonKey.length > 15
);

export interface SupabaseOrderRow {
  id: number | string;
  customer_name: string;
  phone_number?: string | null;
  phone?: string | null;
  drink_name: string;
  size: 'S' | 'M' | 'L';
  options?: string[] | null;
  extra_options?: string[] | null;
  quantity: number;
  requests?: string | null;
  unit_price?: number;
  total_price: number;
  status?: string | null;
  order_status?: string | null;
  created_at?: string;
}

// Supabase Row -> CafeOrder 매핑 함수
export const mapRowToCafeOrder = (row: SupabaseOrderRow): CafeOrder => {
  const qty = Number(row.quantity) || 1;
  const total = Number(row.total_price) || 0;
  const unit = Number(row.unit_price) || (qty > 0 ? Math.round(total / qty) : total);
  const opts = row.options || row.extra_options || [];

  return {
    id: String(row.id || Date.now()),
    customerName: row.customer_name || '익명 고객',
    phoneNumber: row.phone_number || row.phone || '미입력',
    drinkName: row.drink_name || '음료',
    size: (row.size as 'S' | 'M' | 'L') || 'M',
    options: Array.isArray(opts) ? opts : [],
    quantity: qty,
    requests: row.requests || '',
    unitPrice: unit,
    totalPrice: total,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
  };
};

// Supabase REST API 공통 요청 헤더
const getHeaders = () => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

// 최신 주문 목록 조회
export async function fetchRecentOrders(): Promise<CafeOrder[]> {
  if (!isSupabaseConfigured) {
    try {
      const saved = localStorage.getItem('vibe_cafe_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // 1차: cafe_menu 테이블 조회 시도
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cafe_menu?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(mapRowToCafeOrder);
      }
    }
  } catch (err) {
    console.warn('cafe_menu 테이블 조회 실패, orders 테이블 시도:', err);
  }

  // 2차: orders 테이블 조회 시도 (Fallback)
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(mapRowToCafeOrder);
      }
    }
  } catch (err) {
    console.warn('orders 테이블 조회 실패:', err);
  }

  // 통신 실패 시 로컬 스토리지 데이터 반환
  try {
    const saved = localStorage.getItem('vibe_cafe_orders');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// 주문 등록
export async function insertCafeOrder(order: CafeOrder): Promise<CafeOrder> {
  if (!isSupabaseConfigured) {
    return order;
  }

  const payload = {
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    phone: order.phoneNumber,
    drink_name: order.drinkName,
    size: order.size,
    options: order.options,
    extra_options: order.options,
    quantity: order.quantity,
    requests: order.requests,
    unit_price: order.unitPrice,
    total_price: order.totalPrice,
    status: '접수완료',
    order_status: '접수완료',
  };

  // 1차: cafe_menu 테이블에 insert 시도
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cafe_menu`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify([payload]),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        return mapRowToCafeOrder(data[0]);
      }
    }
  } catch (err) {
    console.warn('cafe_menu 저장 실패, orders 테이블 시도:', err);
  }

  // 2차: orders 테이블에 insert 시도 (Fallback)
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify([payload]),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        return mapRowToCafeOrder(data[0]);
      }
    }
  } catch (err) {
    console.warn('orders 저장 실패:', err);
  }

  return order;
}

// 주문 전체 삭제
export async function clearCafeOrders(): Promise<void> {
  if (!isSupabaseConfigured) {
    localStorage.removeItem('vibe_cafe_orders');
    return;
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/cafe_menu?id=neq.0`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  } catch {
    // 무시
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/orders?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  } catch {
    // 무시
  }
}