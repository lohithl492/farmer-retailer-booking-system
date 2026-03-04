const API_URL = window.location.origin + "/api";

const farmerId = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

/* ================= LOGIN CHECK ================= */

if (!farmerId || !token) {
    window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", () => {

    const nameEl = document.getElementById("farmer-name");
    if (nameEl) nameEl.textContent = userName || "Farmer";

    showSection("upload-crop");

});


/* ================= SECTION CONTROL ================= */

function showSection(section) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });

    const selected = document.getElementById(section);
    if (selected) selected.style.display = "block";

    if (section === "my-crops") loadMyCrops();
    if (section === "other-crops") loadOtherCrops();
    if (section === "booking-requests") loadBookingRequests();
}


/* ================= UPLOAD CROP ================= */

async function uploadCrop(event) {

    event.preventDefault();

    const cropName = document.getElementById("crop-name").value.trim();
    const quantity = document.getElementById("crop-quantity").value;
    const unit = document.getElementById("crop-unit").value;
    const price = document.getElementById("crop-price").value;
    const location = document.getElementById("crop-location").value.trim();
    const harvestDate = document.getElementById("crop-harvest-date").value;
    const description = document.getElementById("crop-description").value.trim();
    const imageFiles = document.getElementById("crop-images").files;

    if (!cropName || !quantity || !unit || !price || !location) {
        alert("Please fill all required fields");
        return;
    }

    const formData = new FormData();

    formData.append("farmerId", farmerId);
    formData.append("cropName", cropName);
    formData.append("quantity", quantity);
    formData.append("unit", unit);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("harvestDate", harvestDate);
    formData.append("description", description);

    for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
    }

    try {

        const response = await fetch(`${API_URL}/farmer/upload-crop`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {

            alert("Crop uploaded successfully!");

            document.querySelector("form").reset();

            showSection("my-crops");

        } else {

            alert(data.message || "Upload failed");

        }

    } catch (error) {

        console.error(error);
        alert("Server error while uploading crop");

    }

}


/* ================= LOAD MY CROPS ================= */

async function loadMyCrops() {

    try {

        const response = await fetch(`${API_URL}/farmer/my-crops/${farmerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const container = document.getElementById("my-crops-list");

        if (!data.success || data.crops.length === 0) {

            container.innerHTML = "<p>No crops uploaded yet</p>";
            return;

        }

        const html = data.crops.map(crop => {

            const image = crop.images && crop.images.length > 0
                ? crop.images[0]
                : "/uploads/default.jpg";

            return `
            <div class="crop-card">

                <img src="${image}">

                <div class="crop-card-content">

                    <h3>${crop.cropName}</h3>

                    <p><strong>Price:</strong> ₹${crop.price}/${crop.unit}</p>

                    <p><strong>Quantity:</strong> ${crop.quantity} ${crop.unit}</p>

                    <p>
                        <strong>Status:</strong>
                        <span style="color:${crop.isAvailable ? "green" : "red"}">
                            ${crop.isAvailable ? "Available" : "Sold"}
                        </span>
                    </p>

                    <button onclick="toggleStatus('${crop._id}')">
                        ${crop.isAvailable ? "Mark as Sold" : "Mark as Available"}
                    </button>

                    <button onclick="editCrop('${crop._id}',${crop.price},${crop.quantity},\`${crop.description || ""}\`)">
                        Edit
                    </button>

                    <button onclick="deleteCrop('${crop._id}')" style="background:red;color:white">
                        Delete
                    </button>

                </div>

            </div>
            `;

        }).join("");

        container.innerHTML = html;

    } catch (error) {

        console.error(error);
        alert("Error loading crops");

    }

}


/* ================= DELETE CROP ================= */

async function deleteCrop(id) {

    if (!confirm("Delete this crop?")) return;

    try {

        await fetch(`${API_URL}/farmer/delete-crop/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        loadMyCrops();

    } catch (error) {

        console.error(error);
        alert("Failed to delete crop");

    }

}


/* ================= TOGGLE STATUS ================= */

async function toggleStatus(id) {

    try {

        await fetch(`${API_URL}/farmer/toggle-status/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        loadMyCrops();

    } catch (error) {

        console.error(error);
        alert("Failed to update crop status");

    }

}


/* ================= EDIT CROP ================= */

async function editCrop(id, price, quantity, description) {

    const newPrice = prompt("Enter new price", price);
    if (newPrice === null) return;

    const newQuantity = prompt("Enter new quantity", quantity);
    if (newQuantity === null) return;

    const newDescription = prompt("Enter new description", description);

    try {

        await fetch(`${API_URL}/farmer/update-crop/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                price: newPrice,
                quantity: newQuantity,
                description: newDescription
            })
        });

        loadMyCrops();

    } catch (error) {

        console.error(error);
        alert("Failed to update crop");

    }

}


/* ================= LOAD OTHER CROPS ================= */

async function loadOtherCrops() {

    try {

        const response = await fetch(`${API_URL}/farmer/all-crops`);

        const data = await response.json();

        const container = document.getElementById("other-crops-list");

        if (!data.success || data.crops.length === 0) {

            container.innerHTML = "<p>No crops available</p>";
            return;

        }

        const html = data.crops.map(crop => {

            const image = crop.images && crop.images.length > 0
                ? crop.images[0]
                : "/uploads/default.jpg";

            return `
            <div class="crop-card">

                <img src="${image}">

                <div class="crop-card-content">

                    <h3>${crop.cropName}</h3>

                    <p><strong>Farmer:</strong> ${crop.farmerId.name}</p>

                    <p><strong>Price:</strong> ₹${crop.price}/${crop.unit}</p>

                    <p><strong>Contact:</strong> ${crop.farmerId.phone}</p>

                </div>

            </div>
            `;

        }).join("");

        container.innerHTML = html;

    } catch (error) {

        console.error(error);
        alert("Failed to load crops");

    }

}


/* ================= LOAD BOOKING REQUESTS ================= */

async function loadBookingRequests() {

    try {

        const response = await fetch(`${API_URL}/farmer/booking-requests/${farmerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const container = document.getElementById("booking-requests-list");

        if (!data.success || data.bookings.length === 0) {

            container.innerHTML = "<p>No booking requests</p>";
            return;

        }

        const html = data.bookings
            .filter(b => b.status === "interested")
            .map(b => `
                <div class="booking-card">

                    <h3>${b.cropId.cropName}</h3>

                    <p><strong>Retailer:</strong> ${b.retailerId.name}</p>

                    <p><strong>Quantity:</strong> ${b.quantity} ${b.cropId.unit}</p>

                    <p><strong>Total:</strong> ₹${b.totalPrice}</p>

                    <button onclick="updateBookingStatus('${b._id}','booked')" style="background:green;color:white">
                        Approve
                    </button>

                    <button onclick="updateBookingStatus('${b._id}','cancelled')" style="background:red;color:white">
                        Reject
                    </button>

                </div>
            `).join("");

        container.innerHTML = html;

    } catch (error) {

        console.error(error);
        alert("Failed to load booking requests");

    }

}


/* ================= UPDATE BOOKING ================= */

async function updateBookingStatus(id, status) {

    try {

        const response = await fetch(`${API_URL}/farmer/update-booking-status/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (data.success) {

            loadBookingRequests();
            loadMyCrops();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);
        alert("Failed to update booking");

    }

}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.clear();
    window.location.href = "/index.html";

}