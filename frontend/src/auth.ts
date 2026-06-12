// Authentication service for user management

export interface User {
  _id?: string;
  id?: string;
  Nombre: string;
  Usuario: string;
  correo: string;
  password?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

class AuthService {
  private currentUser: User | null = null;
  private API_URL = 'http://localhost:3000/api';

  constructor() {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  async login(usuario: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_URL}/inicio-sesion/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        this.currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return {
          success: true,
          message: 'Inicio de sesión exitoso',
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Credenciales inválidas',
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  }

  async register(userData: Omit<User, '_id'>): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_URL}/inicio-sesion/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nombre: userData.Nombre,
          Usuario: userData.Usuario,
          correo: userData.correo,
          password: userData.password,
          idUsuario: userData.Usuario.toLowerCase().replace(/\s/g, ''),
          imgPerfil: ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Usuario registrado exitosamente',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al registrar usuario',
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const authService = new AuthService();
