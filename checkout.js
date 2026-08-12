document.addEventListener("DOMContentLoaded", function () {





    if (paymentOptions) {
        paymentOptions.querySelectorAll(".payment-option-item").forEach(function (item) {
            item.addEventListener("click", function () {
                paymentOptions.querySelectorAll(".payment-option-item").forEach(function (i) {
                    i.classList.remove("selected");
                });
                item.classList.add("selected");

                paymentValue.value = item.dataset.value;
                paymentTriggerText.textContent = item.dataset.label;

                const iconHTML = item.querySelector(".payment-icon").outerHTML;
                paymentTrigger.querySelector(".payment-icon").outerHTML = iconHTML;

                paymentSelect.classList.remove("open");
            });
        });
    }

    document.addEventListener("click", function (e) {
        if (paymentSelect && !paymentSelect.contains(e.target)) {
            paymentSelect.classList.remove("open");
        }
    });

    const form = document.getElementById("checkoutForm");


    form.addEventListener("submit", function (e) {

        e.preventDefault();

        if (!auth.currentUser) {
            alert("⚠️ Please Login first before checkout.");
            window.location.href = "new.html";
            return;
        }

        
        const payment = paymentValue.value;
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("⚠️ Your cart is empty.");
            window.location.href = "new.html";
            return;
        }

        const user = auth.currentUser;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Please wait...";
        }

        // আগে থেকেই কেনা কোর্স চেক করা
        db.collection("enrollments")
            .where("userId", "==", user.uid)
            .get()
            .then(function (snapshot) {

                const alreadyOwned = new Set();
                snapshot.forEach(function (doc) {
                    alreadyOwned.add(doc.data().courseName);
                });

                const newItems = cart.filter(function (item) {
                    return !alreadyOwned.has(item.name);
                });

                const skippedItems = cart.filter(function (item) {
                    return alreadyOwned.has(item.name);
                });

                if (newItems.length === 0) {
                    alert("⚠️ You have already enrolled in all the course(s) in your cart:\n\n" +
                        skippedItems.map(function (i) { return "• " + i.name; }).join("\n"));

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Confirm Payment";
                    }
                    return;
                }

                const batch = db.batch();

                newItems.forEach(function (item) {
                    const ref = db.collection("enrollments").doc();
                    batch.set(ref, {
                        userId: user.uid,
                        userName: user.displayName || "",
                        userEmail: user.email || "",
                        courseName: item.name,
                        price: item.price,
                        payment: payment,
                        enrolledAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });

                batch.commit()
                    .then(function () {

                        let message = "✅ Payment Successful!\n\nMethod : " + payment +
                            "\n\nEnrolled in:\n" + newItems.map(function (i) { return "• " + i.name; }).join("\n");

                        if (skippedItems.length > 0) {
                            message += "\n\n⚠️ Already owned (skipped):\n" +
                                skippedItems.map(function (i) { return "• " + i.name; }).join("\n");
                        }

                        alert(message + "\n\nThank you for purchasing from Learn With Siam.");

                        localStorage.removeItem("cart");
                        window.location.href = "dashboard.html";
                    })
                    .catch(function (error) {
                        alert("❌ Enrollment save করা যায়নি: " + error.message);
                    })
                    .finally(function () {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = "Confirm Payment";
                        }
                    });

            })
            .catch(function (error) {
                alert("❌ কিছু একটা সমস্যা হয়েছে: " + error.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Confirm Payment";
                }
            });

    });

});

