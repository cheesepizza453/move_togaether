// src/lib/compressImage.js
export function compressImage(file, maxWidth = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('파일이 없습니다.'));

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        reader.onerror = reject;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const originWidth = img.width;
            const originHeight = img.height;

            let targetWidth = originWidth;
            let targetHeight = originHeight;

            if (originWidth > maxWidth) {
                const ratio = maxWidth / originWidth;
                targetWidth = maxWidth;
                targetHeight = originHeight * ratio;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('이미지 압축 실패'));

                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.\w+$/, '.jpg'),
                        { type: 'image/jpeg' }
                    );

                    resolve(compressedFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = reject;

        reader.readAsDataURL(file);
    });
}
