import { getAllEvents, getEventById } from "../models/event.model.js";
import pool from "../db/index.js";

export const listEvents = async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const events = await getAllEvents(limit, offset);

    const enriched = await Promise.all(events.map(async ev => {
      const tagsRes = await pool.query(`
        SELECT t.id, t.name
        FROM event_tags et
        JOIN tags t ON et.id_tag = t.id
        WHERE et.id_event = $1
      `, [ev.id]);

      return {
        ...ev,
        event_category: {
          id: ev.id_event_category,
          name: ev.category_name
        },
        event_location: {
          id: ev.id_event_location,
          name: ev.event_location_name
        },
        tags: tagsRes.rows
      };
    }));

    res.json({
      collection: enriched,
      pagination: {
        limit,
        offset,
        nextPage: enriched.length < limit ? null : offset + limit,
        total: enriched.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventDetail = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const tagsRes = await pool.query(`
      SELECT t.id, t.name
      FROM event_tags et
      JOIN tags t ON et.id_tag = t.id
      WHERE et.id_event = $1
    `, [id]);

    res.json({
      ...event,
      tags: tagsRes.rows
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req, res) => {
  const {
    name,
    description,
    id_event_category,
    id_event_location,
    start_date,
    duration_in_minutes,
    price,
    enabled_for_enrollment,
    max_assistance
  } = req.body;

  try {
    // validaciones básicas
    if (!name || name.length < 3) {
      return res.status(400).json({ success: false, message: "Name is required and must be at least 3 characters." });
    }
    if (!description || description.length < 3) {
      return res.status(400).json({ success: false, message: "Description is required and must be at least 3 characters." });
    }
    if (max_assistance < 0) {
      return res.status(400).json({ success: false, message: "max_assistance cannot be negative." });
    }
    if (price < 0 || duration_in_minutes < 0) {
      return res.status(400).json({ success: false, message: "Price and duration must be positive numbers." });
    }

    // chequeo de max_assistance vs max_capacity del lugar
    const locResult = await pool.query(
      `SELECT max_capacity FROM event_locations WHERE id = $1`,
      [id_event_location]
    );

    if (locResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Event location does not exist." });
    }

    const max_capacity = parseInt(locResult.rows[0].max_capacity);
    if (max_assistance > max_capacity) {
      return res.status(400).json({
        success: false,
        message: `max_assistance (${max_assistance}) cannot exceed event location capacity (${max_capacity}).`
      });
    }

    const insertResult = await pool.query(`
      INSERT INTO events (
        name, description, id_event_category, id_event_location,
        start_date, duration_in_minutes, price,
        enabled_for_enrollment, max_assistance
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      name,
      description,
      id_event_category,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance
    ]);

    res.status(201).json({
      success: true,
      message: "Evento creado correctamente",
      data: insertResult.rows[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
