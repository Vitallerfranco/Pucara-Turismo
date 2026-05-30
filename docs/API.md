# API Endpoints Documentation

Base URL: `/api`

## Packages (Paquetes)

### GET /api/paquetes
Retrieves all available tour packages.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg-001",
      "slug": "salinas-grandes-5d",
      "titulo": "Salinas Grandes",
      "tipo": "viaje_completo",
      "duracionDias": 5,
      "duracionNoches": 4,
      "precioBase": 280000,
      "gastosAdmin": 10000,
      "rating": 4.9,
      "reviews": 247,
      ...
    }
  ],
  "total": 6
}
```

### GET /api/paquetes/[id]
Retrieves details of a specific package.

**Parameters:**
- `id` (string): Package slug (e.g., `salinas-grandes-5d`)

**Response:**
```json
{
  "success": true,
  "data": { ...package object... }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Paquete no encontrado"
}
```

## Destinations (Destinos)

### GET /api/destinos
Retrieves all destinations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dest-001",
      "slug": "jujuy-salinas",
      "nombre": "Salinas Grandes",
      "provincia": "Jujuy",
      "descripcionCorta": "Las salinas más grandes del mundo",
      "clima": {
        "tempMin": 0,
        "tempMax": 15,
        "descripcion": "..."
      },
      ...
    }
  ],
  "total": 5
}
```

## Recommendation Engine (Recomendador)

### POST /api/recomendador
Calculates package recommendations based on user preferences.

**Request Body:**
```json
{
  "duracion": "media",        // "corta" | "media" | "larga"
  "tipo": "naturaleza",       // string (tag)
  "presupuesto": "medio",     // "bajo" | "medio" | "alto"
  "epoca": "verano",          // string
  "compania": "pareja"        // string
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "paquete": { ...package object... },
      "score": 95
    },
    {
      "paquete": { ...package object... },
      "score": 85
    },
    ...
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

## Availability (Disponibilidad)

### GET /api/disponibilidad/[salidaId]
_Coming soon_

Retrieves real-time availability for a specific departure.

**Parameters:**
- `salidaId` (string): Departure ID

**Response:**
```json
{
  "success": true,
  "data": {
    "salidaId": "...",
    "cuposLibres": 3,
    "ocupacion": 85,
    "ultimaReservaHace": 120  // minutes
  }
}
```

## Reservations (Reservas)

### POST /api/reservas
_Coming soon_

Creates a new reservation.

**Request Body:**
```json
{
  "paqueteId": "pkg-001",
  "usuarioId": "user-123",
  "cantidadPasajeros": 2,
  "extrasSeleccionados": ["extra-001", "extra-002"],
  "notas": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "res-001",
    "numeroReserva": "RES-2026-12345",
    "estado": "pre-reserva",
    "total": 600000
  }
}
```

## Authentication

### POST /api/auth/register
_Coming soon_

Registers a new user.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+54911500000000",
  "password": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "juan@example.com",
    "token": "..."
  }
}
```

### POST /api/auth/login
_Coming soon_

Authenticates a user.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "token": "..."
  }
}
```

## Error Handling

All endpoints follow consistent error handling:

```json
{
  "success": false,
  "error": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Server Error

## Response Headers

All JSON responses include:
```
Content-Type: application/json
Cache-Control: public, max-age=3600  // (for GET requests)
```

## Rate Limiting

_To be implemented in Sprint 2_

Current limits: None (development)

## Authentication

_To be implemented in Sprint 2_

All protected endpoints will require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Webhooks

### WhatsApp Webhook
_To be implemented in Sprint 2_

Endpoint: `/api/webhooks/whatsapp`

Handles incoming WhatsApp messages for customer support.

---

**Status**: 50% implemented (4/8 endpoints ready)
**Last Updated**: May 30, 2026
**Next**: Database integration + Auth endpoints
