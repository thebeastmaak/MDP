const container = document.getElementById("product-container");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function fetchProduct() {
  container.innerHTML = "Loading medical product details...";

  if (!id) {
    container.innerHTML = `<p>❌ No product ID specified in URL.</p>`;
    return;
  }

  try {
    const res = await fetch(`https://medical-dpp-backend.onrender.com/patient/${id}`);

    let data;
    try {
      data = await res.json();
    } catch {
      container.innerHTML = `<p>❌ Invalid response from server.</p>`;
      return;
    }

    console.log("Fetch response status:", res.status);
    console.log("Fetch response data:", data);

    if (res.status !== 200) {
      container.innerHTML = `<p>❌ ${data.error || "Failed to load medical product."}</p>`;
      return;
    }

    container.innerHTML = `
      <div class="medical-passport">
        <div class="header">DIGITAL MEDICAL PRODUCT PASSPORT</div>
        <div class="passport-body">
          <div class="product-photo">
            <img src="${data.image || "https://via.placeholder.com/300x400?text=Medical+Product"}" alt="${data.name || "Medical Product"}" />
          </div>
          <div class="product-info">
            <h2>${data.name || "Unnamed Medical Product"}</h2>
            <ul>
              <li><strong>Product ID:</strong> ${data.product_id || "N/A"}</li>
              <li><strong>Manufacturer:</strong> ${data.manufacturer || "N/A"}</li>
              <li><strong>Batch Number:</strong> ${data.batch_number || "N/A"}</li>
              <li><strong>Expiry Date:</strong> ${data.expiry_date || "N/A"}</li>
              <li><strong>Certification:</strong> ${data.certification || "N/A"}</li>
              <li><strong>Description:</strong> ${data.description || "N/A"}</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <div class="footer-name">${data.name || "Unnamed Medical Product"}</div>
          <div class="footer-details">${data.manufacturer || "Manufacturer Not Provided"}</div>
          <button class="chat-button" onclick="toggleChat()">Ask AI</button>
        </div>

        <div id="chatbot-popup" class="chat-popup">
          <div class="chat-header">
            Ask AI <span onclick="toggleChat()" style="cursor:pointer;float:right;">❌</span>
          </div>
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Ask something about this medical product..." autocomplete="off" />
            <button id="mic-btn" title="Voice input not implemented yet">🎤</button>
            <button id="send-btn" title="Send message">➤</button>
          </div>
        </div>
      </div>
    `;

    attachChatEvents();
  } catch (err) {
    console.error("Fetch error:", err);
    container.innerHTML = `<p>❌ Failed to load medical product. Try again later.</p>`;
  }
}

function toggleChat() {
  const popup = document.querySelector("#chatbot-popup");
  if (popup) popup.classList.toggle("visible");

  if (popup && popup.classList.contains("visible")) {
    const input = document.getElementById("chat-input");
    if (input) input.focus();
  }
}

function attachChatEvents() {
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");
  const messages = document.getElementById("chat-messages");
  const input = document.getElementById("chat-input");

  if (sendBtn) sendBtn.onclick = async () => {
    const message = input.value.trim();
    if (!message) return;

    messages.innerHTML += `<div><em>AI is typing...</em></div>`;
    messages.scrollTop = messages.scrollHeight;
    input.value = "";

    try {
      const res = await fetch("https://dpp-chatbot-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Remove "AI is typing..."
      const typingMsg = messages.querySelector("em");
      if (typingMsg) typingMsg.parentElement.remove();

      if (res.ok && data.reply) {
        messages.innerHTML += `<div><strong>AI:</strong> ${data.reply}</div>`;
      } else if (data.error) {
        messages.innerHTML += `<div><strong>AI:</strong> ❌ Error: ${data.error}</div>`;
        console.error("Backend error:", data.error);
      } else {
        messages.innerHTML += `<div><strong>AI:</strong> 🤖 Unexpected server response.</div>`;
        console.error("Unexpected response:", data);
      }
    } catch (err) {
      const typingMsg = messages.querySelector("em");
      if (typingMsg) typingMsg.parentElement.remove();

      messages.innerHTML += `<div><strong>AI:</strong> ❌ Error reaching AI service.</div>`;
      console.error(err);
    }

    messages.scrollTop = messages.scrollHeight;
  };

  if (micBtn) micBtn.onclick = () => {
    alert("🎤 Voice input not yet implemented.");
  };

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        sendBtn.click();
      }
    });
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("❌ Service Worker registration failed:", error);
    });
}

fetchProduct();
