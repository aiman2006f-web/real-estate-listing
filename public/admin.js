const adminState = {
  adminProperties: [],
  inquiries: []
};

const adminElements = {
  adminMetrics: document.querySelector("#admin-metrics"),
  adminForm: document.querySelector("#admin-form"),
  adminFeedback: document.querySelector("#admin-feedback"),
  resetAdminForm: document.querySelector("#reset-admin-form"),
  refreshAdmin: document.querySelector("#refresh-admin"),
  logoutAdmin: document.querySelector("#logout-admin"),
  inquiryTableBody: document.querySelector("#inquiry-table-body"),
  adminPropertyTable: document.querySelector("#admin-property-table")
};

initializeAdmin();

function initializeAdmin() {
  adminElements.adminForm.addEventListener("submit", submitAdminForm);
  adminElements.resetAdminForm.addEventListener("click", resetAdminForm);
  adminElements.refreshAdmin.addEventListener("click", loadAdminData);
  adminElements.logoutAdmin.addEventListener("click", logoutAdmin);
  loadAdminData().catch(handleAdminError);
}

async function loadAdminData() {
  const [summaryResponse, propertiesResponse, inquiriesResponse] = await Promise.all([
    fetch("/api/admin/summary"),
    fetch("/api/admin/properties"),
    fetch("/api/admin/inquiries")
  ]);

  if ([summaryResponse, propertiesResponse, inquiriesResponse].some(response => response.status === 401)) {
    window.location.href = "/studio/login";
    return;
  }

  const summary = await summaryResponse.json();
  adminState.adminProperties = await propertiesResponse.json();
  adminState.inquiries = await inquiriesResponse.json();

  renderAdminMetrics(summary);
  renderInquiryTable();
  renderAdminPropertyTable();
}

function handleAdminError() {
  adminElements.adminFeedback.textContent = "Unable to load admin data.";
}

function renderAdminMetrics(summary) {
  adminElements.adminMetrics.innerHTML = "";
  const metrics = [
    ["Stored listings", summary.totalProperties],
    ["Homes for sale", summary.totalSales],
    ["Rental listings", summary.totalRentals],
    ["Featured homes", summary.featuredCount],
    ["Total inquiries", summary.totalInquiries]
  ];

  for (const [label, value] of metrics) {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    adminElements.adminMetrics.append(card);
  }
}

function renderInquiryTable() {
  adminElements.inquiryTableBody.innerHTML = "";

  if (!adminState.inquiries.length) {
    adminElements.inquiryTableBody.innerHTML = '<tr><td colspan="4">No inquiries yet.</td></tr>';
    return;
  }

  adminState.inquiries.slice(0, 10).forEach(inquiry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(inquiry.name)}<br><small>${escapeHtml(inquiry.email)}</small></td>
      <td>${escapeHtml(inquiry.property_title)}</td>
      <td><span class="table-chip">${escapeHtml(inquiry.intent)}</span></td>
      <td>${escapeHtml(inquiry.budget || "-")}</td>
    `;
    adminElements.inquiryTableBody.append(row);
  });
}

function renderAdminPropertyTable() {
  adminElements.adminPropertyTable.innerHTML = "";

  adminState.adminProperties.forEach(property => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(property.title)}</td>
      <td>${escapeHtml(property.location)}</td>
      <td>${escapeHtml(property.category)}</td>
      <td>${property.listingType === "sale" ? "Buy" : "Rent"}</td>
      <td><span class="table-chip">${escapeHtml(property.status)}</span></td>
      <td>
        <div class="table-action-group">
          <button class="text-btn" type="button" data-action="edit">Edit</button>
          <button class="text-btn" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => populateAdminForm(property));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProperty(property.id));
    adminElements.adminPropertyTable.append(row);
  });
}

function populateAdminForm(property) {
  const form = adminElements.adminForm;
  form.elements.id.value = property.id;
  form.elements.title.value = property.title;
  form.elements.location.value = property.location;
  form.elements.category.value = property.category;
  form.elements.listingType.value = property.listingType;
  form.elements.price.value = property.price;
  form.elements.bedrooms.value = property.bedrooms;
  form.elements.bathrooms.value = property.bathrooms;
  form.elements.areaSqft.value = property.areaSqft;
  form.elements.imageUrl.value = property.imageUrl;
  form.elements.agentName.value = property.agentName;
  form.elements.agentEmail.value = property.agentEmail;
  form.elements.amenities.value = property.amenities.join(", ");
  form.elements.gallery.value = property.gallery.join(", ");
  form.elements.summary.value = property.summary;
  form.elements.description.value = property.description;
  form.elements.status.value = property.status;
  form.elements.featured.checked = property.featured;
  adminElements.adminFeedback.textContent = `Editing ${property.title}`;
}

async function submitAdminForm(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    category: String(formData.get("category") || ""),
    listingType: String(formData.get("listingType") || ""),
    price: Number(formData.get("price") || 0),
    bedrooms: Number(formData.get("bedrooms") || 0),
    bathrooms: Number(formData.get("bathrooms") || 0),
    areaSqft: Number(formData.get("areaSqft") || 0),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
    agentName: String(formData.get("agentName") || "").trim(),
    agentEmail: String(formData.get("agentEmail") || "").trim(),
    amenities: String(formData.get("amenities") || "").trim(),
    gallery: String(formData.get("gallery") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    status: String(formData.get("status") || "available"),
    featured: formData.get("featured") === "on"
  };

  const endpoint = id ? `/api/properties/${id}` : "/api/properties";
  const method = id ? "PUT" : "POST";
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (response.status === 401) {
    window.location.href = "/studio/login";
    return;
  }

  if (!response.ok) {
    adminElements.adminFeedback.textContent = "Unable to save property.";
    return;
  }

  adminElements.adminFeedback.textContent = id ? "Property updated successfully." : "Property added successfully.";
  resetAdminForm();
  await loadAdminData();
}

async function deleteProperty(id) {
  const confirmed = window.confirm("Delete this property from the database?");
  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/properties/${id}`, { method: "DELETE" });
  if (response.status === 401) {
    window.location.href = "/studio/login";
    return;
  }
  if (!response.ok) {
    adminElements.adminFeedback.textContent = "Unable to delete property.";
    return;
  }

  adminElements.adminFeedback.textContent = "Property deleted.";
  await loadAdminData();
}

async function logoutAdmin() {
  await fetch("/studio/logout", { method: "POST" });
  window.location.href = "/studio/login";
}

function resetAdminForm() {
  adminElements.adminForm.reset();
  adminElements.adminForm.elements.id.value = "";
  adminElements.adminFeedback.textContent = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
