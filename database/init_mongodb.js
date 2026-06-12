// Script de inicialización de MongoDB para Pixel Art Studio
// Ejecutar con: mongosh < init_mongodb.js

// Crear base de datos
use pixelart;

// Crear colecciones con validación de esquemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        username: { bsonType: "string", minLength: 3, maxLength: 30 },
        email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
        password: { bsonType: "string", minLength: 6 },
        nombre: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "name", "data"],
      properties: {
        user_id: { bsonType: "objectId" },
        name: { bsonType: "string", minLength: 1, maxLength: 100 },
        data: { bsonType: "string" }, // Base64 de la imagen
        thumbnail: { bsonType: "string" },
        is_public: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Crear índices para mejorar rendimiento
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.projects.createIndex({ user_id: 1 });
db.projects.createIndex({ is_public: 1, createdAt: -1 });

print("Base de datos inicializada exitosamente!");
