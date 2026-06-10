'use client';

import { useState, useEffect, useRef } from 'react';

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
  return [
    sido?.name,
    sigungu?.code !== sido?.code ? sigungu?.name : null,
    dong?.name,
  ].filter(Boolean).join(' ');
};

// onChange({ address, sido, sigungu, dong }) 형태로 호출됩니다.
const RegionSelector = ({ label, value, onChange, error, required }) => {
  const [sidos, setSidos] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [dongList, setDongList] = useState([]);
  const [sido, setSido] = useState(null);
  const [sigungu, setSigungu] = useState(null);
  const [dong, setDong] = useState(null);
  const [loading, setLoading] = useState({ sido: false, sigungu: false, dong: false });
  const [regionError, setRegionError] = useState('');

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polygonLayerRef = useRef(null);
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
        setSidos(data);
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
  }, []);

  useEffect(() => {
    if (!sido) {
      setSigunguList([]);
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
    } else {
      onChangeRef.current({ address: '', sido: '', sigungu: '', dong: '' });
    }
  }, [sido, sigungu, dong]);

  // Leaflet 지도 초기화 (동이 선택됐을 때만)
  useEffect(() => {
    if (!dong || !mapRef.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Leaflet 기본 아이콘 CSS 링크 추가
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!mounted) return;

        // 기존 지도 제거
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.default.map(mapRef.current, {
          zoomControl: true,
          maxZoom: 14,   // 동 수준으로 줌 제한 (건물/도로 식별 불가)
          minZoom: 10,
        });

        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 14,
        }).addTo(map);

        leafletMapRef.current = map;

        // Nominatim으로 동 폴리곤 가져오기
        const query = encodeURIComponent(`${sido.name} ${sigungu.name} ${dong.name}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&polygon_geojson=1&limit=1`;

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'ko' },
        });
        const data = await res.json();

        if (!mounted) return;

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];

          if (polygonLayerRef.current) {
            polygonLayerRef.current.remove();
          }

          const layer = L.default.geoJSON(feature, {
            style: {
              color: '#FFD044',
              weight: 2,
              fillColor: '#FFD044',
              fillOpacity: 0.25,
              dashArray: null,
            },
          }).addTo(map);

          polygonLayerRef.current = layer;
          map.fitBounds(layer.getBounds(), { maxZoom: 14 });
        } else {
          // 폴리곤 없을 때 기본 위치로 이동 (대한민국 중심)
          map.setView([36.5, 127.5], 10);
        }
      } catch (err) {
        console.error('지도 로드 오류:', err);
      }
    };

    initMap();

    return () => {
      mounted = false;
    };
  }, [sido, sigungu, dong]);

  // 지도 컨테이너 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleSidoChange = (e) => {
    setSido(sidos.find((item) => item.code === e.target.value) || null);
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

      {/* 선택 결과 표시 */}
      {sido && sigungu && dong && (
        <p className="text-12-r text-brand-yellow-dark font-medium">
          ✓ {getAddressText(sido, sigungu, dong)}
        </p>
      )}

      {/* 동 경계 지도 */}
      {dong && (
        <div
          ref={mapRef}
          className="w-full rounded-[15px] overflow-hidden border border-gray-200"
          style={{ height: '200px' }}
        />
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
