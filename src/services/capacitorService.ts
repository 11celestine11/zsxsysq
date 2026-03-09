import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const isNative = () => Capacitor.isNativePlatform();

export async function pickImage() {
  if (isNative()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      return `data:image/${image.format};base64,${image.base64String}`;
    } catch (e) {
      console.error('Camera error:', e);
      return null;
    }
  }
  return null;
}

export async function saveFile(filename: string, content: string) {
  if (isNative()) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      
      await Share.share({
        title: '分享文件',
        text: '这是导出的数据文件',
        url: result.uri,
        dialogTitle: '分享文件',
      });
      return true;
    } catch (e) {
      console.error('Filesystem error:', e);
      return false;
    }
  } else {
    // Web fallback
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}
