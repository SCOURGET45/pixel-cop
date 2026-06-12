// Comunidad Gallery - Load and display public projects

interface Project {
  _id: string;
  user_id: {
    Usuario: string;
    Nombre: string;
  };
  name: string;
  data: string; // Base64 image
  thumbnail?: string;
  is_public: boolean;
  created_at: string;
}

// Try to detect if we're in development or production
// Force localhost for development environments regardless of current hostname
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.port === '5500' ||
                      window.location.port === '8080' ||
                      window.location.protocol === 'file:';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : window.location.origin;
  
const API_URL = `${API_BASE_URL}/api/projects`;

// Debug logging (remove in production)
console.log('🔌 Conectando a API:', API_URL);
console.log('🌐 Hostname:', window.location.hostname);
console.log('🚪 Puerto:', window.location.port);
console.log('📡 Protocolo:', window.location.protocol);

// DOM Elements
const loadingEl = document.getElementById('loading')!;
const projectsGridEl = document.getElementById('projects-grid')!;
const noProjectsEl = document.getElementById('no-projects')!;
const errorEl = document.getElementById('error-message')!;
const errorTextEl = document.getElementById('error-text')!;
const modalEl = document.getElementById('project-modal')!;
const modalTitleEl = document.getElementById('modal-title')!;
const modalAuthorEl = document.getElementById('modal-author')!;
const modalImageEl = document.getElementById('modal-image') as HTMLImageElement;
const btnDownloadEl = document.getElementById('btn-download')!;

let currentProjectData: string | null = null;

// Load projects from API
export async function loadProjects(): Promise<void> {
  showLoading();
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const projects: Project[] = await response.json();
    displayProjects(projects);
    
  } catch (error) {
    console.error('Error loading projects:', error);
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    
    // More helpful error message for connection issues
    let friendlyMessage = errorMsg;
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      friendlyMessage = 'No se pudo conectar con el servidor. Asegúrate de que:\n\n1. El backend esté ejecutándose (npm start en backend/src)\n2. El servidor esté disponible en http://localhost:3000\n3. MongoDB esté conectado correctamente';
    }
    
    showError(friendlyMessage);
  }
}

// Show loading state
function showLoading(): void {
  loadingEl.classList.remove('hidden');
  projectsGridEl.classList.add('hidden');
  noProjectsEl.classList.add('hidden');
  errorEl.classList.add('hidden');
}

// Show error state
function showError(message: string): void {
  loadingEl.classList.add('hidden');
  projectsGridEl.classList.add('hidden');
  noProjectsEl.classList.add('hidden');
  errorEl.classList.remove('hidden');
  errorTextEl.textContent = message;
}

// Display projects in grid
function displayProjects(projects: Project[]): void {
  loadingEl.classList.add('hidden');
  
  if (projects.length === 0) {
    noProjectsEl.classList.remove('hidden');
    return;
  }
  
  projectsGridEl.classList.remove('hidden');
  projectsGridEl.innerHTML = '';
  
  projects.forEach(project => {
    const card = createProjectCard(project);
    projectsGridEl.appendChild(card);
  });
}

// Create project card element
function createProjectCard(project: Project): HTMLElement {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.addEventListener('click', (e) => {
    // Don't open modal if clicking the remix button
    if ((e.target as HTMLElement).closest('.btn-remix')) {
      return;
    }
    openModal(project);
  });
  
  const imageUrl = project.thumbnail || project.data;
  const date = new Date(project.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const authorName = project.user_id?.Usuario || project.user_id?.Nombre || 'Anónimo';
  
  card.innerHTML = `
    <img class="card-image" src="${imageUrl}" alt="${project.name}" />
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(project.name)}</h3>
      <p class="card-author">Por: ${escapeHtml(authorName)}</p>
      <p class="card-date">${date}</p>
    </div>
  `;
  
  // Add Remix button
  const remixBtn = document.createElement('button');
  remixBtn.className = 'btn-remix';
  remixBtn.textContent = '🎨 Remix';
  remixBtn.onclick = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para hacer un remix.');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/remix/${project._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ ${result.mensaje}\nRedirigiendo a tu perfil...`);
        window.location.href = '/perfil.html';
      } else {
        alert(`❌ Error: ${result.mensaje || 'No se pudo clonar el proyecto'}`);
      }
    } catch (error) {
      console.error('Error al hacer remix:', error);
      alert('❌ Error de conexión. Asegúrate de que:\n\n1. El backend esté ejecutándose (npm start en backend/src)\n2. El servidor esté disponible en http://localhost:3000\n3. MongoDB esté conectado correctamente');
    }
  };
  
  card.appendChild(remixBtn);
  
  return card;
}

// Open modal with project details
function openModal(project: Project): void {
  currentProjectData = project.data;
  modalTitleEl.textContent = project.name;
  
  const authorName = project.user_id?.Usuario || project.user_id?.Nombre || 'Anónimo';
  modalAuthorEl.textContent = authorName;
  modalImageEl.src = project.data;
  
  modalEl.classList.remove('hidden');
  
  // Setup download button
  btnDownloadEl.onclick = () => downloadProject(project.name, project.data);
}

// Close modal
export function closeModal(): void {
  modalEl.classList.add('hidden');
  currentProjectData = null;
}

// Download project image
function downloadProject(name: string, imageData: string): void {
  const link = document.createElement('a');
  link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.png`;
  link.href = imageData;
  link.click();
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close modal when clicking outside
modalEl.addEventListener('click', (e) => {
  if (e.target === modalEl) {
    closeModal();
  }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
    closeModal();
  }
});

// Make functions available globally for HTML onclick handlers
(window as any).loadProjects = loadProjects;
(window as any).closeModal = closeModal;

// Load projects on page load
loadProjects();
