/**
 * Orders Page Script
 */

async function loadOrders() {
    const container = document.getElementById("orders-list");

    if (!container) return;

    container.innerHTML =
        '<div class="loading-container"><div class="spinner"></div><p>Memuat pesanan...</p></div>';

    try {
        const result = await api.get("orders");

        if (result.success) {
            if (!result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <p style="font-size: 1.2rem; color: #666; margin-bottom: 1rem;">Belum ada pesanan</p>
                        <a href="menu.html" class="btn btn-primary">Mulai Belanja</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = result.data
                .map(
                    (order) => `
                <div class="cart-item" style="cursor: pointer;" onclick="viewOrder(${order.order_id})">
                    <div class="cart-item-info" style="flex: 1;">
                        <h3>Order #${order.order_number}</h3>
                        <p>Tanggal: ${new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                        <p>Total: ${formatCurrency(order.total_amount || order.total)}</p>
                        <p>Pembayaran: ${(order.payment_method || "cod").toUpperCase()}</p>
                    </div>
                    <div>
                        <span class="badge badge-${order.status || order.order_status}">${order.status || order.order_status}</span>
                    </div>
                </div>
            `
                )
                .join("");
        } else {
            container.innerHTML =
                '<p style="text-align: center; padding: 2rem;">Gagal memuat pesanan</p>';
        }
    } catch (error) {
        console.error("Error loading orders:", error);
        container.innerHTML =
            '<p style="text-align: center; padding: 2rem;">Gagal memuat pesanan</p>';
    }
}

function viewOrder(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});
