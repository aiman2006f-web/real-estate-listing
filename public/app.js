const page = document.body.dataset.page || "home";
const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_STORY_IMAGE = "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80";
const DEFAULT_AVATAR_IMAGE = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80";

function renderStars(rating) {
  const rounded = Math.round(rating);
  return `${"\u2605".repeat(rounded)}${"\u2606".repeat(5 - rounded)}`;
}

function applyImageFallback(image, fallbackSrc) {
  image.addEventListener(
    "error",
    () => {
      if (image.dataset.fallbackApplied === "true") {
        return;
      }

      image.dataset.fallbackApplied = "true";
      image.src = fallbackSrc;
    },
    { once: true }
  );
}

function applyFallbackToAll(images, fallbackSrc) {
  images.forEach(image => applyImageFallback(image, fallbackSrc));
}

const reviewStories = [
  {
    name: "Chris Traeger",
    role: "Homebuyer",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    property: "Westbury Family Residence",
    quote: "The platform felt premium from the first search. We found our family home faster because the listings were clear, elegant, and actually useful."
  },
  {
    name: "Duke Silver",
    role: "Property Investor",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    property: "Palm Crescent Residence",
    quote: "I appreciated how refined the experience was. The details, pricing, and inquiry flow made the decision-making process feel efficient and trustworthy."
  },
  {
    name: "Tsukasa Aoi",
    role: "Luxury Renter",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    property: "Rosewood Garden Flats",
    quote: "The layout is beautiful, but more importantly it works. I could compare premium rentals quickly and send an inquiry without any confusion."
  },
  {
    name: "Freida Varnes",
    role: "Relocating Family",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
    property: "North Harbor Family Estate",
    quote: "We were moving cities and needed confidence. Nestora made the search feel calm, curated, and far more premium than the usual property sites."
  },
  {
    name: "Carl Lorthner",
    role: "First-time Buyer",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=240&q=80",
    property: "Desert Bloom Estate",
    quote: "The filters helped a lot, but the visuals and details are what really sold me. It felt like browsing a professional studio, not a cluttered listing board."
  },
  {
    name: "Marci Senter",
    role: "Upsizing Buyer",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=240&q=80",
    property: "Golden Crest Residence",
    quote: "The new catalog is polished and easy to trust. We loved being able to open a short homepage selection and then move into the full portfolio."
  },
  {
    name: "Aria Bennett",
    role: "Apartment Buyer",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80",
    property: "Cliffside Horizon Loft",
    quote: "It feels premium all the way through. The listing photos, clean prices, and clear layout gave me confidence right away."
  },
  {
    name: "Noah Bishop",
    role: "Remote Investor",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=80",
    property: "Azure Bay Commercial Suites",
    quote: "For remote decisions, detail clarity matters. This site gave me a much better sense of trust and quality than typical portals."
  },
  {
    name: "Layla Monroe",
    role: "Luxury Buyer",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    property: "Sapphire Coast Villa",
    quote: "The presentation felt editorial and premium. It helped us understand the property at a glance and move confidently into the inquiry stage."
  },
  {
    name: "Jordan Hale",
    role: "Relocation Client",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517456793572-67a56b1800e3?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=240&q=80",
    property: "Cedar Vale Residence",
    quote: "We were comparing multiple cities, and this was the first site that made the search feel calm, premium, and organized instead of overwhelming."
  },
  {
    name: "Mina Hart",
    role: "City Renter",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    property: "Marina Point Residences",
    quote: "The clean filters and polished property cards made apartment hunting feel way more intentional. It looks premium and it works."
  },
  {
    name: "Theo Mercer",
    role: "Commercial Tenant",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=240&q=80",
    property: "Regent Corner Suites",
    quote: "For business leasing, clarity is everything. The pricing, layout, and photo treatment made the shortlist process much faster."
  },
  {
    name: "Elena Walsh",
    role: "Growing Family",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=240&q=80",
    property: "Willow Crest House",
    quote: "We loved that the homepage stayed curated, then opened into a full portfolio. It felt thoughtful, not crowded."
  },
  {
    name: "Marcus Flynn",
    role: "Second Home Buyer",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    property: "Opal Garden Estate",
    quote: "The visual language is elegant and expensive-looking, which made the high-end listings feel far more credible."
  },
  {
    name: "Priya Sen",
    role: "Apartment Buyer",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
    property: "Belmont Sky Residence",
    quote: "I wanted something modern and refined, and the site experience matched that. It feels boutique instead of generic."
  },
  {
    name: "Adrian Cole",
    role: "First-Time Renter",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
    property: "Juniper Row Apartment",
    quote: "The catalog looked professional right away, and the story page made the whole brand feel much more trustworthy."
  },
  {
    name: "Sara Kim",
    role: "Downsizing Seller",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80",
    property: "Oakline Family House",
    quote: "What stood out most was the sense of confidence. It feels like a real premium platform, not just a class project."
  },
  {
    name: "Vikram Shah",
    role: "Investor",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    property: "Guildford Commerce Hub",
    quote: "The full property page is clean, fast, and visually sharp. It made comparing portfolio opportunities feel much more efficient."
  },
  {
    name: "Isla Romero",
    role: "Villa Buyer",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    property: "Ivory Ridge Estate",
    quote: "The new branding and structure give the platform a luxury identity. It feels far more elevated than standard real estate marketplaces."
  },
  {
    name: "Daniel Hart",
    role: "Townhome Renter",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=80",
    property: "Maple Crown Townhome",
    quote: "The whole site now feels complete. Reviews, listings, and the browsing flow all support each other really well."
  },
  {
    name: "Helena Price",
    role: "Luxury Apartment Buyer",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1519996521430-12129b8c17d2?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    property: "Elm District Lofts",
    quote: "The two-step flow from featured homes to the complete portfolio was such a smart change. It feels curated first, complete second."
  },
  {
    name: "Owen Blake",
    role: "Family Buyer",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    property: "Harbor Stone House",
    quote: "I liked that the site looked polished without being hard to use. The inquiries and property details felt smooth all the way through."
  },
  {
    name: "Nina Alvarez",
    role: "Design-Focused Renter",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    property: "Luna Grove Flats",
    quote: "The interface feels styled and curated in a good way. It made the homes feel aspirational without hiding the important details."
  }
];

const state = {
  properties: [],
  filters: {
    search: "",
    listingType: "",
    category: "",
    bedrooms: "",
    maxPrice: "",
    featured: false
  },
  activeProperty: null
};

const elements = {
  listingGrid: document.querySelector("#listing-grid"),
  listingTemplate: document.querySelector("#listing-card-template"),
  searchForm: document.querySelector("#search-form"),
  keywordFilter: document.querySelector("#keyword-filter"),
  bedroomFilter: document.querySelector("#bedroom-filter"),
  priceFilter: document.querySelector("#price-filter"),
  featuredOnly: document.querySelector("#featured-only"),
  clearFilters: document.querySelector("#clear-filters"),
  resultsSummary: document.querySelector("#results-summary"),
  heroBrowseButton: document.querySelector("#hero-browse-button"),
  getStartedButton: document.querySelector("#get-started-button"),
  userLoginButton: document.querySelector("#user-login-button"),
  dialog: document.querySelector("#property-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close"),
  userLoginDialog: document.querySelector("#user-login-dialog"),
  userDialogClose: document.querySelector("#user-dialog-close"),
  userLoginForm: document.querySelector("#user-login-form"),
  userLoginFeedback: document.querySelector("#user-login-feedback"),
  statProperties: document.querySelector("#stat-properties"),
  statBuy: document.querySelector("#stat-buy"),
  statRent: document.querySelector("#stat-rent"),
  mobileNavToggle: document.querySelector("#mobile-nav-toggle"),
  navLinks: document.querySelector(".nav-links"),
  categoryFilter: document.querySelector("#category"),
  listingTypeFilter: document.querySelector("#listing-type-filter"),
  storiesPreviewGrid: document.querySelector("#stories-preview-grid"),
  storiesPageGrid: document.querySelector("#stories-page-grid"),
  storyTemplate: document.querySelector("#story-card-template")
};

initialize();

function initialize() {
  hydrateFiltersFromUrl();
  attachEvents();

  if (page === "stories") {
    renderStoriesPage();
    return;
  }

  if (page === "home") {
    renderStoriesPreview();
  }

  fetchProperties().catch(handleLoadError);
}

function hydrateFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.filters.search = params.get("search") || "";
  state.filters.listingType = params.get("listingType") || "";
  state.filters.category = params.get("category") || "";
}

function attachEvents() {
  if (elements.searchForm) {
    elements.searchForm.addEventListener("submit", handleHeroSearch);
  }

  if (elements.keywordFilter) {
    elements.keywordFilter.value = state.filters.search;
    elements.keywordFilter.addEventListener("input", event => {
      state.filters.search = event.target.value.trim();
      fetchProperties();
    });
  }

  if (elements.bedroomFilter) {
    elements.bedroomFilter.addEventListener("change", event => {
      state.filters.bedrooms = event.target.value;
      fetchProperties();
    });
  }

  if (elements.priceFilter) {
    elements.priceFilter.addEventListener("change", event => {
      state.filters.maxPrice = event.target.value;
      fetchProperties();
    });
  }

  if (elements.featuredOnly) {
    elements.featuredOnly.addEventListener("change", event => {
      state.filters.featured = event.target.checked;
      fetchProperties();
    });
  }

  if (elements.categoryFilter) {
    elements.categoryFilter.value = state.filters.category;
    elements.categoryFilter.addEventListener("change", event => {
      state.filters.category = event.target.value;
      fetchProperties();
    });
  }

  if (elements.listingTypeFilter) {
    elements.listingTypeFilter.value = state.filters.listingType;
    elements.listingTypeFilter.addEventListener("change", event => {
      state.filters.listingType = event.target.value;
      fetchProperties();
    });
  }

  if (elements.clearFilters) {
    elements.clearFilters.addEventListener("click", resetFilters);
  }

  if (elements.heroBrowseButton) {
    elements.heroBrowseButton.addEventListener("click", () => {
      document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
    });
  }

  if (elements.getStartedButton) {
    elements.getStartedButton.addEventListener("click", () => {
      document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
    });
  }

  if (elements.userLoginButton && elements.userLoginDialog) {
    elements.userLoginButton.addEventListener("click", () => {
      elements.userLoginDialog.showModal();
    });
  }

  if (elements.dialogClose && elements.dialog) {
    elements.dialogClose.addEventListener("click", () => elements.dialog.close());
  }

  if (elements.userDialogClose && elements.userLoginDialog) {
    elements.userDialogClose.addEventListener("click", () => elements.userLoginDialog.close());
  }

  if (elements.userLoginForm) {
    elements.userLoginForm.addEventListener("submit", handleUserLoginSubmit);
  }

  if (elements.mobileNavToggle && elements.navLinks) {
    elements.mobileNavToggle.addEventListener("click", () => {
      elements.navLinks.classList.toggle("is-open");
    });
  }

  if (elements.dialog) {
    elements.dialog.addEventListener("click", event => {
      const box = elements.dialog.getBoundingClientRect();
      const outside =
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom;

      if (outside) {
        elements.dialog.close();
      }
    });
  }

  if (elements.userLoginDialog) {
    elements.userLoginDialog.addEventListener("click", event => {
      const box = elements.userLoginDialog.getBoundingClientRect();
      const outside =
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom;

      if (outside) {
        elements.userLoginDialog.close();
      }
    });
  }
}

async function fetchProperties() {
  const params = new URLSearchParams();
  if (state.filters.search) params.set("search", state.filters.search);
  if (state.filters.listingType) params.set("listingType", state.filters.listingType);
  if (state.filters.category) params.set("category", state.filters.category);
  if (state.filters.bedrooms) params.set("bedrooms", state.filters.bedrooms);
  if (state.filters.maxPrice) params.set("maxPrice", state.filters.maxPrice);
  if (state.filters.featured) params.set("featured", "true");

  const response = await fetch(`/api/properties?${params.toString()}`);
  state.properties = await response.json();

  if (page === "catalog") {
    renderCatalogGrid();
  } else {
    renderHomePropertyGrid();
    renderHeroStats();
  }
}

function handleLoadError() {
  if (elements.resultsSummary) {
    elements.resultsSummary.textContent = "The app could not reach the backend server.";
  }

  if (elements.listingGrid) {
    elements.listingGrid.innerHTML = `
      <div class="empty-state">
        <h3>Backend not running</h3>
        <p>Start the app with <code>npm start</code> and open <code>http://localhost:3000</code>.</p>
      </div>
    `;
  }
}

function handleHeroSearch(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.filters.search = String(formData.get("search") || "").trim();
  state.filters.listingType = String(formData.get("listingType") || "");
  state.filters.category = String(formData.get("category") || "");

  const params = new URLSearchParams();
  if (state.filters.search) params.set("search", state.filters.search);
  if (state.filters.listingType) params.set("listingType", state.filters.listingType);
  if (state.filters.category) params.set("category", state.filters.category);

  window.location.href = `/properties.html?${params.toString()}`;
}

function resetFilters() {
  state.filters = {
    search: "",
    listingType: "",
    category: "",
    bedrooms: "",
    maxPrice: "",
    featured: false
  };

  if (elements.searchForm) elements.searchForm.reset();
  if (elements.keywordFilter) elements.keywordFilter.value = "";
  if (elements.bedroomFilter) elements.bedroomFilter.value = "";
  if (elements.priceFilter) elements.priceFilter.value = "";
  if (elements.featuredOnly) elements.featuredOnly.checked = false;
  if (elements.categoryFilter) elements.categoryFilter.value = "";
  if (elements.listingTypeFilter) elements.listingTypeFilter.value = "";

  fetchProperties();
}

function handleUserLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const userProfile = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    interest: String(formData.get("interest") || "").trim()
  };

  localStorage.setItem("nestora-user-profile", JSON.stringify(userProfile));
  elements.userLoginFeedback.textContent = `Welcome, ${userProfile.fullName}. Returning you to the homepage.`;

  window.setTimeout(() => {
    elements.userLoginDialog.close();
    event.currentTarget.reset();
    elements.userLoginFeedback.textContent = "";
    document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
  }, 700);
}

function renderHomePropertyGrid() {
  renderPropertyGrid(state.properties.slice(0, 8), `Showing ${Math.min(8, state.properties.length)} of ${state.properties.length} curated properties`);
}

function renderCatalogGrid() {
  renderPropertyGrid(state.properties, `Showing ${state.properties.length} available properties`);
}

function renderPropertyGrid(properties, summaryText) {
  if (!elements.listingGrid || !elements.listingTemplate) {
    return;
  }

  elements.listingGrid.innerHTML = "";

  if (elements.resultsSummary) {
    elements.resultsSummary.textContent = summaryText;
  }

  if (!properties.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<h3>No matching properties</h3><p>Try adjusting the filters to explore more of the collection.</p>";
    elements.listingGrid.append(empty);
    return;
  }

  for (const property of properties) {
    const card = elements.listingTemplate.content.firstElementChild.cloneNode(true);
    const listingImage = card.querySelector(".listing-image");
    listingImage.src = property.imageUrl;
    listingImage.alt = property.title;
    applyImageFallback(listingImage, DEFAULT_PROPERTY_IMAGE);
    card.querySelector(".listing-price").textContent = formatPrice(property.price, property.listingType);
    card.querySelector(".listing-type").textContent = property.listingType === "sale" ? "For sale" : "For rent";
    card.querySelector(".listing-title").textContent = property.title;
    card.querySelector(".listing-summary").textContent = compactAddress(property.location);
    card.querySelector(".listing-agent").textContent = property.agentName;
    card.querySelector(".listing-location").textContent = truncateText(property.summary, 72);
    card.querySelector(".card-badge").textContent = property.featured ? "Featured" : property.category;

    const meta = card.querySelector(".listing-meta");
    [`${property.bedrooms} Bed`, `${property.bathrooms} Bath`, `${property.areaSqft} sqft`].forEach(text => {
      const tag = document.createElement("span");
      tag.textContent = text;
      meta.append(tag);
    });

    card.addEventListener("click", () => openPropertyDialog(property));
    elements.listingGrid.append(card);
  }
}

function renderHeroStats() {
  if (!elements.statProperties) return;

  elements.statProperties.textContent = state.properties.length;
  elements.statBuy.textContent = state.properties.filter(property => property.listingType === "sale").length;
  elements.statRent.textContent = state.properties.filter(property => property.listingType === "rent").length;
}

function openPropertyDialog(property) {
  if (!elements.dialog || !elements.dialogContent) {
    return;
  }

  state.activeProperty = property;
  const gallery = property.gallery.length ? property.gallery : [property.imageUrl];

  elements.dialogContent.innerHTML = `
    <div class="dialog-layout">
      <div class="dialog-gallery">
        <img class="dialog-gallery-main" src="${property.imageUrl}" alt="${property.title}">
        <div class="dialog-gallery-strip">
          ${gallery.slice(0, 3).map(image => `<img src="${image}" alt="${property.title} gallery view">`).join("")}
        </div>
      </div>
      <div class="dialog-copy">
        <p class="section-tag">${property.category} | ${property.listingType === "sale" ? "For Sale" : "For Rent"}</p>
        <h3>${property.title}</h3>
        <p>${property.location}</p>
        <strong class="listing-price">${formatPrice(property.price, property.listingType)}</strong>
        <div class="dialog-meta">
          <span>${property.bedrooms} bedrooms</span>
          <span>${property.bathrooms} bathrooms</span>
          <span>${property.areaSqft} sq ft</span>
        </div>
        <p>${property.description}</p>
        <div class="dialog-amenities">
          ${property.amenities.map(item => `<span>${item}</span>`).join("")}
        </div>
        <form class="inquiry-form" id="inquiry-form">
          <input name="name" type="text" placeholder="Your name" required>
          <input name="email" type="email" placeholder="Your email" required>
          <input name="phone" type="text" placeholder="Phone number">
          <select name="intent" required>
            <option value="">Choose action</option>
            <option value="buy">I want to buy</option>
            <option value="rent">I want to rent</option>
            <option value="tour">Schedule a tour</option>
          </select>
          <input name="budget" type="text" placeholder="Budget">
          <textarea name="message" rows="4" placeholder="Message for ${property.agentName}"></textarea>
          <button class="primary-btn" type="submit">Send inquiry</button>
          <p class="feedback-text" id="inquiry-feedback" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;

  applyFallbackToAll(elements.dialogContent.querySelectorAll(".dialog-gallery-main, .dialog-gallery-strip img"), DEFAULT_PROPERTY_IMAGE);
  elements.dialogContent.querySelector("#inquiry-form").addEventListener("submit", submitInquiry);
  elements.dialog.showModal();
}

async function submitInquiry(event) {
  event.preventDefault();
  const feedback = elements.dialogContent.querySelector("#inquiry-feedback");
  const formData = new FormData(event.currentTarget);
  const payload = {
    propertyId: state.activeProperty.id,
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    intent: String(formData.get("intent") || "").trim(),
    budget: String(formData.get("budget") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };

  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    feedback.textContent = "Unable to send inquiry right now.";
    return;
  }

  feedback.textContent = `Inquiry sent successfully to ${state.activeProperty.agentName}.`;
  event.currentTarget.reset();
}

function renderStoriesPreview() {
  if (!elements.storiesPreviewGrid || !elements.storyTemplate) {
    return;
  }

  elements.storiesPreviewGrid.innerHTML = "";
  reviewStories.slice(0, 6).forEach(story => {
    const card = elements.storyTemplate.content.firstElementChild.cloneNode(true);
    const storyImage = card.querySelector(".story-image");
    storyImage.src = story.image;
    storyImage.alt = story.name;
    applyImageFallback(storyImage, DEFAULT_STORY_IMAGE);
    card.querySelector(".story-name").textContent = story.name;
    card.querySelector(".story-excerpt").textContent = truncateText(story.quote, 82);
    card.querySelector(".stars").textContent = renderStars(story.rating);
    card.querySelector(".story-rating").textContent = story.rating.toFixed(1);
    elements.storiesPreviewGrid.append(card);
  });
}

function renderStoriesPage() {
  if (!elements.storiesPageGrid || !elements.storyTemplate) {
    return;
  }

  elements.storiesPageGrid.innerHTML = "";
  reviewStories.forEach(story => {
    const card = elements.storyTemplate.content.firstElementChild.cloneNode(true);
    const storyImage = card.querySelector(".story-image");
    const storyAvatar = card.querySelector(".story-avatar");
    storyImage.src = story.image;
    storyImage.alt = story.name;
    storyAvatar.src = story.avatar;
    storyAvatar.alt = `${story.name} portrait`;
    applyImageFallback(storyImage, DEFAULT_STORY_IMAGE);
    applyImageFallback(storyAvatar, DEFAULT_AVATAR_IMAGE);
    card.querySelector(".story-name").textContent = story.name;
    card.querySelector(".story-role").textContent = story.role;
    card.querySelector(".story-rating-badge").textContent = `${story.rating.toFixed(1)} / 5`;
    card.querySelector(".stars").textContent = renderStars(story.rating);
    card.querySelector(".story-rating").textContent = `${story.rating.toFixed(1)} rating`;
    card.querySelector(".story-quote").textContent = story.quote;
    card.querySelector(".story-property").textContent = `Property: ${story.property}`;
    elements.storiesPageGrid.append(card);
  });
}

function formatPrice(price, listingType) {
  const amount = Number(price).toLocaleString();
  return listingType === "rent" ? `$${amount} / month` : `$${amount}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

function compactAddress(location) {
  const pieces = location.split(",").map(item => item.trim());
  return pieces.slice(0, 2).join(", ");
}

function buildStars(rating) {
  const rounded = Math.round(rating);
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}
