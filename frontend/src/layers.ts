// Layer management for canvas-based drawing

export interface Layer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  visible: boolean;
}

export class LayerManager {
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;
  private container: HTMLElement;
  private layersList: HTMLElement;
  private layerCounter = 0;

  constructor(container: HTMLElement, layersList: HTMLElement) {
    this.container = container;
    this.layersList = layersList;
  }

  createLayer(name?: string): Layer {
    // Verificar que el contenedor exista y tenga dimensiones válidas
    if (!this.container) {
      console.error("Error: El contenedor del canvas no está definido.");
      throw new Error("Contenedor del canvas no encontrado");
    }

    this.layerCounter++;
    const layerName = name || `Capa ${this.layerCounter}`;
    const id = `layer-${Date.now()}-${this.layerCounter}`;

    // Create canvas for this layer
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    // Set canvas size to match container
    if (!this.container || typeof this.container.offsetWidth === 'undefined') {
      console.error("Error crítico: El contenedor de capas no es válido o no tiene dimensiones.", this.container);
      // Usar dimensiones por defecto si falla el contenedor
      const width = 800;
      const height = 600;
      canvas.width = width;
      canvas.height = height;
    } else {
      const width = this.container.offsetWidth || 800;
      const height = this.container.offsetHeight || 600;
      
      if (width === 0 || height === 0) {
        console.warn("Advertencia: El contenedor tiene dimensiones 0. Usando valores por defecto.");
      }
      
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    const layer: Layer = {
      id,
      name: layerName,
      canvas,
      ctx,
      visible: true,
    };

    // Add to beginning of array (top layer)
    this.layers.unshift(layer);
    this.activeLayerId = id;

    // Add canvas to DOM
    this.container.appendChild(canvas);

    // Update layers list UI
    this.updateLayersList();

    return layer;
  }

  deleteLayer(layerId: string): boolean {
    if (this.layers.length <= 1) {
      return false; // Can't delete the last layer
    }

    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1) {
      return false;
    }

    // Remove from DOM
    const layer = this.layers[index];
    layer.canvas.remove();

    // Remove from array
    this.layers.splice(index, 1);

    // If deleted layer was active, set new active layer
    if (this.activeLayerId === layerId) {
      this.activeLayerId = this.layers[0]?.id || null;
    }

    this.updateLayersList();
    return true;
  }

  setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;
    this.updateLayersList();
  }

  getActiveLayer(): Layer | null {
    if (!this.activeLayerId) {
      return null;
    }
    return this.layers.find(l => l.id === this.activeLayerId) || null;
  }

  getActiveCtx(): CanvasRenderingContext2D | null {
    const activeLayer = this.getActiveLayer();
    return activeLayer?.ctx || null;
  }

  toggleLayerVisibility(layerId: string): void {
    const layer = this.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      layer.canvas.style.display = layer.visible ? 'block' : 'none';
      this.updateLayersList();
    }
  }

  mergeDown(layerId: string): boolean {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1 || index >= this.layers.length - 1) {
      return false; // No layer below to merge with
    }

    const topLayer = this.layers[index];
    const bottomLayer = this.layers[index + 1];

    // Draw top layer onto bottom layer
    bottomLayer.ctx.drawImage(topLayer.canvas, 0, 0);

    // Delete top layer
    topLayer.canvas.remove();
    this.layers.splice(index, 1);

    // Set bottom layer as active
    this.activeLayerId = bottomLayer.id;

    this.updateLayersList();
    return true;
  }

  getCompositeCanvas(): HTMLCanvasElement {
    // Create a temporary canvas to composite all visible layers
    const compositeCanvas = document.createElement('canvas');
    const width = this.container.offsetWidth || 800;
    const height = this.container.offsetHeight || 600;
    compositeCanvas.width = width;
    compositeCanvas.height = height;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas compuesto');
    }

    // Draw layers from bottom to top (reverse order)
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (layer.visible) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    }

    return compositeCanvas;
  }

  private updateLayersList(): void {
    this.layersList.innerHTML = '';

    this.layers.forEach(layer => {
      const layerItem = document.createElement('div');
      layerItem.className = `layer-item ${layer.id === this.activeLayerId ? 'active' : ''}`;
      layerItem.dataset.layerId = layer.id;

      // Visibility toggle button
      const visibilityBtn = document.createElement('button');
      visibilityBtn.className = 'layer-visibility';
      visibilityBtn.textContent = layer.visible ? '👁️' : '🚫';
      visibilityBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1rem;';
      visibilityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLayerVisibility(layer.id);
      });

      // Layer name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = layer.name;
      nameSpan.style.cssText = 'flex:1;text-align:left;padding:0.2rem;cursor:pointer;';
      nameSpan.addEventListener('click', () => {
        this.setActiveLayer(layer.id);
      });

      // Click to select layer
      layerItem.addEventListener('click', () => {
        this.setActiveLayer(layer.id);
      });

      layerItem.appendChild(visibilityBtn);
      layerItem.appendChild(nameSpan);
      this.layersList.appendChild(layerItem);
    });
  }

  resizeAllLayers(width: number, height: number): void {
    // Save content of each layer before resizing
    const layerData: {id: string; imageData: ImageData}[] = [];
    
    this.layers.forEach(layer => {
      // Save current image data
      const imageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
      layerData.push({id: layer.id, imageData});
    });
    
    // Resize each layer
    this.layers.forEach(layer => {
      const oldWidth = layer.canvas.width;
      const oldHeight = layer.canvas.height;
      layer.canvas.width = width;
      layer.canvas.height = height;
      
      // Get saved data for this layer
      const savedData = layerData.find(d => d.id === layer.id)!.imageData;
      
      // Restore the saved image data (cropped or expanded as needed)
      if (width >= oldWidth && height >= oldHeight) {
        // Canvas is larger - just put the data
        layer.ctx.putImageData(savedData, 0, 0);
      } else {
        // If canvas is smaller, we need to crop
        const croppedData = layer.ctx.createImageData(
          Math.min(width, savedData.width),
          Math.min(height, savedData.height)
        );
        
        // Copy overlapping pixels
        for (let y = 0; y < croppedData.height; y++) {
          for (let x = 0; x < croppedData.width; x++) {
            const srcIdx = (y * savedData.width + x) * 4;
            const dstIdx = (y * croppedData.width + x) * 4;
            croppedData.data[dstIdx] = savedData.data[srcIdx];
            croppedData.data[dstIdx + 1] = savedData.data[srcIdx + 1];
            croppedData.data[dstIdx + 2] = savedData.data[srcIdx + 2];
            croppedData.data[dstIdx + 3] = savedData.data[srcIdx + 3];
          }
        }
        layer.ctx.putImageData(croppedData, 0, 0);
      }
    });
  }
}
