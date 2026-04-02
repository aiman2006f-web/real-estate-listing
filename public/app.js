const state = {
  properties: [],
  adminProperties: [],
  inquiries: [],
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
  navLinks: document.querySelector(".nav-links")
};

initialize();

function initialize() {
  attachEvents();
  fetchProperties().catch(handleLoadError);
}

function attachEvents() {
  elements.searchForm.addEventListener("submit", handleHeroSearch);
  elements.keywordFilter.addEventListener("input", event => {
    state.filters.search = event.target.value.trim();
    fetchProperties();
  });
  elements.bedroomFilter.addEventListener("change", event => {
    state.filters.bedrooms = event.target.value;
    fetchProperties();
  });
  elements.priceFilter.addEventListener("change", event => {
    state.filters.maxPrice = event.target.value;
    fetchProperties();
  });
  elements.featuredOnly.addEventListener("change", event => {
    state.filters.featured = event.target.checked;
    fetchProperties();
  });
  elements.clearFilters.addEventListener("click", resetFilters);
  elements.heroBrowseButton.addEventListener("click", () => {
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
  });
  elements.getStartedButton.addEventListener("click", () => {
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
  });
  elements.userLoginButton.addEventListener("click", () => {
    elements.userLoginDialog.showModal();
  });
  elements.dialogClose.addEventListener("click", () => elements.dialog.close());
  elements.userDialogClose.addEventListener("click", () => elements.userLoginDialog.close());
  elements.userLoginForm.addEventListener("submit", handleUserLoginSubmit);
  elements.mobileNavToggle.addEventListener("click", () => {
    elements.navLinks.classList.toggle("is-open");
  });
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
  renderPropertyGrid();
  renderHeroStats();
}

function handleLoadError() {
  elements.resultsSummary.textContent = "The app could not reach the backend server.";
  elements.listingGrid.innerHTML = `
    <div class="empty-state">
      <h3>Backend not running</h3>
      <p>Start the app with <code>npm start</code> and open <code>http://localhost:3000</code>.</p>
    </div>
  `;
}

function handleHeroSearch(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.filters.search = String(formData.get("search") || "").trim();
  state.filters.listingType = String(formData.get("listingType") || "");
  state.filters.category = String(formData.get("category") || "");
  fetchProperties();
  document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
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
  elements.searchForm.reset();
  elements.keywordFilter.value = "";
  elements.bedroomFilter.value = "";
  elements.priceFilter.value = "";
  elements.featuredOnly.checked = false;
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

  localStorage.setItem("wealthhome-user-profile", JSON.stringify(userProfile));
  elements.userLoginFeedback.textContent = `Welcome, ${userProfile.fullName}. Returning you to the homepage.`;

  window.setTimeout(() => {
    elements.userLoginDialog.close();
    event.currentTarget.reset();
    elements.userLoginFeedback.textContent = "";
    document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
  }, 700);
}

function renderPropertyGrid() {
  const homepageProperties = state.properties.slice(0, 8);
  elements.listingGrid.innerHTML = "";
  elements.resultsSummary.textContent = `Showing ${homepageProperties.length} of ${state.properties.length} homes`;

  if (!homepageProperties.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<h3>No matching properties</h3><p>Try adjusting the filters or add a new property from Admin Studio.</p>";
    elements.listingGrid.append(empty);
    return;
  }

  for (const property of homepageProperties) {
    const card = elements.listingTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".listing-image").src = property.imageUrl;
    card.querySelector(".listing-image").alt = property.title;
    card.querySelector(".listing-price").textContent = formatCompactPrice(property.price, property.listingType);
    card.querySelector(".listing-type").textContent = property.listingType === "sale" ? "For sale" : "For rent";
    card.querySelector(".listing-title").textContent = property.title;
    card.querySelector(".listing-summary").textContent = compactAddress(property.location);
    card.querySelector(".listing-agent").textContent = property.agentName;
    card.querySelector(".listing-location").textContent = truncateText(property.summary, 46);

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
  elements.statProperties.textContent = state.properties.length;
  elements.statBuy.textContent = state.properties.filter(property => property.listingType === "sale").length;
  elements.statRent.textContent = state.properties.filter(property => property.listingType === "rent").length;
}

function openPropertyDialog(property) {
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

function formatPrice(price, listingType) {
  return listingType === "rent" ? `$${Number(price).toLocaleString()}` : `$${Number(price).toLocaleString()}`;
}

function formatCompactPrice(price, listingType) {
  if (listingType === "rent") {
    return `$${Number(price).toLocaleString()}`;
  }

  const shortened = Number(price) / 1000;
  return `$${shortened.toFixed(2)}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function compactAddress(location) {
  const pieces = location.split(",").map(item => item.trim());
  return pieces.slice(0, 2).join(", ");
}
