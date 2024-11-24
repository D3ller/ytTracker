"use strict";

let loginForm = document.getElementById("loginForm");
let profileUser = document.getElementById("profile");
let profileHTML = (username) => {
    return `<h1 class="text-xl font-semibold gradient-text text-center mb-5">Welcome, ${username.substring(0, 1).toUpperCase() + username.substring(1,8)}!</h1>
    <span id="logout" class="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 hover:underline">Logout?</span>`;

}

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
            appear(loginForm);
            appear(profileUser);
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
    } else {
        element.classList.add("hidden");
    }
}

let set = (element, value) => {
    element.innerHTML = value;
}

let isLogged = async () => {
    const profile = localStorage.getItem("profile");
    return !!profile;
}

let logout = async () => {
    if (await isLogged()) {
        try {
            const response = await fetch("http://localhost:3000/auth/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (response.ok) {
                localStorage.removeItem("profile");
                appear(loginForm);
                appear(profileUser);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}




document.addEventListener('DOMContentLoaded', async () => {
    if (await isLogged()) {
        console.log("You are already logged in!");
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
                set(profileUser, profileHTML(profile.user.username));
                document.getElementById("logout").addEventListener("click", logout);
            }
        } catch (e) {
            console.error("Error:", e);
            alert("You are already logged in!");
            }
    }
})