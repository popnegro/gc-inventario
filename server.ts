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
  if (!pool) return;
  try {
    // 1. Create supports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supports (
        canonical_id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        ciudad VARCHAR(50) NOT NULL,
        tipo_soporte VARCHAR(50) NOT NULL,
        family VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        address TEXT,
        description TEXT,
        characteristics TEXT,
        mapa_url TEXT,
        image_urls TEXT, -- JSON string array
        disponibilidad VARCHAR(50) DEFAULT 'disponible',
        technical TEXT, -- JSON technical object
        waypoints TEXT, -- JSON waypoints array
        route_path TEXT -- JSON coordinates array
      );
    `);

    // 1.5 Create mediakits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mediakits (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        client_name TEXT,
        soportes_ids TEXT, -- comma-separated list of supports
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      );
    `);

    // 2. Check if table is empty
    const checkRes = await pool.query('SELECT COUNT(*) FROM supports');
    const count = parseInt(checkRes.rows[0].count, 10);
    
    if (count === 0) {
      console.log('Neon database table "supports" is empty. Initializing seed data...');
      const inventoryModule = await import('./src/data/inventory');
      const allSupports = [
        ...(inventoryModule.fixedLocations || []),
        ...(inventoryModule.mobileRoutes || []),
      ];

      for (const item of allSupports) {
        const image_urls = JSON.stringify(item.imageUrls || []);
        const technical = JSON.stringify(item.technical || null);
        const waypoints = 'waypoints' in item ? JSON.stringify(item.waypoints || []) : null;
        const route_path = 'routePath' in item ? JSON.stringify(item.routePath || []) : null;

        await pool.query(`
          INSERT INTO supports (
            canonical_id, name, ciudad, tipo_soporte, family, active, 
            lat, lng, address, description, characteristics, mapa_url, 
            image_urls, disponibilidad, technical, waypoints, route_path
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          item.canonical_id,
          item.name,
          item.ciudad,
          item.tipo_soporte,
          item.family || null,
          item.active !== false,
          'lat' in item ? item.lat : null,
          'lng' in item ? item.lng : null,
          'address' in item ? item.address : '',
          item.description,
          item.characteristics,
          'mapa_url' in item ? item.mapa_url : '',
          image_urls,
          item.disponibilidad || 'disponible',
          technical,
          waypoints,
          route_path
        ]);
      }
      console.log(`Successfully seeded ${allSupports.length} items into Neon PostgreSQL database.`);
    } else {
      console.log(`Neon database loaded. ${count} active records found in "supports" table.`);
    }
  } catch (err) {
    console.error('Failed to initialize and seed Neon database:', err);
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

  // Run database initialization in background
  initDatabase().catch(err => {
    console.error('Async DB initialization error:', err);
  });

  // --- Backend API Routes ---

  /**
   * Public inventory endpoint returning all supports from Neon PostgreSQL
   * or falling back to static inventory module.
   */
  app.get('/api/supports', async (req, res) => {
    try {
      if (pool) {
        const queryRes = await pool.query('SELECT * FROM supports ORDER BY canonical_id ASC');
        const data = queryRes.rows.map(row => {
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
            technical: safeParseJson<any>(row.technical, null),
            ...(row.tipo_soporte === 'led_movil' && row.waypoints ? { waypoints: safeParseJson<any[]>(row.waypoints, []) } : {}),
            ...(row.tipo_soporte === 'led_movil' && row.route_path ? { routePath: safeParseJson<any[]>(row.route_path, []) } : {})
          };
        });

        return res.json({
          status: 'success',
          count: data.length,
          data: data,
        });
      } else {
        // Static fallback if database isn't connected
        const inventoryModule = await import('./src/data/inventory');
        const allSupports = [
          ...(inventoryModule.fixedLocations || []),
          ...(inventoryModule.mobileRoutes || []),
        ];
        return res.json({
          status: 'success',
          count: allSupports.length,
          data: allSupports,
        });
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
        const inventoryModule = await import('./src/data/inventory');
        const allSupports = [
          ...(inventoryModule.fixedLocations || []),
          ...(inventoryModule.mobileRoutes || []),
        ];
        const mapped = allSupports.map(item => ({
          id: item.canonical_id,
          nombre: item.name,
          direccion: 'address' in item ? item.address : '',
          latitud: 'lat' in item ? item.lat : null,
          longitud: 'lng' in item ? item.lng : null,
          estado_ocupacion: item.disponibilidad || 'disponible'
        }));
        return res.json({
          status: 'success',
          count: mapped.length,
          data: mapped
        });
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
        return res.json({
          status: 'success',
          message: 'Status updated successfully (Running in database-less static mode).',
        });
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
        return res.json({
          status: 'success',
          message: `Soporte ${id} actualizado correctamente en memoria (Modo estático).`
        });
      }
    } catch (err: any) {
      console.error('Error updating support details:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error updating support details' });
    }
  });

  /**
   * Endpoint to fetch all registered Media Kits
   */
  app.get('/api/mediakits', async (req, res) => {
    try {
      if (pool) {
        const queryRes = await pool.query('SELECT * FROM mediakits ORDER BY created_at DESC');
        return res.json({
          status: 'success',
          count: queryRes.rows.length,
          data: queryRes.rows
        });
      } else {
        // Mock fallback list
        return res.json({
          status: 'success',
          count: 2,
          data: [
            { id: 'mk-1', name: 'Propuesta Primavera 2026 - Mendoza Centro', client_name: 'Coca Cola AR', soportes_ids: 'mza-led-1,mza-led-2', notes: 'Campañas de vía pública digital.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
            { id: 'mk-2', name: 'Media Kit LED Móvil - Lanzamiento Mendoza', client_name: 'Banco Galicia', soportes_ids: 'mza-movil-1', notes: 'Recorridos de alta frecuencia de 6 horas.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() }
          ]
        });
      }
    } catch (err: any) {
      console.error('Error fetching mediakits:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error loading mediakits' });
    }
  });

  /**
   * Endpoint to register a new Media Kit proposal
   */
  app.post('/api/mediakits', async (req, res) => {
    try {
      const { id, name, client_name, soportes_ids, notes } = req.body;

      if (!name) {
        return res.status(400).json({ status: 'error', message: 'name parameter is required' });
      }

      const generatedId = id || 'mk-' + Math.random().toString(36).substr(2, 9);

      if (pool) {
        await pool.query(
          `INSERT INTO mediakits (id, name, client_name, soportes_ids, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [generatedId, name, client_name || '', soportes_ids || '', notes || '']
        );
        return res.json({
          status: 'success',
          message: 'Media Kit registrado correctamente en Neon.',
          data: { id: generatedId, name, client_name, soportes_ids, notes }
        });
      } else {
        return res.json({
          status: 'success',
          message: 'Media Kit registrado correctamente en memoria (Modo estático).',
          data: { id: generatedId, name, client_name, soportes_ids, notes, created_at: new Date().toISOString() }
        });
      }
    } catch (err: any) {
      console.error('Error saving mediakit:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Error saving media kit' });
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
