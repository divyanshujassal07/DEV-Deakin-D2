import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../pages/backend/Firebase";

function Header() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setUserName(currentUser.displayName || currentUser.email || "");

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const profile = userSnapshot.data();

            setUserName(
              profile.name ||
                currentUser.displayName ||
                currentUser.email ||
                ""
            );
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserName("");
      }
    });

    return unsubscribe;
  }, []);

  // Log out
  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // Search website sections
  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim().toLowerCase();

    if (!query) return;

    if (query.includes("photo") || query.includes("gallery")) {
      navigate("/");
      setTimeout(() => {
        document.getElementById("gallery")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else if (query.includes("home")) {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (query.includes("project")) {
      navigate("/");
      setTimeout(() => {
        document.getElementById("work")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else if (query.includes("about")) {
      navigate("/");
      setTimeout(() => {
        document.getElementById("about")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else if (query.includes("browse") || query.includes("posts")) {
      navigate("/browse-posts");
    } else if (
      query.includes("pricing") ||
      query.includes("subscription")
    ) {
      navigate("/pricing");
    } else {
      alert("No matching section found!");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        DEV@Deakin
      </Link>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          className="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <div className="nav-buttons">
        <button type="button" onClick={() => navigate("/post")}>
          Post
        </button>

        {/* Browse Posts navigation link */}
        <Link to="/browse-posts" className="login-link">
          Browse Posts
        </Link>

        <Link to="/pricing" className="login-link">
          Pricing
        </Link>

        {user ? (
          <>
            <span className="welcome-user">
              Welcome, {userName || "User"}
            </span>

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Header;