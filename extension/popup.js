"use strict";

let loginForm = document.getElementById("loginForm");
let profileUser = document.getElementById("profile");

loginForm.addEventListener("submit", async (e) => {
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
            appear(document.getElementById("status"));
            document.getElementById("status").innerText = "Login successful!";
            const profile = await response.json();
            localStorage.setItem("profile", JSON.stringify(profile.user));
        } else {
            throw new Error(`You are already logged in!`);
        }
    } catch (error) {
        appear(document.getElementById("status"));
        document.getElementById("status").innerText = error;
    }
});

let appear = (element) => {
    if (element.classList.contains("hidden")) {
        element.classList.remove("hidden");
    }
}

let isLogged = async () => {
    const profile = localStorage.getItem("profile");
    return !!profile;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (await isLogged()) {
        document.getElementById("status").innerText = "You are already logged in!";

        try {
            const response = await fetch("http://localhost:3000/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if(response.ok) {
                const profile = await response.json();
                localStorage.setItem("profile", JSON.stringify(profile.user));
                appear(loginForm);
                appear(profileUser);
            }
        } catch (e) {
            console.error("Error:", e);
        }
    }
})