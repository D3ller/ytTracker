document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        if (response.ok) {
            document.getElementById("status").innerText = "Login successful!";
        } else {
            throw new Error(`You are already logged in!`);
        }
    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("status").innerText = "Login failed!";
    }
});
