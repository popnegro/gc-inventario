import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';

const { Pool } = pg;
const PORT = 3000;

// Initialize Neon PostgreSQL connection pool if DATABASE_URL is available
let pool: pg.Pool | null = null;
if (process.env.DATABASE_URL) {
  console.log('Connecting to Neon PostgreSQL...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for secure Neon connectivity
  });
} else {
  console.log('DATABASE_URL environment variable is missing. Running in static inventory mode.');
}

/**
 * Automatically creates and seeds the Neon database on server startup
 */
async function initDatabase() {
  if (!pool) {
    throw new Error('DATABASE_URL is required. Inventory API does not run in static mode.');
  }
  try {
    await pool.query('SELECT 1');
    console.log('Neon PostgreSQL connection verified.');
  } catch (err) {
    console.error('Failed to connect to Neon PostgreSQL:', err);
  }
}

function safeParseJson<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as unknown as T;
  const str = String(value).trim();
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (err) {
    if (Array.isArray(fallback)) {
      return [str] as unknown as T;
    }
    return fallback;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Verify database connectivity without creating or seeding production tables.
  initDatabase().catch(err => {
    console.error('Neon initialization error:', err);
  });

  // --- Backend API Routes ---

  /**
   * Public inventory endpoint returning all supports from Neon PostgreSQL
   * or falling back to static inventory module.
   */
  app.get('/api/supports', async (req, res) => {
    try {
      if (pool) {
        const queryRes = await pool.query(`
          SELECT
            s.*,
            st.summary AS technical_summary,
            st.measures AS technical_measures,
            st.resolution AS technical_resolution,
            st.turn_on_schedule AS technical_turn_on_schedule,
            st.daily_frequency AS technical_daily_frequency,
            st.requirements AS technical_requirements,
            st.spot_duration_seconds AS technical_spot_duration_seconds,
            st.minimum_daily_outings AS technical_minimum_daily_outings,
            st.max_advertisers AS technical_max_advertisers,
            st.route_duration_hours AS technical_route_duration_hours,
            st.operation_days AS technical_operation_days,
            st.video_mode AS technical_video_mode,
            st.metadata AS technical_metadata,
            sp.exhibition_price, sp.installation_price, sp.printing_price,
            sp.monthly_price, sp.exclusive_price, sp.currency,
            sp.tax_included, sp.price_public,
            sr.route_name, sr.route_mode, sr.schedule AS route_schedule,
            sr.duration AS route_duration, sr.hours AS route_hours,
            sr.weekdays AS route_weekdays,
            sr.max_advertisers AS route_max_advertisers,
            sr.spot_duration_seconds AS route_spot_duration_seconds,
            sr.minimum_daily_outings AS route_minimum_daily_outings,
            sr.route_path AS route_path_rich,
            sr.waypoints AS waypoints_rich,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', sm.id,
                  'media_type', sm.media_type,
                  'url', sm.url,
                  'title', sm.title,
                  'alt', sm.alt,
                  'mime_type', sm.mime_type,
                  'sort_order', sm.sort_order,
                  'metadata', sm.metadata
                ) ORDER BY sm.sort_order
              ) FILTER (WHERE sm.id IS NOT NULL),
              '[]'::json
            ) AS media
          FROM supports s
          LEFT JOIN support_technical st ON st.support_canonical_id = s.canonical_id
          LEFT JOIN support_pricing sp ON sp.support_canonical_id = s.canonical_id
          LEFT JOIN support_routes sr ON sr.support_canonical_id = s.canonical_id
          LEFT JOIN support_media sm ON sm.support_canonical_id = s.canonical_id AND sm.active = TRUE
          GROUP BY s.id, st.support_canonical_id, sp.support_canonical_id, sr.support_canonical_id
          ORDER BY s.canonical_id ASC
        `);
        const data = queryRes.rows.map(row => {
          const technical = row.technical_summary || row.technical_measures || row.technical_resolution
            ? {
                summary: row.technical_summary,
                measures: row.technical_measures,
                resolution: row.technical_resolution,
                turn_on_schedule: row.technical_turn_on_schedule,
                daily_frequency: row.technical_daily_frequency,
                requirements: row.technical_requirements,
                spot_duration_seconds: row.technical_spot_duration_seconds,
                minimum_daily_outings: row.technical_minimum_daily_outings,
                max_advertisers: row.technical_max_advertisers,
                route_duration_hours: row.technical_route_duration_hours,
                operation_days: row.technical_operation_days,
                video_mode: row.technical_video_mode,
                metadata: safeParseJson<any>(row.technical_metadata, {}),
              }
            : safeParseJson<any>(row.technical, null);
          const media = safeParseJson<any[]>(row.media, []);
          const pricing = row.currency ? {
            exhibition_price: row.exhibition_price,
            installation_price: row.installation_price,
            printing_price: row.printing_price,
            monthly_price: row.monthly_price,
            exclusive_price: row.exclusive_price,
            currency: row.currency,
            tax_included: row.tax_included,
            price_public: row.price_public,
          } : null;
          const routePath = row.route_path_rich || row.route_path;
          const waypoints = row.waypoints_rich || row.waypoints;
          return {
            canonical_id: row.canonical_id,
            name: row.name,
            ciudad: row.ciudad,
            tipo_soporte: row.tipo_soporte,
            family: row.family,
            active: row.active,
            lat: row.lat,
            lng: row.lng,
            address: row.address,
            description: row.description,
            characteristics: row.characteristics,
            mapa_url: row.mapa_url,
            imageUrls: safeParseJson<string[]>(row.image_urls, []),
            disponibilidad: row.disponibilidad,
            availableFrom: row.available_from,
            schedule: row.schedule || row.route_schedule,
            duration: row.duration || row.route_duration,
            pricing,
            technical,
            media,
            ...(row.tipo_soporte === 'led_movil' && routePath ? { routePath: safeParseJson<any[]>(routePath, []) } : {}),
            ...(row.tipo_soporte === 'led_movil' && waypoints ? { waypoints: safeParseJson<any[]>(waypoints, []) } : {}),
          };
        });

        return res.json({
          status: 'success',
          count: data.length,
          data: data,
        });
      } else {
        return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado. Neon es la fuente de verdad del inventario.' });
      }
    } catch (err: any) {
      console.error('Error serving inventory:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error loading inventory' });
    }
  });

  /**
   * Alias /api/inventario requested by the user:
   * Returns OOH inventory from Neon PostgreSQL supports table.
   */
  app.get('/api/inventario', async (req, res) => {
    try {
      if (pool) {
        const queryRes = await pool.query('SELECT canonical_id as id, name as nombre, address as direccion, lat as latitud, lng as longitud, disponibilidad as estado_ocupacion FROM supports ORDER BY canonical_id ASC');
        return res.json({
          status: 'success',
          count: queryRes.rows.length,
          data: queryRes.rows
        });
      } else {
        return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado.' });
      }
    } catch (err: any) {
      console.error('Error in /api/inventario:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error loading /api/inventario' });
    }
  });

  /**
   * Endpoint to update support availability status directly in Neon DB
   */
  app.post('/api/supports/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { disponibilidad } = req.body;

      if (!disponibilidad) {
        return res.status(400).json({ status: 'error', message: 'disponibilidad parameter is required' });
      }

      if (pool) {
        const checkRes = await pool.query('UPDATE supports SET disponibilidad = $1 WHERE canonical_id = $2', [disponibilidad, id]);
        return res.json({
          status: 'success',
          message: `Status updated to "${disponibilidad}" in Neon database.`,
        });
      } else {
        return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado.' });
      }
    } catch (err: any) {
      console.error('Error updating status override:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error updating availability status' });
    }
  });

  /**
   * Endpoint to update full support details in Neon DB
   */
  app.put('/api/supports/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, lat, lng, description, characteristics, disponibilidad } = req.body;

      if (pool) {
        await pool.query(
          `UPDATE supports 
           SET name = $1, address = $2, lat = $3, lng = $4, description = $5, characteristics = $6, disponibilidad = $7
           WHERE canonical_id = $8`,
          [name, address, lat !== null && lat !== undefined ? parseFloat(lat) : null, lng !== null && lng !== undefined ? parseFloat(lng) : null, description, characteristics, disponibilidad, id]
        );
        return res.json({
          status: 'success',
          message: `Soporte ${id} actualizado correctamente en la base de datos de Neon.`
        });
      } else {
        return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado.' });
      }
    } catch (err: any) {
      console.error('Error updating support details:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error updating support details' });
    }
  });

  /**
   * Endpoint to fetch all registered Media Kits
   */
  app.get('/api/mediakits', async (_req, res) => {
    try {
      if (!pool) return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado.' });
      const queryRes = await pool.query(`
        SELECT id, nombre AS name, cliente_nombre AS client_name,
               screen_ids AS soportes_ids, comentarios AS notes, created_at
        FROM mediakits ORDER BY created_at DESC
      `);
      const data = queryRes.rows.map(row => ({
        ...row,
        soportes_ids: safeParseJson<string[]>(row.soportes_ids, []),
        notes: safeParseJson<any[]>(row.notes, []),
      }));
      return res.json({ status: 'success', count: data.length, data });
    } catch (err: any) {
      console.error('Error fetching mediakits:', err);
      return res.status(500).json({ status: 'error', message: err?.message || 'Error loading mediakits' });
    }
  });

  app.post('/api/mediakits', async (req, res) => {
    try {
      const { id, name, client_name, soportes_ids, notes } = req.body;
      if (!name) return res.status(400).json({ status: 'error', message: 'name parameter is required' });
      if (!pool) return res.status(503).json({ status: 'error', message: 'DATABASE_URL no está configurado.' });

      const generatedId = id || 'mk-' + Math.random().toString(36).slice(2, 11);
      const screenIds = Array.isArray(soportes_ids) ? JSON.stringify(soportes_ids) : (typeof soportes_ids === 'string' ? soportes_ids : '[]');
      const comments = Array.isArray(notes) ? JSON.stringify(notes) : (typeof notes === 'string' ? notes : '[]');

      await pool.query(`
        INSERT INTO mediakits (
          id, nombre, cliente_id, cliente_nombre, ciudad, screen_ids,
          version, estado, fecha, comentarios
        ) VALUES ($1, $2, $3, $4, $5, $6, 1, 'Borrador', CURRENT_DATE::text, $7)
      `, [
        generatedId, name, `legacy-${generatedId}`, client_name || '',
        req.body.ciudad || 'Mendoza', screenIds, comments
      ]);

      return res.status(201).json({
        status: 'success',
        message: 'Media Kit registrado correctamente en Neon.',
        data: { id: generatedId, name, client_name, soportes_ids: safeParseJson<string[]>(screenIds, []), notes: safeParseJson<any[]>(comments, []) }
      });
    } catch (err: any) {
      console.error('Error saving mediakit:', err);
      return res.status(500).json({ status: 'error', message: err?.message || 'Error saving media kit' });
    }
  });

  /**
   * Gmail Proxy Endpoint:
   * Safely relays Gmail send commands on behalf of authenticated users
   * using the passed Authorization Bearer token from Firebase Auth.
   */
  app.post('/api/gmail/send', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ status: 'error', message: 'No Authorization header found' });
      }

      const { to, subject, body } = req.body;
      if (!to || !subject || !body) {
        return res.status(400).json({ status: 'error', message: 'Missing fields: to, subject, and body are required' });
      }

      // Construct standard RFC 2822 email representation
      const emailLines = [
        `To: ${to}`,
        `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        body
      ];
      
      const rfcMessage = emailLines.join('\r\n');
      const base64Safe = Buffer.from(rfcMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64Safe }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Gmail API send failed:', responseData);
        return res.status(response.status).json({
          status: 'error',
          message: responseData?.error?.message || 'Failed to send email via Google Gmail API',
          details: responseData,
        });
      }

      return res.json({
        status: 'success',
        data: responseData,
      });
    } catch (err: any) {
      console.error('Gmail proxy sending error:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Gmail proxy sending failure' });
    }
  });

  /**
   * Google Slides Presentation Creation Proxy:
   * Creates a beautifully-styled Google Slides deck on behalf of the authenticated user
   * representing the specified Media Kit and its selected support items.
   */
  app.post('/api/slides/create', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ status: 'error', message: 'No Authorization header found' });
      }

      const { name, client_name, notes, soportes } = req.body;
      if (!name || !soportes || !Array.isArray(soportes)) {
        return res.status(400).json({ status: 'error', message: 'Missing fields: name and soportes array are required' });
      }

      // Step 1: Create a new blank presentation
      const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: name }),
      });

      if (!createResponse.ok) {
        const createError = await createResponse.json();
        console.error('Failed to create Slides presentation:', createError);
        return res.status(createResponse.status).json({
          status: 'error',
          message: createError?.error?.message || 'Failed to create Google Slides presentation',
        });
      }

      const presentation = await createResponse.json();
      const presentationId = presentation.presentationId;

      // Step 2: Build batch update requests
      const requests: any[] = [];

      const firstSlideId = presentation.slides?.[0]?.objectId;
      if (firstSlideId) {
        requests.push({
          deleteObject: { objectId: firstSlideId }
        });
      }

      // 1. Create custom cover slide
      const coverSlideId = 'cover_slide_id';
      requests.push({
        createSlide: {
          objectId: coverSlideId,
          slideLayoutReference: { predefinedLayout: 'BLANK' }
        }
      });

      // Cover Title box
      const coverTitleId = 'cover_title_box_id';
      requests.push({
        createShape: {
          objectId: coverTitleId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageId: coverSlideId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: 110, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: 80,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: coverTitleId,
          text: `GRUPO COMUNICARTE\n${name.toUpperCase()}`
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: coverTitleId,
          style: {
            fontSize: { magnitude: 28, unit: 'PT' },
            bold: true,
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0.05, green: 0.05, blue: 0.1 } }
            }
          },
          fields: 'fontSize,bold,foregroundColor'
        }
      });

      // Cover Subtitle box
      const coverSubtitleId = 'cover_sub_box_id';
      requests.push({
        createShape: {
          objectId: coverSubtitleId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageId: coverSlideId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: 120, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: 210,
              unit: 'PT'
            }
          }
        }
      });

      const subtitleText = `Propuesta comercial elaborada para:\nCliente: ${client_name || 'Marca / Cliente Particular'}\n\nFecha de emisión: ${new Date().toLocaleDateString()}\nNotas: ${notes || 'Sin consideraciones especiales.'}`;
      requests.push({
        insertText: {
          objectId: coverSubtitleId,
          text: subtitleText
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: coverSubtitleId,
          style: {
            fontSize: { magnitude: 12, unit: 'PT' },
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0.35, green: 0.35, blue: 0.4 } }
            }
          },
          fields: 'fontSize,foregroundColor'
        }
      });

      // 2. Add slide for each OOH support
      soportes.forEach((soporte: any, index: number) => {
        const slideId = `slide_support_${index}`;
        const titleBoxId = `title_box_${index}`;
        const contentBoxId = `content_box_${index}`;

        requests.push({
          createSlide: {
            objectId: slideId,
            slideLayoutReference: { predefinedLayout: 'BLANK' }
          }
        });

        requests.push({
          createShape: {
            objectId: titleBoxId,
            shapeType: 'RECTANGLE',
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 640, unit: 'PT' },
                height: { magnitude: 50, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 40,
                translateY: 30,
                unit: 'PT'
              }
            }
          }
        });

        requests.push({
          insertText: {
            objectId: titleBoxId,
            text: `${index + 1}. ${soporte.name} [ID: ${soporte.canonical_id}]`
          }
        });

        requests.push({
          updateTextStyle: {
            objectId: titleBoxId,
            style: {
              fontSize: { magnitude: 20, unit: 'PT' },
              bold: true,
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0.05, green: 0.05, blue: 0.1 } }
              }
            },
            fields: 'fontSize,bold,foregroundColor'
          }
        });

        requests.push({
          createShape: {
            objectId: contentBoxId,
            shapeType: 'RECTANGLE',
            elementProperties: {
              pageId: slideId,
              size: {
                width: { magnitude: 640, unit: 'PT' },
                height: { magnitude: 260, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 40,
                translateY: 100,
                unit: 'PT'
              }
            }
          }
        });

        const supportDetailsText = 
          `📍 DIRECCIÓN: ${soporte.address || 'Ruta dinámica / Camión móvil'}\n` +
          `🏙️ PLAZA COMERCIAL: ${soporte.ciudad === 'mendoza' ? 'Gran Mendoza (Mza)' : 'Buenos Aires (BsAs)'}\n` +
          `📺 TIPO DE SOPORTE: ${soporte.tipo_soporte === 'led' ? 'Pantalla LED Digital' : soporte.tipo_soporte === 'led_movil' ? 'LED Móvil Rutero' : 'Cartel Estático Tradicional'}\n` +
          `📏 MEDIDAS Y FICHA TÉCNICA: ${soporte.characteristics || 'S/C'}\n` +
          `🟢 DISPONIBILIDAD ACTUAL: ${soporte.disponibilidad || 'disponible'}\n\n` +
          `📝 DETALLES COMERCIALES:\n${soporte.description || 'Soporte publicitario premium ideal para campañas de gran cobertura y alto impacto visual en zonas de alta afluencia vehicular.'}`;

        requests.push({
          insertText: {
            objectId: contentBoxId,
            text: supportDetailsText
          }
        });

        requests.push({
          updateTextStyle: {
            objectId: contentBoxId,
            style: {
              fontSize: { magnitude: 11, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0.25, green: 0.25, blue: 0.25 } }
              }
            },
            fields: 'fontSize,foregroundColor'
          }
        });
      });

      const batchResponse = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!batchResponse.ok) {
        const batchError = await batchResponse.json();
        console.error('Failed to fill Slides template:', batchError);
        return res.status(batchResponse.status).json({
          status: 'error',
          message: batchError?.error?.message || 'Failed to construct slides template structure',
        });
      }

      const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

      return res.json({
        status: 'success',
        presentationId,
        url: presentationUrl,
      });

    } catch (err: any) {
      console.error('Google Slides creation error:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Google Slides proxy failure' });
    }
  });

  /**
   * Health check endpoint
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseConnected: Boolean(pool),
    });
  });

  // --- Vite & Static Asset Handling ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Store locator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
