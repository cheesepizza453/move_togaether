'use client';

import RegionSelector from './RegionSelector';
import React from 'react';

const getTodayDateValue = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().split('T')[0];
};

const Step1 = ({
  title,
  formData,
  errors,
  onFormDataChange,
  showArrival = true,
  departureLabel = '출발지',
  dateFieldName = null,
  dateLabel = '',
  showDescription = true,
  allowPartialRegion = false,
  descriptionHint = '희망 일정, 동행견 설명, 켄넬 지원 여부, 공격성, 질병, 봉사자님께 전하는 말 등',
  descriptionPlaceholder = '이동 봉사에 대한 상세한 설명을 입력해주세요.\n(희망 일정, 동행견 설명, 켄넬 지원 여부, 공격성, 질병, 봉사자님께 전하는 말 등)',
}) => {
  const handleDepartureChange = ({ address, sido, sigungu, dong }) => {
    onFormDataChange('departureAddress', address);
    onFormDataChange('departureSido', sido);
    onFormDataChange('departureSigungu', sigungu);
    onFormDataChange('departureDong', dong);
  };

  const handleArrivalChange = ({ address, sido, sigungu, dong }) => {
    onFormDataChange('arrivalAddress', address);
    onFormDataChange('arrivalSido', sido);
    onFormDataChange('arrivalSigungu', sigungu);
    onFormDataChange('arrivalDong', dong);
  };

  return (
    <div className="space-y-6">
      <div className={'flex justify-between items-start'}>
        <h5 className={'text-20-m'}>{title}</h5>
        <p className={'flex items-start text-10-l text-[#DB1F1F]'}>
          <span className={'text-16-m mt-[-2px]'}>*</span>표시는 필수 입력 정보입니다.
        </p>
      </div>

      {/* 제목 */}
      <div className={'mt-[20px]'}>
        <label htmlFor={'title'} className="block text-16-m mb-[12px]">
          제목<span className={'text-[#E17364] text-16-m'}>*</span>
        </label>
        <input
          id={'title'}
          type="text"
          value={formData.title}
          maxLength={40}
          onChange={(e) => onFormDataChange('title', e.target.value)}
          placeholder="제목을 입력해주세요"
          className={`appearance-none w-full h-[52px] px-[18px] border rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="relative flex justify-between items-center mt-1">
          <div>{errors.title && <p className="text-xs text-red-500">{errors.title}</p>}</div>
          <p className="absolute top-[2px] right-[5px] text-text-800 text-12-l">
            {formData.title?.length || 0}/40
          </p>
        </div>
      </div>

      {dateFieldName && (
        <div>
          <label htmlFor={dateFieldName} className="block text-16-m mb-[12px]">
            {dateLabel}<span className={'text-[#E17364] text-16-m'}>*</span>
          </label>
          <input
            id={dateFieldName}
            type="date"
            value={formData[dateFieldName] || ''}
            max={getTodayDateValue()}
            onChange={(e) => onFormDataChange(dateFieldName, e.target.value)}
            className={`w-full h-[52px] px-[18px] border rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors ${
              errors[dateFieldName] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors[dateFieldName] && (
            <p className="text-xs text-red-500 mt-1">{errors[dateFieldName]}</p>
          )}
        </div>
      )}

      {/* 이동 경로 / 위치 */}
      <div className="space-y-6">
        {showArrival && (
          <h3 className="block text-16-m">
            이동 경로<span className={'text-[#E17364] text-16-m'}>*</span>
          </h3>
        )}

        <RegionSelector
          label={departureLabel}
          value={formData.departureAddress}
          onChange={handleDepartureChange}
          error={errors.departureAddress}
          allowPartialRegion={allowPartialRegion}
          required
        />

        {showArrival && (
          <RegionSelector
            label="도착지"
            value={formData.arrivalAddress}
            onChange={handleArrivalChange}
            error={errors.arrivalAddress}
            allowOverseas
            allowPartialRegion={allowPartialRegion}
            required
          />
        )}
      </div>

      {showDescription && (
        <div>
          <label htmlFor={'description'} className="block text-16-m mb-[6px]">
            설명<span className={'text-[#E17364] text-16-m'}>*</span>
          </label>
          <p className="text-12-r text-text-800 mb-[12px]">
            {descriptionHint}
          </p>
          <textarea
            maxLength={800}
            id={'description'}
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder={descriptionPlaceholder}
            rows={4}
            className={`w-full h-[52px] px-[18px] border rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors resize-none py-[14px] min-h-[140px] ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className={'relative'}>
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
            <p className="absolute right-[5px] text-text-800 text-12-l">
              {formData.description?.length || 0}/800
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1;
