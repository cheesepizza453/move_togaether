'use client';

import { useState, useEffect, useRef } from 'react';

const OVERSEAS_REGION = { code: 'OVERSEAS', name: '해외', fullName: '해외' };

const fetchRegions = async (params, signal) => {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`/api/regions?${searchParams.toString()}`, { signal });
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.error || '지역 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  return result.data || [];
};

const getAddressText = (sido, sigungu, dong) => {
  if (sido?.code === OVERSEAS_REGION.code) return OVERSEAS_REGION.name;

  return [
    sido?.name,
    sigungu?.code !== sido?.code ? sigungu?.name : null,
    dong?.name,
  ].filter(Boolean).join(' ');
};

// onChange({ address, sido, sigungu, dong }) 형태로 호출됩니다.
const RegionSelector = ({
  label,
  value,
  onChange,
  error,
  required,
  allowOverseas = false,
  allowPartialRegion = false,
}) => {
  const [sidos, setSidos] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [dongList, setDongList] = useState([]);
  const [sido, setSido] = useState(null);
  const [sigungu, setSigungu] = useState(null);
  const [dong, setDong] = useState(null);
  const [loading, setLoading] = useState({ sido: false, sigungu: false, dong: false });
  const [regionError, setRegionError] = useState('');

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 외부 value 변경 시 (초기값 복원 등) 파싱
  useEffect(() => {
    if (!value) {
      setSido(null);
      setSigungu(null);
      setDong(null);
      setSigunguList([]);
      setDongList([]);
    }
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();

    const loadSidos = async () => {
      setLoading((prev) => ({ ...prev, sido: true }));
      setRegionError('');

      try {
        const data = await fetchRegions({ level: 'sido' }, controller.signal);
        setSidos(allowOverseas ? [...data, OVERSEAS_REGION] : data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('시/도 조회 오류:', err);
          setRegionError(err.message);
        }
      } finally {
        setLoading((prev) => ({ ...prev, sido: false }));
      }
    };

    loadSidos();

    return () => controller.abort();
  }, [allowOverseas]);

  useEffect(() => {
    if (!sido) {
      setSigunguList([]);
      return;
    }

    if (sido.code === OVERSEAS_REGION.code) {
      setSigungu(OVERSEAS_REGION);
      setDong(OVERSEAS_REGION);
      setSigunguList([]);
      setDongList([]);
      return;
    }

    const controller = new AbortController();

    const loadSigungu = async () => {
      setLoading((prev) => ({ ...prev, sigungu: true }));
      setRegionError('');

      try {
        const data = await fetchRegions({
          level: 'sigungu',
          sidoCode: sido.code,
          sidoName: sido.name,
        }, controller.signal);
        setSigunguList(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('시/군/구 조회 오류:', err);
          setRegionError(err.message);
        }
      } finally {
        setLoading((prev) => ({ ...prev, sigungu: false }));
      }
    };

    loadSigungu();

    return () => controller.abort();
  }, [sido]);

  useEffect(() => {
    if (!sido || !sigungu) {
      setDongList([]);
      return;
    }

    if (sido.code === OVERSEAS_REGION.code) {
      setDong(OVERSEAS_REGION);
      setDongList([]);
      return;
    }

    const controller = new AbortController();

    const loadDongs = async () => {
      setLoading((prev) => ({ ...prev, dong: true }));
      setRegionError('');

      try {
        const data = await fetchRegions({
          level: 'dong',
          sidoName: sido.name,
          sigunguCode: sigungu.code,
          sigunguName: sigungu.name,
        }, controller.signal);
        setDongList(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('읍/면/동 조회 오류:', err);
          setRegionError(err.message);
        }
      } finally {
        setLoading((prev) => ({ ...prev, dong: false }));
      }
    };

    loadDongs();

    return () => controller.abort();
  }, [sido, sigungu]);

  // 선택 완료 시 상위 onChange 호출 — { address, sido, sigungu, dong } 객체로 전달
  useEffect(() => {
    if (sido && sigungu && dong) {
      const address = getAddressText(sido, sigungu, dong);
      onChangeRef.current({ address, sido: sido.name, sigungu: sigungu.name, dong: dong.name });
    } else if (allowPartialRegion && sido) {
      const address = getAddressText(sido, sigungu, dong);
      onChangeRef.current({
        address,
        sido: sido.name,
        sigungu: sigungu?.name || '',
        dong: dong?.name || '',
      });
    } else {
      onChangeRef.current({ address: '', sido: '', sigungu: '', dong: '' });
    }
  }, [sido, sigungu, dong, allowPartialRegion]);

  const handleSidoChange = (e) => {
    const selectedSido = sidos.find((item) => item.code === e.target.value) || null;
    setSido(selectedSido);

    if (selectedSido?.code === OVERSEAS_REGION.code) {
      setSigungu(OVERSEAS_REGION);
      setDong(OVERSEAS_REGION);
      setSigunguList([]);
      setDongList([]);
      return;
    }

    setSigungu(null);
    setDong(null);
    setSigunguList([]);
    setDongList([]);
  };

  const handleSigunguChange = (e) => {
    setSigungu(sigunguList.find((item) => item.code === e.target.value) || null);
    setDong(null);
    setDongList([]);
  };

  const handleDongChange = (e) => {
    setDong(dongList.find((item) => item.code === e.target.value) || null);
  };

  const selectClass = 'w-full h-[52px] px-[14px] border border-gray-300 rounded-[15px] text-text-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors appearance-none cursor-pointer';
  const isOverseas = sido?.code === OVERSEAS_REGION.code;
  const selectedAddress = getAddressText(sido, sigungu, dong);
  const hasSelectedAddress = Boolean(selectedAddress) && (
    allowPartialRegion || (sido && sigungu && dong)
  );

  return (
    <div className="space-y-3">
      <label className="block text-16-m">
        {label}{required && <span className="text-[#E17364] text-16-m">*</span>}
      </label>

      {/* 시/도 */}
      <div className="relative">
        <select
          value={sido?.code || ''}
          onChange={handleSidoChange}
          disabled={loading.sido}
          className={`${selectClass} ${loading.sido ? 'opacity-40 cursor-wait' : ''}`}
        >
          <option value="">{loading.sido ? '시/도 불러오는 중...' : '시/도 선택'}</option>
          {sidos.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>

      {!isOverseas && (
        <>
          {/* 시/군/구 */}
          <div className="relative">
            <select
              value={sigungu?.code || ''}
              onChange={handleSigunguChange}
              disabled={!sido || loading.sigungu}
              className={`${selectClass} ${!sido || loading.sigungu ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="">{loading.sigungu ? '시/군/구 불러오는 중...' : '시/군/구 선택'}</option>
              {sigunguList.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>

          {/* 읍/면/동 */}
          <div className="relative">
            <select
              value={dong?.code || ''}
              onChange={handleDongChange}
              disabled={!sigungu || loading.dong}
              className={`${selectClass} ${!sigungu || loading.dong ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="">{loading.dong ? '읍/면/동 불러오는 중...' : '읍/면/동 선택'}</option>
              {dongList.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
        </>
      )}

      {/* 선택 결과 표시 */}
      {hasSelectedAddress && (
        <p className="text-12-r text-brand-yellow-dark font-medium">
          ✓ {selectedAddress}
        </p>
      )}

      {/* 에러 */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {regionError && (
        <p className="text-xs text-red-500">{regionError}</p>
      )}
    </div>
  );
};

export default RegionSelector;
