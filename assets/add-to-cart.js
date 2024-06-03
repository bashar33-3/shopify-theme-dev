// Function to update the cart item count in the header and toggle empty cart message
function loadCart() {
  console.log("update-cart-count");
  fetch("/cart.js")
    .then((response) => response.json())
    .then((data) => {
      const cartCountElements = document.querySelectorAll(
        ".header-cart-count h1"
      );
      const itemCount = data.item_count;
      const totalPrice = calculateTotalPrice(data.items);

      cartCountElements.forEach((element) => {
        element.textContent = itemCount;
      });

      document.getElementById("cart-total").textContent = `$${totalPrice}`;

      toggleCartView(itemCount);
      displayCartItems(data.items);
    })
    .catch((error) => console.error("Error fetching cart:", error));
}

// Function to calculate the total price of items in the cart
function calculateTotalPrice(items) {
  let total = 0;
  items.forEach((item) => {
    total += item.price * item.quantity;
  });
  return (total / 100).toFixed(2); // Assuming the price is in cents, convert to dollars
}

// Function to toggle cart view based on item count
function toggleCartView(itemCount) {
  const emptyCartElement = document.getElementById("empty-cart");
  const notEmptyCartElement = document.getElementById("not-empty-cart");
  const cartProductsElement = document.querySelector(".cart-products");

  console.log("Toggling cart view, item count:", itemCount);

  if (itemCount > 0) {
    console.log("Cart has items. Showing not-empty-cart.");
    document.querySelectorAll(".header-cart-count").forEach((element) => {
      element.style.display = "block";
    });
    if (emptyCartElement) emptyCartElement.style.display = "none";
    if (notEmptyCartElement) notEmptyCartElement.style.display = "block";
    if (cartProductsElement) {
      cartProductsElement.classList.remove("empty");
      cartProductsElement.classList.add("not-empty");
    }
  } else {
    console.log("Cart is empty. Showing empty-cart.");
    document.querySelectorAll(".header-cart-count").forEach((element) => {
      element.style.display = "none";
    });
    if (emptyCartElement) emptyCartElement.style.display = "flex";
    if (notEmptyCartElement) notEmptyCartElement.style.display = "none";
    if (cartProductsElement) {
      cartProductsElement.classList.remove("not-empty");
      cartProductsElement.classList.add("empty");
    }
  }
}

function displayCartItems(items) {
  const cartItemsContainer = document.getElementById("cart-items-container");

  if (!cartItemsContainer) {
    console.error("cart-items-container element not found");
    return;
  }

  cartItemsContainer.innerHTML = ""; // Clear previous items

  items.forEach((item) => {
    console.log(item);
    // Ensure item.price is a string before slicing
    const priceString = String(item.price);
    // Get the price and insert a decimal point before the last two digits
    const priceWithDecimal =
      priceString.slice(0, -2) + "." + priceString.slice(-2);

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.setAttribute("data-item-id", item.id); // Add item ID as a data attribute
    itemElement.innerHTML = `

      <div class='cart-item-inner'> 
      
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.product_title}">
      </div>


      <div class='dflex-row justify-content-sb'> 
      
      <div class="cart-item-details">
        <div class="cart-item-title">
          <a href="${item.url}">
            <h3 class="underline-animation fs-16">${item.product_title}</h3>
          </a>
        </div>
        <div class="cart-item-price text-neutral-100-7 fs-16">$${priceWithDecimal}</div>
        ${
          !item.product_has_only_default_variant
            ? `<div class="cart-item-variant fs-14 text-neutral-100-7">${item.variant_title}</div>`
            : ""
        }
      </div>
      <div class="quantity-remove">
        <div class="quantity-box">
          <input type="number" class="quantity-input" value="${
            item.quantity
          }" min="1">
        </div>
        <h6 class="remove-item-btn underline-animation-reverse fs-12 text-neutral-100-7 fw-regular">Remove</h6>
      </div>
      
      </div>
      
      


      <div>
      `;
    cartItemsContainer.appendChild(itemElement);
  });
}

function updateCart(update_payload) {
  let updates = {
    [update_payload.id]: update_payload.quantity,
  };
  // Send a POST request to update the quantity of the item in the cart
  fetch(window.Shopify.routes.root + "cart/update.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  })
    .then((response) => {
      if (response.ok) {
        // Quantity updated successfully
        console.log("Quantity updated successfully");
        // Update the cart count and items
        loadCart();
      } else {
        // Handle error if the quantity couldn't be updated
        console.error("Error updating quantity:", response.statusText);
        alert("There was an error updating the quantity. Please try again.");
      }
    })
    .catch((error) => {
      // Handle network errors
      console.error("Network error:", error);
      alert("There was a network error. Please try again.");
    });
}

// Function to handle Quick Add form submission
function handleQuickAddFormSubmit(event) {
  event.preventDefault(); // Prevent the default form submission

  const form = event.target;
  const variantId = form.querySelector('input[name="id"]').value;

  // Add product to the cart using Fetch API
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      id: variantId,
      quantity: 1,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then((error) => Promise.reject(error));
      }
    })
    .then((data) => {
      console.log("Product added to cart:", data);
      // Update the cart count and empty cart message in the header
      loadCart();

      showCartOverlay();
    })
    .catch((error) => {
      console.error("Error adding product to cart:", error);
      // Show error message to user
      alert("There was an error adding the product to the cart.");
    });
}

jQuery(document).ready(function () {
  // Add event listeners to Quick Add buttons
  jQuery(".quick-add-form").on("submit", handleQuickAddFormSubmit);

  // Initial cart count update on page load
  loadCart();

  // Delegate the change event for quantity inputs
  jQuery(document).on("change", ".quantity-input", function (event) {
    var itemId = jQuery(this).closest(".cart-item").data("item-id");
    var newQuantity = parseInt(jQuery(this).val());
    var update_payload = {
      id: itemId,
      quantity: newQuantity,
    };
    updateCart(update_payload);
  });

  // Delegate the click event for remove buttons
  jQuery(document).on("click", ".remove-item-btn", function (event) {
    var itemElement = jQuery(this).closest(".cart-item");
    var itemId = itemElement.data("item-id");

    // Add the collapsing class to trigger the transition
    itemElement.addClass("collapsing");

    // After the transition is complete, update the cart
    itemElement.one(
      "transitionend webkitTransitionEnd oTransitionEnd",
      function () {
        var update_payload = {
          id: itemId,
          quantity: 0, // Setting the quantity to 0 to remove the item
        };
        updateCart(update_payload);
      }
    );
  });
});
