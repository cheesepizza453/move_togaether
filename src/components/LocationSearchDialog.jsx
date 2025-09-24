'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

const LocationSearchDialog = ({ isOpen, onClose, onLocationConfirm }) => {
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog가 열릴 때 body 스크롤 방지 (Radix UI 기본 동작만 사용)
  // useEffect(() => {
  //   if (isOpen) {
  //     // 단순히 overflow만 hidden으로 설정
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     // 스크롤 복원
  //     document.body.style.overflow = 'unset';
  //   }

  //   // 컴포넌트 언마운트 시 스크롤 복원
  //   return () => {
  //     document.body.style.overflow = 'unset';
  //   };
  // }, [isOpen]);

  // 다이얼로그가 열릴 때 현재 위치 가져오기
  useEffect(() => {
    if (isOpen) {
      setCurrentLocation('');
      setCurrentCoordinates(null);
      setError(null);
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 브라우저의 위치 API 사용
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5분
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // 카카오맵 API를 사용하여 주소 변환
      const address = await getAddressFromCoordinates(latitude, longitude);

      setCurrentLocation(address);
      setCurrentCoordinates({ latitude, longitude });
    } catch (err) {
      console.error('위치 가져오기 오류:', err);
      setError('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
      // 위치 가져오기 실패 시 다이얼로그를 닫고 기존 정렬로 되돌림
      setTimeout(() => {
        onClose();
      }, 2000); // 2초 후 자동으로 닫기
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // 서버사이드 API를 사용한 좌표 → 주소 변환
      const response = await fetch('/api/coord2address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      });

      if (!response.ok) {
        throw new Error('주소 변환에 실패했습니다.');
      }

      const data = await response.json();

      if (data.success && data.address) {
        return data.address;
      } else {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error('주소 변환 오류:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleSearch = () => {
    if (currentLocation && currentCoordinates) {
      onLocationConfirm({
        address: currentLocation,
        coordinates: currentCoordinates
      });
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      modal={false}
    >
      {/* 커스텀 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60"
          onClick={onClose}
        />
      )}
      <DialogContent
        className="sm:max-w-md z-[9999] bg-white"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-center">현재 위치 찾기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Input
              value={currentLocation}
              placeholder="현재 위치로 주소 찾기"
              readOnly
              className="bg-yellow-50 border-yellow-200"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            onClick={handleSearch}
            disabled={!currentLocation || isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          >
            <MapPin className="h-4 w-4 mr-2" />
            현재 위치 검색
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSearchDialog;
