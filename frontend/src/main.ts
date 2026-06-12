import './style.css'
import { authService } from './auth'
import { LayerManager } from './layers'
import { DrawingTools, ToolType } from './tools'
import { PixelCop } from './pixel-cop'

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Auto-save interval (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

// App state
let layerManager: LayerManager | null = null;
let drawingTools: DrawingTools | null = null;
let pixelCop: PixelCop | null = null;
let isAppInitialized = false;
let hayCambiosSinGuardar = false;
let autoSaveTimer: number | null = null;
let currentProjectId: string | null = null;
let originalImageData: string | null = null; // Para Pixel-Cop

// Global app object for navigation
declare global {
  interface Window {
    app: {
      showView: (viewName: string) => void;
    };
  }
}

// Initialize the application
function init(): void {
  setupNavigation();
  checkAuth();
}

// Setup navigation between views
function setupNavigation(): void {
  window.app = {
    showView: (viewName: string) => {
      // Hide all views
      document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
      });
      
      // Show requested view
      const targetView = document.getElementById(`${viewName}View`);
      if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
      }
      
      // Initialize editor if entering editor view
      if (viewName === 'editor' && !isAppInitialized) {
        setTimeout(() => {
          if (!authService.isLoggedIn()) {
            alert('Para usar el editor, primero debes iniciar sesión.');
            showView('auth');
          } else {
            initializeApp();
          }
        }, 100);
      }
      
      // Load community gallery if entering community view
      if (viewName === 'community') {
        loadCommunityGallery();
      }
    }
  };
  
  // Mobile menu toggle
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Check if user is logged in
function checkAuth(): void {
  updateNavForAuth();
}

// Update navigation based on auth status
function updateNavForAuth(): void {
  const loginBtn = document.getElementById('loginBtn');
  const user = authService.getCurrentUser();
  
  if (user && loginBtn) {
    loginBtn.textContent = `👤 ${user.Usuario}`;
    loginBtn.onclick = () => {
      if (confirm('¿Cerrar sesión?')) {
        authService.logout();
        location.reload();
      }
    };
  }
}

// Initialize the main application
function initializeApp(): void {
  isAppInitialized = true;
  
  // Initialize tools
  drawingTools = new DrawingTools();
  
  // Initialize layer manager
  const canvasWrapper = document.getElementById('canvasWrapper')!;
  const layersList = document.getElementById('layersList')!;
  layerManager = new LayerManager(canvasWrapper, layersList);
  
  // Create initial canvas and layer
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Initialize Pixel-Cop after canvas is created
  const activeLayer = layerManager.getActiveLayer();
  if (activeLayer) {
    pixelCop = new PixelCop(activeLayer.canvas);
  }
  
  // Setup toolbar
  setupToolbar();
  
  // Setup menu actions
  setupMenuActions();
  
  // Setup layers panel
  setupLayersPanel();
  
  // Start auto-save timer
  startAutoSave();
}

// Start auto-save timer
function startAutoSave(): void {
  if (autoSaveTimer) return;
  
  autoSaveTimer = window.setInterval(() => {
    if (hayCambiosSinGuardar && currentProjectId) {
      saveProjectToCloud(currentProjectId);
      console.log('Guardado automático realizado...');
      hayCambiosSinGuardar = false;
    }
  }, AUTO_SAVE_INTERVAL);
}

// Mark canvas as changed (for auto-save)
function markCanvasChanged(): void {
  hayCambiosSinGuardar = true;
}

// Create canvas with specified dimensions
function createCanvas(width: number, height: number): void {
  if (!layerManager) return;
  
  // Clear existing canvases
  const container = document.getElementById('canvas-container')!;
  container.innerHTML = '';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  
  // Create first layer
  const layer = layerManager.createLayer('Fondo');
  layer.canvas.width = width;
  layer.canvas.height = height;
  
  // Fill with white background
  layer.ctx.fillStyle = '#ffffff';
  layer.ctx.fillRect(0, 0, width, height);
}

// Setup toolbar event listeners
function setupToolbar(): void {
  if (!drawingTools) return;
  
  // Tool buttons
  const toolButtons = document.querySelectorAll('.tool-btn');
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      toolButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const tool = (btn as HTMLElement).dataset.tool as ToolType;
      drawingTools!.setTool(tool);
    });
  });
  
  // Brush size
  const brushSizeInput = document.getElementById('brushSize') as HTMLInputElement;
  const brushSizeValue = document.getElementById('brushSizeValue')!;
  
  brushSizeInput.addEventListener('input', () => {
    const size = parseInt(brushSizeInput.value, 10);
    brushSizeValue.textContent = `${size}px`;
    drawingTools!.setBrushSize(size);
  });
  
  // Color picker
  const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
  colorPicker.addEventListener('input', () => {
    drawingTools!.setColor(colorPicker.value);
  });
  
  // Color presets
  const presetColors = document.querySelectorAll('.preset-color');
  presetColors.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = (preset as HTMLElement).dataset.color!;
      drawingTools!.setColor(color);
      colorPicker.value = color;
    });
  });
  
  // Canvas drawing events
  const canvasContainer = document.getElementById('canvas-container')!;
  
  canvasContainer.addEventListener('mousedown', (e) => {
    if (!layerManager || !drawingTools) return;
    
    const rect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = layerManager.getActiveCtx();
    
    const tool = drawingTools.getCurrentTool();
    
    if (tool === 'selection') {
      drawingTools.startSelection(x, y);
    } else {
      drawingTools.startDrawing(x, y, ctx);
    }
  });
  
  canvasContainer.addEventListener('mousemove', (e) => {
    if (!layerManager || !drawingTools) return;
    
    const rect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = layerManager.getActiveCtx();
    
    const tool = drawingTools.getCurrentTool();
    
    if (tool === 'selection') {
      const selectionRect = drawingTools.updateSelection(x, y);
      if (selectionRect && drawingTools.isCurrentlySelecting()) {
        // Visual feedback for selection rectangle could be added here
        markCanvasChanged();
      }
    } else if (drawingTools.getCurrentTool() === 'picker' && e.buttons === 0) {
      // Just hovering with picker tool
      canvasContainer.style.cursor = 'crosshair';
    } else {
      drawingTools.draw(x, y, ctx);
      markCanvasChanged();
    }
  });
  
  canvasContainer.addEventListener('mouseup', (e) => {
    if (!drawingTools) return;
    
    const tool = drawingTools.getCurrentTool();
    
    if (tool === 'selection') {
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = layerManager!.getActiveCtx();
      
      const buffer = drawingTools.endSelection(ctx);
      if (buffer) {
        // Show selection options
        const selectionOptions = document.getElementById('selectionOptions');
        if (selectionOptions) {
          selectionOptions.style.display = 'block';
        }
        markCanvasChanged();
      }
    } else {
      drawingTools.stopDrawing();
    }
  });
  
  canvasContainer.addEventListener('mouseleave', () => {
    if (drawingTools) {
      drawingTools.stopDrawing();
    }
  });
  
  // Keyboard shortcuts for selection tool
  window.addEventListener('keydown', (e) => {
    if (!drawingTools || !layerManager) return;
    
    const tool = drawingTools.getCurrentTool();
    
    // Delete or Backspace to delete selection
    if ((e.key === 'Delete' || e.key === 'Backspace') && tool === 'selection') {
      const ctx = layerManager.getActiveCtx();
      if (drawingTools.getSelectionBuffer()) {
        drawingTools.clearSelection(ctx);
        drawingTools.cancelSelection();
        
        // Hide selection options
        const selectionOptions = document.getElementById('selectionOptions');
        if (selectionOptions) {
          selectionOptions.style.display = 'none';
        }
        
        markCanvasChanged();
        e.preventDefault();
      }
    }
  });
  
  canvasContainer.addEventListener('click', (e) => {
    if (!layerManager || !drawingTools) return;
    
    const tool = drawingTools.getCurrentTool();
    
    if (tool === 'picker') {
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = layerManager.getActiveCtx();
      
      const pickedColor = drawingTools.pickColor(x, y, ctx);
      if (pickedColor) {
        drawingTools.setColor(pickedColor);
        const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
        colorPicker.value = pickedColor;
      }
    } else if (tool === 'fill') {
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = layerManager.getActiveCtx();
      
      drawingTools.startDrawing(x, y, ctx);
    }
  });
}

// Setup menu actions
function setupMenuActions(): void {
  // New file
  document.getElementById('btnNew')!.addEventListener('click', () => {
    if (confirm('¿Crear nuevo lienzo? Se perderá el trabajo actual no guardado.')) {
      createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  });
  
  // Open file (import image)
  document.getElementById('btnOpen')!.addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  });
  
  document.getElementById('fileInput')!.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file && layerManager) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const activeLayer = layerManager!.getActiveLayer();
          if (activeLayer) {
            // Resize canvas to match image if needed
            if (img.width !== activeLayer.canvas.width || img.height !== activeLayer.canvas.height) {
              activeLayer.canvas.width = img.width;
              activeLayer.canvas.height = img.height;
              document.getElementById('canvas-container')!.style.width = `${img.width}px`;
              document.getElementById('canvas-container')!.style.height = `${img.height}px`;
            }
            
            // Draw image on current layer
            activeLayer.ctx.drawImage(img, 0, 0);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    input.value = '';
  });
  
  // Save (Save to cloud)
  document.getElementById('btnSave')!.addEventListener('click', async () => {
    if (!layerManager) return;
    
    const user = authService.getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para guardar proyectos.');
      return;
    }
    
    // Get user ID (handle different possible property names)
    const userId = user._id || user.id;
    if (!userId) {
      alert('No se pudo identificar el usuario. Por favor inicia sesión nuevamente.');
      return;
    }
    
    const projectName = prompt('Nombre del proyecto:', `Mi Arte ${new Date().toLocaleDateString()}`);
    if (!projectName) return;
    
    try {
      // Get composite canvas with all layers
      const compositeCanvas = layerManager.getCompositeCanvas();
      
      // Create full image data (Base64)
      const imageData = compositeCanvas.toDataURL('image/png');
      
      // Create thumbnail (smaller version)
      const thumbnailCanvas = document.createElement('canvas');
      const thumbWidth = 300;
      const thumbHeight = Math.round((compositeCanvas.height / compositeCanvas.width) * thumbWidth);
      thumbnailCanvas.width = thumbWidth;
      thumbnailCanvas.height = thumbHeight;
      const thumbCtx = thumbnailCanvas.getContext('2d');
      if (thumbCtx) {
        thumbCtx.drawImage(compositeCanvas, 0, 0, thumbWidth, thumbHeight);
      }
      const thumbnailData = thumbnailCanvas.toDataURL('image/jpeg', 0.8);
      
      // Ask if public
      const isPublic = confirm('¿Quieres compartir este proyecto públicamente en la galería de la comunidad?');
      
      // Send to backend
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          name: projectName,
          data: imageData,
          thumbnail: thumbnailData,
          is_public: isPublic
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        currentProjectId = result.project?._id || result.project?.id;
        // Guardar la imagen original para Pixel-Cop
        originalImageData = imageData;
        hayCambiosSinGuardar = false;
        
        // Inicializar Pixel-Cop con la imagen guardada
        if (pixelCop) {
          pixelCop.setOriginalImageFromBase64(imageData);
        }
        
        alert(`✅ ${result.mensaje}\n${isPublic ? '¡Tu proyecto ahora es visible en la galería de la comunidad!' : 'Proyecto guardado privadamente.'}`);
      } else {
        alert(`❌ Error: ${result.mensaje || 'Error al guardar el proyecto'}`);
      }
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('❌ Error de conexión. Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
    }
  });
  
  // Selection tool buttons
  const btnDeleteSelection = document.getElementById('btnDeleteSelection');
  if (btnDeleteSelection) {
    btnDeleteSelection.addEventListener('click', () => {
      if (!layerManager || !drawingTools) return;
      
      const ctx = layerManager.getActiveCtx();
      drawingTools.clearSelection(ctx);
      drawingTools.cancelSelection();
      
      // Hide selection options
      const selectionOptions = document.getElementById('selectionOptions');
      if (selectionOptions) {
        selectionOptions.style.display = 'none';
      }
      
      markCanvasChanged();
    });
  }
  
  const btnCancelSelection = document.getElementById('btnCancelSelection');
  if (btnCancelSelection) {
    btnCancelSelection.addEventListener('click', () => {
      if (!drawingTools) return;
      
      drawingTools.cancelSelection();
      
      // Hide selection options
      const selectionOptions = document.getElementById('selectionOptions');
      if (selectionOptions) {
        selectionOptions.style.display = 'none';
      }
    });
  }
  
  // Tool button handler for showing/hiding selection options
  const toolButtons = document.querySelectorAll('.tool-btn');
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = (btn as HTMLElement).dataset.tool as ToolType;
      
      // Show/hide selection options based on tool
      const selectionOptions = document.getElementById('selectionOptions');
      if (selectionOptions) {
        if (tool === 'selection' && drawingTools?.getSelectionBuffer()) {
          selectionOptions.style.display = 'block';
        } else {
          selectionOptions.style.display = 'none';
        }
      }
    });
  });
  
  // Add link to community gallery
  const menuGroup = document.querySelector('.menu-group')!;
  const comunidadLink = document.createElement('a');
  comunidadLink.href = '/comunidad.html';
  comunidadLink.textContent = '🌐 Ver Comunidad';
  comunidadLink.style.cssText = 'margin-left: 10px; padding: 5px 10px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;';
  menuGroup.appendChild(comunidadLink);
  
  // Pixel-Cop: Botón de verificación de integridad
  const btnVerifyIntegrity = document.getElementById('btnVerifyIntegrity');
  if (btnVerifyIntegrity) {
    btnVerifyIntegrity.addEventListener('click', async () => {
      if (!pixelCop || !layerManager) {
        alert('Pixel-Cop no está inicializado.');
        return;
      }
      
      // Verificar integridad
      const report = pixelCop.verifyIntegrity();
      
      if (report.differentPixels === 0) {
        alert(`🛡️ Pixel-Cop: ¡Integridad verificada! ${report.integrityPercentage}% de integridad.\nNo se detectaron modificaciones.`);
      } else {
        alert(`🛡️ Pixel-Cop: Se detectaron ${report.differentPixels} píxeles modificados.\nIntegridad: ${report.integrityPercentage}%\n\nResaltando píxeles modificados en rojo...`);
        // Resaltar diferencias
        await pixelCop.highlightDifferences('rgba(255, 0, 0, 0.5)', 3000);
      }
    });
  }
  
  // Export
  document.getElementById('btnExport')!.addEventListener('click', () => {
    if (!layerManager) return;
    
    const format = (document.getElementById('exportFormat') as HTMLSelectElement).value as 'png' | 'jpg' | 'gif';
    const compositeCanvas = layerManager.getCompositeCanvas();
    
    let dataURL: string;
    if (format === 'jpg') {
      dataURL = compositeCanvas.toDataURL('image/jpeg', 0.95);
    } else if (format === 'gif') {
      // GIF export - we'll export as PNG since canvas doesn't support GIF natively
      dataURL = compositeCanvas.toDataURL('image/png');
      alert('Nota: El formato GIF se exportará como PNG. Para GIF animado, se requiere una librería adicional.');
    } else {
      dataURL = compositeCanvas.toDataURL('image/png');
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = `pixelart-${Date.now()}.${format === 'gif' ? 'png' : format}`;
    link.href = dataURL;
    link.click();
  });
}

// Setup layers panel
function setupLayersPanel(): void {
  if (!layerManager) return;
  
  // Add layer
  document.getElementById('btnAddLayer')!.addEventListener('click', () => {
    layerManager!.createLayer();
    markCanvasChanged();
  });
  
  // Delete layer
  document.getElementById('btnDeleteLayer')!.addEventListener('click', () => {
    const activeLayer = layerManager!.getActiveLayer();
    if (activeLayer) {
      if (!layerManager!.deleteLayer(activeLayer.id)) {
        alert('No se puede eliminar la única capa restante.');
      } else {
        markCanvasChanged();
      }
    }
  });
  
  // Merge down
  document.getElementById('btnMergeDown')!.addEventListener('click', () => {
    const activeLayer = layerManager!.getActiveLayer();
    if (activeLayer) {
      if (!layerManager!.mergeDown(activeLayer.id)) {
        alert('No hay capa debajo para fusionar.');
      } else {
        markCanvasChanged();
      }
    }
  });
}

// Save a new project to the cloud
async function saveNewProject(userId: string, projectName: string): Promise<void> {
  if (!layerManager) return;
  
  try {
    // Get composite canvas with all layers
    const compositeCanvas = layerManager.getCompositeCanvas();
    
    // Create full image data (Base64)
    const imageData = compositeCanvas.toDataURL('image/png');
    
    // Create thumbnail (smaller version)
    const thumbnailCanvas = document.createElement('canvas');
    const thumbWidth = 300;
    const thumbHeight = Math.round((compositeCanvas.height / compositeCanvas.width) * thumbWidth);
    thumbnailCanvas.width = thumbWidth;
    thumbnailCanvas.height = thumbHeight;
    const thumbCtx = thumbnailCanvas.getContext('2d');
    if (thumbCtx) {
      thumbCtx.drawImage(compositeCanvas, 0, 0, thumbWidth, thumbHeight);
    }
    const thumbnailData = thumbnailCanvas.toDataURL('image/jpeg', 0.8);
    
    // Ask if public
    const isPublic = confirm('¿Quieres compartir este proyecto públicamente en la galería de la comunidad?');
    
    // Send to backend
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        name: projectName,
        data: imageData,
        thumbnail: thumbnailData,
        is_public: isPublic
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      currentProjectId = result.project?._id || result.project?.id;
      hayCambiosSinGuardar = false;
      alert(`✅ ${result.mensaje}\n${isPublic ? '¡Tu proyecto ahora es visible en la galería de la comunidad!' : 'Proyecto guardado privadamente.'}`);
    } else {
      alert(`❌ Error: ${result.mensaje || 'Error al guardar el proyecto'}`);
    }
    
  } catch (error) {
    console.error('Error saving project:', error);
    alert('❌ Error de conexión. Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
  }
}

// Save existing project to cloud (for auto-save)
async function saveProjectToCloud(projectId: string): Promise<void> {
  if (!layerManager) return;
  
  try {
    const compositeCanvas = layerManager.getCompositeCanvas();
    const imageData = compositeCanvas.toDataURL('image/png');
    
    const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: imageData,
        updated_at: Date.now()
      })
    });
    
    if (response.ok) {
      console.log('Auto-guardado completado');
    } else {
      console.error('Error en auto-guardado');
    }
  } catch (error) {
    console.error('Error en auto-guardado:', error);
  }
}

// Start the app
init();
