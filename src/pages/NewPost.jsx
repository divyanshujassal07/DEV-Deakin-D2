import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "./backend/Firebase";
import { onAuthStateChanged } from "firebase/auth";

function NewPost() {
    // Post details
    const [postType, setPostType] = useState("Question");
    const [postPlan, setPostPlan] = useState("Free");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [abstract, setAbstract] = useState("");
    const [articleText, setArticleText] = useState("");
    const [tags, setTags] = useState("");

    // User and loading states
    const [user, setUser] = useState(null);
    const [userPlan, setUserPlan] = useState("Free");
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // Check login status and subscription
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setUserPlan("Free");

            try {
                if (currentUser) {
                    const token = await currentUser.getIdToken();

                    const response = await fetch(
                        "http://localhost:3000/api/posts",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error("Unable to check subscription.");
                    }

                    setUserPlan(data.userPlan || "Free");
                }
            } catch (error) {
                console.error("Subscription check failed:", error);
            } finally {
                setAuthLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // Submit post
    async function handleSubmit(event) {
        event.preventDefault();

        if (!user) {
            alert("Please log in before submitting a post.");
            return;
        }

        // Validate title
        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }

        // Validate question
        if (postType === "Question" && !description.trim()) {
            alert("Please describe your problem.");
            return;
        }

        // Validate article
        if (
            postType === "Article" &&
            (!abstract.trim() || !articleText.trim())
        ) {
            alert("Please complete the abstract and article text.");
            return;
        }

        // Validate tags
        const tagList = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);

        if (tagList.length > 3) {
            alert("You can enter a maximum of three tags.");
            return;
        }

        if (
            new Set(tagList.map(tag => tag.toLowerCase())).size !==
            tagList.length
        ) {
            alert("Please do not enter duplicate tags.");
            return;
        }

        // Free users cannot create Paid posts
        if (postPlan === "Paid" && userPlan !== "Paid") {
            alert("Only Paid members can create Paid posts.");
            return;
        }

        setLoading(true);

        try {
            const idToken = await user.getIdToken();

            const postData = {
                postType,
                postPlan,
                title: title.trim(),
                description: postType === "Question"
                    ? description.trim()
                    : "",
                abstract: postType === "Article"
                    ? abstract.trim()
                    : "",
                articleText: postType === "Article"
                    ? articleText.trim()
                    : "",
                tags: tagList
            };

            const response = await fetch(
                "http://localhost:3000/api/posts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`
                    },
                    body: JSON.stringify(postData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to submit your post."
                );
            }

            alert("Your post has been submitted successfully!");

            // Clear form
            setTitle("");
            setDescription("");
            setAbstract("");
            setArticleText("");
            setTags("");
            setPostType("Question");
            setPostPlan("Free");

        } catch (error) {
            console.error("Post submission error:", error);
            alert(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    // Loading screen
    if (authLoading) {
        return (
            <div className="new-post-container">
                <h2>Checking login status...</h2>
            </div>
        );
    }

    // Only logged-in users can create posts
    if (!user) {
        return (
            <div className="new-post-container">
                <h1>New Post</h1>
                <p>Please log in to create a Question or Article.</p>
                <Link to="/login">Login</Link>
            </div>
        );
    }

    return (
        <div className="new-post-container">
            <h1>New Post</h1>

            <form onSubmit={handleSubmit}>

                {/* Select Post Type */}
                <h3>Select Post Type</h3>

                <label>
                    <input
                        type="radio"
                        value="Question"
                        checked={postType === "Question"}
                        onChange={() => setPostType("Question")}
                    />
                    Question
                </label>

                <label>
                    <input
                        type="radio"
                        value="Article"
                        checked={postType === "Article"}
                        onChange={() => setPostType("Article")}
                    />
                    Article
                </label>

                {/* Select Post Access */}
                <h3>Who can access this post?</h3>

                <label>
                    <input
                        type="radio"
                        name="postPlan"
                        value="Free"
                        checked={postPlan === "Free"}
                        onChange={() => setPostPlan("Free")}
                    />
                    Free – Everyone can access
                </label>

                <label>
                    <input
                        type="radio"
                        name="postPlan"
                        value="Paid"
                        checked={postPlan === "Paid"}
                        disabled={userPlan !== "Paid"}
                        onChange={() => setPostPlan("Paid")}
                    />
                    Paid – Premium members only
                </label>

                {userPlan !== "Paid" && (
                    <p>
                        You are currently on the Free plan.
                        {" "}
                        <Link to="/pricing">Upgrade to Paid</Link>
                        {" "}to create Paid posts.
                    </p>
                )}

                {/* Post Details */}
                <h3>What do you want to ask or share?</h3>

                <label>Title</label>

                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter your title"
                    required
                />

                {/* Question Fields */}
                {postType === "Question" ? (
                    <>
                        <label>Describe your problem</label>

                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your problem..."
                            required
                        />
                    </>
                ) : (
                    <>
                        <label>Abstract</label>

                        <textarea
                            value={abstract}
                            onChange={e => setAbstract(e.target.value)}
                            placeholder="Write a short abstract..."
                            required
                        />

                        <label>Article Text</label>

                        <textarea
                            value={articleText}
                            onChange={e => setArticleText(e.target.value)}
                            placeholder="Write your article..."
                            required
                        />
                    </>
                )}

                {/* Tags */}
                <label>Tags (maximum 3, separated by commas)</label>

                <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="React, JavaScript, Programming"
                />

                {/* Submit */}
                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Post"}
                </button>

            </form>
        </div>
    );
}

export default NewPost;