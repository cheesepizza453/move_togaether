'use client';

import { useState, useEffect, useRef } from 'react';
import { getSidos, getSigunguList, getDongList } from '@/lib/korea-regions';

// onChange({ address, sido, sigungu, dong }) 형태로 호출됩니다.
const RegionSelector = ({ label, value, onChange, error, required }) => {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [dong, setDong] = useState('');

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polygonLayerRef = useRef(null);

  const sidos = getSidos();
  const siguList = getSigunguList(sido);
  const dongList = getDongList(sido, sigungu);

  // 외부 value 변경 시 (초기값 복원 등) 파싱
  useEffect(() => {
    if (!value) {
      setSido('');
      setSigungu('');
      setDong('');
    }
  }, [value]);

  // 선택 완료 시 상위 onChange 호출 — { address, sido, sigungu, dong } 객체로 전달
  useEffect(() => {
    if (sido && sigungu && dong) {
      onChange({ address: `${sido} ${sigungu} ${dong}`, sido, sigungu, dong });
    } else {
      onChange({ address: '', sido: '', sigungu: '', dong: '' });
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
        const query = encodeURIComponent(`${sido} ${sigungu} ${dong}`);
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
    setSido(e.target.value);
    setSigungu('');
    setDong('');
  };

  const handleSigunguChange = (e) => {
    setSigungu(e.target.value);
    setDong('');
  };

  const handleDongChange = (e) => {
    setDong(e.target.value);
  };

  const selectClass = 'w-full h-[52px] px-[14px] border border-gray-300 rounded-[15px] text-text-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors appearance-none cursor-pointer';

  return (
    <div className="space-y-3">
      <label className="block text-16-m">
        {label}{required && <span className="text-[#E17364] text-16-m">*</span>}
      </label>

      {/* 시/도 */}
      <div className="relative">
        <select value={sido} onChange={handleSidoChange} className={selectClass}>
          <option value="">시/도 선택</option>
          {sidos.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>

      {/* 시/군/구 */}
      <div className="relative">
        <select
          value={sigungu}
          onChange={handleSigunguChange}
          disabled={!sido}
          className={`${selectClass} ${!sido ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <option value="">시/군/구 선택</option>
          {siguList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>

      {/* 읍/면/동 */}
      <div className="relative">
        <select
          value={dong}
          onChange={handleDongChange}
          disabled={!sigungu}
          className={`${selectClass} ${!sigungu ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <option value="">읍/면/동 선택</option>
          {dongList.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>

      {/* 선택 결과 표시 */}
      {sido && sigungu && dong && (
        <p className="text-12-r text-brand-yellow-dark font-medium">
          ✓ {sido} {sigungu} {dong}
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
    </div>
  );
};

export default RegionSelector;