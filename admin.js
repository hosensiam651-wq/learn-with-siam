// ======================================
// Admin Access Guard
// ======================================
const ADMIN_EMAIL = "siamhosen779@gmail.com";

auth.onAuthStateChanged(function (user) {
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("⛔ You are not authorized to access this page.");
        window.location.href = "new.html";
    }
});



// ======================================
// Admin Panel — Firestore Connected
// পুরো কোর্স নিয়ন্ত্রণ: Add / Edit / Delete
// ======================================

const addBtn = document.getElementById("addCourse");
const courseList = document.getElementById("courseList");
const adminMsg = document.getElementById("adminMsg");
const seedBtn = document.getElementById("seedBtn");

let editingId = null; // null মানে নতুন কোর্স যোগ হচ্ছে, id থাকলে সেটা এডিট হচ্ছে

// --------------------
// Add / Update Course
// --------------------
addBtn.addEventListener("click", function () {

    const name = document.getElementById("courseName").value.trim();
    const originalPrice = document.getElementById("courseOriginalPrice").value.trim();
    const price = document.getElementById("coursePrice").value.trim();
    const image = document.getElementById("courseImage").value.trim();
    const students = document.getElementById("courseStudents").value.trim();

    if (adminMsg) adminMsg.textContent = "";

    if (name === "" || price === "") {
        if (adminMsg) adminMsg.textContent = "❌ Course Name আর Price দেওয়া বাধ্যতামূলক।";
        return;
    }

    const courseData = {
        name: name,
        price: Number(price),
        originalPrice: originalPrice !== "" ? Number(originalPrice) : null,
        image: image || "",
        students: students !== "" ? Number(students) : 0
    };

    addBtn.disabled = true;
    addBtn.textContent = editingId ? "Updating..." : "Adding...";

    let request;

    if (editingId) {
        request = db.collection("courses").doc(editingId).update(courseData);
    } else {
        courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        request = db.collection("courses").add(courseData);
    }

    request
        .then(function () {
            resetForm();
            if (adminMsg) {
                adminMsg.style.color = "#2a9d5c";
                adminMsg.textContent = "✅ সেভ হয়েছে! হোমপেজে গিয়ে দেখো।";
            }
        })
        .catch(function (error) {
            if (adminMsg) {
                adminMsg.style.color = "#e63946";
                adminMsg.textContent = "❌ সেভ করা যায়নি: " + error.message;
            }
            console.error(error);
        })
        .finally(function () {
            addBtn.disabled = false;
            addBtn.textContent = editingId ? "Update Course" : "Add Course";
        });
});

function resetForm() {
    document.getElementById("courseName").value = "";
    document.getElementById("courseOriginalPrice").value = "";
    document.getElementById("coursePrice").value = "";
    document.getElementById("courseImage").value = "";
    document.getElementById("courseStudents").value = "";
    editingId = null;
    addBtn.textContent = "Add Course";
}

// --------------------
// List Courses (live) + Edit + Delete
// --------------------
db.collection("courses").orderBy("createdAt", "desc")
    .onSnapshot(function (snapshot) {

        if (snapshot.empty) {
            courseList.innerHTML = "<p>এখনো কোনো কোর্স নেই।</p>";
            return;
        }

        courseList.innerHTML = "";

        snapshot.forEach(function (doc) {
            const course = doc.data();

            const div = document.createElement("div");
            div.className = "admin-course";
            div.innerHTML =
                (course.image ? '<img src="' + course.image + '" class="admin-course-img" alt="">' : "") +
                "<h3>" + course.name + "</h3>" +
                "<p>Price : ৳" + course.price +
                (course.originalPrice ? " (আগে ৳" + course.originalPrice + ")" : "") + "</p>" +
                "<p>👨‍🎓 " + (course.students || 0) + "+ Students</p>" +
                '<button class="editCourseBtn" data-id="' + doc.id + '">✏️ Edit</button> ' +
                '<button class="deleteCourseBtn" data-id="' + doc.id + '">🗑️ Delete</button>';

            div.dataset.name = course.name;
            div.dataset.originalPrice = course.originalPrice || "";
            div.dataset.price = course.price;
            div.dataset.image = course.image || "";
            div.dataset.students = course.students || 0;

            courseList.appendChild(div);
        });

    }, function (error) {
        courseList.innerHTML = "<p>⚠️ কোর্স লোড করা যায়নি। Firebase config চেক করো।</p>";
        console.error(error);
    });

// Edit / Delete (event delegation)
courseList.addEventListener("click", function (e) {

    const editBtn = e.target.closest(".editCourseBtn");
    const deleteBtn = e.target.closest(".deleteCourseBtn");

    if (editBtn) {
        const div = editBtn.closest(".admin-course");
        document.getElementById("courseName").value = div.dataset.name;
        document.getElementById("courseOriginalPrice").value = div.dataset.originalPrice;
        document.getElementById("coursePrice").value = div.dataset.price;
        document.getElementById("courseImage").value = div.dataset.image;
        document.getElementById("courseStudents").value = div.dataset.students;

        editingId = editBtn.dataset.id;
        addBtn.textContent = "Update Course";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    if (deleteBtn) {
        if (!confirm("এই কোর্সটা ডিলিট করতে চাও?")) return;

        db.collection("courses").doc(deleteBtn.dataset.id).delete()
            .catch(function (error) {
                alert("❌ Delete করা যায়নি: " + error.message);
            });
    }
});

// --------------------
// Seed: আগের ৫টা সুন্দর কোর্স আবার যোগ করো (ছবিসহ)
// --------------------
if (seedBtn) {
    seedBtn.addEventListener("click", function () {

        if (!confirm("আগের ৫টা কোর্স (ছবি, দাম, discount সহ) আবার যোগ করা হবে। এগিয়ে যাবে?")) return;

        const defaultCourses = [
            {
                name: "Data Science",
                originalPrice: 5000,
                price: 4750,
                image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600",
                students: 1240
            },
            {
                name: "Machine Learning",
                originalPrice: 6000,
                price: 5700,
                image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
                students: 980
            },
            {
                name: "Excel Masterclass",
                originalPrice: 3000,
                price: 2850,
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
                students: 2100
            },
            {
                name: "English Course",
                originalPrice: 3500,
                price: 3325,
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
                students: 1870
            },
            {
                name: "HSC English",
                originalPrice: 2500,
                price: 2375,
                image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
                students: 1430
            }
        ];

        seedBtn.disabled = true;
        seedBtn.textContent = "যোগ করা হচ্ছে...";

        const batch = db.batch();
        defaultCourses.forEach(function (course) {
            const ref = db.collection("courses").doc();
            batch.set(ref, Object.assign({}, course, {
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }));
        });

        batch.commit()
            .then(function () {
                alert("✅ ৫টা কোর্স যোগ হয়ে গেছে! হোমপেজে গিয়ে দেখো।");
            })
            .catch(function (error) {
                alert("❌ সমস্যা হয়েছে: " + error.message);
            })
            .finally(function () {
                seedBtn.disabled = false;
                seedBtn.textContent = "🌱 আগের ৫টা কোর্স আবার যোগ করো (ছবিসহ)";
            });
    });
}

