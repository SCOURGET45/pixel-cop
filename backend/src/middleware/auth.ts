import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import InicioSesion from '../models/Inicio_sesion';

// Extender la interfaz Request para incluir user
export interface AuthRequest extends Request {
  user?: any;
}

// Interfaz para el payload del token JWT
interface JwtPayload {
  id: string;
}

/**
 * Middleware para verificar el token JWT
 * Obtiene el token del header Authorization, lo verifica y busca al usuario en la BD
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        mensaje: 'Token faltante o inválido'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token con jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    // Buscar al usuario en la base de datos usando el ID del token decodificado
    const usuario = await InicioSesion.findById(decoded.id);

    if (!usuario) {
      res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
      return;
    }

    // Almacenar el usuario en req.user
    req.user = usuario;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        mensaje: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        mensaje: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      mensaje: 'Error al verificar el token',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Middleware para requerir roles específicos
 * @param roles - Array de roles permitidos (ej: ['admin', 'mod'])
 * @returns Middleware que verifica si el usuario tiene uno de los roles permitidos
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        mensaje: 'No autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        mensaje: 'No tienes permiso para acceder a este recurso'
      });
      return;
    }

    next();
  };
};
