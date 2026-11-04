import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./backend/Firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = "http://localhost:3000";

function Pricing() {
    const navigate = useNavigate();

    // Payment and loading states
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [planLoading, setPlanLoading] = useState(false);

    // Messages
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Payment form fields
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Current authenticated user and plan
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPlan, setCurrentPlan] = useState("Free");

    // Get the latest plan from the backend
    async function loadCurrentPlan(user) {
        if (!user) {
            setCurrentPlan("Free");
            return;
        }

        setPlanLoading(true);

        try {
            const token = await user.getIdToken(true);

            const response = await fetch(`${API_URL}/api/posts`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not retrieve your plan.");
            }

            setCurrentPlan(data.userPlan || "Free");
        } catch (err) {
            console.error("Plan lookup failed:", err);
            setCurrentPlan("Free");
        } finally {
            setPlanLoading(false);
        }
    }

    // Listen for Firebase authentication changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                setCurrentUser(user);
                setAuthLoading(false);
                await loadCurrentPlan(user);
            },
            (err) => {
                console.error("Authentication check failed:", err);
                setCurrentUser(null);
                setCurrentPlan("Free");
                setAuthLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    // Open the payment form
    function handleUpgrade() {
        setError("");
        setSuccess("");

        if (authLoading) {
            setError("Checking your login status. Please try again.");
            return;
        }

        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (currentPlan === "Paid") {
            setError("You already have the Paid plan.");
            return;
        }

        setShowPayment(true);
    }

    // Process demo subscription
    async function handlePayment(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!currentUser) {
            setError("Please log in before upgrading.");
            return;
        }

        // Validate demo card information
        const digits = cardNumber.replace(/\s/g, "");
        const expiryMatch = expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

        if (!cardName.trim()) {
            setError("Enter the name on your card.");
            return;
        }

        if (!/^\d{16}$/.test(digits)) {
            setError("Enter a valid 16-digit card number.");
            return;
        }

        if (!expiryMatch) {
            setError("Enter the expiry date in MM/YY format.");
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            setError("Enter a valid 3 or 4-digit security code.");
            return;
        }

        // Check card expiry
        const month = Number(expiryMatch[1]);
        const year = 2000 + Number(expiryMatch[2]);

        if (new Date(year, month) <= new Date()) {
            setError("The card expiry date has passed.");
            return;
        }

        setLoading(true);

        try {
            // Send the authenticated request to the backend.
            // The backend updates the subscription using Firebase Admin.
            const token = await currentUser.getIdToken(true);

            const response = await fetch(`${API_URL}/api/subscription/activate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to activate subscription.");
            }

            // Update the page immediately after backend confirmation
            setCurrentPlan("Paid");
            setSuccess("Your Paid plan is now active!");
            setShowPayment(false);

            // Clear payment form
            setCardName("");
            setCardNumber("");
            setExpiryDate("");
            setCvv("");

        } catch (err) {
            console.error("Subscription activation failed:", err);
            setError(err.message || "Unable to activate your subscription.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="pricing-container">
            <h1>Choose Your Plan</h1>
            <p>Choose the plan that works best for you.</p>

            {/* Current Plan */}
            <section className="current-plan">
                <h2>Your Current Plan</h2>
                <p>
                    {authLoading || planLoading
                        ? "Checking your plan..."
                        : currentUser
                            ? `You are currently on the ${currentPlan} plan.`
                            : "You are currently browsing as a visitor. Your available plan is Free."}
                </p>
            </section>

            {/* Pricing Plans */}
            <div className="pricing-plans">
                {/* Free Plan */}
                <section className="pricing-card">
                    <h2>Free Plan</h2>
                    <p className="price">₹0 / month</p>
                    <ul>
                        <li>Browse articles and tutorials</li>
                        <li>Explore community projects</li>
                        <li>Basic account access</li>
                    </ul>
                    <button type="button" disabled={currentPlan === "Free"}>
                        {currentPlan === "Free" ? "Current Plan" : "Free Plan"}
                    </button>
                </section>

                {/* Paid Plan */}
                <section className="pricing-card">
                    <h2>Paid Plan</h2>
                    <p className="price">₹499 / month</p>
                    <ul>
                        <li>All Free plan features</li>
                        <li>Additional learning resources</li>
                        <li>Premium community access</li>
                    </ul>
                    <button
                        type="button"
                        onClick={handleUpgrade}
                        disabled={authLoading || planLoading || currentPlan === "Paid"}
                    >
                        {authLoading || planLoading
                            ? "Checking Plan..."
                            : currentPlan === "Paid"
                                ? "Current Plan"
                                : "Upgrade Plan"}
                    </button>
                </section>
            </div>

            {/* Success Message */}
            {success && (
                <p role="status" style={{ color: "green" }}>
                    {success}
                </p>
            )}

            {/* Error Message */}
            {error && !showPayment && (
                <p role="alert" style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {/* Payment Form */}
            {showPayment && (
                <section className="payment-form">
                    <h2>Payment Details</h2>
                    <p>
                        Demo payment form – no actual payment will be processed.
                    </p>

                    <form onSubmit={handlePayment}>
                        {/* Cardholder Name */}
                        <label htmlFor="cardName">Name on Card</label>
                        <input
                            id="cardName"
                            type="text"
                            autoComplete="cc-name"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Enter name on card"
                            required
                        />

                        {/* Card Number */}
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                            id="cardNumber"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                                const digits = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 16);

                                setCardNumber(
                                    digits.replace(/(.{4})/g, "$1 ").trim()
                                );
                            }}
                            placeholder="1234 5678 9012 3456"
                            required
                        />

                        {/* Expiry Date and CVV */}
                        <div className="card-extra-fields">
                            <div>
                                <label htmlFor="expiryDate">Expiry Date</label>
                                <input
                                    id="expiryDate"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    maxLength={5}
                                    value={expiryDate}
                                    onChange={(e) => {
                                        let digits = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 4);

                                        if (digits.length > 2) {
                                            digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                                        }

                                        setExpiryDate(digits);
                                    }}
                                    placeholder="MM/YY"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="cvv">CVV / Security Code</label>
                                <input
                                    id="cvv"
                                    type="password"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    maxLength={4}
                                    value={cvv}
                                    onChange={(e) =>
                                        setCvv(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4)
                                        )
                                    }
                                    placeholder="123"
                                    required
                                />
                            </div>
                        </div>

                        {/* Payment Error */}
                        {error && (
                            <p role="alert" style={{ color: "red" }}>
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button type="submit" disabled={loading}>
                            {loading ? "Processing..." : "Complete Subscription"}
                        </button>

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowPayment(false);
                                setError("");
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                </section>
            )}
        </main>
    );
}

export default Pricing;
