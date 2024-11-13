chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendVideoId") {
        sendResponse({ status: "received" });
    }
});