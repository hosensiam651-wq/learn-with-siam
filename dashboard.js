document.addEventListener("DOMContentLoaded", function () {

    auth.onAuthStateChanged(function (user) {

        if (!user) {
            alert("⚠️ Please login first to view your dashboard.");
            window.location.href = "new.html";
            return;
        }

        document.getElementById("studentName").textContent = user.displayName || "Student";
        document.getElementById("studentEmail").textContent = user.email || "";

        loadMyCourses(user.uid);
    });

});

function loadMyCourses(uid) {
    const container = document.getElementById("myCoursesList");
    const countEl = document.getElementById("coursesEnrolledCount");

    
    db.collection("enrollments")
        .where("userId", "==", uid)
        .get()
        .then(function (snapshot) {

            countEl.textContent = snapshot.size;

            if (snapshot.empty) {
                container.innerHTML = "<p>এখনো কোনো কোর্স কেনা হয়নি। <a href='new.html#courses'>কোর্স দেখো</a></p>";
                return;
            }

            container.innerHTML = "";

            snapshot.forEach(function (doc) {
                const course = doc.data();

                const div = document.createElement("div");
                div.className = "my-course-item";
                div.innerHTML =
                    "<p class='my-course-name'>" + course.courseName + "</p>" +
                    "<a href='video.html'>▶ Continue Learning</a>" +
                    "<progress value='0' max='100'></progress>" +
                    "<p>Not Started</p>";

                container.appendChild(div);
            });
        })
        .catch(function (error) {
            container.innerHTML = "<p>⚠️ কোর্স লোড করা যায়নি।</p>";
            console.error(error);
        });
}
