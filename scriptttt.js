document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); 
    fetch('/api/groceries')
        .then(response => response.json())
        .then(data => displayGroceries(data));
    // document.getElementById('checkout-button').addEventListener('click', checkout);
    document.getElementById('cart-icon').addEventListener('click', openCartModal);
    // document.getElementById('cart-icon').addEventListener('click', openAddressCartModal);

    // updateCartCount();
});

function displayGroceries(groceries) {
    const groceryList = document.getElementById('grocery-list');
    groceryList.innerHTML = '';
    const mylist = document.createElement('ul');
    mylist.id='myUL';
    groceries.forEach(grocery => {
        const itemLi = document.createElement('li');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'grocery-item';
        itemDiv.innerHTML = `
            <h2>${grocery.name}</h2>
            <p>Price: $${grocery.price}</p>
            <div class="quantity-controls">
                <button onclick="decrementQuantity('${grocery.name}')">-</button>
                <input type="number" id="quantity-${grocery.name}" value="1" min="1">
                <button onclick="incrementQuantity('${grocery.name}')">+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart('${grocery.name}', '${grocery.price}')">Add to Cart</button>
        `;
        itemLi.appendChild(itemDiv);
        mylist.appendChild(itemLi);
        groceryList.appendChild(mylist);
    });
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
                <img src="${item.image}" alt="${item.name}">
                <span>$${(item.price)}</span>
                <div class="cart-quantity-controls">
                    <button onclick="decrementCartItem(${index})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="incrementCartItem(${index})">+</button>
                </div>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeCartItem(${index})">🗑️</button>
            `;
            cartItemsList.appendChild(cartItem);
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;
        });
    }

    totalItemsElement.innerText = totalItems;
    subtotalElement.innerText = subtotal.toFixed(2);
}


function incrementCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity++;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
}

function decrementCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal();
    }
}

function removeCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart count in header
    updateCartModal(); // Update modal content
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match transition duration in CSS
}

function closeCartFormModal() {
    const modal = document.getElementById('checkout-cart-modal');
    modal.classList.remove('open');
    modal.style.display = 'none';
}

function resetCart() {
    localStorage.removeItem('cart');
    updateCartCount();
    closeCartModal();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Please add items in the cart');
    } else {
        alert('Checking out ' + cart.length + ' items');    
        // document.getElementById('cart-icon').addEventListener('click', openAddressCartModal);
        const modal = document.getElementById('checkout-cart-modal');
        modal.style.display = 'block';
        modal.classList.add('open');
    }
    // Additional logic for checkout can be implemented here.
}

// function submitCheckout(event) {
//     event.preventDefault();

//     // Retrieve checkout form data
//     const formData = new FormData(event.target);
//     const checkoutDetails = {
//         name: formData.get('name'),
//         phone: formData.get('phone'),
//         address: formData.get('address')
//     };

//     // Simulate sending checkout details (replace with actual backend integration)
//     console.log('Checkout Details:', checkoutDetails);

//     // Optionally: Clear cart and update UI after successful checkout
//     resetCart();
//     closeCartModal(); // Close modal after checkout
// }

// function submitCheckout() {
//     // Retrieve checkout form data
//     const name = document.getElementById('name').value;
//     const phone = document.getElementById('phone').value;
//     const address = document.getElementById('address').value;
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];

//     const orderDetails = {
//         name,
//         phone,
//         address,
//         cart
//     };

//     fetch('http://localhost:3000/send-mail', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(orderDetails)
//     })
//     .then(response => response.text())
//     .then(data => {
//         alert(data);
//         resetCart();
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Failed to send email');
//     });

//     // Simulate sending checkout details (replace with actual backend integration)
//     console.log('Checkout Details:', orderDetails);
//     resetCart();
//     closeCartModal(); // Close modal after checkout
// }


// function submitCheckout() {
//     // Retrieve checkout form data
//     const name = document.getElementById('name').value;
//     const phone = document.getElementById('phone').value;
//     const address = document.getElementById('address').value;
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];

//     if (!name || !phone || !address) {
//         alert('Please fill in all the details');
//         return;
//     }

//     const checkoutDetails = {
//         name,
//         phone,
//         address,
//         cart
//     };

//     fetch('http://localhost:3001/send-mail', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(checkoutDetails)
//     })
//     .then(response => response.text())
//     .then(data => {
//         alert(data);
//         resetCart();
//         closeCartModal(); // Close modal after checkout
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Failed to send email');
//     });

//     // Simulate sending checkout details (replace with actual backend integration)
//     console.log('Checkout Details:', checkoutDetails);
// }


function submitCheckout() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!name || !phone || !address) {
        alert('Please fill in all the details');
        return;
    }

    const checkoutDetails = {
        name,
        phone,
        address,
        cart
    };

    fetch('http://localhost:3001/send-mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutDetails)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        resetCart();
        closeCartModal(); // Close modal after checkout
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send email');
    });
}


function searchGrocery() {
    // Declare variables
    var input, filter, ul, li, h2, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        // console.log("inside for loop");
      h2 = li[i].getElementsByTagName("h2")[0];
      console.log("inside for loop H2            ="+h2);
      console.log("inside for loop h2.textContent="+h2.textContent );
      console.log("inside for loop h2.innerText  ="+h2.innerText);
      txtValue = h2.textContent;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
};  