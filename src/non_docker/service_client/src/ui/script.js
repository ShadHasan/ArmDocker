// ==========================================
// SECTION 1: ALL PARAMETERIZED CALLBACK FUNCTIONS
// ==========================================

// Global state simulation
const appState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    history: JSON.parse(localStorage.getItem('history')) || [],
    currentPage: 1,
    currentImageIndex: 0
};

// Log activity to history
function logActivity(actionText) {
    const timestamp = new Date().toLocaleString();
    appState.history.push({ timestamp, actionText });
    localStorage.setItem('history', JSON.stringify(appState.history));
}

// Navigation Callback
function navigateTo(url) {
    window.location.href = url;
}

// Session Callback
function handleLogout() {
    logActivity('User logged out');
    alert('Session deleted. Logging out...');
    navigateTo('index.html');
}

// Header Dropdown Toggle Callback
function toggleDropdown(dropdownElement) {
    if (dropdownElement) {
        const isShown = dropdownElement.style.display === 'block';
        dropdownElement.style.display = isShown ? 'none' : 'block';
    }
}

// Search Suggestions Callback
function handleSearchInput(query, suggestionBox) {
    if (!suggestionBox) return;
    if (query.length >= 3) {
        suggestionBox.innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" id="sug-1">Product Sample 1 (${query})</div>
            <div style="padding: 10px; cursor: pointer;" id="sug-2">Product Sample 2 (${query})</div>
        `;
        suggestionBox.style.display = 'block';
    } else {
        suggestionBox.style.display = 'none';
    }
}

// Pagination Fetch Callback
function fetchProductsByPage(pageIndex, pageInput) {
    if (pageIndex < 1) pageIndex = 1;
    appState.currentPage = pageIndex;
    if (pageInput) pageInput.value = pageIndex;
    logActivity(`Fetched product page ${pageIndex}`);
    // Simulated UI update
    console.log(`Fetching products for page: ${pageIndex}`);
}

// Image Carousel Callback
function changeProductImage(direction, totalImages, imageElement) {
    if (!imageElement) return;
    if (direction === 'next') {
        appState.currentImageIndex = (appState.currentImageIndex + 1) % totalImages;
    } else if (direction === 'prev') {
        appState.currentImageIndex = (appState.currentImageIndex - 1 + totalImages) % totalImages;
    }
    const sampleImages = [
        "https://via.placeholder.com/300?text=Product+Image+1",
        "https://via.placeholder.com/300?text=Product+Image+2",
        "https://via.placeholder.com/300?text=Product+Image+3"
    ];
    imageElement.src = sampleImages[appState.currentImageIndex];
}

// Pincode Availability Callback
function checkDeliveryAvailability(pincode, resultElement) {
    if (!resultElement) return;
    if (pincode.length === 6) {
        resultElement.innerText = "Delivery available for PIN: " + pincode;
        resultElement.style.color = "green";
    } else {
        resultElement.innerText = "Invalid PIN code. Must be 6 digits.";
        resultElement.style.color = "red";
    }
}

// Basket Callback
function addToBasket(productName, quantity) {
    const qty = parseInt(quantity) || 1;
    appState.cart.push({ name: productName, qty: qty, price: 99.99 });
    localStorage.setItem('cart', JSON.stringify(appState.cart));
    logActivity(`Added ${qty} x "${productName}" to basket`);
    alert(`${qty} x "${productName}" added to basket!`);
}

function updateCartQuantity(index, newQty, totalElement) {
    if (newQty <= 0) {
        const item = appState.cart[index];
        if (item) logActivity(`Removed "${item.name}" from basket`);
        appState.cart.splice(index, 1);
    } else {
        appState.cart[index].qty = parseInt(newQty);
        logActivity(`Updated quantity for "${appState.cart[index].name}" to ${newQty}`);
    }
    localStorage.setItem('cart', JSON.stringify(appState.cart));
    renderCartTable(totalElement);
}

function renderCartTable(totalElement) {
    const tableBody = document.getElementById('cart-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let total = 0;

    appState.cart.forEach((item, index) => {
        const itemTotal = item.qty * item.price;
        total += itemTotal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                <input type="number" value="${item.qty}" min="0" style="width: 50px; padding: 5px;" id="cart-qty-${index}">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">$${itemTotal.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);

        // Attach listener for dynamic row input
        const qtyInput = document.getElementById(`cart-qty-${index}`);
        if (qtyInput) {
            qtyInput.addEventListener('change', (e) => {
                updateCartQuantity(index, e.target.value, totalElement);
            });
        }
    });

    if (totalElement) {
        totalElement.innerText = `$${total.toFixed(2)}`;
    }
}

// Order Placement Callback
function placeOrder() {
    if (appState.cart.length === 0) {
        alert("Your basket is empty!");
        return;
    }
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    logActivity(`Placed order ${orderId}`);
    appState.cart = [];
    localStorage.setItem('cart', JSON.stringify([]));
    navigateTo(`order-success.html?orderId=${orderId}`);
}

// History Render & Clear Callback
function renderHistory(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '';
    if (appState.history.length === 0) {
        containerElement.innerHTML = '<li style="padding: 10px; border-bottom: 1px solid #eee;">No activity recorded yet.</li>';
        return;
    }
    appState.history.forEach(item => {
        const li = document.createElement('li');
        li.style.cssText = "padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;";
        li.innerHTML = `<span>${item.actionText}</span><small style="color: #888;">${item.timestamp}</small>`;
        containerElement.appendChild(li);
    });
}

function clearHistory(containerElement) {
    appState.history = [];
    localStorage.setItem('history', JSON.stringify([]));
    renderHistory(containerElement);
}

// Custom Promise Callback (Asynchronous Operation Simulation)
function simulatedAsyncDataFetch(endpoint) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (endpoint) {
                resolve({ status: 200, message: `Data fetched successfully from ${endpoint}` });
            } else {
                reject(new Error("Endpoint invalid"));
            }
        }, 1000);
    });
}

// ==========================================
// SECTION 2: EVENT LISTENERS & PROMISE HANDLING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Common Header Events ---
    const basketBtn = document.getElementById('header-basket-btn');
    if (basketBtn) {
        basketBtn.addEventListener('click', () => navigateTo('checkout.html'));
    }

    const userMenuBtn = document.getElementById('header-user-menu-btn');
    const userDropdown = document.getElementById('header-user-dropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => toggleDropdown(userDropdown));
    }

    const navOrdersOpt = document.getElementById('dropdown-opt-orders');
    if (navOrdersOpt) {
        navOrdersOpt.addEventListener('click', () => navigateTo('order-list.html'));
    }

    const navLogoutOpt = document.getElementById('dropdown-opt-logout');
    if (navLogoutOpt) {
        navLogoutOpt.addEventListener('click', handleLogout);
    }

    // --- Product Listing Page Events ---
    const searchInput = document.getElementById('product-search-input');
    const suggestionBox = document.getElementById('search-suggestions');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearchInput(e.target.value.trim(), suggestionBox);
        });
    }

    const prevPageBtn = document.getElementById('btn-prev-page');
    const nextPageBtn = document.getElementById('btn-next-page');
    const pageIndexInput = document.getElementById('page-index-input');

    if (prevPageBtn && pageIndexInput) {
        prevPageBtn.addEventListener('click', () => {
            const current = parseInt(pageIndexInput.value) || 1;
            fetchProductsByPage(current - 1, pageIndexInput);
        });
    }

    if (nextPageBtn && pageIndexInput) {
        nextPageBtn.addEventListener('click', () => {
            const current = parseInt(pageIndexInput.value) || 1;
            fetchProductsByPage(current + 1, pageIndexInput);
        });
    }

    if (pageIndexInput) {
        pageIndexInput.addEventListener('change', (e) => {
            fetchProductsByPage(parseInt(e.target.value) || 1, pageIndexInput);
        });
    }

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const prodName = card.getAttribute('data-name') || 'Sample Product';
            logActivity(`Visited product page for "${prodName}"`);
            navigateTo('product.html');
        });
    });

    // --- Product Detail Page Events ---
    const prevImgBtn = document.getElementById('btn-prev-img');
    const nextImgBtn = document.getElementById('btn-next-img');
    const mainProductImg = document.getElementById('main-product-img');

    if (prevImgBtn && mainProductImg) {
        prevImgBtn.addEventListener('click', () => changeProductImage('prev', 3, mainProductImg));
    }
    if (nextImgBtn && mainProductImg) {
        nextImgBtn.addEventListener('click', () => changeProductImage('next', 3, mainProductImg));
    }

    const checkPinBtn = document.getElementById('btn-check-pin');
    const pinInput = document.getElementById('pincode-input');
    const pinResult = document.getElementById('pin-result');
    if (checkPinBtn && pinInput && pinResult) {
        checkPinBtn.addEventListener('click', () => checkDeliveryAvailability(pinInput.value.trim(), pinResult));
    }

    const addToCartBtn = document.getElementById('btn-add-to-cart');
    const productQtyInput = document.getElementById('product-qty-input');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qty = productQtyInput ? productQtyInput.value : 1;
            addToBasket('Premium Wireless Headphones', qty);
        });
    }

    // --- Checkout Page Events ---
    const cartTotalDisplay = document.getElementById('cart-total-display');
    if (document.getElementById('cart-table-body')) {
        renderCartTable(cartTotalDisplay);
    }

    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // --- Order List Page Events ---
    const orderRows = document.querySelectorAll('.order-list-row');
    orderRows.forEach(row => {
        row.addEventListener('click', () => {
            const id = row.getAttribute('data-id');
            navigateTo(`order-details.html?id=${id}`);
        });
    });

    // --- History Page Events ---
    const historyContainer = document.getElementById('history-list-container');
    if (historyContainer) {
        renderHistory(historyContainer);
    }

    const clearHistoryBtn = document.getElementById('btn-clear-history');
    if (clearHistoryBtn && historyContainer) {
        clearHistoryBtn.addEventListener('click', () => clearHistory(historyContainer));
    }

    // --- Async Promise Categorized as Event Handling ---
    const asyncFetchTriggerBtn = document.getElementById('btn-async-fetch');
    if (asyncFetchTriggerBtn) {
        asyncFetchTriggerBtn.addEventListener('click', () => {
            simulatedAsyncDataFetch('/api/v1/products')
                .then(response => {
                    console.log("Async Promise Resolved:", response.message);
                    alert("Async operation complete: " + response.message);
                })
                .catch(error => {
                    console.error("Async Promise Rejected:", error);
                });
        });
    }
});