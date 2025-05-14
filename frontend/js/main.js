if (document.getElementById("loginForm")) {
    try {
        document.getElementById("loginForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
            });

            const data = await response.json();
            console.log("response = ", data);

            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid username or password");
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

if (window.location.pathname.includes("dashboard.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in");
        window.location.href = "index.html";
    } else {
        fetch("http://localhost:3001/protected", {
            headers: {Authorization: "Bearer " + token}
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("message").innerText = data.message + " Hello " + data.username;
            })
            .catch(() => {
                alert("Invalid token");
                localStorage.removeItem("token");
                window.location.href = "index.html";
            });
    }

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}