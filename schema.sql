CREATE TABLE properties (
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

CREATE TABLE inquiries (
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
