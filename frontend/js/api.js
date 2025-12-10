/**
 * Siap Santap - API Module
 * Handles all API requests with demo mode fallback
 */

const api = {
    /**
     * Convert old PHP endpoints to new JS endpoints
     */
    normalizeEndpoint(endpoint) {
        // Remove .php extension and convert to new format
        return endpoint
            .replace('.php', '')
            .replace('products', 'products')
            .replace('categories', 'categories')
            .replace('orders', 'orders')
            .replace('auth', 'auth');
    },

    async request(endpoint, options = {}) {
        try {
            // Normalize endpoint (remove .php)
            const normalizedEndpoint = this.normalizeEndpoint(endpoint);
            const url = `${CONFIG.API_BASE}/${normalizedEndpoint}`;

            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn("API Error:", error.message);

            // Fallback to demo mode if enabled
            if (CONFIG.ENABLE_DEMO_MODE) {
                CONFIG.isDemo = true;
                return this.getDemoData(endpoint, options);
            }

            return { success: false, message: "Network error: " + error.message };
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    },

    /**
     * Returns demo data based on endpoint
     */
    getDemoData(endpoint, options = {}) {
        const endpointLower = endpoint.toLowerCase();

        // Show demo notification once
        if (CONFIG.DEMO_NOTIFICATION && !this._demoNotified) {
            this._demoNotified = true;
            setTimeout(() => {
                if (typeof showNotification === "function") {
                    showNotification("Mode Demo: Menampilkan data sample", "info");
                }
            }, 500);
        }

        // Products endpoint
        if (endpointLower.includes("products")) {
            const urlParams = new URLSearchParams(endpoint.split("?")[1] || "");
            const categoryId = urlParams.get("category");
            const productId = urlParams.get("id");

            if (productId) {
                const product = DEMO_DATA.getProduct(productId);
                return { success: true, data: product };
            }

            const products = DEMO_DATA.getProductsByCategory(categoryId);
            return { success: true, data: products };
        }

        // Categories endpoint
        if (endpointLower.includes("categories")) {
            return { success: true, data: DEMO_DATA.categories };
        }

        // Auth endpoint
        if (endpointLower.includes("auth")) {
            if (endpointLower.includes("check")) {
                return { logged_in: false };
            }
            return { success: true, message: "Demo mode - auth simulated" };
        }

        // Orders endpoint (demo - use localStorage)
        if (endpointLower.includes("orders")) {
            const demoOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");

            // Handle POST (create order)
            if (options.method === "POST") {
                const orderData = JSON.parse(options.body || "{}");
                const newOrder = {
                    order_id: Date.now(),
                    order_number: `ORD-${Date.now()}`,
                    ...orderData,
                    status: "pending",
                    created_at: new Date().toISOString(),
                };
                demoOrders.push(newOrder);
                localStorage.setItem("demo_orders", JSON.stringify(demoOrders));
                return {
                    success: true,
                    message: "Order created",
                    order_id: newOrder.order_id,
                    order_number: newOrder.order_number,
                };
            }

            return { success: true, data: demoOrders };
        }

        // Default response
        return { success: true, data: [], message: "Demo mode active" };
    },
};
