const loginForm = document.querySelector("#admin-login-form");
const loginFeedback = document.querySelector("#login-feedback");

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    username: String(formData.get("username") || "").trim(),
    password: String(formData.get("password") || "")
  };

  const response = await fetch("/studio/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    loginFeedback.textContent = "Invalid username or password.";
    return;
  }

  window.location.href = "/studio";
});
