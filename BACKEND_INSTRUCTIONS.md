# Instrucciones para ejecutar el Backend

El error de conexión en la sección "Comunidad" ocurre porque el backend no está ejecutándose. Sigue estos pasos:

## 1. Asegúrate de tener MongoDB instalado y ejecutándose

### En Linux/Mac:
```bash
# Verificar si MongoDB está corriendo
sudo systemctl status mongod

# Iniciar MongoDB si no está corriendo
sudo systemctl start mongod
```

### En Windows:
- Abre el servicio de MongoDB desde Services.msc
- O ejecuta MongoDB manualmente con: `mongod`

## 2. Configurar variables de entorno (opcional)

Crea un archivo `.env` en `backend/src/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pixelart
```

## 3. Ejecutar el backend

```bash
cd /workspace/backend/src
npm install
npm start
```

Deberías ver algo como:
```
MongoDB conectado
Servidor activo en puerto 3000
```

## 4. Verificar que el backend esté funcionando

Abre tu navegador y ve a:
- http://localhost:3000 - Debería mostrar "API de PixelArt Studio funcionando"
- http://localhost:3000/api/projects - Debería devolver una lista vacía `[]` o proyectos

## 5. Ahora sí, prueba la comunidad

Con el backend corriendo, ve a la sección "Comunidad" en tu aplicación frontend y debería cargar correctamente.

---

## Notas adicionales:

- El frontend ahora detecta automáticamente si estás en localhost o en producción
- Los mensajes de error son más descriptivos para ayudarte a diagnosticar problemas
- Si cambias el puerto del backend, actualiza también la variable `PORT` en el `.env`
