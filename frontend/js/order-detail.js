/**
 * Order Detail Page Script
 */

async function loadOrderDetail() {
    const container = document.getElementById("order-detail");

    if (!container) return;

    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("id");

    if (!orderId) {
        container.innerHTML =
            '<p style="text-align: center; padding: 2rem; color: #f44336;">Order ID tidak ditemukan</p>';
        return;
    }

    try {
        const result = await api.get(`orders?id=${orderId}`);

        if (result.success && result.data) {
            const order = result.data.order || result.data;
            const items = result.data.items || order.items || [];

            // Calculate amounts
            const subtotal = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const taxRate = CONFIG?.TAX_RATE || 0.1;
            const tax = subtotal * taxRate;
            const shipping = 10000;
            const total = order.total_amount || order.total || subtotal + tax + shipping;

            // Payment info section
            let paymentInfoHTML = "";
            const paymentMethod = order.payment_method || "cod";

            if (paymentMethod === "ewallet" || paymentMethod === "transfer") {
                paymentInfoHTML = `
                    <div class="order-info-card payment-info">
                        <h2>💳 Informasi Pembayaran</h2>
                        <div class="payment-details">
                            ${
                                paymentMethod === "ewallet"
                                    ? `
                                <div class="info-row">
                                    <span>Metode:</span>
                                    <strong>E-Wallet (GoPay/OVO/Dana)</strong>
                                </div>
                                <div class="info-row">
                                    <span>Nomor Tujuan:</span>
                                    <strong style="font-size: 1.125rem; color: var(--primary-color);">0812-3456-7890</strong>
                                </div>
                            `
                                    : `
                                <div class="info-row">
                                    <span>Metode:</span>
                                    <strong>Transfer Bank</strong>
                                </div>
                                <div class="info-row">
                                    <span>Bank:</span>
                                    <strong>BCA</strong>
                                </div>
                                <div class="info-row">
                                    <span>No. Rekening:</span>
                                    <strong style="font-size: 1.125rem; color: var(--primary-color);">1234567890</strong>
                                </div>
                            `
                            }
                            <div class="info-row">
                                <span>Total Pembayaran:</span>
                                <strong style="font-size: 1.375rem; color: var(--primary-color);">${formatCurrency(total)}</strong>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                paymentInfoHTML = `
                    <div class="order-info-card payment-info">
                        <h2>💵 Informasi Pembayaran</h2>
                        <div class="payment-details">
                            <div class="info-row">
                                <span>Metode:</span>
                                <strong>COD (Cash on Delivery)</strong>
                            </div>
                            <div class="info-row">
                                <span>Total Pembayaran:</span>
                                <strong style="font-size: 1.375rem; color: var(--primary-color);">${formatCurrency(total)}</strong>
                            </div>
                        </div>
                        <div class="payment-note">
                            <p><strong>ℹ️ Informasi:</strong> Bayar saat pesanan tiba</p>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="order-info-card">
                    <h2>📋 Informasi Pesanan</h2>
                    <div class="info-row">
                        <span>No. Pesanan:</span>
                        <strong style="color: var(--primary-color);">${order.order_number}</strong>
                    </div>
                    <div class="info-row">
                        <span>Tanggal Pemesanan:</span>
                        <span>${new Date(order.created_at).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}</span>
                    </div>
                    <div class="info-row">
                        <span>Status Pesanan:</span>
                        <span class="badge badge-${order.status || order.order_status}">${getStatusText(order.status || order.order_status)}</span>
                    </div>
                </div>
                
                ${paymentInfoHTML}
                
                <div class="order-info-card">
                    <h2>📍 Informasi Pengiriman</h2>
                    <div class="info-row">
                        <span>Nama Penerima:</span>
                        <strong>${order.full_name}</strong>
                    </div>
                    <div class="info-row">
                        <span>Email:</span>
                        <span>${order.email}</span>
                    </div>
                    <div class="info-row">
                        <span>No. Telepon:</span>
                        <strong style="color: var(--primary-color);">${order.phone}</strong>
                    </div>
                    <div class="info-row">
                        <span>Alamat Lengkap:</span>
                        <span style="line-height: 1.6;">${order.shipping_address}</span>
                    </div>
                    ${
                        order.notes
                            ? `
                    <div class="info-row">
                        <span>Catatan:</span>
                        <span style="font-style: italic;">"${order.notes}"</span>
                    </div>
                    `
                            : ""
                    }
                </div>
                
                <div class="order-info-card">
                    <h2>🛍️ Detail Pesanan</h2>
                    <div class="order-items-list">
                        ${
                            items.length > 0
                                ? items
                                      .map(
                                          (item, index) => `
                            <div class="order-item-row">
                                <div class="item-info">
                                    <span class="item-number">${index + 1}.</span>
                                    <div>
                                        <strong>${item.product_name}</strong>
                                        <br>
                                        <small style="color: var(--text-gray);">${item.quantity} × ${formatCurrency(item.price)}</small>
                                    </div>
                                </div>
                                <div class="item-total">
                                    <strong>${formatCurrency(item.quantity * item.price)}</strong>
                                </div>
                            </div>
                        `
                                      )
                                      .join("")
                                : '<p style="text-align: center;">Detail item tidak tersedia</p>'
                        }
                    </div>
                    
                    <div class="order-summary-total">
                        <div class="info-row">
                            <span>Subtotal Produk:</span>
                            <span>${formatCurrency(subtotal)}</span>
                        </div>
                        <div class="info-row">
                            <span>Pajak (${Math.round(taxRate * 100)}%):</span>
                            <span>${formatCurrency(tax)}</span>
                        </div>
                        <div class="info-row">
                            <span>Biaya Pengiriman:</span>
                            <span>${formatCurrency(shipping)}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="info-row total">
                            <span><strong>Total Pembayaran:</strong></span>
                            <strong style="font-size: 1.5rem;">${formatCurrency(total)}</strong>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML =
                '<p style="text-align: center; padding: 2rem; color: #f44336;">Pesanan tidak ditemukan</p>';
        }
    } catch (error) {
        console.error("Error loading order:", error);
        container.innerHTML =
            '<p style="text-align: center; padding: 2rem; color: #f44336;">Terjadi kesalahan saat memuat pesanan</p>';
    }
}

function getStatusText(status) {
    const statusMap = {
        pending: "Menunggu Konfirmasi",
        processing: "Diproses",
        shipped: "Dikirim",
        delivered: "Selesai",
        cancelled: "Dibatalkan",
    };
    return statusMap[status] || status;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadOrderDetail();
});
