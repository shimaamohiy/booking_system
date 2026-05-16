# Booking System API Documentation

## Description
This documentation describes the Booking System API as implemented in the current codebase, including routes, request/response formats, authentication, and role access rules.

## Base URL
`http://localhost:8000`

## Content Types
- JSON requests should set: `Content-Type: application/json`.
- File uploads use: `Content-Type: multipart/form-data`.

## Authentication
This API uses JWT Bearer tokens. Tokens are accepted in either of the following:

**Header format**
```
Authorization: Bearer <jwt>
```

**Cookie format**
```
Authorization=Bearer <jwt>
```

The login endpoint sets the `Authorization` cookie automatically. Protected endpoints require a valid token.

## Roles
- `user`
- `professional`
- `admin`

Role access is enforced per endpoint. If a role is not listed, access is denied.

---

## Endpoints

### Health

#### `GET /`
Returns a basic status message.

**Response**
```json
{
  "message": "Booking System API is running!"
}
```

---

### Authentication (Sign)

#### `POST /api/sign/signup`
Creates a new user account.

**Body (JSON)**
- `name` (string, required): 2-30 characters.
- `email` (string, required): valid email, 5-30 characters.
- `password` (string, required): at least 8 characters, must include uppercase, lowercase, number, and special character.
- `role` (string, required): `user`, `professional`, or `admin`.
- `specialty` (string, optional): only used when role is `professional`. Allowed values include `doctor`, `Dermatologist`, `Ophthalmologist`, `Dentist`.

**Response (201)**
```json
{
  "success": true,
  "message": "Your Account has been created Successfully ",
  "result": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### `POST /api/sign/login`
Authenticates a user and returns a JWT token. Also sets the `Authorization` cookie.

**Body (JSON)**
- `email` (string, required)
- `password` (string, required): same pattern as signup.

**Response (200)**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "message": "Logged in successfully",
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### `POST /api/sign/logout`
Clears the authentication cookie.

**Response (200)**
```json
{
  "success": true,
  "message": "logout successfully"
}
```

---

### Appointments

#### `GET /api/appointments`
Returns appointments based on the requester role.

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Query**
- `status` (string, optional): `booked`, `cancelled`, `completed`.

**Behavior**
- `user` sees only their appointments.
- `professional` sees only appointments booked with them.
- `admin` sees all appointments.

**Response (200)**
```json
{
  "success": true,
  "count": 1,
  "appointments": [
    {
      "_id": "60d0fe...",
      "userId": "...",
      "professionalId": { "_id": "...", "name": "Dr. Smith" },
      "serviceId": { "_id": "...", "name": "Consultation", "price": 50 },
      "date": "2023-12-01T00:00:00.000Z",
      "timeSlot": "10:00 AM",
      "totalPrice": 50,
      "status": "booked",
      "createdAt": "2023-11-01T12:00:00.000Z",
      "updatedAt": "2023-11-01T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/appointments`
Books a new appointment.

**Auth**: required

**Roles**: `user`

**Body (JSON)**
- `professionalId` (string, required): the professional user's `_id`.
- `serviceId` (string, required)
- `date` (string, required): parsed by `new Date(date)`.
- `timeSlot` (string, required)

**Response (201)**
```json
{
  "success": true,
  "appointment": {
    "_id": "...",
    "userId": "...",
    "professionalId": "...",
    "serviceId": "...",
    "date": "2023-12-01T00:00:00.000Z",
    "timeSlot": "10:00 AM",
    "totalPrice": 45,
    "status": "booked",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-01T12:00:00.000Z"
  },
  "message": "Appointment booked successfully"
}
```

#### `PUT /api/appointments/:id`
Updates date, time slot, or status.

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Body (JSON)**
- `date` (string, optional)
- `timeSlot` (string, optional)
- `status` (string, optional): `booked`, `cancelled`, `completed`

**Response (200)**
```json
{
  "success": true,
  "appointment": {
    "_id": "...",
    "userId": "...",
    "professionalId": "...",
    "serviceId": "...",
    "date": "2023-12-02T00:00:00.000Z",
    "timeSlot": "11:00 AM",
    "totalPrice": 45,
    "status": "completed",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-10T12:00:00.000Z"
  }
}
```

#### `DELETE /api/appointments/:id`
Cancels an appointment (sets status to `cancelled`).

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Response (200)**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

### Services

#### `GET /api/services`
Retrieves services. Professionals only see their own services.

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Query**
- `search` (string, optional): matches name or description (case-insensitive).
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `sort` (string, optional): `price_asc` or `price_desc`.

**Response (200)**
```json
{
  "success": true,
  "count": 1,
  "services": [
    {
      "_id": "...",
      "name": "Consultation",
      "description": "Initial visit",
      "price": 50,
      "discount": 10,
      "professionalId": { "_id": "...", "name": "Dr. Smith" },
      "createdAt": "2023-11-01T12:00:00.000Z",
      "updatedAt": "2023-11-01T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/services`
Creates a new service.

**Auth**: required

**Roles**: `professional`, `admin`

**Body (JSON)**
- `name` (string, required)
- `description` (string, required)
- `price` (number, required)
- `discount` (number, optional)
- `professionalId` (string, required for `admin` only): professional user's `_id`.

**Response (201)**
```json
{
  "success": true,
  "service": {
    "_id": "...",
    "name": "Consultation",
    "description": "Initial visit",
    "price": 50,
    "discount": 10,
    "professionalId": { "_id": "...", "name": "Dr. Smith" },
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-01T12:00:00.000Z"
  }
}
```

#### `PUT /api/services/:id`
Updates a service.

**Auth**: required

**Roles**: `professional`, `admin`

**Body (JSON)**
- `name` (string, optional)
- `description` (string, optional)
- `price` (number, optional)
- `discount` (number, optional)

**Response (200)**
```json
{
  "success": true,
  "service": {
    "_id": "...",
    "name": "Consultation",
    "description": "Updated description",
    "price": 55,
    "discount": 5,
    "professionalId": "...",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-10T12:00:00.000Z"
  }
}
```

#### `DELETE /api/services/:id`
Deletes a service.

**Auth**: required

**Roles**: `professional`, `admin`

**Response (200)**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### Profile

All profile routes require authentication.

#### `GET /api/profile`
Returns the authenticated user's profile (without password).

**Response (200)**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePicture": "/uploads/profile-123.jpeg",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-10T12:00:00.000Z"
  }
}
```

#### `PUT /api/profile`
Updates profile fields.

**Body (JSON)**
- `name` (string, optional)
- `email` (string, optional, must be unique)

**Response (200)**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePicture": "/uploads/profile-123.jpeg",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-10T12:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

#### `POST /api/profile/picture`
Uploads or replaces the profile picture.

**Body (multipart/form-data)**
- `profilePicture` (file, required): jpeg, jpg, png, gif, max 5MB. Stored as a 300x300 jpeg.

**Response (200)**
```json
{
  "success": true,
  "profilePicture": "/uploads/profile-123.jpeg",
  "message": "Profile picture updated successfully"
}
```

#### `DELETE /api/profile/picture`
Deletes the profile picture.

**Response (200)**
```json
{
  "success": true,
  "message": "Profile picture removed successfully"
}
```

#### `PUT /api/profile/password`
Changes the user's password.

**Body (JSON)**
- `currentPassword` (string, required)
- `newPassword` (string, required): same pattern as signup.

**Response (200)**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Feedback

#### `POST /api/feedback`
Submits feedback for a professional. Requires a completed appointment with that professional.

**Auth**: required

**Roles**: `user`

**Body (JSON)**
- `professionalId` (string, required): professional user's `_id`.
- `rating` (integer, required): 1 to 5.
- `comment` (string, optional)

**Response (201)**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback": {
    "_id": "...",
    "userId": "...",
    "professionalId": "...",
    "rating": 5,
    "comment": "Great service",
    "createdAt": "2023-11-01T12:00:00.000Z",
    "updatedAt": "2023-11-01T12:00:00.000Z"
  }
}
```

#### `GET /api/feedback`
Retrieves feedbacks.

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Query**
- `professionalId` (string, optional): fetch feedback for a specific professional.

**Behavior**
- If `professionalId` is provided, it overrides role-based filtering.
- `user` sees only their feedback.
- `professional` sees feedback left for them.
- `admin` sees all feedback.

**Response (200)**
```json
{
  "success": true,
  "count": 1,
  "feedbacks": [
    {
      "_id": "...",
      "userId": { "_id": "...", "name": "John Doe" },
      "professionalId": { "_id": "...", "name": "Dr. Smith" },
      "rating": 5,
      "comment": "Great service",
      "createdAt": "2023-11-01T12:00:00.000Z",
      "updatedAt": "2023-11-01T12:00:00.000Z"
    }
  ]
}
```

---

### Users

#### `GET /api/users/professionals`
Returns all users with role `professional`.

**Auth**: required

**Roles**: `user`, `professional`, `admin`

**Response (200)**
```json
{
  "success": true,
  "professionals": [
    {
      "_id": "...",
      "name": "Dr. Smith",
      "specialty": "Dermatologist"
    }
  ]
}
```

---

### Static Files

#### `GET /uploads/:filename`
Serves uploaded files (profile pictures).

---

## Errors

The API uses standard HTTP status codes. Error responses vary slightly by endpoint but typically include a `message` and may include `success: false`.

- `400 Bad Request`: Validation or missing fields.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Role or ownership restriction.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Unexpected server error.

**Example error response**
```json
{
  "success": false,
  "message": "Only users can book appointments"
}
```