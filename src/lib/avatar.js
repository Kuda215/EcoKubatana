export function getAvatarUrl(user) {
  if (user?.avatar_url) return user.avatar_url;
  try {
    return localStorage.getItem('ecokubatana_avatar') || '';
  } catch {
    return '';
  }
}

export function setLocalAvatar(url) {
  try {
    if (url) localStorage.setItem('ecokubatana_avatar', url);
    else localStorage.removeItem('ecokubatana_avatar');
  } catch { /* ignore */ }
}

export function resizeImageFile(file, max = 320) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('Could not read image'));
        else resolve(blob);
      }, 'image/jpeg', 0.86);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}
