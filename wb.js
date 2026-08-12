// ======================================
// Learn With Siam - wb.js
// (Firebase Auth + Firestore Courses সংযুক্ত)
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    // --------------------
    // Smooth Scroll
    // --------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // --------------------
    // Dark Mode
    // --------------------
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            this.innerHTML = document.body.classList.contains("dark-mode")
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
        });
    }

    // --------------------
    // Mobile Menu
    // --------------------
    const menuBtn = document.getElementById("menuBtn");
    const closeBtn = document.getElementById("closeBtn");
    const menu = document.getElementById("menu");

    if (menuBtn && menu) {
        menuBtn.onclick = function () { menu.classList.add("active"); };
    }
    if (closeBtn && menu) {
        closeBtn.onclick = function () { menu.classList.remove("active"); };
    }

    // --------------------
    // Discount Countdown Timer
    // --------------------
    let totalSeconds = 24 * 60 * 60;

    setInterval(function () {
        const hour = Math.floor(totalSeconds / 3600);
        const minute = Math.floor((totalSeconds % 3600) / 60);
        const second = totalSeconds % 60;

        document.querySelectorAll(".timer").forEach(function (timer) {
            if (totalSeconds > 0) {
                timer.innerHTML = "⏰ Offer Ends : " +
                    String(hour).padStart(2, "0") + ":" +
                    String(minute).padStart(2, "0") + ":" +
                    String(second).padStart(2, "0");
            } else {
                timer.innerHTML = "❌ Offer Expired";
            }
        });

        if (totalSeconds > 0) totalSeconds--;
    }, 1000);

    // --------------------
    // Load Courses (Firestore) + Cart Count
    // --------------------
    loadCourses();
    updateCartCount();

    // --------------------
    // Course Search (single, clean version)
    // --------------------
    const searchBox = document.getElementById("searchBox");
    const noCoursesFound = document.getElementById("noCoursesFound");

    if (searchBox) {
        searchBox.addEventListener("input", function () {
            const searchText = this.value.trim().toLowerCase();
            const courseCards = document.querySelectorAll("#courseContainer .course-card");
            let found = 0;

            courseCards.forEach(function (card) {
                const text = card.textContent.toLowerCase();
                if (searchText === "" || text.includes(searchText)) {
                    card.style.display = "";
                    found++;
                } else {
                    card.style.display = "none";
                }
            });

            if (noCoursesFound) {
                noCoursesFound.style.display = (searchText !== "" && found === 0) ? "block" : "none";
            }
        });
    }

    // --------------------
    // Add To Cart (event delegation — dynamically loaded cards-এও কাজ করবে)
    // --------------------
    const courseContainer = document.getElementById("courseContainer");
    if (courseContainer) {
        courseContainer.addEventListener("click", function (e) {
            const btn = e.target.closest(".addCart");
            if (!btn) return;

            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push({ name: btn.dataset.name, price: Number(btn.dataset.price) });
            localStorage.setItem("cart", JSON.stringify(cart));

            updateCartCount();
            alert(btn.dataset.name + " added to Cart.");
        });
    }

    // --------------------
    // Login / Register Popups
    // --------------------
    const loginBtn = document.getElementById("loginBtn");
    const loginPopup = document.getElementById("loginPopup");
    const closePopup = document.getElementById("closePopup");

    const openRegisterBtn = document.getElementById("openRegisterPopup");
    const registerPopup = document.getElementById("registerPopup");
    const closeRegisterBtn = document.getElementById("closeRegisterPopup");
    const backToLoginBtn = document.getElementById("backToLogin");

    
    const logoutBtn = document.getElementById("logoutBtn");

    if (loginBtn && loginPopup) {
        loginBtn.onclick = function () {
            loginPopup.style.display = "flex";
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = function () {
            if (confirm("Are you sure you want to logout?")) {
                auth.signOut();
            }
        };
    }
    

    if (closePopup) {
        closePopup.onclick = function () { loginPopup.style.display = "none"; };
    }

    window.addEventListener("click", function (e) {
        if (e.target === loginPopup) loginPopup.style.display = "none";
    });

    if (openRegisterBtn && registerPopup) {
        openRegisterBtn.onclick = function (e) {
            e.preventDefault();
            loginPopup.style.display = "none";
            registerPopup.style.display = "flex";
        };
    }

    if (closeRegisterBtn && registerPopup) {
        closeRegisterBtn.onclick = function () { registerPopup.style.display = "none"; };
    }

    if (backToLoginBtn && registerPopup) {
        backToLoginBtn.onclick = function () {
            registerPopup.style.display = "none";
            loginPopup.style.display = "flex";
        };
    }

    // --------------------
    // Firebase: Login Submit
    // --------------------
    const submitLogin = document.getElementById("submitLogin");
    const loginError = document.getElementById("loginError");

    if (submitLogin) {
        submitLogin.addEventListener("click", function () {
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (loginError) loginError.textContent = "";

            if (email === "" || password === "") {
                if (loginError) loginError.textContent = "❌ Please enter email and password."
                
                return;
            }

            submitLogin.disabled = true;
            submitLogin.textContent = "অপেক্ষা করো...";

            auth.signInWithEmailAndPassword(email, password)
                .then(function () {
                    loginPopup.style.display = "none";
                    alert("✅ Login Successful!\n\nWelcome back to Learn With Siam.");
                })
                .catch(function (error) {
                    if (loginError) loginError.textContent = "❌ " + firebaseErrorMessage(error.code);
                    console.error("Login error:", error.code, error.message);
                })
                .finally(function () {
                    submitLogin.disabled = false;
                    submitLogin.textContent = "Login";
                });
        });
    }

    // --------------------
    // Firebase: Register Submit
    // --------------------
    const registerForm = document.getElementById("registerForm");
    const registerError = document.getElementById("registerError");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (registerError) registerError.textContent = "";

            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("registerConfirmPassword").value;

            if (password !== confirmPassword) {
                if (registerError) registerError.textContent = "❌ পাসওয়ার্ড মিলছে না।";
                return;
            }
            if (password.length < 6) {
                if (registerError) registerError.textContent = "❌ পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।";
                return;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "অপেক্ষা করো...";
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then(function (userCredential) {
                    return userCredential.user.updateProfile({ displayName: name })
                        .then(function () {
                            return db.collection("users").doc(userCredential.user.uid).set({
                                name: name,
                                email: email,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        });
                })
                .then(function () {
                    registerPopup.style.display = "none";
                    alert("✅ Account Created!\n\nWelcome to Learn With Siam, " + name + ".");
                })
                .catch(function (error) {
                    if (registerError) registerError.textContent = "❌ " + firebaseErrorMessage(error.code);
                    console.error("Register error:", error.code, error.message);
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Create Account";
                    }
                });
        });
    }

    // --------------------
    // Firebase: Auth State (login button text)
    // --------------------
    
    
    const ADMIN_EMAIL = "siamhosen779@gmail.com";
    const adminMenuLink = document.getElementById("adminMenuLink");

    auth.onAuthStateChanged(function (user) {
        if (!loginBtn) return;

        
        if (adminMenuLink) {
            const isAdmin = user && user.email === ADMIN_EMAIL;
            adminMenuLink.classList.toggle("admin-hidden", !isAdmin);
        }
        
        if (user) {
            loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        } else {
            loginBtn.style.display = "inline-block";
        
            loginBtn.textContent = "LOGIN";
            loginBtn.style.pointerEvents = "auto";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    });
    
    

});

// ==========================================
// Firebase error code → বাংলা মেসেজ
// ==========================================


function firebaseErrorMessage(code) {
    switch (code) {
        case "auth/email-already-in-use":
            return "An account already exists with this email.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Password is too weak, use a stronger one.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait 5-10 minutes and try again.";
        case "auth/network-request-failed":
            return "Network connection issue, check your internet and try again.";
        case "auth/operation-not-allowed":
            return "Email/Password login is not enabled yet (check Firebase Console).";
        default:
            return "Something went wrong (" + (code || "unknown") + "), please try again.";
    }
}


// ==========================================
// Load Courses From Firestore
// ==========================================
function loadCourses() {
    const container = document.getElementById("courseContainer");
    if (!container || typeof db === "undefined") return;

    const fetchPromise = db.collection("courses").orderBy("createdAt", "desc").get();

    const timeoutPromise = new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error("timeout"));
        }, 10000);
    });

    Promise.race([fetchPromise, timeoutPromise])
        .then(function (snapshot) {
            if (snapshot.empty) {
                container.innerHTML = "<p class='loading-courses'>এখনো কোনো কোর্স যোগ করা হয়নি। Admin Panel থেকে যোগ করো।</p>";
                return;
            }

            container.innerHTML = "";

            snapshot.forEach(function (doc) {
                const course = doc.data();
                const hasDiscount = course.originalPrice && course.originalPrice > course.price;
                const discountPercent = hasDiscount
                    ? Math.round((1 - course.price / course.originalPrice) * 100)
                    : 0;

                const priceHtml = hasDiscount
                    ? '<p class="price"><del>৳' + course.originalPrice + '</del> <strong>৳' + course.price + '</strong></p>' +
                      '<p class="discount">🔥 ' + discountPercent + '% Discount</p>' +
                      '<p class="timer">⏰ Offer Ends : 24:00:00</p>'
                    : '<p class="price"><strong>৳' + course.price + '</strong></p>';

                const card = document.createElement("div");
                card.className = "course-card";
                card.innerHTML =
                    '<img src="' + (course.image || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600") + '" alt="' + course.name + '">' +
                    "<h3>" + course.name + "</h3>" +
                    priceHtml +
                    "<p>👨‍🎓 " + (course.students || 0) + "+ Students Enrolled</p>" +
                    '<button class="addCart" data-name="' + course.name + '" data-price="' + course.price + '">Enroll Now</button>' +
                    '<a href="course-details.html?id=' + doc.id + '" class="details-btn">View Details</a>';

                container.appendChild(card);
            });
        })
        .catch(function (error) {
            if (error && error.message === "timeout") {
                container.innerHTML = "<p class='loading-courses'>⚠️ Firestore থেকে রেসপন্স আসছে না (network সমস্যা মনে হচ্ছে)। আসল Chrome ব্রাউজারে পেজটা খুলে আবার চেষ্টা করো।</p>";
            } else {
                container.innerHTML = "<p class='loading-courses'>⚠️ কোর্স লোড করা যায়নি। firebase-config.js এ তোমার config ঠিক আছে কিনা চেক করো।</p>";
            }
            console.error("Course load error:", error);
        });
}

// ==========================================
// Cart Count (Header)
// ==========================================
function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCount.innerText = cart.length;
}


// ==========================================
// Navbar v2 — Sticky Shadow + Active Link + Cart Badge Sync
// ==========================================

// Sticky shadow on scroll
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    if (window.scrollY > 10) {
        navbar.classList.add("navbar-scrolled");
    } else {
        navbar.classList.remove("navbar-scrolled");
    }
});

// Active link highlight (scroll-spy)
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar-links .nav-link");

    if (sections.length && navLinks.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    navLinks.forEach(function (link) {
                        link.classList.remove("active-link");
                        if (link.getAttribute("href") === "#" + entry.target.id) {
                            link.classList.add("active-link");
                        }
                    });
                }
            });
        }, { threshold: 0.4 });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }
});

// Sync cart count to desktop cart badge too
const _originalUpdateCartCount = updateCartCount;
updateCartCount = function () {
    _originalUpdateCartCount();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const desktopBadge = document.getElementById("cartCountDesktop");
    if (desktopBadge) desktopBadge.textContent = cart.length;
};

