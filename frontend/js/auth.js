/**
 * Authentication Scripts
 */

// Login Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);

        const result = await api.post("auth?action=login", data);

        if (result.success) {
            // Store token if provided
            if (result.token) {
                localStorage.setItem("auth_token", result.token);
            }
            if (result.user) {
                localStorage.setItem("user", JSON.stringify(result.user));
            }

            showNotification("Login berhasil!");
            setTimeout(() => {
                // Redirect based on role
                if (result.user?.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "menu.html";
                }
            }, 1000);
        } else {
            showNotification(result.message || "Login gagal", "error");
        }
    });
}

// Register Form
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);

        if (data.password !== data.confirm_password) {
            showNotification("Password tidak cocok!", "error");
            return;
        }

        delete data.confirm_password;

        const result = await api.post("auth?action=register", data);

        if (result.success) {
            showNotification("Registrasi berhasil! Silakan login.");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            showNotification(result.message || "Registrasi gagal", "error");
        }
    });
}
