import Groq from "groq-sdk";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// In-memory chat history per session
// For production, consider Redis or a database-backed store.
const chatHistories = new Map();
const MAX_HISTORY = 10;

const toLower = (text = "") => text.toLowerCase();

const getSessionKey = (req) => {
  const { sessionId } = req.body || {};
  return sessionId || req.ip || "default";
};

// ----------------------
// Order tracking helpers
// ----------------------

const ORDER_ID_REGEX = /ORD-\d{8}-\d{4}/i;

const detectOrderIntent = (message) => {
  const lower = toLower(message);
  if (ORDER_ID_REGEX.test(message)) return true;

  return (
    lower.includes("order status") ||
    lower.includes("track my order") ||
    lower.includes("where is my order") ||
    lower.includes("tell me about my order")
  );
};

const detectOrderPlacementIntent = (message) => {
  const lower = toLower(message);
  return (
    lower.includes("place order") ||
    lower.includes("buy this") ||
    lower.includes("checkout") ||
    lower.includes("order this") ||
    lower.includes("order now")
  );
};

const extractOrderIdFromMessage = (message) => {
  const match = message.match(ORDER_ID_REGEX);
  return match ? match[0].toUpperCase() : null;
};

const formatOrderStatusReply = (order) => {
  const status = order.orderStatus || order.status || "Placed";
  const paymentMethod = order.paymentMethod || "N/A";
  const total = typeof order.amount === "number" ? order.amount : 0;
  const paymentLabel =
    paymentMethod.toUpperCase() === "COD" ? "COD" : "Online";

  const date =
    order.date && !Number.isNaN(order.date)
      ? new Date(order.date).toLocaleString("en-IN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  return `Order ID: ${order.orderId || "N/A"}
Status: ${status}
Payment: ${paymentLabel}
Total: ₹${total}
Date: ${date}`;
};

const handleOrderTracking = async (message) => {
  const orderId = extractOrderIdFromMessage(message);

  if (!orderId) {
    return {
      reply:
        "Please provide your Order ID (Example: ORD-20260226-4831).",
    };
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    return {
      reply:
        "No order found with this ID. Please double-check your Order ID.",
    };
  }

  return { reply: formatOrderStatusReply(order) };
};

const appendToHistory = (sessionKey, history, userMessage, assistantReply) => {
  const userMsg = { role: "user", content: userMessage };
  const assistantMsg = { role: "assistant", content: assistantReply };
  const newHistory = [...history, userMsg, assistantMsg];
  const trimmedHistory = newHistory.slice(-MAX_HISTORY);
  chatHistories.set(sessionKey, trimmedHistory);
};

// Format products for Groq system prompt
const formatProductsForPrompt = (products) => {
  if (!products || !products.length) {
    return "No products are currently available in the catalog.";
  }

  return products
    .map((p) => {
      const gender = p.category || "General";
      const sub = p.subCategory || "";
      const label = sub ? `${gender} - ${sub}` : gender;
      return `${label} - ${p.name} - ₹${p.price}`;
    })
    .join("\n");
};

// Core Groq call
async function getAIResponse(userMessage, chatHistory, productsList) {
  const formattedProductList = formatProductsForPrompt(productsList);

  const systemMessage = `
You are an AI ecommerce shopping assistant for FOREVER store.

You can ONLY suggest products from the list below:
${formattedProductList}

If a requested product is not in the list, reply EXACTLY:
"This product is coming soon."

If a requested price range is not available in the list, reply EXACTLY:
"Not available in this price range."

Always:
- Ask for gender if not provided (Men, Women, Kids).
- Ask for category (shirt, suit, tshirt, dress, etc.) if not clear.
- Ask for budget range if not clear (for example: "under 1000").
- Use the provided products list to filter by gender, category, and budget.
- Never invent new products or prices beyond the list.

FAQ rules:
- Refund: 7 days return.
- Shipping: ₹50 below ₹999, free above ₹999.
- Sale: Festive seasons.

Escalation rules:
If user says anything like:
- connect me with agent
- talk to agent
- customer support
- complaint
- not satisfied

Reply EXACTLY:
"You can contact our support team:

📞 +91 7973208007
📧 contact@foreveryou.com

Our team will assist you shortly."

Be short, helpful and interactive.
Respond in plain text only.
`.trim();

  const messages = [
    { role: "system", content: systemMessage },
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    messages,
  });

  const reply =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Our assistant is temporarily unavailable. Please contact support.";

  return reply;
}

export const handleChat = async (req, res) => {
  const sessionKey = getSessionKey(req);
  let history = chatHistories.get(sessionKey) || [];

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Message is required." });
    }

    // Limit history before adding new message
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // 1) Block order placement attempts (chatbot must not create orders)
    if (detectOrderPlacementIntent(message)) {
      const reply =
        "Please complete your purchase directly from the website checkout page.";
      appendToHistory(sessionKey, history, message, reply);
      return res.json({ reply });
    }

    // 2) Handle order tracking via backend logic only (no Groq)
    if (detectOrderIntent(message)) {
      const { reply } = await handleOrderTracking(message);
      appendToHistory(sessionKey, history, message, reply);
      return res.json({ reply });
    }

    // 3) For all other queries, use Groq with product-controlled context
    const products = await Product.find({})
      .limit(50)
      .select("name price category subCategory");

    const aiReply = await getAIResponse(message, history, products);

    appendToHistory(sessionKey, history, message, aiReply);

    return res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.json({
      reply:
        "Our assistant is temporarily unavailable. Please contact support.",
    });
  }
};
