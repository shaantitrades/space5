/**
 * Multi Convert - FFmpeg Configuration
 * Configuration automatique de FFmpeg pour les conversions vidéo/audio
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

// Configurer le chemin FFmpeg
if (ffmpegPath && ffmpegPath.path) {
  ffmpeg.setFfmpegPath(ffmpegPath.path);
  console.log('✅ FFmpeg configuré:', ffmpegPath.path);
} else {
  console.warn('⚠️ FFmpeg non trouvé, les conversions vidéo/audio ne fonctionneront pas');
}

export { ffmpeg };
export default ffmpeg;
