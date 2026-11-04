import { useState, useEffect } from "react";

function Subscribe() {
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false); 
 
useEffect(() => {
if (!message) return;
const timer = setTimeout(() => setMessage(""), 3000);
return () => clearTimeout(timer);
}, [message]);

async function handleSubscribe(event) {
event.preventDefault();
setMessage("");
setLoading(true);


try {
  const response = await fetch("http://localhost:3000/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (response.ok) {
    setMessage("Successfully subscribed! Check your inbox.");
    setEmail("");
  } else {
    setMessage(data.message || "Subscription failed. Please try again.");
  }
} catch {
  setMessage("Cannot connect to the server. Please try again.");
} finally {
  setLoading(false);
}


}

return ( <section className="contact-section"> <h2>Subscribe for daily Insider</h2> <form onSubmit={handleSubscribe}> <label htmlFor="email">Email</label>
<input type="email" id="email" name="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} required /> <button type="submit" disabled={loading}>{loading ? "Subscribing..." : "Subscribe"}</button>
{message && <p role="status">{message}</p>} </form> </section>
);
}

export default Subscribe;
