import './style.css'
import { authService } from './auth'
import { LayerManager } from './layers'
import { DrawingTools, ToolType } from './tools'

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// App state
let layerManager: LayerManager | null = null;
let drawingTools: DrawingTools | null = null;
let isAppInitialized = false;

// DOM Elements
const authContainer = document.getElementById('auth-container')!;
const appContainer = document.getElementById('app-container')!;
const loginForm = document.getElementById('login-form')!;
const registerForm = document.getElementById('register-form')!;
const userDisplay = document.getElementById('user-display')!;

// Initialize the application
function init(): void {
  checkAuth();
  setupAuthListeners();
}

// Check if user is logged in
function checkAuth(): void {
  if (authService.isLoggedIn()) {
    showApp();
  } else {
    showAuth();
  }
}

// Show authentication screens
function showAuth(): void {
  authContainer.classList.remove('hidden');
  appContainer.classList.add('hidden');
}

// Show main app
function showApp(): void {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  
  const user = authService.getCurrentUser();
  if (user) {
    userDisplay.textContent = `Hola, ${user.Usuario}`;
  }
  
  if (!isAppInitialized) {
    initializeApp();
  }
}

// Setup authentication event listeners
function setupAuthListeners(): void {
  // Login form
  const loginFormEl = document.getElementById('loginForm') as HTMLFormElement;
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = (document.getElementById('loginUsuario') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    
    const result = await authService.login(usuario, password);
    
    if (result.success) {
      showApp();
    } else {
      alert(result.message);
    }
  });

  // Register form
  const registerFormEl = document.getElementById('registerForm') as HTMLFormElement;
  registerFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
      Nombre: (document.getElementById('regNombre') as HTMLInputElement).value,
      Usuario: (document.getElementById('regUsuario') as HTMLInputElement).value,
      correo: (document.getElementById('regCorreo') as HTMLInputElement).value,
      password: (document.getElementById('regPassword') as HTMLInputElement).value,
    };
    
    const result = await authService.register(userData);
    
    if (result.success) {
      alert(result.message);
      // Switch to login form
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    } else {
      alert(result.message);
    }
  });

  // Toggle between login and register
  document.getElementById('showRegister')!.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });

  document.getElementById('showLogin')!.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // Logout
  document.getElementById('btnLogout')!.addEventListener('click', () => {
    authService.logout();
    showAuth();
  });
}

// Initialize the main application
function initializeApp(): void {
  isAppInitialized = true;
  
  // Initialize tools
  drawingTools = new DrawingTools();
  
  // Initialize layer manager
  const canvasContainer = document.getElementById('canvas-container')!;
  const layersList = document.getElementById('layers-list')!;
  layerManager = new LayerManager(canvasContainer, layersList);
  
  // Create initial canvas and layer
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Setup toolbar
  setupToolbar();
  
  // Setup menu actions
  setupMenuActions();
  
  // Setup layers panel
  setupLayersPanel();
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
    
    drawingTools.startDrawing(x, y, ctx);
  });
  
  canvasContainer.addEventListener('mousemove', (e) => {
    if (!layerManager || !drawingTools) return;
    
    const rect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = layerManager.getActiveCtx();
    
    if (drawingTools.getCurrentTool() === 'picker' && e.buttons === 0) {
      // Just hovering with picker tool
      canvasContainer.style.cursor = 'crosshair';
    } else {
      drawingTools.draw(x, y, ctx);
    }
  });
  
  canvasContainer.addEventListener('mouseup', () => {
    if (drawingTools) {
      drawingTools.stopDrawing();
    }
  });
  
  canvasContainer.addEventListener('mouseleave', () => {
    if (drawingTools) {
      drawingTools.stopDrawing();
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
        alert(`✅ ${result.mensaje}\n${isPublic ? '¡Tu proyecto ahora es visible en la galería de la comunidad!' : 'Proyecto guardado privadamente.'}`);
      } else {
        alert(`❌ Error: ${result.mensaje || 'Error al guardar el proyecto'}`);
      }
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('❌ Error de conexión. Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
    }
  });
  
  // Add link to community gallery
  const menuGroup = document.querySelector('.menu-group')!;
  const comunidadLink = document.createElement('a');
  comunidadLink.href = '/comunidad.html';
  comunidadLink.textContent = '🌐 Ver Comunidad';
  comunidadLink.style.cssText = 'margin-left: 10px; padding: 5px 10px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;';
  menuGroup.appendChild(comunidadLink);
  
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
  });
  
  // Delete layer
  document.getElementById('btnDeleteLayer')!.addEventListener('click', () => {
    const activeLayer = layerManager!.getActiveLayer();
    if (activeLayer) {
      if (!layerManager!.deleteLayer(activeLayer.id)) {
        alert('No se puede eliminar la única capa restante.');
      }
    }
  });
  
  // Merge down
  document.getElementById('btnMergeDown')!.addEventListener('click', () => {
    const activeLayer = layerManager!.getActiveLayer();
    if (activeLayer) {
      if (!layerManager!.mergeDown(activeLayer.id)) {
        alert('No hay capa debajo para fusionar.');
      }
    }
  });
}

// Start the app
init();
