import { getAllEvents, getEventById } from "../models/event.model.js";
import pool from "../db/index.js";

export const listEvents = async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const events = await getAllEvents(limit, offset);

    const enriched = await Promise.all(events.map(async ev => {
      // tags
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

    // traer tags
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
