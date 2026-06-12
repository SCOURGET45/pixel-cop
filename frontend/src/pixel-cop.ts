// Pixel-Cop: Herramienta de verificación de integridad de imágenes
// Compara los píxeles actuales con los originales y resalta las diferencias

export interface PixelDifference {
  x: number;
  y: number;
  originalColor: { r: number; g: number; b: number; a: number };
  currentColor: { r: number; g: number; b: number; a: number };
}

export interface IntegrityReport {
  totalPixels: number;
  differentPixels: number;
  integrityPercentage: number;
  differences: PixelDifference[];
}

export class PixelCop {
  private originalImageData: ImageData | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    this.ctx = context;
  }

  /**
   * Guarda el estado original de la imagen para comparaciones futuras
   */
  saveOriginalState(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.originalImageData = this.ctx.getImageData(0, 0, width, height);
    console.log('Pixel-Cop: Estado original guardado');
  }

  /**
   * Restaura el estado original de la imagen
   */
  restoreOriginalState(): boolean {
    if (!this.originalImageData) {
      console.warn('Pixel-Cop: No hay estado original guardado');
      return false;
    }
    this.ctx.putImageData(this.originalImageData, 0, 0);
    console.log('Pixel-Cop: Estado original restaurado');
    return true;
  }

  /**
   * Compara los píxeles actuales con los originales
   * Devuelve un reporte de integridad
   */
  verifyIntegrity(): IntegrityReport {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const currentImageData = this.ctx.getImageData(0, 0, width, height);
    
    const report: IntegrityReport = {
      totalPixels: width * height,
      differentPixels: 0,
      integrityPercentage: 100,
      differences: []
    };

    if (!this.originalImageData) {
      console.warn('Pixel-Cop: No hay estado original para comparar');
      return report;
    }

    const originalData = this.originalImageData.data;
    const currentData = currentImageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const origR = originalData[index];
        const origG = originalData[index + 1];
        const origB = originalData[index + 2];
        const origA = originalData[index + 3];

        const currR = currentData[index];
        const currG = currentData[index + 1];
        const currB = currentData[index + 2];
        const currA = currentData[index + 3];

        // Comparar si los píxeles son diferentes
        if (origR !== currR || origG !== currG || origB !== currB || origA !== currA) {
          report.differentPixels++;
          report.differences.push({
            x,
            y,
            originalColor: { r: origR, g: origG, b: origB, a: origA },
            currentColor: { r: currR, g: currG, b: currB, a: currA }
          });
        }
      }
    }

    report.integrityPercentage = Math.round(
      ((report.totalPixels - report.differentPixels) / report.totalPixels) * 100
    );

    console.log(`Pixel-Cop: Integridad ${report.integrityPercentage}% (${report.differentPixels} píxeles modificados)`);
    return report;
  }

  /**
   * Resalta los píxeles modificados en el canvas
   * @param color - Color para resaltar (por defecto rojo semitransparente)
   * @param duration - Duración del resaltado en ms (por defecto 2000ms)
   */
  highlightDifferences(color: string = 'rgba(255, 0, 0, 0.5)', duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      const report = this.verifyIntegrity();
      
      if (report.differentPixels === 0) {
        console.log('Pixel-Cop: No hay diferencias que resaltar');
        resolve();
        return;
      }

      // Crear un canvas temporal para el resaltado
      const overlay = document.createElement('canvas');
      overlay.width = this.canvas.width;
      overlay.height = this.canvas.height;
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.pointerEvents = 'none';
      
      const overlayCtx = overlay.getContext('2d');
      if (!overlayCtx) {
        resolve();
        return;
      }

      // Dibujar rectángulos rojos sobre los píxeles modificados
      overlayCtx.fillStyle = color;
      
      report.differences.forEach(diff => {
        // Dibujar un pequeño cuadrado en cada píxel modificado
        overlayCtx.fillRect(diff.x, diff.y, 1, 1);
      });

      // Añadir el overlay al canvas
      this.canvas.parentElement?.appendChild(overlay);

      // Eliminar el overlay después de la duración especificada
      setTimeout(() => {
        overlay.remove();
        console.log('Pixel-Cop: Resaltado eliminado');
        resolve();
      }, duration);
    });
  }

  /**
   * Obtiene los datos de la imagen original en Base64
   */
  getOriginalImageBase64(format: string = 'image/png'): string | null {
    if (!this.originalImageData) {
      return null;
    }

    // Crear un canvas temporal para convertir ImageData a Base64
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      return null;
    }

    tempCtx.putImageData(this.originalImageData, 0, 0);
    return tempCanvas.toDataURL(format);
  }

  /**
   * Establece la imagen original desde una cadena Base64
   */
  setOriginalImageFromBase64(base64Data: string): boolean {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          this.originalImageData = tempCtx.getImageData(0, 0, img.width, img.height);
          console.log('Pixel-Cop: Imagen original cargada desde Base64');
          resolve(true);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => {
        console.error('Pixel-Cop: Error al cargar imagen Base64');
        resolve(false);
      };
      img.src = base64Data;
    }) as unknown as boolean;
  }

  /**
   * Compara dos imágenes Base64 y devuelve las diferencias
   * Método estático útil para comparaciones sin instancia
   */
  static compareBase64Images(originalBase64: string, currentBase64: string): Promise<IntegrityReport> {
    return new Promise((resolve) => {
      const img1 = new Image();
      const img2 = new Image();
      let loadedImages = 0;

      const checkLoaded = () => {
        loadedImages++;
        if (loadedImages === 2) {
          // Ambas imágenes cargadas, proceder con la comparación
          const width = Math.max(img1.width, img2.width);
          const height = Math.max(img1.height, img2.height);

          const canvas1 = document.createElement('canvas');
          canvas1.width = width;
          canvas1.height = height;
          const ctx1 = canvas1.getContext('2d');

          const canvas2 = document.createElement('canvas');
          canvas2.width = width;
          canvas2.height = height;
          const ctx2 = canvas2.getContext('2d');

          if (!ctx1 || !ctx2) {
            resolve({
              totalPixels: width * height,
              differentPixels: 0,
              integrityPercentage: 100,
              differences: []
            });
            return;
          }

          ctx1.drawImage(img1, 0, 0);
          ctx2.drawImage(img2, 0, 0);

          const data1 = ctx1.getImageData(0, 0, width, height).data;
          const data2 = ctx2.getImageData(0, 0, width, height).data;

          const report: IntegrityReport = {
            totalPixels: width * height,
            differentPixels: 0,
            integrityPercentage: 100,
            differences: []
          };

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const index = (y * width + x) * 4;
              
              if (
                data1[index] !== data2[index] ||
                data1[index + 1] !== data2[index + 1] ||
                data1[index + 2] !== data2[index + 2] ||
                data1[index + 3] !== data2[index + 3]
              ) {
                report.differentPixels++;
                report.differences.push({
                  x,
                  y,
                  originalColor: { 
                    r: data1[index], 
                    g: data1[index + 1], 
                    b: data1[index + 2], 
                    a: data1[index + 3] 
                  },
                  currentColor: { 
                    r: data2[index], 
                    g: data2[index + 1], 
                    b: data2[index + 2], 
                    a: data2[index + 3] 
                  }
                });
              }
            }
          }

          report.integrityPercentage = Math.round(
            ((report.totalPixels - report.differentPixels) / report.totalPixels) * 100
          );

          resolve(report);
        }
      };

      img1.onload = checkLoaded;
      img2.onload = checkLoaded;
      img1.onerror = () => resolve({ totalPixels: 0, differentPixels: 0, integrityPercentage: 100, differences: [] });
      img2.onerror = () => resolve({ totalPixels: 0, differentPixels: 0, integrityPercentage: 100, differences: [] });

      img1.src = originalBase64;
      img2.src = currentBase64;
    });
  }
}
