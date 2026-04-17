'use strict';

/* =========================
   UTIL
========================= */
const addEventOnElem = function (elements, eventType, callback) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

/* =========================
   NAVBAR
========================= */
const $header = document.querySelector('[data-header]');
const $navbar = document.querySelector('[data-navbar]');
const $navToggler = document.querySelectorAll('[data-nav-toggler]');
const $overlay = document.querySelector('[data-overlay]');
const $dropdownToggler = document.querySelector('[data-dropdown-toggler]');
const $dropdown = document.querySelector('[data-dropdown]');
const $cartToggler = document.querySelector('[data-cart-toggler]');
const $cartModal = document.querySelector('[data-cart-modal]');

function toggleNavbar() {
  $navbar.classList.toggle('active');
  $overlay.classList.toggle('active');
  document.body.classList.toggle('active');
}

addEventOnElem($navToggler, 'click', toggleNavbar);

function toggleElem(elem) {
  if (elem) elem.classList.toggle('active');
}

if ($dropdownToggler) {
  $dropdownToggler.addEventListener('click', () => toggleElem($dropdown));
}

if ($cartToggler) {
  $cartToggler.addEventListener('click', () => toggleElem($cartModal));
}

window.addEventListener('scroll', () => {
  if ($header) {
    $header.classList.toggle('active', window.scrollY > 50);
  }
});

/* =========================
   SLIDER (UNCHANGED)
========================= */
const $sliderContainers = document.querySelectorAll('[data-slider-container]');

function sliderInitial($sliderContainer) {
  const $slider = $sliderContainer.querySelector('[data-slider]');
  const $prevBtn = $sliderContainer.querySelector('[data-prev-btn]');
  const $nextBtn = $sliderContainer.querySelector('[data-next-btn]');

  function nextSlide() {
    $slider.appendChild($slider.firstElementChild);
  }

  function prevSlide() {
    $slider.prepend($slider.lastElementChild);
  }

  $nextBtn?.addEventListener('click', nextSlide);
  $prevBtn?.addEventListener('click', prevSlide);

  let interval = setInterval(nextSlide, 2000);

  $slider.addEventListener('mouseover', () => clearInterval(interval));
  $slider.addEventListener('mouseout', () => {
    interval = setInterval(nextSlide, 2000);
  });
}

for (let i = 0; i < $sliderContainers.length; i++) {
  sliderInitial($sliderContainers[i]);
}

/* =========================
   CART SYSTEM (FIXED - SINGLE SOURCE)
========================= */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cart-items");

/* =========================
   ADD TO CART (FIXED)
========================= */
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {

    const product = {
      name: button.dataset.name,
      price: parseFloat(button.dataset.price),
      image: button.dataset.image, // ✅ IMPORTANT FIX
      quantity: 1
    };

    const existing = cart.find(item => item.name === product.name);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();

    alert("Added to cart");
  });
});

/* =========================
   RENDER CART
========================= */
function renderCart() {
  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p>Cart is empty</p>`;
    return;
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;">
        
        <img src="${item.image}" width="50" height="50" style="border-radius:8px;object-fit:cover;">

        <div style="flex:1">
          <b>${item.name}</b><br>
          $${(item.price * item.quantity).toFixed(2)}
        </div>

        <div>
          <button onclick="decrease(${index})">-</button>
          <span>${item.quantity}</span>
          <button onclick="increase(${index})">+</button>
        </div>

        <button onclick="removeItem(${index})">X</button>
      </div>
    `;

    cartContainer.appendChild(li);
  });
}

/* =========================
   CART ACTIONS
========================= */
function increase(i) {
  cart[i].quantity++;
  saveCart();
}

function decrease(i) {
  if (cart[i].quantity > 1) {
    cart[i].quantity--;
  } else {
    cart.splice(i, 1);
  }
  saveCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

/* =========================
   CHECKOUT NAVIGATION
========================= */
function goToCheckout() {
  window.location.href = "checkout.html";
}

/* =========================
   BACKEND CHECKOUT CALL
========================= */
async function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const customer = {
    name: document.getElementById("name")?.value || "",
    email: document.getElementById("email")?.value || "",
    phone: document.getElementById("phone")?.value || "",
    address: document.getElementById("address")?.value || ""
  };

  const res = await fetch("http://localhost:5000/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart, customer })
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Payment failed");
  }
}

/* INIT */
renderCart();
function calculateTotal() {
  return cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}