document.addEventListener("DOMContentLoaded", function () {

    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("totalPrice");
    const clearCartBtn = document.getElementById("clearCart");

    function renderCart() {

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            cartItems.innerHTML = "<h3>Your Cart is Empty.</h3>";
            totalPrice.innerText = "৳0";
            return;
        }

        let total = 0;
        cartItems.innerHTML = "";

        cart.forEach(function (course, index) {

            total += course.price;

            cartItems.innerHTML += `
            <div class="cart-card">

                <h3>${course.name}</h3>

                <p>Price : ৳${course.price}</p>

                <button class="removeBtn" data-index="${index}">
                Remove
                </button>

            </div>
            `;

        });

        totalPrice.innerText = "৳" + total.toLocaleString();
    }

    // প্রথমবার লোড হওয়ার সময় দেখাও
    renderCart();

    // Remove বাটন (event delegation — ডায়নামিক বাটনেও কাজ করবে)
    cartItems.addEventListener("click", function (e) {
        const btn = e.target.closest(".removeBtn");
        if (!btn) return;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const index = Number(btn.dataset.index);

        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));

        renderCart();
    });

    // Clear Cart বাটন
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", function () {
            if (!confirm("তুমি কি পুরো কার্ট খালি করতে চাও?")) return;

            localStorage.removeItem("cart");
            renderCart();
        });
    }

});

