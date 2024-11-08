document.addEventListener('DOMContentLoaded', () => {
    let cartIcon = document.querySelector('#cart-icon');
    let cart = document.querySelector('.cart');
    let closeCart = document.querySelector('#close-cart');

    // Show and hide cart
    cartIcon.onclick = () => {
        cart.classList.add("active");
    };

    closeCart.onclick = () => {
        cart.classList.remove('active');
    };

    // Wait for document to load
    if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", ready);
    } else {
        ready();
    }

    function ready() {
        const removeCartButtons = document.getElementsByClassName("cart-remove");
        for (let i = 0; i < removeCartButtons.length; i++) {
            const button = removeCartButtons[i];
            button.addEventListener("click", removeCartItem);
        }

        const quantityInputs = document.getElementsByClassName("cart-quantity");
        for (let i = 0; i < quantityInputs.length; i++) {
            const input = quantityInputs[i];
            input.addEventListener('change', quantityChanged);
        }

        const addCart = document.getElementsByClassName("add-cart");
        for (let i = 0; i < addCart.length; i++) {
            const button = addCart[i];
            button.addEventListener("click", addCartClicked);
        }

        loadCartItems(); // Load items from localStorage when page loads
    }

    // Remove cart item
    function removeCartItem(event) {
        const buttonClicked = event.target;
        buttonClicked.parentElement.remove()
        updateTotal();
        saveCartItems();
        updateCartIcon();
    }

    // Handle quantity change
    function quantityChanged(event) {
        const input = event.target;
        if (isNaN(input.value) || input.value <= 0) {
            input.value = 1;  // Set to minimum 1 if invalid input
        }
        updateTotal();
        saveCartItems();
        updateCartIcon();
    }
    

    // Add product to cart
    function addCartClicked(event) {
        const button = event.target;
        const shopProducts = button.parentElement;
        const title = shopProducts.getElementsByClassName("product-title")[0].innerText;
        const price = shopProducts.getElementsByClassName("price")[0].innerText;
        const productImg = shopProducts.getElementsByClassName("product-img")[0].src;
        addProductToCart(title, price, productImg);
        updateTotal();
        saveCartItems();
        updateCartIcon();
    }

    function addProductToCart(title, price, productImg, quantity = 1) {
        const cartShopBox = document.createElement("div");
        cartShopBox.classList.add('cart-box');
        const cartItems = document.getElementsByClassName('cart-content')[0];
        const cartItemsNames = cartItems.getElementsByClassName('cart-product-title');
        for (let i = 0; i < cartItemsNames.length; i++) {
            if (cartItemsNames[i].innerText == title) {
                alert('You have already added this item to the cart');
                return;
            }
        }

        // HTML for a new cart item
        const cartBoxContent =` 
        <img src="${productImg}" alt="" class="cart-img"/>
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <input type="number" value="${quantity}" class="cart-quantity"/>
        </div>
        <i class='bx bx-trash cart-remove'></i>`;
        cartShopBox.innerHTML = cartBoxContent;
        cartItems.append(cartShopBox);

        // Add event listeners to the newly added elements
        cartShopBox.querySelector('.cart-remove').addEventListener('click', removeCartItem);
        cartShopBox.querySelector('.cart-quantity').addEventListener('change', quantityChanged);

        saveCartItems();
        updateCartIcon();
    }

    // Update total price
    function updateTotal() {
        const cartContent = document.getElementsByClassName('cart-content')[0];
        const cartBoxes = cartContent.getElementsByClassName('cart-box');
        let total = 0;
        for (let i = 0; i < cartBoxes.length; i++) {
            const cartBox = cartBoxes[i];
            const priceElement = cartBox.getElementsByClassName('cart-price')[0];
            const quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
            const price = parseFloat(priceElement.innerText.replace("$", ''));
            const quantity = parseInt(quantityElement.value);

            // Add price * quantity to the total
            total += price * quantity;
        }
        
        // Round total to two decimal places
        total = Math.round(total * 100) / 100;
        document.getElementsByClassName("total-price")[0].innerText = '$' + total;
        localStorage.setItem('cartTotal', total); // Save total in localStorage
    }

    // Save cart items to localStorage
    function saveCartItems() {
        const cartContent = document.getElementsByClassName('cart-content')[0];
        const cartBoxes = cartContent.getElementsByClassName('cart-box');
        const cartItems = [];

        for (let i = 0; i < cartBoxes.length; i++) {
            const cartBox = cartBoxes[i];
            const titleElement = cartBox.getElementsByClassName('cart-product-title')[0];
            const priceElement = cartBox.getElementsByClassName('cart-price')[0];
            const quantityElement = cartBox.getElementsByClassName('cart-quantity')[0];
            const productImg = cartBox.getElementsByClassName('cart-img')[0].src;

            const item = {
                title: titleElement.innerText,
                price: priceElement.innerText,
                quantity: quantityElement.value,
                productImg: productImg,
            };
            cartItems.push(item);
        }
        localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Save cart items in localStorage
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            addProductToCart(item.title, item.price, item.productImg, item.quantity);
        }

        const cartTotal = localStorage.getItem('cartTotal');
        if (cartTotal) {
            document.getElementsByClassName('total-price')[0].innerText = '$' + cartTotal;
        }
        updateCartIcon();
    }

    // Update cart icon to show total quantity
    function updateCartIcon() {
        const cartBoxes = document.getElementsByClassName('cart-box');
        let quantity = 0;
        for (let i = 0; i < cartBoxes.length; i++) {
            const cartBox = cartBoxes[i];
            const quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
            quantity += parseInt(quantityElement.value);
        }
        const cartIcon = document.querySelector("#cart-icon");
        cartIcon.setAttribute("data-quantity", quantity); // Display quantity on cart icon
    }
});


// Show Signup/Login modals
const signUpBtn = document.getElementById('signUpBtn');
const loginBtn = document.getElementById('loginBtn');

signUpBtn.onclick = () => {
    document.getElementById('signup-modal').classList.add('show');
};
loginBtn.onclick = () => {
    document.getElementById('login-modal').classList.add('show');
};
// Close modals when the close button is clicked
document.querySelectorAll('.close-modal').forEach(button => {
    button.onclick = () => {
        button.closest('.modal').classList.remove('show');  // Closes the nearest modal
    };
});

// Close modals when clicking outside the modal content
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // Handle signup form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the form from submitting the default way

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        // Send signup request using fetch
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success, you can redirect or show a success message
                alert('Signup successful!');
                window.location.href = '/';  // Redirect to home page or another page
            } else {
                // Show error message
                alert(data.error || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the form from submitting the default way

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Send login request using fetch
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success, you can redirect or show a success message
                alert('Login successful!');
                window.location.href = '/';  // Redirect to home page or another page
            } else {
                // Show error message
                alert(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});



