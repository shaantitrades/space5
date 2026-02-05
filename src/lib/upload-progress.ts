/**
 * Upload avec progression
 * Utilise XMLHttpRequest pour tracker la progression d'upload
 */
export async function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void,
  signal?: AbortSignal
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Gérer l'annulation
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    // Progression de l'upload (0-50%)
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 50; // 0-50% pour l'upload
        onProgress(percentComplete);
      }
    });

    // Upload terminé, traitement côté serveur (50%)
    xhr.upload.addEventListener('load', () => {
      onProgress(50);
    });

    // Progression du téléchargement de la réponse (50-100%)
    xhr.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = 50 + (e.loaded / e.total) * 50; // 50-100% pour le download
        onProgress(percentComplete);
      }
    });

    // Réponse complète
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        
        // Créer une Response compatible fetch
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(
            xhr.getAllResponseHeaders()
              .trim()
              .split('\r\n')
              .reduce((acc, line) => {
                const [key, value] = line.split(': ');
                if (key && value) acc[key] = value;
                return acc;
              }, {} as Record<string, string>)
          ),
        });
        
        resolve(response);
      } else {
        reject(new Error(`HTTP Error ${xhr.status}: ${xhr.statusText}`));
      }
    });

    // Erreur réseau
    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    // Timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Request timeout'));
    });

    // Envoi de la requête
    xhr.open('POST', url);
    xhr.responseType = 'blob';
    xhr.send(formData);
  });
}

/**
 * Simuler une progression pour les opérations sans tracking réel
 * Utile pour les conversions locales côté client
 */
export function simulateProgress(
  duration: number,
  onProgress: (progress: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = 50; // Update every 50ms
    
    const updateProgress = () => {
      if (signal?.aborted) {
        clearInterval(timer);
        reject(new Error('Operation cancelled'));
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, (elapsed / duration) * 100);
      onProgress(progress);

      if (progress >= 95) {
        clearInterval(timer);
        onProgress(100);
        resolve();
      }
    };

    const timer = setInterval(updateProgress, interval);
    
    // Cleanup si annulation
    if (signal) {
      signal.addEventListener('abort', () => {
        clearInterval(timer);
        reject(new Error('Operation cancelled'));
      });
    }
  });
}
