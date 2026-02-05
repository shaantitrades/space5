/**
 * Multi Convert - Audio Converter
 * Conversion audio (MP3, WAV, FLAC, AAC, OGG, etc.)
 */

import ffmpeg from '../ffmpeg-config';
import { Readable } from 'stream';

export interface AudioConversionOptions {
  format?: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'wma' | 'm4a';
  bitrate?: string; // '128k', '192k', '320k'
  sampleRate?: number; // 44100, 48000
  channels?: number; // 1 (mono), 2 (stereo)
  quality?: 'low' | 'medium' | 'high' | 'lossless';
}

export interface AudioMetadata {
  duration: number;
  codec: string;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  size: number;
}

export class AudioConverter {
  /**
   * Convertit un fichier audio
   */
  static async convert(
    audioBuffer: Buffer,
    options: AudioConversionOptions = {}
  ): Promise<Buffer> {
    const {
      format = 'mp3',
      bitrate = '192k',
      sampleRate = 44100,
      channels = 2,
      quality = 'high',
    } = options;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(audioBuffer);

      let command = ffmpeg(inputStream).outputFormat(format);

      // Codec selon le format
      const codecMap: Record<string, string> = {
        mp3: 'libmp3lame',
        wav: 'pcm_s16le',
        flac: 'flac',
        aac: 'aac',
        ogg: 'libvorbis',
        wma: 'wmav2',
        m4a: 'aac',
      };

      command = command.audioCodec(codecMap[format] || 'copy');

      // Qualité
      if (quality !== 'lossless') {
        command = command.audioBitrate(bitrate);
      }

      command = command
        .audioFrequency(sampleRate)
        .audioChannels(channels)
        .on('start', (cmd) => {
          console.log('Conversion audio démarrée:', cmd);
        })
        .on('progress', (progress) => {
          console.log(`Progression: ${progress.percent?.toFixed(2)}%`);
        })
        .on('error', (err) => {
          console.error('Erreur conversion audio:', err);
          reject(new Error(`Échec: ${err.message}`));
        })
        .on('end', () => {
          console.log('Conversion audio terminée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Découpe un fichier audio
   */
  static async trim(
    audioBuffer: Buffer,
    startTime: string,
    duration: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(audioBuffer);

      ffmpeg(inputStream)
        .setStartTime(startTime)
        .setDuration(duration)
        .outputFormat('mp3')
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('error', (err) => {
          console.error('Erreur découpage audio:', err);
          reject(new Error(`Échec: ${err.message}`));
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
   * Fusionne plusieurs fichiers audio
   */
  static async merge(audioBuffers: Buffer[]): Promise<Buffer> {
    if (audioBuffers.length === 0) {
      throw new Error('Aucun fichier à fusionner');
    }

    if (audioBuffers.length === 1) {
      return audioBuffers[0];
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      // Créer un stream pour chaque buffer
      const streams = audioBuffers.map(buf => Readable.from(buf));

      let command = ffmpeg();
      
      // Ajouter toutes les entrées
      streams.forEach(stream => {
        command = command.input(stream as any);
      });

      command
        .on('error', (err) => {
          console.error('Erreur fusion audio:', err);
          reject(new Error(`Échec: ${err.message}`));
        })
        .on('end', () => {
          console.log('Fusion terminée');
          resolve(Buffer.concat(chunks));
        })
        .mergeToFile('output.mp3')
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Compresse un fichier audio
   */
  static async compress(
    audioBuffer: Buffer,
    targetBitrate: string = '128k'
  ): Promise<Buffer> {
    return await this.convert(audioBuffer, {
      format: 'mp3',
      bitrate: targetBitrate,
      quality: 'medium',
    });
  }

  /**
   * Normalise le volume d'un audio
   */
  static async normalize(audioBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(audioBuffer);

      ffmpeg(inputStream)
        .outputFormat('mp3')
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .audioFilters(['loudnorm'])
        .on('error', (err) => {
          console.error('Erreur normalisation:', err);
          reject(new Error(`Échec: ${err.message}`));
        })
        .on('end', () => {
          console.log('Normalisation terminée');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  /**
   * Obtient les métadonnées
   */
  static async getMetadata(audioBuffer: Buffer): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(audioBuffer);

      ffmpeg.ffprobe(inputStream as any, (err, metadata) => {
        if (err) {
          console.error('Erreur lecture métadonnées:', err);
          reject(new Error('Échec lecture métadonnées'));
          return;
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration || 0,
          codec: audioStream?.codec_name || 'unknown',
          bitrate: audioStream?.bit_rate || 0,
          sampleRate: audioStream?.sample_rate || 0,
          channels: audioStream?.channels || 0,
          format: metadata.format.format_name || 'unknown',
          size: audioBuffer.length,
        });
      });
    });
  }

  /**
   * Crée un fondu (fade in/out)
   */
  static async addFade(
    audioBuffer: Buffer,
    fadeIn: number = 0,
    fadeOut: number = 0
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(audioBuffer);

      const filters = [];
      if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn}`);
      if (fadeOut > 0) filters.push(`afade=t=out:st=${fadeOut}:d=2`);

      ffmpeg(inputStream)
        .outputFormat('mp3')
        .audioCodec('libmp3lame')
        .audioFilters(filters.join(','))
        .on('error', (err) => {
          console.error('Erreur fade:', err);
          reject(new Error(`Échec: ${err.message}`));
        })
        .on('end', () => {
          console.log('Fade appliqué');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }
}
