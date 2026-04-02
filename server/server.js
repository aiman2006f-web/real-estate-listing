const path = require("path");
const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "real-estate.db");
const db = new Database(dbPath);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "homeverse123";

app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "homeverse-lane-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);
app.use(express.static(path.join(__dirname, "..", "public")));

initializeDatabase();

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/studio/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin-login.html"));
});

app.post("/studio/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.isAdminAuthenticated = true;
  res.json({ ok: true });
});

app.post("/studio/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
});

app.get("/studio", requireAdminPageAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

app.get("/api/properties", (req, res) => {
  const filters = req.query;
  const { whereSql, params } = buildPropertyFilters(filters);
  const sql = `
    SELECT *
    FROM properties
    ${whereSql}
    ORDER BY featured DESC, created_at DESC
  `;
  const properties = db.prepare(sql).all(...params).map(normalizeProperty);
  res.json(properties);
});

app.get("/api/properties/:id", (req, res) => {
  const property = db
    .prepare("SELECT * FROM properties WHERE id = ?")
    .get(req.params.id);

  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.json(normalizeProperty(property));
});

app.post("/api/properties", (req, res) => {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const payload = sanitizePropertyPayload(req.body);

  if (!payload.title || !payload.location || !payload.price || !payload.category || !payload.listingType) {
    res.status(400).json({ error: "Missing required property fields" });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO properties (
        title, location, category, listing_type, price, bedrooms, bathrooms, area_sqft, image_url,
        gallery_json, summary, description, amenities_json, agent_name, agent_email, featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      payload.title,
      payload.location,
      payload.category,
      payload.listingType,
      payload.price,
      payload.bedrooms,
      payload.bathrooms,
      payload.areaSqft,
      payload.imageUrl,
      JSON.stringify(payload.gallery),
      payload.summary,
      payload.description,
      JSON.stringify(payload.amenities),
      payload.agentName,
      payload.agentEmail,
      payload.featured ? 1 : 0,
      payload.status
    );

  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(normalizeProperty(property));
});

app.put("/api/properties/:id", (req, res) => {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const existing = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const merged = sanitizePropertyPayload({ ...normalizeProperty(existing), ...req.body });
  db.prepare(
    `UPDATE properties
     SET title = ?, location = ?, category = ?, listing_type = ?, price = ?, bedrooms = ?, bathrooms = ?,
         area_sqft = ?, image_url = ?, gallery_json = ?, summary = ?, description = ?, amenities_json = ?,
         agent_name = ?, agent_email = ?, featured = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    merged.title,
    merged.location,
    merged.category,
    merged.listingType,
    merged.price,
    merged.bedrooms,
    merged.bathrooms,
    merged.areaSqft,
    merged.imageUrl,
    JSON.stringify(merged.gallery),
    merged.summary,
    merged.description,
    JSON.stringify(merged.amenities),
    merged.agentName,
    merged.agentEmail,
    merged.featured ? 1 : 0,
    merged.status,
    req.params.id
  );

  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  res.json(normalizeProperty(property));
});

app.delete("/api/properties/:id", (req, res) => {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const result = db.prepare("DELETE FROM properties WHERE id = ?").run(req.params.id);
  if (!result.changes) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.status(204).send();
});

app.post("/api/inquiries", (req, res) => {
  const inquiry = sanitizeInquiryPayload(req.body);

  if (!inquiry.propertyId || !inquiry.name || !inquiry.email || !inquiry.intent) {
    res.status(400).json({ error: "Missing required inquiry fields" });
    return;
  }

  const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(inquiry.propertyId);
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const result = db.prepare(
    `INSERT INTO inquiries (property_id, name, email, phone, intent, message, budget)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    inquiry.propertyId,
    inquiry.name,
    inquiry.email,
    inquiry.phone,
    inquiry.intent,
    inquiry.message,
    inquiry.budget
  );

  const savedInquiry = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(savedInquiry);
});

app.get("/api/admin/summary", (_req, res) => {
  if (!isAdminAuthenticated(_req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const summary = {
    totalProperties: db.prepare("SELECT COUNT(*) AS count FROM properties").get().count,
    totalSales: db
      .prepare("SELECT COUNT(*) AS count FROM properties WHERE listing_type = 'sale'")
      .get().count,
    totalRentals: db
      .prepare("SELECT COUNT(*) AS count FROM properties WHERE listing_type = 'rent'")
      .get().count,
    featuredCount: db
      .prepare("SELECT COUNT(*) AS count FROM properties WHERE featured = 1")
      .get().count,
    totalInquiries: db.prepare("SELECT COUNT(*) AS count FROM inquiries").get().count,
    recentInquiries: db
      .prepare(
        `SELECT inquiries.*, properties.title AS property_title
         FROM inquiries
         JOIN properties ON properties.id = inquiries.property_id
         ORDER BY inquiries.created_at DESC
         LIMIT 8`
      )
      .all()
  };

  res.json(summary);
});

app.get("/api/admin/properties", (_req, res) => {
  if (!isAdminAuthenticated(_req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const properties = db
    .prepare("SELECT * FROM properties ORDER BY updated_at DESC, created_at DESC")
    .all()
    .map(normalizeProperty);
  res.json(properties);
});

app.get("/api/admin/inquiries", (_req, res) => {
  if (!isAdminAuthenticated(_req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const inquiries = db
    .prepare(
      `SELECT inquiries.*, properties.title AS property_title, properties.location AS property_location
       FROM inquiries
       JOIN properties ON properties.id = inquiries.property_id
       ORDER BY inquiries.created_at DESC`
    )
    .all();
  res.json(inquiries);
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Habitat Lane running at http://localhost:${PORT}`);
});

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      listing_type TEXT NOT NULL CHECK(listing_type IN ('sale', 'rent')),
      price INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL DEFAULT 0,
      bathrooms REAL NOT NULL DEFAULT 0,
      area_sqft INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      amenities_json TEXT NOT NULL DEFAULT '[]',
      agent_name TEXT NOT NULL DEFAULT '',
      agent_email TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'available',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      intent TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      budget TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
    );
  `);

  seedProperties();
}

function seedProperties() {
  db.prepare("DELETE FROM properties WHERE title = ?").run("Lakeview Dream Villa");

  const properties = [
    {
      title: "Westbury Family Residence",
      location: "Belmont Gardens, Chicago",
      category: "House",
      listingType: "sale",
      price: 349000,
      bedrooms: 3,
      bathrooms: 2,
      areaSqft: 3450,
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Beautiful huge family house in a heartful neighborhood with landscaped frontage.",
      description: "A bright suburban home inspired by the reference layout, with airy interiors, a renewed facade, landscaped frontage, and move-in-ready family spaces.",
      amenities: ["Smart Home", "Garage", "Garden", "24/7 Security"],
      agentName: "William Seklo",
      agentEmail: "william@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "Modern Apartment Nice View",
      location: "Westbury, New York",
      category: "Apartment",
      listingType: "rent",
      price: 3400,
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1450,
      imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Newly renovated apartment with skyline light and warm wood details.",
      description: "This rental apartment offers a polished urban experience with wide windows, curated finishes, and a layout tuned for young professionals or couples.",
      amenities: ["Swimming Pool", "Private Security", "Medical Center", "Gym"],
      agentName: "Maya Brooks",
      agentEmail: "maya@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "Harborline Office Hub",
      location: "Lower Manhattan, New York",
      category: "Commercial",
      listingType: "rent",
      price: 6200,
      bedrooms: 0,
      bathrooms: 2,
      areaSqft: 2300,
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Commercial workspace for a modern business team with reception and flexible desks.",
      description: "A refined office studio suitable for agencies, startups, and boutique consultancies that want a central address and polished client-facing environment.",
      amenities: ["Reception", "Parking Space", "Fiber Internet", "Meeting Rooms"],
      agentName: "Derek Shaw",
      agentEmail: "derek@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Sunset Interior Retreat",
      location: "Austin Heights, Texas",
      category: "House",
      listingType: "sale",
      price: 542000,
      bedrooms: 3,
      bathrooms: 2.5,
      areaSqft: 2850,
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Interior-forward family home with layered textures and cozy entertaining areas.",
      description: "An inviting home with multiple living zones, a dining-oriented heart, and a refined neutral palette for buyers who want comfort and presentation.",
      amenities: ["Smart Home", "Private Security", "Garden", "Fireplace"],
      agentName: "Claire Hudson",
      agentEmail: "claire@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Metro Skyline Residence",
      location: "Downtown Seattle, Washington",
      category: "Apartment",
      listingType: "rent",
      price: 4100,
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1380,
      imageUrl: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Sleek city apartment with a skyline profile and amenity-rich tower access.",
      description: "Created for renters who want strong views and a professional lifestyle, this apartment blends convenience, premium finishes, and a central location.",
      amenities: ["Medical Center", "Swimming Pool", "Profile Lounge", "Rooftop Deck"],
      agentName: "Noah Blake",
      agentEmail: "noah@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "Palm Crescent Residence",
      location: "Jumeirah Village, Dubai",
      category: "Villa",
      listingType: "sale",
      price: 1215000,
      bedrooms: 5,
      bathrooms: 5,
      areaSqft: 4680,
      imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687644-a3bfcd646154?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Contemporary villa with private pool, glass living hall, and premium family suites.",
      description: "A high-end villa for buyers looking for resort-style luxury, expansive interiors, and strong neighborhood prestige.",
      amenities: ["Private Pool", "Smart Home", "Garage", "Garden Lounge"],
      agentName: "Layla Kareem",
      agentEmail: "layla@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "Cedar Grove Townhome",
      location: "Brookline, Massachusetts",
      category: "House",
      listingType: "rent",
      price: 3900,
      bedrooms: 3,
      bathrooms: 2.5,
      areaSqft: 1880,
      imageUrl: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Warm and family-ready townhome with bright windows and quiet tree-lined access.",
      description: "Built for renters who want neighborhood charm with modern comfort, this townhome offers practical space, balanced light, and dependable value.",
      amenities: ["Fireplace", "Parking", "Storage", "Play Area"],
      agentName: "Emma Rhodes",
      agentEmail: "emma@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Cliffside Horizon Loft",
      location: "Santa Monica, California",
      category: "Apartment",
      listingType: "sale",
      price: 684000,
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1495,
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Design-led ocean-adjacent loft with clean lines and expressive open-plan living.",
      description: "A bright apartment with a polished California feel, ideal for buyers who care about style, location, and a flexible modern footprint.",
      amenities: ["Roof Deck", "Gym", "Ocean Breeze", "Pet Friendly"],
      agentName: "Julian Park",
      agentEmail: "julian@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "North Harbor Family Estate",
      location: "Vancouver, British Columbia",
      category: "House",
      listingType: "sale",
      price: 932000,
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 3560,
      imageUrl: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Large estate home with family zoning, stone detailing, and generous exterior frontage.",
      description: "This listing adds a broader international location mix to the site while giving the catalog a premium family-home option with strong curb appeal.",
      amenities: ["Garden", "Two-Car Garage", "Home Office", "Security"],
      agentName: "Sophia Bennett",
      agentEmail: "sophia@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Old Town Brick Manor",
      location: "Charleston, South Carolina",
      category: "House",
      listingType: "sale",
      price: 774000,
      bedrooms: 4,
      bathrooms: 3.5,
      areaSqft: 3180,
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Character-rich brick manor with heritage detailing and beautifully updated interiors.",
      description: "Added to broaden the catalog with a more classic architectural style that complements the newer modern homes on the site.",
      amenities: ["Historic Charm", "Updated Kitchen", "Courtyard", "Fireplace"],
      agentName: "Marcus Hale",
      agentEmail: "marcus@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Azure Bay Commercial Suites",
      location: "Singapore Marina District",
      category: "Commercial",
      listingType: "rent",
      price: 8900,
      bedrooms: 0,
      bathrooms: 3,
      areaSqft: 2940,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Premium office suites overlooking the bay with polished meeting and reception areas.",
      description: "This commercial addition gives the site more business-oriented inventory and improves the overall variety of searchable properties.",
      amenities: ["Meeting Rooms", "Reception", "Fiber Internet", "Bay View"],
      agentName: "Daniel Koh",
      agentEmail: "daniel@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Maple Stone Cottage",
      location: "Asheville, North Carolina",
      category: "House",
      listingType: "sale",
      price: 598000,
      bedrooms: 3,
      bathrooms: 2,
      areaSqft: 2140,
      imageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "A cozy beige-toned cottage with stone accents, garden edges, and warm family interiors.",
      description: "This listing adds another reference-style residential option with softer architectural character and a strong warm-home feel.",
      amenities: ["Garden", "Fireplace", "Parking", "Patio"],
      agentName: "Olivia Hart",
      agentEmail: "olivia@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Golden Crest Residence",
      location: "San Diego, California",
      category: "House",
      listingType: "rent",
      price: 4600,
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 2680,
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Bright modern family residence with airy windows, neutral textures, and clean curb appeal.",
      description: "Added as another catalog expansion so the property grid feels fuller and visually consistent with the reference layout.",
      amenities: ["Smart Home", "Garage", "Security", "Family Lounge"],
      agentName: "Nathan Cole",
      agentEmail: "nathan@habitatlane.com",
      featured: true,
      status: "available"
    },
    {
      title: "Rosewood Garden Flats",
      location: "Notting Hill, London",
      category: "Apartment",
      listingType: "rent",
      price: 5200,
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1360,
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "Elegant apartment living with garden-facing light and refined city finishes.",
      description: "A polished London rental for users who want a premium urban address, warm interiors, and a quieter residential setting.",
      amenities: ["Garden View", "Concierge", "Storage", "Lift Access"],
      agentName: "Harper Lane",
      agentEmail: "harper@habitatlane.com",
      featured: false,
      status: "available"
    },
    {
      title: "Desert Bloom Estate",
      location: "Phoenix, Arizona",
      category: "House",
      listingType: "sale",
      price: 689000,
      bedrooms: 4,
      bathrooms: 3,
      areaSqft: 3025,
      imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80"
      ],
      summary: "A warm desert-side estate with natural light, broad frontage, and family-friendly planning.",
      description: "Added to broaden the location mix with another strong-looking residential listing that fits the homepage card style well.",
      amenities: ["Pool", "Patio", "Smart Home", "Garage"],
      agentName: "Ethan Moss",
      agentEmail: "ethan@habitatlane.com",
      featured: true,
      status: "available"
    }
  ];

  const insert = db.prepare(
    `INSERT INTO properties (
      title, location, category, listing_type, price, bedrooms, bathrooms, area_sqft,
      image_url, gallery_json, summary, description, amenities_json, agent_name,
      agent_email, featured, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const updateByTitle = db.prepare(
    `UPDATE properties
     SET location = ?, category = ?, listing_type = ?, price = ?, bedrooms = ?, bathrooms = ?,
         area_sqft = ?, image_url = ?, gallery_json = ?, summary = ?, description = ?,
         amenities_json = ?, agent_name = ?, agent_email = ?, featured = ?, status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE title = ?`
  );

  const transaction = db.transaction(rows => {
    for (const row of rows) {
      const existing = db.prepare("SELECT id FROM properties WHERE title = ?").get(row.title);

      if (existing) {
        updateByTitle.run(
          row.location,
          row.category,
          row.listingType,
          row.price,
          row.bedrooms,
          row.bathrooms,
          row.areaSqft,
          row.imageUrl,
          JSON.stringify(row.gallery),
          row.summary,
          row.description,
          JSON.stringify(row.amenities),
          row.agentName,
          row.agentEmail,
          row.featured ? 1 : 0,
          row.status,
          row.title
        );
        continue;
      }

      insert.run(
        row.title,
        row.location,
        row.category,
        row.listingType,
        row.price,
        row.bedrooms,
        row.bathrooms,
        row.areaSqft,
        row.imageUrl,
        JSON.stringify(row.gallery),
        row.summary,
        row.description,
        JSON.stringify(row.amenities),
        row.agentName,
        row.agentEmail,
        row.featured ? 1 : 0,
        row.status
      );
    }
  });

  transaction(properties);
}

function buildPropertyFilters(filters) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push("(title LIKE ? OR location LIKE ? OR summary LIKE ? OR description LIKE ?)");
    const pattern = `%${filters.search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }

  if (filters.listingType) {
    clauses.push("listing_type = ?");
    params.push(filters.listingType);
  }

  if (filters.minPrice) {
    clauses.push("price >= ?");
    params.push(Number(filters.minPrice));
  }

  if (filters.maxPrice) {
    clauses.push("price <= ?");
    params.push(Number(filters.maxPrice));
  }

  if (filters.bedrooms) {
    clauses.push("bedrooms >= ?");
    params.push(Number(filters.bedrooms));
  }

  if (filters.featured === "true") {
    clauses.push("featured = 1");
  }

  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

function normalizeProperty(property) {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    category: property.category,
    listingType: property.listing_type,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.area_sqft,
    imageUrl: property.image_url,
    gallery: safeJsonParse(property.gallery_json, []),
    summary: property.summary,
    description: property.description,
    amenities: safeJsonParse(property.amenities_json, []),
    agentName: property.agent_name,
    agentEmail: property.agent_email,
    featured: Boolean(property.featured),
    status: property.status,
    createdAt: property.created_at,
    updatedAt: property.updated_at
  };
}

function sanitizePropertyPayload(payload) {
  const gallery = Array.isArray(payload.gallery)
    ? payload.gallery.filter(Boolean)
    : String(payload.gallery || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

  const amenities = Array.isArray(payload.amenities)
    ? payload.amenities.filter(Boolean)
    : String(payload.amenities || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

  return {
    title: String(payload.title || "").trim(),
    location: String(payload.location || "").trim(),
    category: String(payload.category || "House").trim(),
    listingType: payload.listingType === "rent" ? "rent" : "sale",
    price: Number(payload.price || 0),
    bedrooms: Number(payload.bedrooms || 0),
    bathrooms: Number(payload.bathrooms || 0),
    areaSqft: Number(payload.areaSqft || payload.area_sqft || 0),
    imageUrl:
      String(payload.imageUrl || payload.image_url || "").trim() ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    gallery,
    summary: String(payload.summary || "").trim(),
    description: String(payload.description || "").trim(),
    amenities,
    agentName: String(payload.agentName || payload.agent_name || "").trim(),
    agentEmail: String(payload.agentEmail || payload.agent_email || "").trim(),
    featured: Boolean(payload.featured),
    status: String(payload.status || "available").trim() || "available"
  };
}

function sanitizeInquiryPayload(payload) {
  return {
    propertyId: Number(payload.propertyId || payload.property_id || 0),
    name: String(payload.name || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    intent: String(payload.intent || "").trim(),
    message: String(payload.message || "").trim(),
    budget: String(payload.budget || "").trim()
  };
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function isAdminAuthenticated(req) {
  return Boolean(req.headers.cookie && req.session && req.session.isAdminAuthenticated);
}

function requireAdminPageAuth(req, res, next) {
  if (!isAdminAuthenticated(req)) {
    res.redirect("/studio/login");
    return;
  }

  next();
}
