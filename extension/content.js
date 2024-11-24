let currentUrl = window.location.href;

function checkVideoChange() {
    if (window.location.href.includes('/watch') && currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        const videoId = new URLSearchParams(window.location.search).get('v');

        if (videoId) {
            console.log(`Detected video change, Video ID: ${videoId}`);
            chrome.runtime.sendMessage({ action: "sendVideoId", videoId }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError.message);
                } else {
                    console.log("Background response:", response);
                    handleVideoIdMessage(videoId);
                }
            });
        }
    }
}

const observer = new MutationObserver(checkVideoChange);
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener('popstate', checkVideoChange);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)

    if (message.action === "saveToken") {
        saveTokenCookie();
    }

    if (message.action === "sendVideoId") {
        handleVideoIdMessage(message.videoId);
    }
});

function saveTokenCookie() {
    chrome.cookies.get({ url: "http://localhost:3000", name: "token" }, (cookie) => {
        if (cookie) {
            chrome.storage.local.set({ token: cookie.value }, () => {
                console.log("Token saved successfully.");
            });
        } else {
            console.error("No token cookie found after login.");
        }
    });
}

function handleVideoIdMessage(videoId) {
    console.log(videoId)
            sendVideoIdToServer(videoId);
}

function sendVideoIdToServer(videoId) {
    fetch("http://localhost:3000/videos/add", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ videoId })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then((result) => {
            console.log(result)
         console.log("Video ID sent successfully:", result)
        })
        .catch((error) => console.error("Failed to send video ID:", error));
}