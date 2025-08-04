import express from 'express';
import pool from '../db/index.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ POST /api/event-location
// Crea una nueva ubicación de evento (requiere autenticación)
router.post('/', verifyToken, async (req, res) => {
  const { name, full_address, latitude, longitude, id_location, max_capacity } = req.body;
  const id_creator_user = req.user.id;

  // Validaciones
  if (!name || name.length < 3 || !full_address || full_address.length < 3) {
    return res.status(400).json({ error: 'El nombre o la dirección son inválidos (mínimo 3 caracteres).' });
  }

  if (!id_location || isNaN(id_location)) {
    return res.status(400).json({ error: 'El id_location es inválido o inexistente.' });
  }

  if (!max_capacity || max_capacity <= 0) {
    return res.status(400).json({ error: 'La capacidad máxima debe ser mayor a cero.' });
  }

  try {
    // Verificar que el id_location exista
    const locationCheck = await pool.query('SELECT * FROM locations WHERE id = $1', [id_location]);
    if (locationCheck.rowCount === 0) {
      return res.status(400).json({ error: 'El id_location no existe.' });
    }

    // Insertar la ubicación del evento
    const insert = await pool.query(
      `INSERT INTO event_locations (name, full_address, latitude, longitude, id_location, max_capacity, id_creator_user)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, full_address, latitude, longitude, id_location, max_capacity, id_creator_user]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('Error al crear event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al crear la ubicación.' });
  }
});

// ✅ GET /api/event-location/:id
// Obtiene una ubicación de evento si pertenece al usuario autenticado
router.get('/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const id_creator_user = req.user.id;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM event_locations WHERE id = $1 AND id_creator_user = $2`,
      [id, id_creator_user]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'La ubicación no existe o no pertenece al usuario autenticado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener event_location:', err);
    return res.status(500).json({ error: 'Error interno del servidor al obtener la ubicación.' });
  }
});

export default router;
