'use client';

import PhotoUpload from './PhotoUpload';

const Step2 = ({
  formData,
  errors,
  photoPreview,
  onFormDataChange,
  onPhotoChange,
  onPhotoRemove
}) => {
  const sizeOptions = [
    { value: 'small', label: '소형견 (10kg 이하)' },
    { value: 'medium', label: '중형견 (10-25kg)' },
    { value: 'large', label: '대형견 (25kg 이상)' }
  ];

  return (
    <div className="space-y-6">
      {/* 강아지 사진 */}
      <PhotoUpload
        photoPreview={photoPreview}
        onPhotoChange={onPhotoChange}
        onPhotoRemove={onPhotoRemove}
        error={errors.photo}
      />

      {/* 강아지 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강아지 이름 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          placeholder="강아지 이름을 입력해주세요"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* 강아지 크기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강아지 크기 *
        </label>
        <div className="space-y-2">
          {sizeOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="size"
                value={option.value}
                checked={formData.size === option.value}
                onChange={(e) => onFormDataChange('size', e.target.value)}
                className="mr-3 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.size && (
          <p className="text-xs text-red-500 mt-1">{errors.size}</p>
        )}
      </div>

      {/* 견종 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          견종
        </label>
        <input
          type="text"
          value={formData.breed}
          onChange={(e) => onFormDataChange('breed', e.target.value)}
          placeholder="견종을 입력해주세요 (선택사항)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* 안내 메시지 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">강아지 정보 입력 안내</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 강아지 사진은 이동 시 식별에 도움이 됩니다</li>
          <li>• 크기 정보는 이동 방법 결정에 중요합니다</li>
          <li>• 견종 정보는 선택사항입니다</li>
        </ul>
      </div>
    </div>
  );
};

export default Step2;
