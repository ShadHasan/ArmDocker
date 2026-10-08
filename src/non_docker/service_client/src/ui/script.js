/**
 * ============================================================================
 * SECTION 1: MASTER APPLICATION STATE & STATIC DICTIONARIES
 * ============================================================================
 */
const APP_STATE = {
    currentView: "view-home",
    selectedProductId: null,
    selectedOrderId: null,
    currentPageIndex: 1,
    searchQuery: "",
    selectedCategories: [],
    basket: {}, // Key: Product ID, Value: Quantity
    currentSliderIndex: 0,
    allMyOrders:[],
    activityLog: [
        { time: "2026-10-03 10:00", event: "SYSTEM_INITIALIZED", message: "Whiteboard empty canvas rendered successfully." }
    ]
};

var ROWS_PRODUCTS = []

var aoa = ["request", "status", "cancel"]

/**
 * ============================================================================
 * SECTION 1.1: Global Signal Abstract Interaction
 * ============================================================================
 */
function convertRawToProductComptible(data) {
	const docs = data.rows
            .map(row => row.doc)
            .filter(doc => !doc._id.startsWith('_design/'));
    if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No inventory records found.</td></tr>';
        } else {
            docs.forEach(doc => {
            	ROWS_PRODUCTS.push({
            		"id": doc._id,
			        "name": doc.name || '',
			        "description": doc.description,
			        "basePrice": doc.costPrice,
			        "salePrice": doc.sellingPrice,
			        "category": doc.category || '',
			        "specs": doc.quantity || 0,
			        "images": doc.images
            	});
            });
        }
	console.log("Product Data Load Received");
}

function globalTriggerAction(action, data) {
	 signalManager.triggerAction(action, data);
 }


function receiveGlobalActionResponse(response) {
	 switch(response.action) {
		case "ui_details":
			break;
		case "dataType":
			break;
		case "binary_data":
			break;
		case "data":
			processResponseData(response);
			break;
		case "render":
			document.getElementById("view-home").innerHTML = response.result.HTML;
			var script = document.createElement('script');
			script.textContent = `${response.result.SCRIPT}`;
			document.body.appendChild(script);
			break;
	}
 }
 
function processResponseData(response) {
	switch(response.context_data.type) {
		case "inventory":
			convertRawToProductComptible(response.result);
			break;
		case "order": 
			switch (response.context_data.aoa) {
				case "request":
					postOrderProcessPipeline(response.result);
				break;
			}
			break;
	}
}
 
function fetchRowsProducts() {
	globalTriggerAction("data", {"type": "inventory", "offset": 0, "length": 9})
}
 

/**
 * ============================================================================
 * SECTION 2: PARAMETERIZED MUTATOR & VIEW RENDERING CALLBACK FUNCTIONS
 * ============================================================================
 */

function switchActiveViewport(targetViewId) {
    const views = [
        "view-home", "view-listing", "view-product-details", 
        "view-checkout", "view-order-placed", "view-order-details", 
        "view-order-list", "view-history"
    ];
    
    views.forEach(viewId => {
        const el = document.getElementById(viewId);
        if (el) el.style.display = (viewId === targetViewId) ? "block" : "none";
    });
    
    APP_STATE.currentView = targetViewId;
    document.getElementById("profile-dropdown-menu").style.display = "none";
    
    logActivityMetric("VIEW_NAVIGATION", `User switched perspective view frame context to: ${targetViewId}`);
}

function logActivityMetric(eventType, diagnosticMsg) {
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    APP_STATE.activityLog.push({ time: stamp, event: eventType, message: diagnosticMsg });
}

function filterAndRenderProductGrid(pageIdx, queryText, selectedCats) {
    const gridContainer = document.getElementById("product-grid");
    if (!gridContainer) return;
    
    gridContainer.innerHTML = "";
    
    let filtered = ROWS_PRODUCTS.filter(prod => {
        const matchesQuery = prod.name.toLowerCase().includes(queryText.toLowerCase()) || 
                             prod.description.toLowerCase().includes(queryText.toLowerCase());
        const matchesCategory = selectedCats.length === 0 || selectedCats.includes(prod.category);
        return matchesQuery && matchesCategory;
    });
    
    const itemsPerPage = 2;
    const startIdx = (pageIdx - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage);
    
    document.getElementById("pagination-index").value = pageIdx;
    
    if (paginatedItems.length === 0) {
        gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">No products match current query properties.</div>`;
        return;
    }
    
    paginatedItems.forEach(item => {
        const card = document.createElement("div");
        card.style.cssText = "border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; background: #fff;";
        card.setAttribute("data-product-id", item.id);
        card.onmouseover = () => { card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; };
        card.onmouseout = () => { card.style.boxShadow = "none"; };
        
        card.innerHTML = `
            <img src="${item.images[0]}" style="width: 100%; height: 120px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px; color: #666;">
            <h4 style="margin: 5px 0; font-size: 16px;">${item.name}</h4>
            <p style="font-size: 12px; color: #777; flex-grow: 1; margin: 5px 0;">${item.description.substring(0, 60)}...</p>
            <div style="margin-top: 10px;">
                <span style="font-size: 14px; color: #e44d26; font-weight: bold;">$${item.salePrice}</span>
                <span style="font-size: 11px; text-decoration: line-through; color: #999; margin-left: 5px;">$${item.basePrice}</span>
            </div>
        `;
        
        card.addEventListener("click", () => {
            selectAndDisplayProductDetails(item.id);
        });
        
        gridContainer.appendChild(card);
    });
}

function processSearchAutocompleteSuggestions(currentText) {
    const container = document.getElementById("search-suggestions");
    if (!container) return;
    
    if (currentText.length < 3) {
        container.style.display = "none";
        container.innerHTML = "";
        return;
    }
    
    const matches = ROWS_PRODUCTS.filter(p => p.name.toLowerCase().includes(currentText.toLowerCase()));
    
    if (matches.length === 0) {
        container.style.display = "none";
        return;
    }
    
    container.innerHTML = "";
    container.style.display = "block";
    
    matches.forEach(prod => {
        const row = document.createElement("div");
        row.style.cssText = "padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; font-size: 14px;";
        row.innerText = prod.name;
        row.onmouseover = () => { row.style.backgroundColor = "#f5f5f5"; };
        row.onmouseout = () => { row.style.backgroundColor = "transparent"; };
        
        row.addEventListener("click", () => {
            document.getElementById("product-search-input").value = prod.name;
            APP_STATE.searchQuery = prod.name;
            container.style.display = "none";
            filterAndRenderProductGrid(1, APP_STATE.searchQuery, APP_STATE.selectedCategories);
        });
        
        container.appendChild(row);
    });
}

function selectAndDisplayProductDetails(productId) {
    const item = ROWS_PRODUCTS.find(p => p.id === productId);
    if (!item) return;
    
    APP_STATE.selectedProductId = productId;
    APP_STATE.currentSliderIndex = 0;
    
    document.getElementById("details-product-name").innerText = item.name;
    document.getElementById("details-product-desc").innerText = item.description;
    document.getElementById("details-strike-price").innerText = `Original List Value: $${item.basePrice}`;
    document.getElementById("details-deal-price").innerText = `Available Offer Rate: $${item.salePrice}`;
    document.getElementById("details-product-specs").innerText = item.specs;
    document.getElementById("details-qty-input").value = 1;
    document.getElementById("details-pin-status").innerText = "";
    document.getElementById("details-pin-input").value = "";
    
    updateSliderVisualAssets(item, 0);
    switchActiveViewport("view-product-details");
    logActivityMetric("PRODUCT_VISIT", `Inspected structural product configuration card node target: [ID: ${productId}] - ${item.name}`);
}

function updateSliderVisualAssets(productObj, targetedImageIndex) {
    if(targetedImageIndex < 0) targetedImageIndex = productObj.images.length - 1;
    if(targetedImageIndex >= productObj.images.length) targetedImageIndex = 0;
    
    APP_STATE.currentSliderIndex = targetedImageIndex;
    
    document.getElementById("slider-main-image-placeholder").src = productObj.images[targetedImageIndex];
    
    const thumbsContainer = document.getElementById("slider-thumbnails-container");
    thumbsContainer.innerHTML = "";
    
    productObj.images.forEach((img, idx) => {
        const thumb = document.createElement("img");
        thumb.src = img;
        const isActive = idx === targetedImageIndex;
        thumb.style.cssText = `width: 40px; height: 40px; background: #eee; font-size: 8px; border: ${isActive ? '2px solid #007aff' : '1px solid #ccc'}; cursor: pointer; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; font-weight: bold;`;
        thumb.innerText = `Var ${idx + 1}`;
        
        thumb.addEventListener("click", () => {
            updateSliderVisualAssets(productObj, idx);
        });
        
        thumbsContainer.appendChild(thumb);
    });
}

function executeAddItemsToBasket(productId, targetQuantity) {
    if (!APP_STATE.basket[productId]) {
        APP_STATE.basket[productId] = 0;
    }
    APP_STATE.basket[productId] += targetQuantity;
    
    const product = ROWS_PRODUCTS.find(p => p.id === productId);
    logActivityMetric("BASKET_ADDITION", `Added quantity: ${targetQuantity} unit(s) of [ID: ${productId}] ${product ? product.name : ''} to transaction bucket storage.`);
    
    recalculateGlobalCartMetrics();
}

function updateBasketQuantityDirect(productId, updatedQuantity) {
    if (updatedQuantity <= 0) {
        delete APP_STATE.basket[productId];
        logActivityMetric("BASKET_REMOVAL", `Purged all structural instances of product ID: ${productId} from active inventory bucket.`);
    } else {
        APP_STATE.basket[productId] = updatedQuantity;
        logActivityMetric("BASKET_QUANTITY_MODIFICATION", `Adjusted quantity of item variant ID: ${productId} to target value: ${updatedQuantity}`);
    }
    recalculateGlobalCartMetrics();
    renderBasketCheckoutTable();
}

function recalculateGlobalCartMetrics() {
    let aggregateCount = 0;
    Object.values(APP_STATE.basket).forEach(q => aggregateCount += q);
    document.getElementById("basket-count").innerText = aggregateCount;
}

function renderBasketCheckoutTable() {
    const tbody = document.getElementById("checkout-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    let finalAggregateSum = 0;
    
    const basketKeys = Object.keys(APP_STATE.basket);
    
    if (basketKeys.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #888;">Shopping basket collection structure contains no active instances.</td></tr>`;
        document.getElementById("checkout-total-price").innerText = "$0.00";
        return;
    }
    
    basketKeys.forEach(pIdKey => {
        const pId = pIdKey;
        const product = ROWS_PRODUCTS.find(p => p.id === pId);
        if (!product) return;
        
        const currentQty = APP_STATE.basket[pId];
        const rowTotal = product.salePrice * currentQty;
        finalAggregateSum += rowTotal;
        
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #eee";
        
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: bold;">${product.name}</td>
            <td style="padding: 12px;">
                <input type="number" value="${currentQty}" min="0" style="width: 50px; padding: 4px;" data-change-pid="${pId}" class="checkout-qty-modifier-input">
            </td>
            <td style="padding: 12px;">$${product.salePrice}</td>
            <td style="padding: 12px; font-weight: bold; color: #222;">$${rowTotal.toFixed(2)}</td>
            <td style="padding: 12px;">
                <button style="color: #ff3b30; background: none; border: none; cursor: pointer; font-weight: bold;" data-remove-pid="${pId}" class="checkout-row-remove-btn">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    document.getElementById("checkout-total-price").innerText = `$${finalAggregateSum.toFixed(2)}`;
    
    bindCheckoutRowListeners();
}

function bindCheckoutRowListeners() {
    document.querySelectorAll(".checkout-qty-modifier-input").forEach(inputEl => {
        inputEl.addEventListener("change", (e) => {
            const targetPid = parseInt(e.target.getAttribute("data-change-pid"));
            const targetVal = parseInt(e.target.value);
            updateBasketQuantityDirect(targetPid, targetVal);
        });
    });
    
    document.querySelectorAll(".checkout-row-remove-btn").forEach(btnEl => {
        btnEl.addEventListener("click", (e) => {
            const targetPid = parseInt(e.target.getAttribute("data-remove-pid"));
            updateBasketQuantityDirect(targetPid, 0);
        });
    });
}

// Generate Unique Product ID
function generateUniqueId() {
    return 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
}

function executeOrderPlacementPipeline() {
    const basketKeys = Object.keys(APP_STATE.basket);
    if (basketKeys.length === 0) {
        alert("Transaction cannot be executed with an empty checkout container structural map.");
        return;
    }
    
    let compiledItems = {};
    let calculationAggregateSum = 0;
    
    basketKeys.forEach(k => {
        const itemQty = APP_STATE.basket[k];
        compiledItems[k] = itemQty;
        const pObj = ROWS_PRODUCTS.find(p => p.id === parseInt(k));
        if(pObj) calculationAggregateSum += pObj.salePrice * itemQty;
    });
    
    const uniqueGeneratedOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const timestampNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const structuredOrderPayload = {
        status: "request",
        items: compiledItems,
        total: parseFloat(calculationAggregateSum.toFixed(2)),
        date: timestampNow
    };
    globalTriggerAction("data", {"type": "order", "aoa": "request", "body": structuredOrderPayload});
    logActivityMetric("ORDER_PLACEMENT_REQUEST", `Order request has been placed at ${timestampNow}`);
    
}

function postOrderProcessPipeline(structuredOrderPayload)
{
	APP_STATE.allMyOrders.unshift(structuredOrderPayload);
    APP_STATE.basket = {};
    recalculateGlobalCartMetrics();
    
    logActivityMetric("ORDER_PLACEMENT_SUCCESS", `Committed checkout system operations payload safely. Order Record Matrix Key: ${uniqueGeneratedOrderId} at ${timestampNow}`);
    
    document.getElementById("placed-order-id-display").innerText = uniqueGeneratedOrderId;
    switchActiveViewport("view-order-placed");
}

function populateOrderDetailsInspector(orderIdString) {
    const matchingOrder = APP_STATE.allMyOrders.find(o => o._id === orderIdString);
    if (!matchingOrder) return;
    
    APP_STATE.selectedOrderId = orderIdString;
    
    document.getElementById("order-details-id").innerText = matchingOrder.id;
    document.getElementById("order-details-status").innerText = matchingOrder.status;
    document.getElementById("order-details-subtotal").innerText = `$${matchingOrder.total.toFixed(2)}`;
    document.getElementById("order-details-total").innerText = `$${matchingOrder.total.toFixed(2)}`;
    
    document.getElementById("order-details-delivery-info").innerText = `Standard Logistics Dispatch\nTarget Facility HUB: Area PIN routing manifest entry\nTimestamp Logged: ${matchingOrder.date}`;
    
    let statusResolutionMsg = "";
    switch(matchingOrder.status) {
        case "Processing": statusResolutionMsg = "Package undergoing allocation processing protocols inside warehouse inventory stack."; break;
        case "shipped": statusResolutionMsg = "Carrier transit operations engaged. In-route to target regional hub."; break;
        default: statusResolutionMsg = "System queue status confirmed: " + matchingOrder.status;
    }
    document.getElementById("order-details-tracking").innerText = statusResolutionMsg;
    
    const itemsContainer = document.getElementById("order-details-items-container");
    itemsContainer.innerHTML = "";
    
    Object.keys(matchingOrder.items).forEach(pIdKey => {
        const pId = parseInt(pIdKey);
        const qty = matchingOrder.items[pIdKey];
        const prod = ROWS_PRODUCTS.find(p => p.id === pId);
        
        if (prod) {
            const rowItem = document.createElement("div");
            rowItem.style.cssText = "display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px;";
            rowItem.innerHTML = `<span><strong>${prod.name}</strong> x ${qty}</span><span>$${(prod.salePrice * qty).toFixed(2)}</span>`;
            itemsContainer.appendChild(rowItem);
        }
    });
    
    switchActiveViewport("view-order-details");
    logActivityMetric("INSPECT_ORDER_DETAILS", `Opened core telemetry diagnosis parameters sheet for transaction node key reference: ${orderIdString}`);
}

function renderOrderListCollectionGrid() {
    const targetContainer = document.getElementById("order-list-rows-container");
    if (!targetContainer) return;
    
    targetContainer.innerHTML = "";
    
    if(APP_STATE.allMyOrders.length === 0) {
        targetContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #999;">Historical ledger array holds no tracked instances.</div>`;
        return;
    }
    
    APP_STATE.allMyOrders.forEach(ord => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; padding: 12px; border-bottom: 1px solid #e0e0e0; cursor: pointer; align-items: center; transition: background 0.2s;";
        row.setAttribute("data-order-target-id", ord._id);
        row.onmouseover = () => { row.style.backgroundColor = "#fafafa"; };
        row.onmouseout = () => { row.style.backgroundColor = "transparent"; };
        
        let colorProfile = "#666";
        if (ord.status === "request") colorProfile = "#4341D9";
        if (ord.status === "cancelled") colorProfile = "#ff2c2c";
        if (ord.status === "Processing" || ord.status === "Accepted") colorProfile = "#007aff";
        if (ord.status === "shipped" || ord.status === "Completed") colorProfile = "#34c759";
        
        row.innerHTML = `
            <div style="flex: 2; font-family: monospace; font-size: 15px; font-weight: bold; color: #111;">${ord.id}</div>
            <div style="flex: 1;"><span style="background: ${colorProfile}15; color: ${colorProfile}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${ord.status}</span></div>
        `;
        
        row.addEventListener("click", () => {
            populateOrderDetailsInspector(ord._id);
        });
        
        targetContainer.appendChild(row);
    });
}

function renderUserActivityLogMatrix() {
    const box = document.getElementById("history-log-container");
    if (!box) return;
    
    box.innerHTML = "";
    
    for (let i = APP_STATE.activityLog.length - 1; i >= 0; i--) {
        const item = APP_STATE.activityLog[i];
        const logLine = document.createElement("div");
        logLine.style.cssText = "border-left: 3px solid #ccc; padding-left: 10px; font-size: 12px; line-height: 1.4;";
        
        if (item.event === "BASKET_ADDITION" || item.event === "ORDER_PLACEMENT_SUCCESS") logLine.style.borderLeftColor = "#34c759";
        if (item.event === "PRODUCT_VISIT") logLine.style.borderLeftColor = "#007aff";
        
        logLine.innerHTML = `<span style="color: #888;">[${item.time}]</span> <strong style="color: #444;">${item.event}</strong> - <span style="color: #555;">${item.message}</span>`;
        box.appendChild(logLine);
    }
}

function simulateAreaPinValidationAsync(enteredPinCode) {
    return new Promise((resolve, reject) => {
        logActivityMetric("ASYNC_PIN_CHECK_START", `Dispatched checking query array parameter token: [${enteredPinCode}] to external simulated matrix check node.`);
        
        setTimeout(() => {
            if(enteredPinCode && enteredPinCode.trim().length >= 5) {
                resolve({ checkResult: true, msg: "Delivery logistics operational channels active in specified zone." });
            } else {
                resolve({ checkResult: false, msg: "Destination out of operational matrix boundaries." });
            }
        }, 600); 
    });
}

/**
 * ============================================================================
 * SECTION 3: SYSTEM INITIALIZATION & GLOBAL EVENT LISTENERS BINDING PATTERNS
 * ============================================================================
 */
function eventEnLoad() {
	    
    document.getElementById("nav-home").addEventListener("click", () => {
        switchActiveViewport("view-home");
    });
    
    document.getElementById("nav-listing").addEventListener("click", () => {
        filterAndRenderProductGrid(APP_STATE.currentPageIndex, APP_STATE.searchQuery, APP_STATE.selectedCategories);
        switchActiveViewport("view-listing");
    });
	
	document.getElementById("product-search-input").addEventListener("input", (e) => {
        APP_STATE.searchQuery = e.target.value;
        processSearchAutocompleteSuggestions(APP_STATE.searchQuery);
        filterAndRenderProductGrid(1, APP_STATE.searchQuery, APP_STATE.selectedCategories);
    });

    document.querySelectorAll(".category-filter").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const activeCheckedNodes = [];
            document.querySelectorAll(".category-filter:checked").forEach(cb => {
                activeCheckedNodes.push(cb.value);
            });
            APP_STATE.selectedCategories = activeCheckedNodes;
            filterAndRenderProductGrid(1, APP_STATE.searchQuery, APP_STATE.selectedCategories);
        });
    });

    document.getElementById("pagination-prev").addEventListener("click", () => {
        if (APP_STATE.currentPageIndex > 1) {
            APP_STATE.currentPageIndex--;
            filterAndRenderProductGrid(APP_STATE.currentPageIndex, APP_STATE.searchQuery, APP_STATE.selectedCategories);
        }
    });
    
    document.getElementById("pagination-next").addEventListener("click", () => {
        APP_STATE.currentPageIndex++;
        filterAndRenderProductGrid(APP_STATE.currentPageIndex, APP_STATE.searchQuery, APP_STATE.selectedCategories);
    });
    
    document.getElementById("pagination-index").addEventListener("change", (e) => {
        let proposedIdx = parseInt(e.target.value);
        if (isNaN(proposedIdx) || proposedIdx < 1) proposedIdx = 1;
        APP_STATE.currentPageIndex = proposedIdx;
        filterAndRenderProductGrid(APP_STATE.currentPageIndex, APP_STATE.searchQuery, APP_STATE.selectedCategories);
    });
    
    document.getElementById("basket-icon").addEventListener("click", () => {
        renderBasketCheckoutTable();
        switchActiveViewport("view-checkout");
    });
    
    document.getElementById("user-menu-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const m = document.getElementById("profile-dropdown-menu");
        m.style.display = (m.style.display === "block") ? "none" : "block";
    });
    
    document.addEventListener("click", () => {
        document.getElementById("profile-dropdown-menu").style.display = "none";
        document.getElementById("search-suggestions").style.display = "none";
    });

    document.getElementById("menu-orders-btn").addEventListener("click", () => {
        renderOrderListCollectionGrid();
        switchActiveViewport("view-order-list");
    });
    
    document.getElementById("menu-history-btn").addEventListener("click", () => {
        renderUserActivityLogMatrix();
        switchActiveViewport("view-history");
    });
    
    document.getElementById("menu-logout-btn").addEventListener("click", () => {
        const confirmation = confirm("Execute complete termination protocols on active terminal session token storage arrays?");
        if(confirmation) {
            logActivityMetric("SESSION_TERMINATE_REQUEST", "Session deletion requested. Flushing runtime matrix cache fields.");
            alert("Session cache deleted. Reloading engine space standard parameters framework configuration.");
            window.location.reload();
        }
    });

    document.getElementById("slider-btn-left").addEventListener("click", () => {
        const pObj = ROWS_PRODUCTS.find(p => p.id === APP_STATE.selectedProductId);
        if(pObj) updateSliderVisualAssets(pObj, APP_STATE.currentSliderIndex - 1);
    });
    
    document.getElementById("slider-btn-right").addEventListener("click", () => {
        const pObj = ROWS_PRODUCTS.find(p => p.id === APP_STATE.selectedProductId);
        if(pObj) updateSliderVisualAssets(pObj, APP_STATE.currentSliderIndex + 1);
    });

    document.getElementById("details-add-basket-btn").addEventListener("click", () => {
        const currentQtyVal = parseInt(document.getElementById("details-qty-input").value);
        if(isNaN(currentQtyVal) || currentQtyVal < 1) return;
        executeAddItemsToBasket(APP_STATE.selectedProductId, currentQtyVal);
        alert("Selected variant configuration array items loaded to the tracking bucket safely.");
    });

    document.getElementById("details-pin-btn").addEventListener("click", () => {
        const targetPinCodeText = document.getElementById("details-pin-input").value;
        const feedbackContainer = document.getElementById("details-pin-status");
        
        feedbackContainer.style.color = "#888";
        feedbackContainer.innerText = "Querying log grid...";
        
        simulateAreaPinValidationAsync(targetPinCodeText)
            .then(responsePayload => {
                logActivityMetric("ASYNC_PIN_CHECK_RESOLVED", `Result received for: [${targetPinCodeText}] -> status: ${responsePayload.checkResult}`);
                feedbackContainer.innerText = responsePayload.msg;
                feedbackContainer.style.color = responsePayload.checkResult ? "#34c759" : "#ff3b30";
            })
            .catch(err => {
                feedbackContainer.innerText = "System check communication error.";
                feedbackContainer.style.color = "#ff3b30";
            });
    });

    document.getElementById("checkout-place-order-btn").addEventListener("click", () => {
        executeOrderPlacementPipeline();
    });
    
    document.getElementById("placed-continue-btn").addEventListener("click", () => {
        filterAndRenderProductGrid(1, "", []);
        switchActiveViewport("view-listing");
    });
    
    document.getElementById("details-back-to-list-btn").addEventListener("click", () => {
        renderOrderListCollectionGrid();
        switchActiveViewport("view-order-list");
    });

    document.getElementById("history-clear-btn").addEventListener("click", () => {
        APP_STATE.activityLog = [];
        logActivityMetric("HISTORY_PURGE", "User executed clearance routine over local tracking operations buffer memory.");
        renderUserActivityLogMatrix();
    });

    logActivityMetric("SYSTEM_READY", "All explicit event binding arrays mapped securely. Application context operational.");
}

eventEnLoad();

globalTriggerAction("data", {"type": "inventory", "offset": 0, "length": 9});
globalTriggerAction("data", {"type": "order", "aoa": "status","offset": 0, "length": 9});
