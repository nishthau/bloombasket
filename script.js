document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    fetch('/api/groceries')
        .then(response => response.json())
        .then(data => {
            window.groceries = data; // Save groceries data to a global variable for easy access in filterGroceries
            setupPagination(data, 1); // Initialize the pagination on the first page
        });
    document.getElementById('cart-icon').addEventListener('click', openCartModal);
});

function setupPagination(groceries, currentPage) {
    const itemsPerPage = 14;
    const totalPages = Math.ceil(groceries.length / itemsPerPage);
    const paginationControls = document.getElementById('pagination-controls');

    paginationControls.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.onclick = () => setupPagination(groceries, i);
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        paginationControls.appendChild(pageButton);
    }

    displayGroceries(groceries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
}

function displayGroceries(groceries) {
    const groceryList = document.getElementById('grocery-list');
    groceryList.innerHTML = '';
    groceries.forEach(grocery => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'grocery-item';
        itemDiv.innerHTML = `
            <div class="grocery-content">
                <p>${grocery.name}</p>
                Price: $${grocery.price}

            </div>
            <div class="grocery-controls-button">
                <div class="quantity-controls">
                    <button onclick="decrementQuantity('${grocery.name}')">-</button>
                    <input type="number" id="quantity-${grocery.name}" value="1" min="1">
                    <button onclick="incrementQuantity('${grocery.name}')">+</button>
                </div>
                <button class="add-to-cart" onclick="addToCart('${grocery.name}', '${grocery.price}')">Add to Cart</button>
            </div>
            
        `;        
        groceryList.appendChild(itemDiv);
    });
}

function handleCheckboxChange(event) {
    const checkboxes = document.querySelectorAll('#category-filters input[type="checkbox"]');
    const allCheckbox = document.querySelector('#category-filters input[value="ALL"]');
    const changedCheckbox = event.target;

    if (changedCheckbox.value === 'ALL' && changedCheckbox.checked) {
        // Uncheck all other checkboxes if "ALL" is checked
        checkboxes.forEach(checkbox => {
            if (checkbox !== allCheckbox) {
                checkbox.checked = false;
            }
        });
    } else if (changedCheckbox.value !== 'ALL' && changedCheckbox.checked) {
        // Uncheck "ALL" checkbox if any other checkbox is checked
        allCheckbox.checked = false;
    }

    filterGroceries();
}
function filterGroceries() {
    const searchBox = document.getElementById('search-box');
    const query = searchBox.value.toLowerCase();
    const selectedCategories = Array.from(document.querySelectorAll('#category-filters input:checked')).map(cb => cb.value);

    // console.log("Selected category is" + selectedCategories);
    const filteredGroceries = window.groceries.filter(grocery => {
        if (selectedCategories == "ALL") {
            const matchesQuery = grocery.name.toLowerCase().includes(query);
            return matchesQuery && true;
        }
        else {
        const matchesQuery = grocery.name.toLowerCase().includes(query);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(grocery.Departement.toUpperCase());
        // console.log("Selected category is" + matchesQuery +" and "+matchesCategory);
        return matchesQuery && matchesCategory;
        }
    });

    setupPagination(filteredGroceries, 1);
}

function incrementQuantity(itemName) {
    const quantityInput = document.getElementById(`quantity-${itemName}`);
    let quantity = parseInt(quantityInput.value, 10);
    quantity += 1;
    quantityInput.value = quantity;
}

function decrementQuantity(itemName) {
    const quantityInput = document.getElementById(`quantity-${itemName}`);
    let quantity = parseInt(quantityInput.value, 10);
    if (quantity > 1) {
        quantity -= 1;
        quantityInput.value = quantity;
    }
}

function addToCart(itemName, itemPrice) {
    const quantityInput = document.getElementById(`quantity-${itemName}`);
    const quantity = parseInt(quantityInput.value, 10);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.name === itemName);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
    } else {
        cart.push({ name: itemName, price: itemPrice, quantity: quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal(); // Update modal content
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.innerText = cartCount;

    if (cartCount === 0) {
        cartCountElement.classList.add('empty');
    } else {
        cartCountElement.classList.remove('empty');
    }
}

function openCartModal(event) {
    event.preventDefault();
    updateCartModal(); // Update modal content
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('open');
    }, 10); // Delay adding class to ensure transition effect
}

function updateCartModal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cart-items');
    const totalItemsElement = document.getElementById('total-items');
    const subtotalElement = document.getElementById('subtotal');
    let totalItems = 0;
    let subtotal = 0;

    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('li');
            cartItem.innerHTML = `
                <!-- <img src="${item.image}" alt="${item.name}"> -->
                <span>${(item.name)}</span>
                <span>$${(item.price)}</span>
                <div class="cart-quantity-controls">
                    <button onclick="decrementCartItem(${index})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="incrementCartItem(${index})">+</button>
                </div>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn" onclick="removeCartItem(${index})">🗑️</button>
            `;
            cartItemsList.appendChild(cartItem);
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;
        });
    }

    totalItemsElement.innerText = totalItems;
    subtotalElement.innerText = subtotal.toFixed(2);
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Wait for the transition effect to complete
}

function decrementCartItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal(); // Update modal content
        updateCartCount();
    }
}

function incrementCartItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal(); // Update modal content
    updateCartCount();
}

function removeCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal(); // Update modal content
    updateCartCount();
}

function resetCart() {
    localStorage.removeItem('cart');
    updateCartCount();
    updateCartModal(); // Update modal content
}

// function submitCheckout(event) {
//     // event.preventDefault();

//     const name = document.getElementById('name').value;
//     const phone = document.getElementById('phone').value;
//     const address = document.getElementById('address').value;
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];

//     const checkoutData = {
//         name,
//         phone,
//         address,
//         cart
//     };

//     console.log('Checkout Data:', checkoutData);

//     fetch('/api/checkout', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(checkoutData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Checkout Success:', data);
//         resetCart();
//         alert('Checkout successful!');
//         closeCartModal();
//     })
//     .catch(error => {
//         console.error('Checkout Error:', error);
//         alert('An error occurred during checkout. Please try again.');
//     });
// }

function submitCheckout() {
    // const name = document.getElementById('customer-name').value;
    // const phone = document.getElementById('customer-phone').value;
    // const address = document.getElementById('customer-address').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = cart.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        subtotal: item.quantity * item.price
    }));
    console.log(cartItems);

    fetch('http://localhost:3000/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, address, cartItems })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        alert(data.message);
        // Optionally, clear the cart here
        // cart = [];
        // resetCart();
        // updateCartDisplay();
    })
    .catch(error => console.error('Error:', error));
}


/////////////////////////////////////////////
// Existing JavaScript code

// Function to open the admin login modal
function openAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'block';
}

// Function to handle admin login form submission
document.getElementById('admin-login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    fetch('/admin-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('admin-login-modal');
            fetchOrders();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Function to fetch and display all orders
function fetchOrders() {
    fetch('/orders')
    .then(response => response.json())
    .then(data => {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        data.orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <h3>Order #${order.id}</h3>
                <p><strong>Customer:</strong> ${order.name}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.productName} (x${item.quantity}) - $${item.subtotal}</li>`).join('')}
                </ul>
                <hr>
            `;
            ordersList.appendChild(orderItem);
        });
        document.getElementById('admin-orders-modal').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}

// Function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
