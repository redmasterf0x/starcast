require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

function generateMagicToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateMagicLink(token) {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  return `${baseUrl}/auth/verify?token=${token}`;
}

const articles = [
  {
    id: 1,
    title: 'Why digital publications are building community into the story',
    category: 'Culture',
    readTime: '5 min read',
    summary: 'Writers are turning audience interaction into a core part of editorial strategy.',
  },
  {
    id: 2,
    title: 'Neon-powered stacks are helping media teams ship faster',
    category: 'Tech',
    readTime: '7 min read',
    summary: 'Modern publishing teams need reliability, scale, and a clean path to data-driven decisions.',
  },
  {
    id: 3,
    title: 'The next generation of subscriber communities is built around trust',
    category: 'Community',
    readTime: '4 min read',
    summary: 'Brands that stay useful, consistent, and transparent keep audiences longer.',
  },
];

function getDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.NEON_DATABASE_URL,
    process.env.NEON_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRESQL_URL,
  ];

  for (const value of candidates) {
    if (value && value.trim()) {
      return value.trim();
    }
  }

  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  if (PGHOST && PGDATABASE && PGUSER) {
    const port = PGPORT || '5432';
    const passwordSegment = PGPASSWORD ? `:${encodeURIComponent(PGPASSWORD)}` : '';
    return `postgresql://${PGUSER}${passwordSegment}@${PGHOST}:${port}/${PGDATABASE}?sslmode=require`;
  }

  return '';
}

const databaseUrl = getDatabaseUrl();
const pool = databaseUrl && /^postgres(?:ql)?:\/\//i.test(databaseUrl)
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : null;

const ROLE_LEVELS = {
  user: 0,
  authed_user: 1,
  mod: 2,
  admin: 3,
};

function normalizeRole(role) {
  const normalized = String(role || 'user').toLowerCase();
  return Object.prototype.hasOwnProperty.call(ROLE_LEVELS, normalized) ? normalized : 'user';
}

function requireRole(...minimumRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentRole = normalizeRole(req.session.user.role);
    const minimumLevel = minimumRoles.reduce((highest, roleName) => {
      const role = normalizeRole(roleName);
      return Math.max(highest, ROLE_LEVELS[role] || 0);
    }, 0);

    if ((ROLE_LEVELS[currentRole] || 0) < minimumLevel) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.AUTH_SECRET || 'starcast-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
  })
);
app.use(express.static(path.join(__dirname)));

async function ensureDatabase() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'authed_user'
        CHECK (role IN ('user', 'authed_user', 'mod', 'admin')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(120) NOT NULL DEFAULT 'Member',
      bio TEXT DEFAULT 'Tell the community what you love about media and culture.',
      interests TEXT DEFAULT 'Film, media, community, live storytelling',
      member_status VARCHAR(64) NOT NULL DEFAULT 'Member',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS magic_links (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      read_time TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM posts');
  if (existing.rows[0].count === 0) {
    await pool.query(
      `INSERT INTO posts (title, category, read_time, summary) VALUES
        ('Why digital publications are building community into the story', 'Culture', '5 min read', 'Writers are turning audience interaction into a core part of editorial strategy.'),
        ('Neon-powered stacks are helping media teams ship faster', 'Tech', '7 min read', 'Modern publishing teams need reliability, scale, and a clean path to data-driven decisions.'),
        ('The next generation of subscriber communities is built around trust', 'Community', '4 min read', 'Brands that stay useful, consistent, and transparent keep audiences longer.')`
    );
  }
}

async function createDefaultProfileForUser(userId, email) {
  if (!pool) return null;

  const defaultDisplayName = (email || 'member').split('@')[0] || 'Member';
  const result = await pool.query(
    `INSERT INTO user_profiles (user_id, display_name, bio, interests, member_status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [
      userId,
      defaultDisplayName,
      'Tell the community what you love about media and culture.',
      'Film, media, community, live storytelling',
      'Member',
    ]
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  const existing = await pool.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  return existing.rows[0] || null;
}

async function getProfileForUser(userId) {
  if (!pool) return null;

  const result = await pool.query(
    `SELECT up.*, u.email
     FROM user_profiles up
     JOIN users u ON u.id = up.user_id
     WHERE up.user_id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

function requireAuth(req, res, next) {
  return requireRole('authed_user')(req, res, next);
}

app.get('/api/health', async (req, res) => {
  if (!pool) {
    return res.json({
      ok: true,
      database: 'not configured',
      auth: process.env.AUTH_SECRET ? 'configured' : 'not configured',
      message: 'Neon and auth are scaffolded. Add a real PostgreSQL connection string via DATABASE_URL (or the Neon PG* env values) and AUTH_SECRET to activate them. The API key alone is not enough.',
    });
  }

  try {
    await ensureDatabase();
    const result = await pool.query('SELECT NOW() AS current_time');
    return res.json({
      ok: true,
      database: 'connected',
      auth: process.env.AUTH_SECRET ? 'configured' : 'not configured',
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      database: 'error',
      auth: process.env.AUTH_SECRET ? 'configured' : 'not configured',
      error: error.message,
    });
  }
});

app.get('/api/articles', async (req, res) => {
  if (!pool) {
    return res.json({ source: 'mock', articles });
  }

  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY id ASC');
    return res.json({ source: 'database', articles: result.rows });
  } catch (error) {
    return res.json({ source: 'mock', articles, error: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: !!(req.session && req.session.user),
    user: req.session && req.session.user ? {
      email: req.session.user.email,
      role: normalizeRole(req.session.user.role),
    } : null,
    provider: 'session-auth',
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email and password (6+ chars) are required.' });
  }

  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email.toLowerCase(), passwordHash, 'authed_user']
    );

    const user = result.rows[0];
    await createDefaultProfileForUser(user.id, user.email);

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'authed_user',
    };
    return res.status(201).json({
      message: 'Account created successfully.',
      user: { email: user.email, role: user.role || 'authed_user' },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile', requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  try {
    const profile = await getProfileForUser(req.session.user.id);
    if (!profile) {
      const created = await createDefaultProfileForUser(req.session.user.id, req.session.user.email);
      return res.json({ profile: created || {
        user_id: req.session.user.id,
        display_name: (req.session.user.email || 'Member').split('@')[0],
        bio: 'Tell the community what you love about media and culture.',
        interests: 'Film, media, community, live storytelling',
        member_status: 'Member',
      }});
    }

    return res.json({
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        bio: profile.bio,
        interests: profile.interests,
        member_status: profile.member_status,
        email: profile.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  const { display_name, bio, interests, member_status } = req.body || {};
  const trimmedDisplayName = String(display_name || '').trim();
  const trimmedBio = String(bio || '').trim();
  const trimmedInterests = String(interests || '').trim();
  const trimmedStatus = String(member_status || 'Member').trim();

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, display_name, bio, interests, member_status, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         display_name = EXCLUDED.display_name,
         bio = EXCLUDED.bio,
         interests = EXCLUDED.interests,
         member_status = EXCLUDED.member_status,
         updated_at = NOW()
       RETURNING *`,
      [
        req.session.user.id,
        trimmedDisplayName || 'Member',
        trimmedBio || 'Tell the community what you love about media and culture.',
        trimmedInterests || 'Film, media, community, live storytelling',
        trimmedStatus || 'Member',
      ]
    );

    return res.json({
      message: 'Profile saved successfully.',
      profile: {
        id: result.rows[0].id,
        user_id: result.rows[0].user_id,
        display_name: result.rows[0].display_name,
        bio: result.rows[0].bio,
        interests: result.rows[0].interests,
        member_status: result.rows[0].member_status,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
    };
    return res.json({
      message: 'Logged in successfully.',
      user: { email: user.email, role: normalizeRole(user.role) },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully.' });
  });
});

app.post('/api/auth/magic-link', async (req, res) => {
  const { email } = req.body || {};

  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  try {
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO magic_links (email, token, expires_at) VALUES ($1, $2, $3)`,
      [email.toLowerCase(), token, expiresAt]
    );

    const magicLink = generateMagicLink(token);
    console.log(`[DEV] Magic link for ${email}: ${magicLink}`);

    return res.json({
      message: 'Magic link sent successfully.',
      email: email.toLowerCase(),
      devLink: magicLink,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-link', async (req, res) => {
  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Token is required.' });
  }

  if (!pool) {
    return res.status(503).json({ error: 'Database is not configured yet.' });
  }

  try {
    const linkResult = await pool.query(
      `SELECT * FROM magic_links WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (linkResult.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid or expired link.' });
    }

    const link = linkResult.rows[0];
    const email = link.email.toLowerCase();

    let user = null;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rowCount === 0) {
      const newUserResult = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, '', 'authed_user']
      );
      user = newUserResult.rows[0];
      await createDefaultProfileForUser(user.id, user.email);
    } else {
      user = userResult.rows[0];
    }

    await pool.query('UPDATE magic_links SET verified = TRUE WHERE token = $1', [token]);

    req.session.user = {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
    };

    return res.json({
      message: 'Signed in successfully.',
      user: { email: user.email, role: normalizeRole(user.role) },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/mod', requireRole('mod'), async (req, res) => {
  return res.json({
    message: 'Moderator access granted.',
    user: { email: req.session.user.email, role: normalizeRole(req.session.user.role) },
  });
});

app.get('/api/admin', requireRole('admin'), async (req, res) => {
  return res.json({
    message: 'Admin access granted.',
    user: { email: req.session.user.email, role: normalizeRole(req.session.user.role) },
  });
});

app.get('/api/admin/users', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    return res.json({
      users: result.rows.map((user) => ({
        id: user.id,
        email: user.email,
        role: normalizeRole(user.role),
        created_at: user.created_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/role', requireRole('admin'), async (req, res) => {
  const targetId = Number(req.params.id);
  const nextRole = normalizeRole(req.body && req.body.role);

  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  if (!Object.prototype.hasOwnProperty.call(ROLE_LEVELS, nextRole)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  if (targetId === req.session.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role from this screen.' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [nextRole, targetId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      message: 'Role updated successfully.',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: normalizeRole(result.rows[0].role),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/role-check', requireAuth, async (req, res) => {
  return res.json({
    role: normalizeRole(req.session.user.role),
    canAccessModerator: (ROLE_LEVELS[normalizeRole(req.session.user.role)] || 0) >= ROLE_LEVELS.mod,
    canAccessAdmin: (ROLE_LEVELS[normalizeRole(req.session.user.role)] || 0) >= ROLE_LEVELS.admin,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

async function start() {
  if (pool) {
    try {
      await ensureDatabase();
      console.log('Database ready');
    } catch (error) {
      console.error('Database setup failed:', error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Starcast app running on http://localhost:${PORT}`);
  });
}

start();
