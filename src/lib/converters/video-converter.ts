/**
 * Multi Convert - Video Converter
 * Conversion vidéo (MP4, AVI, MOV, WebM, MKV, etc.)
 * 
 * Note: Utilise FFmpeg via fluent-ffmpeg
 */

import ffmpeg from '../ffmpeg-config';
import { Readable } from 'stream';
import { promisify } from 'util';

export interface VideoConversionOptions {
  format?: 'mp4' | 'avi' | 'mov' | 'webm' | 'mkv' | 'flv' | 'wmv';
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: string; // '1920x1080', '1280x720', etc.
  fps?: number;
  bitrate?: string; // '2000k', '5000k', etc.
  audioCodec?: 'aac' | 'mp3' | 'opus' | 'vorbis';
  audioBitrate?: string; // '128k', '192k', etc.
}

export interface VideoMetadata {
  duration: number; // secondes
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  audioCodec: string;
  audioBitrate: number;
  format: string;
  size: number;
}

export class VideoConverter {
  /**
   * Convertit une vidéo vers un autre format
   */
  static async convert(
    inputBuffer: Buffer,
    options: VideoConversionOptions = {}
  ): Promise<Buffer> {
    const {
      format = 'mp4',
      codec = 'h264',
      quality = 'high',
      resolution,
      fps,
      bitrate,
      audioCodec = 'aac',
      audioBitrate = '192k',
    } = options;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(inputBuffer);
      
      let command = ffmpeg(inputStream)
        .outputFormat(format)
        .videoCodec(codec)
        .audioCodec(audioCodec)
        .audioBitrate(audioBitrate);

      // Qualité
      const qualityPresets = {
        low: { crf: 28, preset: 'fast' },
        medium: { crf: 23, preset: 'medium' },
        high: { crf: 18, preset: 'slow' },
        ultra: { crf: 15, preset: 'veryslow' },
      };

      const preset = qualityPresets[quality];
      if (codec === 'h264' || codec === 'h265') {
        command = command
          .outputOptions([`-crf ${preset.crf}`, `-preset ${preset.preset}`]);
      }

      // Résolution
      if (resolution) {
        command = command.size(resolution);
      }

      // FPS
      if (fps) {
        command = command.fps(fps);
      }

      // Bitrate
      if (bitrate) {
        command = command.videoBitrate(bitrate);
      }

      // Convertir en stream
      command
        .on('start', (cmd) => {
          console.log('Conversion vidéo démarrée:', cmd);
        })
        .on('progress', (progress) => {
          console.log(`Progression: ${progress.percent?.toFixed(2)}%`);
        })
        .on('error', (err) => {
          console.error('Erreur conversion vidéo:', err);
          reject(new Error(`Échec de la conversion: ${err.message}`));
        })
        .on('end', () => {
          console.log('Conversion vidéo terminée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Extrait l'audio d'une vidéo
   */
  static async extractAudio(
    videoBuffer: Buffer,
    format: 'mp3' | 'wav' | 'aac' | 'flac' = 'mp3'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(videoBuffer);

      ffmpeg(inputStream)
        .outputFormat(format)
        .noVideo()
        .audioCodec(format === 'mp3' ? 'libmp3lame' : format)
        .audioBitrate('192k')
        .on('error', (err) => {
          console.error('Erreur extraction audio:', err);
          reject(new Error(`Échec de l'extraction: ${err.message}`));
        })
        .on('end', () => {
          console.log('Extraction audio terminée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Découpe une vidéo
   */
  static async trim(
    videoBuffer: Buffer,
    startTime: string, // '00:00:10'
    duration: string   // '00:00:30'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(videoBuffer);

      ffmpeg(inputStream)
        .setStartTime(startTime)
        .setDuration(duration)
        .outputFormat('mp4')
        .videoCodec('copy')
        .audioCodec('copy')
        .on('error', (err) => {
          console.error('Erreur découpage:', err);
          reject(new Error(`Échec du découpage: ${err.message}`));
        })
        .on('end', () => {
          console.log('Découpage terminé');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Compresse une vidéo
   */
  static async compress(
    videoBuffer: Buffer,
    targetSizeMB?: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(videoBuffer);

      let command = ffmpeg(inputStream)
        .outputFormat('mp4')
        .videoCodec('h264')
        .audioCodec('aac')
        .outputOptions([
          '-crf 28',
          '-preset fast',
          '-movflags +faststart',
        ]);

      // Si taille cible spécifiée, calculer le bitrate
      if (targetSizeMB) {
        // Obtenir d'abord la durée (simplifié ici)
        const targetBitrate = Math.floor((targetSizeMB * 8192) / 60); // Approximation
        command = command.videoBitrate(`${targetBitrate}k`);
      }

      command
        .on('error', (err) => {
          console.error('Erreur compression:', err);
          reject(new Error(`Échec de la compression: ${err.message}`));
        })
        .on('end', () => {
          console.log('Compression terminée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Obtient les métadonnées d'une vidéo
   */
  static async getMetadata(videoBuffer: Buffer): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(videoBuffer);

      ffmpeg.ffprobe(inputStream as any, (err, metadata) => {
        if (err) {
          console.error('Erreur lecture métadonnées:', err);
          reject(new Error('Échec de la lecture des métadonnées'));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: eval(videoStream?.r_frame_rate || '0') || 0,
          codec: videoStream?.codec_name || 'unknown',
          bitrate: metadata.format.bit_rate || 0,
          audioCodec: audioStream?.codec_name || 'none',
          audioBitrate: audioStream?.bit_rate || 0,
          format: metadata.format.format_name || 'unknown',
          size: videoBuffer.length,
        });
      });
    });
  }

  /**
   * Crée une miniature depuis une vidéo
   */
  static async createThumbnail(
    videoBuffer: Buffer,
    timestamp: string = '00:00:01'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(videoBuffer);

      ffmpeg(inputStream)
        .screenshots({
          timestamps: [timestamp],
          size: '320x240',
        })
        .on('error', (err) => {
          console.error('Erreur création miniature:', err);
          reject(new Error(`Échec de la création: ${err.message}`));
        })
        .on('end', () => {
          console.log('Miniature créée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }
}
