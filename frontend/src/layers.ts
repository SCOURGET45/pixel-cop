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
    const width = this.container.offsetWidth || 800;
    const height = this.container.offsetHeight || 600;
    canvas.width = width;
    canvas.height = height;

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
      visibilityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLayerVisibility(layer.id);
      });

      // Layer name input
      const nameInput = document.createElement('input');
      nameInput.className = 'layer-name';
      nameInput.type = 'text';
      nameInput.value = layer.name;
      nameInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      nameInput.addEventListener('change', () => {
        layer.name = nameInput.value;
      });

      // Click to select layer
      layerItem.addEventListener('click', () => {
        this.setActiveLayer(layer.id);
      });

      layerItem.appendChild(visibilityBtn);
      layerItem.appendChild(nameInput);
      this.layersList.appendChild(layerItem);
    });
  }
}
