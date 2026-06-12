// Estado Global
const state = {
    tool: 'brush',
    color: '#7c3aed',
    brushSize: 10,
    brushType: 'round',
    isDrawing: false,
    zoom: 1,
    canvasWidth: 800,
    canvasHeight: 600,
    layers: [] as any[],
    activeLayerIndex: 0,
    panStart: { x: 0, y: 0 },
    isPanning: false,
    pendingImage: null as HTMLImageElement | null
};

// Referencias DOM
const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const viewport = document.getElementById('canvas-viewport')!;
const splashScreen = document.getElementById('splash-screen')!;
const appContainer = document.getElementById('app-container')!;
const authContainer = document.getElementById('auth-container')!;

// Elementos de UI
const statusCoords = document.getElementById('status-coords')!;
const statusTool = document.getElementById('status-tool')!;
const statusDimensions = document.getElementById('status-dimensions')!;
const statusZoom = document.getElementById('status-zoom')!;
const brushSizeSlider = document.getElementById('brush-size-slider') as HTMLInputElement;
const brushSizeValue = document.getElementById('brush-size-value')!;

// Inicialización
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            appContainer.classList.remove('hidden');
            setTimeout(() => appContainer.classList.add('visible'), 50);
            initCanvas();
            updateStatusBar();
        }, 500);
    }, 1500);

    setupEventListeners();
    setupTools();
    generateAnchorGrid();
});

function initCanvas() {
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.layers = [{ name: 'Fondo', visible: true }];
    renderLayersList();
    updateStatusBar();
}

// Configuración de Herramientas
function setupTools() {
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const toolName = btn.getAttribute('data-tool');
            if (toolName) setTool(toolName);
        });
    });

    brushSizeSlider.addEventListener('input', (e) => {
        state.brushSize = parseInt((e.target as HTMLInputElement).value);
        brushSizeValue.textContent = `${state.brushSize}px`;
        updateContextBar();
    });

    const brushTypeSelect = document.getElementById('brush-type') as HTMLSelectElement;
    brushTypeSelect.addEventListener('change', (e) => {
        state.brushType = (e.target as HTMLSelectElement).value;
    });

    const colorInput = document.getElementById('main-color') as HTMLInputElement;
    colorInput.addEventListener('input', (e) => {
        state.color = (e.target as HTMLInputElement).value;
    });

    document.querySelectorAll('.swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = (swatch as HTMLElement).getAttribute('data-color');
            if (color) {
                state.color = color;
                colorInput.value = color;
            }
        });
    });
}

function setTool(toolName: string) {
    state.tool = toolName;
    viewport.style.cursor = toolName === 'hand' ? 'grab' : 'crosshair';
    
    const toolNames: Record<string, string> = {
        brush: 'Pincel', eraser: 'Goma', bucket: 'Relleno',
        picker: 'Selector', selection: 'Selección', hand: 'Mano'
    };
    statusTool.textContent = toolNames[toolName] || toolName;
    updateContextBar();
}

function updateContextBar() {
    const brushSettings = document.getElementById('ctx-brush-settings')!;
    const toolInfo = document.getElementById('ctx-tool-info')!;

    if (state.tool === 'brush' || state.tool === 'eraser') {
        brushSettings.classList.remove('hidden');
        toolInfo.classList.add('hidden');
    } else {
        brushSettings.classList.add('hidden');
        toolInfo.classList.remove('hidden');
        toolInfo.innerHTML = `<span class="info-text">Herramienta: ${statusTool.textContent}</span>`;
    }
}

// Dibujo y Eventos del Canvas
let lastX = 0, lastY = 0;

function setupEventListeners() {
    canvas.addEventListener('mousedown', (e) => {
        if (state.tool === 'hand') {
            state.isPanning = true;
            state.panStart = { x: e.clientX - viewport.scrollLeft, y: e.clientY - viewport.scrollTop };
            viewport.style.cursor = 'grabbing';
            return;
        }
        state.isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        draw(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / state.zoom);
        const y = Math.floor((e.clientY - rect.top) / state.zoom);
        statusCoords.textContent = `X: ${x} Y: ${y}`;

        if (state.isPanning) {
            viewport.scrollTo(e.clientX - state.panStart.x, e.clientY - state.panStart.y);
            return;
        }
        if (!state.isDrawing) return;
        draw(e);
    });

    window.addEventListener('mouseup', () => {
        state.isDrawing = false;
        state.isPanning = false;
        viewport.style.cursor = state.tool === 'hand' ? 'grab' : 'crosshair';
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key.toLowerCase() === 'h') {
            (document.querySelector('[data-tool="hand"]') as HTMLElement)?.click();
        }
        const brushBtn = document.querySelector('[data-tool="brush"]') as HTMLElement;
        if (e.key.toLowerCase() === 'b' && brushBtn) brushBtn.click();
        
        const eraserBtn = document.querySelector('[data-tool="eraser"]') as HTMLElement;
        if (e.key.toLowerCase() === 'e' && eraserBtn) eraserBtn.click();
        
        if (e.ctrlKey && e.key === '+') changeZoom(0.1);
        if (e.ctrlKey && e.key === '-') changeZoom(-0.1);
        if (e.ctrlKey && e.key === '0') resetZoom();
        if (e.ctrlKey && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            (document.getElementById('fileInput') as HTMLInputElement)?.click();
        }
    });

    viewport.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            changeZoom(e.deltaY > 0 ? -0.1 : 0.1);
        }
    });

    // Botones UI
    document.getElementById('btn-open-resize')?.addEventListener('click', () => openModal('resize-modal'));
    document.getElementById('btn-toggle-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-export')?.addEventListener('click', exportImage);
    document.getElementById('btn-new-project')?.addEventListener('click', () => location.reload());
    document.getElementById('btn-add-layer')?.addEventListener('click', addLayer);
    document.getElementById('btn-del-layer')?.addEventListener('click', deleteLayer);
    
    document.getElementById('toggle-layers-panel')?.addEventListener('click', () => {
        document.querySelector('.right-panel')?.classList.toggle('collapsed');
    });

    // Input de archivo
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.addEventListener('change', handleFileSelect);

    // Modal resize
    document.getElementById('btn-apply-resize')?.addEventListener('click', applyResize);

    // Modales de importación
    document.getElementById('btn-fit-canvas')?.addEventListener('click', () => drawImportedImage('fit'));
    document.getElementById('btn-original-size')?.addEventListener('click', () => drawImportedImage('original'));
    document.getElementById('btn-center')?.addEventListener('click', () => drawImportedImage('center'));
}

function draw(e: MouseEvent) {
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else if (state.tool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = state.color;
    } else {
        return;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Zoom
function changeZoom(delta: number) {
    let newZoom = state.zoom + delta;
    if (newZoom < 0.1) newZoom = 0.1;
    if (newZoom > 5) newZoom = 5;
    state.zoom = newZoom;
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = 'top left';
    updateStatusBar();
}

function resetZoom() {
    state.zoom = 1;
    canvas.style.transform = 'scale(1)';
    updateStatusBar();
}

// Capas
function renderLayersList() {
    const list = document.getElementById('layers-list')!;
    list.innerHTML = '';
    state.layers.forEach((layer, index) => {
        const div = document.createElement('div');
        div.className = `layer-item ${index === state.activeLayerIndex ? 'active' : ''}`;
        div.innerHTML = `
            <i class="ph ph-eye" style="margin-right:8px; opacity:${layer.visible ? 1 : 0.3}"></i>
            <span class="layer-name">${layer.name}</span>
        `;
        div.addEventListener('click', () => {
            state.activeLayerIndex = index;
            renderLayersList();
        });
        list.appendChild(div);
    });
}

function addLayer() {
    state.layers.unshift({ name: `Capa ${state.layers.length + 1}`, visible: true });
    state.activeLayerIndex = 0;
    renderLayersList();
}

function deleteLayer() {
    if (state.layers.length > 1) {
        state.layers.splice(state.activeLayerIndex, 1);
        state.activeLayerIndex = Math.max(0, state.activeLayerIndex - 1);
        renderLayersList();
    }
}

// Modales
function openModal(id: string) {
    document.getElementById(id)?.classList.remove('hidden');
    if (id === 'resize-modal') {
        (document.getElementById('resize-width') as HTMLInputElement).value = state.canvasWidth.toString();
        (document.getElementById('resize-height') as HTMLInputElement).value = state.canvasHeight.toString();
    }
}

function closeModal(id: string) {
    document.getElementById(id)?.classList.add('hidden');
}

// Hacer disponible globalmente para onclick
(window as any).closeModal = closeModal;

function generateAnchorGrid() {
    const grid = document.getElementById('anchor-grid')!;
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const btn = document.createElement('div');
        btn.className = 'anchor-btn';
        if (i === 4) btn.classList.add('selected');
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.anchor-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        grid.appendChild(btn);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function exportImage() {
    const link = document.createElement('a');
    link.download = 'error404-art.png';
    link.href = canvas.toDataURL();
    link.click();
}

function updateStatusBar() {
    statusDimensions.textContent = `${state.canvasWidth} x ${state.canvasHeight} px`;
    statusZoom.textContent = `${Math.round(state.zoom * 100)}%`;
}

// Importación de imágenes
function handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            state.pendingImage = img;
            openModal('import-modal');
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
}

function drawImportedImage(mode: string) {
    if (!state.pendingImage) return;
    const img = state.pendingImage;
    ctx.globalCompositeOperation = 'source-over';
    
    let w = img.width, h = img.height, x = 0, y = 0;

    if (mode === 'fit') {
        const ratio = Math.min(canvas.width / w, canvas.height / h);
        w *= ratio; h *= ratio;
        x = (canvas.width - w) / 2;
        y = (canvas.height - h) / 2;
    } else if (mode === 'center') {
        x = (canvas.width - w) / 2;
        y = (canvas.height - h) / 2;
    }

    ctx.drawImage(img, x, y, w, h);
    closeModal('import-modal');
    state.pendingImage = null;
}

function applyResize() {
    const w = parseInt((document.getElementById('resize-width') as HTMLInputElement).value);
    const h = parseInt((document.getElementById('resize-height') as HTMLInputElement).value);
    
    if (w > 0 && h > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(canvas, 0, 0);

        canvas.width = w;
        canvas.height = h;
        state.canvasWidth = w;
        state.canvasHeight = h;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(tempCanvas, (w - tempCanvas.width) / 2, (h - tempCanvas.height) / 2);
        
        updateStatusBar();
        closeModal('resize-modal');
    }
}
