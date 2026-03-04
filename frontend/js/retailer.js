const API_URL = window.location.origin + "/api";

const retailerId = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

/* ================= LOGIN CHECK ================= */

if (!retailerId || !token) {
    window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", () => {

    const nameEl = document.getElementById("retailer-name");
    if (nameEl) nameEl.textContent = userName || "Retailer";

    showSection("browse-crops");

});


/* ================= SECTION CONTROL ================= */

function showSection(section) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });

    const selected = document.getElementById(section);
    if (selected) selected.style.display = "block";

    if (section === "browse-crops") loadAvailableCrops();
    if (section === "my-bookings") loadMyBookings();

}


/* ================= LOAD CROPS ================= */

async function loadAvailableCrops(searchTerm = "") {

    try {

        showLoading(true);

        const response = await fetch(`${API_URL}/farmer/all-crops`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const container = document.getElementById("crops-list");

        if (!data.success || data.crops.length === 0) {

            container.innerHTML = "<p class='loading'>No crops available</p>";
            return;

        }

        const filtered = data.crops.filter(crop => {

            if (!crop.cropName) return false;

            return crop.cropName
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        });

        if (filtered.length === 0) {

            container.innerHTML = "<p class='loading'>No crops found</p>";
            return;

        }

        const html = filtered.map(crop => {

            const image =
                crop.images && crop.images.length > 0
                    ? crop.images[0]
                    : "/uploads/default.jpg";

            return `
            <div class="crop-card">

                <img src="${image}">

                <div class="crop-card-content">

                    <h3>${crop.cropName}</h3>

                    <p><strong>👨‍🌾 Farmer:</strong> ${crop.farmerId?.name || "Unknown"}</p>

                    <p><strong>Price:</strong> ₹${crop.price}/${crop.unit}</p>

                    <p><strong>Available:</strong> ${crop.quantity} ${crop.unit}</p>

                    <p><strong>Location:</strong> ${crop.farmerId?.location || "N/A"}</p>

                    <p><strong>Contact:</strong>
                        <a href="tel:${crop.farmerId?.phone}">
                            ${crop.farmerId?.phone || "N/A"}
                        </a>
                    </p>

                    <input
                        type="number"
                        id="qty-${crop._id}"
                        placeholder="Quantity to book"
                        min="1"
                        max="${crop.quantity}"
                        class="quantity-input"
                    >

                    <button
                        onclick="bookCrop('${crop._id}','${crop.farmerId?._id}')"
                        class="btn-book"
                    >
                        Book Crop
                    </button>

                </div>

            </div>
            `;

        }).join("");

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        document.getElementById("crops-list").innerHTML =
            "<p class='loading'>Error loading crops</p>";

    } finally {

        showLoading(false);

    }

}


/* ================= SEARCH CROPS ================= */

function searchCrops() {

    const value = document.getElementById("search-crops").value.trim();

    loadAvailableCrops(value);

}


/* ================= BOOK CROP ================= */

async function bookCrop(cropId, farmerId) {

    const qtyInput = document.getElementById(`qty-${cropId}`);

    const quantity = parseInt(qtyInput.value);

    if (!quantity || quantity <= 0) {

        showAlert("Enter valid quantity", "error");
        return;

    }

    try {

        showLoading(true);

        const response = await fetch(`${API_URL}/retailer/book-crop`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                cropId,
                farmerId,
                retailerId,
                quantity
            })
        });

        const data = await response.json();

        if (data.success) {

            showAlert("Booking request sent to farmer", "success");

            qtyInput.value = "";

            loadAvailableCrops();

        } else {

            showAlert(data.message || "Booking failed", "error");

        }

    } catch (error) {

        console.error(error);

        showAlert("Server error while booking crop", "error");

    } finally {

        showLoading(false);

    }

}


/* ================= LOAD BOOKINGS ================= */

async function loadMyBookings() {

    try {

        showLoading(true);

        const response = await fetch(`${API_URL}/retailer/my-bookings/${retailerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const container = document.getElementById("bookings-list");

        if (!data.success || data.bookings.length === 0) {

            container.innerHTML = "<p class='loading'>No bookings yet</p>";
            return;

        }

        const html = data.bookings.map(b => `
            <div class="booking-card">

                <h3>${b.cropId.cropName}</h3>

                <p><strong>Farmer:</strong> ${b.farmerId.name}</p>

                <p><strong>Quantity:</strong> ${b.quantity} ${b.cropId.unit}</p>

                <p><strong>Total:</strong> ₹${b.totalPrice}</p>

                <p><strong>Status:</strong> ${b.status}</p>

            </div>
        `).join("");

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        document.getElementById("bookings-list").innerHTML =
            "<p class='loading'>Error loading bookings</p>";

    } finally {

        showLoading(false);

    }

}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.clear();

    window.location.href = "/index.html";

}


/* ================= ALERT ================= */

function showAlert(message, type = "info") {

    const existing = document.querySelector(".alert-box");

    if (existing) existing.remove();

    const alert = document.createElement("div");

    alert.className = "alert-box";

    alert.textContent = message;

    alert.style.cssText = `
        position:fixed;
        top:20px;
        right:20px;
        padding:15px 20px;
        border-radius:8px;
        font-weight:600;
        z-index:2000;
    `;

    if (type === "success") {

        alert.style.background = "#4caf50";
        alert.style.color = "white";

    } else {

        alert.style.background = "#f44336";
        alert.style.color = "white";

    }

    document.body.appendChild(alert);

    setTimeout(() => alert.remove(), 3000);

}


/* ================= LOADING ================= */

function showLoading(show = true) {

    let loader = document.getElementById("loading-spinner");

    if (show && !loader) {

        loader = document.createElement("div");

        loader.id = "loading-spinner";

        loader.style.cssText = `
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            width:50px;
            height:50px;
            border:4px solid #f3f3f3;
            border-top:4px solid #f5576c;
            border-radius:50%;
            animation:spin 1s linear infinite;
            z-index:2000;
        `;

        document.body.appendChild(loader);

    } else if (!show && loader) {

        loader.remove();

    }

}