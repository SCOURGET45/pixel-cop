// Drawing tools for canvas-based painting

export type ToolType = 'brush' | 'eraser' | 'fill' | 'picker' | 'selection';

export interface SelectionBuffer {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class DrawingTools {
  private currentTool: ToolType = 'brush';
  private currentColor: string = '#000000';
  private brushSize: number = 5;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  
  // Selection tool properties
  private selectionBuffer: SelectionBuffer | null = null;
  private isSelecting: boolean = false;
  private startCoords: {x: number, y: number} = {x: 0, y: 0};
  private selectionRect: {x1: number, y1: number, x2: number, y2: number} | null = null;

  setTool(tool: ToolType): void {
    this.currentTool = tool;
  }

  getCurrentTool(): ToolType {
    return this.currentTool;
  }

  setColor(color: string): void {
    this.currentColor = color;
  }

  getColor(): string {
    return this.currentColor;
  }

  setBrushSize(size: number): void {
    this.brushSize = size;
  }

  getBrushSize(): number {
    return this.brushSize;
  }

  // Selection tool methods
  startSelection(x: number, y: number): void {
    if (this.currentTool !== 'selection') return;
    this.isSelecting = true;
    this.startCoords = {x, y};
    this.selectionRect = {x1: x, y1: y, x2: x, y2: y};
  }
  
  updateSelection(x: number, y: number): {x1: number, y1: number, x2: number, y2: number} | null {
    if (!this.isSelecting || this.currentTool !== 'selection') return null;
    this.selectionRect = {
      x1: this.startCoords.x,
      y1: this.startCoords.y,
      x2: x,
      y2: y
    };
    return this.selectionRect;
  }
  
  endSelection(ctx: CanvasRenderingContext2D): SelectionBuffer | null {
    if (!this.isSelecting || !this.selectionRect) return null;
    
    const {x1, y1, x2, y2} = this.selectionRect;
    const startX = Math.min(x1, x2);
    const startY = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    
    if (width <= 0 || height <= 0) {
      this.isSelecting = false;
      this.selectionRect = null;
      return null;
    }
    
    // Capture the pixels in the selection area
    this.selectionBuffer = {
      imageData: ctx.getImageData(startX, startY, width, height),
      x: startX,
      y: startY,
      width: width,
      height: height
    };
    
    this.isSelecting = false;
    this.selectionRect = null;
    console.log('Área copiada al buffer');
    return this.selectionBuffer;
  }
  
  getSelectionBuffer(): SelectionBuffer | null {
    return this.selectionBuffer;
  }
  
  clearSelection(ctx: CanvasRenderingContext2D): boolean {
    if (!this.selectionBuffer) return false;
    ctx.clearRect(
      this.selectionBuffer.x,
      this.selectionBuffer.y,
      this.selectionBuffer.width,
      this.selectionBuffer.height
    );
    return true;
  }
  
  moveSelection(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number): boolean {
    if (!this.selectionBuffer) return false;
    
    // Clear the old area
    ctx.clearRect(
      this.selectionBuffer.x,
      this.selectionBuffer.y,
      this.selectionBuffer.width,
      this.selectionBuffer.height
    );
    
    // Update position
    this.selectionBuffer.x += deltaX;
    this.selectionBuffer.y += deltaY;
    
    // Draw the selection at new position
    ctx.putImageData(
      this.selectionBuffer.imageData,
      this.selectionBuffer.x,
      this.selectionBuffer.y
    );
    
    return true;
  }
  
  pasteSelection(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
    if (!this.selectionBuffer) return false;
    
    ctx.putImageData(this.selectionBuffer.imageData, x, y);
    return true;
  }
  
  cancelSelection(): void {
    this.selectionBuffer = null;
    this.isSelecting = false;
    this.selectionRect = null;
  }
  
  isCurrentlySelecting(): boolean {
    return this.isSelecting;
  }
  
  getSelectionRect(): {x1: number, y1: number, x2: number, y2: number} | null {
    return this.selectionRect;
  }

  startDrawing(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
      // Draw a single dot for click
      this.drawDot(x, y, ctx);
    } else if (this.currentTool === 'fill') {
      this.floodFill(Math.floor(x), Math.floor(y), this.currentColor, ctx);
      this.isDrawing = false;
    }
  }

  draw(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    if (!this.isDrawing) return;

    if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
      this.drawLine(this.lastX, this.lastY, x, y, ctx);
      this.lastX = x;
      this.lastY = y;
    }
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  pickColor(x: number, y: number, ctx: CanvasRenderingContext2D): string | null {
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const r = imageData[0];
    const g = imageData[1];
    const b = imageData[2];
    const a = imageData[3];

    // Convert to hex
    const hex = this.rgbToHex(r, g, b);
    return hex;
  }

  private drawDot(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    
    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = this.currentColor;
    }
    
    ctx.fill();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawLine(x0: number, y0: number, x1: number, y1: number, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = this.brushSize;

    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = this.currentColor;
    }

    ctx.stroke();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
  }

  private floodFill(startX: number, startY: number, fillColor: string, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Get the color of the starting pixel
    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Parse fill color
    const fillRGB = this.hexToRgb(fillColor);
    if (!fillRGB) return;

    // If the fill color is the same as the start color, do nothing
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b && startA === 255) {
      return;
    }

    // Use a stack for flood fill
    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = (y * width + x) * 4;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      // Check if this pixel matches the start color
      if (
        data[pos] === startR &&
        data[pos + 1] === startG &&
        data[pos + 2] === startB &&
        data[pos + 3] === startA
      ) {
        // Fill this pixel
        data[pos] = fillRGB.r;
        data[pos + 1] = fillRGB.g;
        data[pos + 2] = fillRGB.b;
        data[pos + 3] = 255;

        visited.add(key);

        // Add neighboring pixels to stack
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
}
