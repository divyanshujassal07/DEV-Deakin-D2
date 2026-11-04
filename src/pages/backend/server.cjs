// ==========================================

// LOAD ENVIRONMENT VARIABLES

// ==========================================

require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");

const cors = require("cors");

const formData = require("form-data");

const Mailgun = require("mailgun.js");

const { db, auth } = require("./firebaseAdmin.cjs");

const { FieldValue } = require("firebase-admin/firestore");

const app = express();

const PORT = 3000;

// ==========================================

// MIDDLEWARE

// ==========================================

app.use(cors());

app.use(express.json());

// Log incoming requests

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);

  next();
});

// ==========================================

// MAILGUN CONFIGURATION

// ==========================================

let mg = null;

if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  const mailgun = new Mailgun(formData);

  mg = mailgun.client({
    username: "api",

    key: process.env.MAILGUN_API_KEY,
  });
}

// ==========================================

// TEST SERVER

// ==========================================

app.get("/", (req, res) => {
  res.status(200).send("Newsletter server is running!");
});

// ==========================================

// FIREBASE AUTHENTICATION

// ==========================================

app.post("/api/auth/verify", async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,

        message: "Authentication token is missing.",
      });
    }

    const token = authorization.split(" ")[1];

    const decodedToken = await auth.verifyIdToken(token);

    console.log("Authenticated user:", decodedToken.uid);

    return res.status(200).json({
      success: true,

      message: "User authenticated successfully.",

      uid: decodedToken.uid,

      email: decodedToken.email || null,
    });
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,

      message: "Invalid or expired authentication token.",
    });
  }
});

// ==========================================

// ACTIVATE PAID SUBSCRIPTION (DEMO PAYMENT)

// ==========================================

app.post("/api/subscription/activate", async (req, res) => {
  try {
    // Require the user to be logged in

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,

        message: "Please log in first.",
      });
    }

    // Verify the Firebase ID token

    const token = authorization.split(" ")[1];

    const decodedToken = await auth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // Find the user's Firestore profile

    const userRef = db.collection("users").doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,

        message: "User profile not found.",
      });
    }

    // DEMO ONLY: activate the subscription without processing real payment.

    await userRef.update({
      subscription: {
        plan: "Paid",

        status: "active",

        paid: true,

        paymentMode: "demo",

        amount: 499,

        currency: "INR",

        purchasedAt: FieldValue.serverTimestamp(),
      },
    });

    return res.status(200).json({
      success: true,

      message: "Your Paid subscription is now active!",

      plan: "Paid",
    });
  } catch (error) {
    console.error("Subscription activation error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to activate subscription.",
    });
  }
});

// ==========================================

// CREATE A NEW POST

// ==========================================

app.post("/api/posts", async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,

        message: "Please log in first.",
      });
    }

    const token = authorization.split(" ")[1];

    const decodedToken = await auth.verifyIdToken(token);

    const uid = decodedToken.uid;

    const {
      postType,

      postPlan,

      title,

      description,

      abstract,

      articleText,

      tags,
    } = req.body || {};

    // Validate post type

    if (!["Question", "Article"].includes(postType)) {
      return res.status(400).json({
        success: false,

        message: "Invalid post type.",
      });
    }

    // Validate title

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,

        message: "Enter a valid title (maximum 150 characters).",
      });
    }

    // Validate question description

    if (
      postType === "Question" &&
      (typeof description !== "string" || !description.trim())
    ) {
      return res.status(400).json({
        success: false,

        message: "Question description is required.",
      });
    }

    // Validate article content

    if (
      postType === "Article" &&
      (typeof abstract !== "string" ||
        !abstract.trim() ||
        typeof articleText !== "string" ||
        !articleText.trim())
    ) {
      return res.status(400).json({
        success: false,

        message: "Article abstract and text are required.",
      });
    }

    // Validate tags

    if (
      !Array.isArray(tags) ||
      tags.length > 3 ||
      !tags.every((tag) => typeof tag === "string" && tag.trim())
    ) {
      return res.status(400).json({
        success: false,

        message: "Maximum three valid tags are allowed.",
      });
    }

    const cleanTags = [...new Set(tags.map((tag) => tag.trim()))];

    if (cleanTags.length !== tags.length) {
      return res.status(400).json({
        success: false,

        message: "Duplicate tags are not allowed.",
      });
    }

    // Get user's subscription

    const userDoc = await db.collection("users").doc(uid).get();

    const userData = userDoc.exists ? userDoc.data() : {};

    const subscription = userData.subscription || {};

    const isPaid =
      subscription.plan === "Paid" &&
      subscription.paid === true &&
      subscription.status === "active";

    // Validate the visibility selected by the post creator.
    if (!["Free", "Paid"].includes(postPlan)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid post access plan.",
      });
    }

    // Only users with an active Paid subscription can create Paid posts.
    if (postPlan === "Paid" && !isPaid) {
      return res.status(403).json({
        success: false,
        message: "Only Paid members can create Paid posts.",
      });
    }

    const finalPostPlan = postPlan;

    // Prepare post data

    const newPost = {
      postType,

      title: title.trim(),

      description: postType === "Question" ? description.trim() : "",

      abstract: postType === "Article" ? abstract.trim() : "",

      articleText: postType === "Article" ? articleText.trim() : "",

      tags: cleanTags,

      userId: uid,

      userEmail: decodedToken.email || "",

      postPlan: finalPostPlan,

      createdAt: FieldValue.serverTimestamp(),
    };

    // Save post to Firestore

    const postRef = await db.collection("posts").add(newPost);

    console.log("Post created:", postRef.id);

    return res.status(201).json({
      success: true,

      message: "Post created successfully.",

      postId: postRef.id,

      postPlan: finalPostPlan,
    });
  } catch (error) {
    console.error("Post creation error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to create post.",
    });
  }
});

// ==========================================

// BROWSE POSTS

// ==========================================

app.get("/api/posts", async (req, res) => {
  try {
    let isPaidUser = false;

    const authorization = req.headers.authorization;

    // Check logged-in user

    if (authorization) {
      if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,

          message: "Invalid authentication header.",
        });
      }

      const token = authorization.split(" ")[1];

      const decodedToken = await auth.verifyIdToken(token);

      const userDoc = await db

        .collection("users")

        .doc(decodedToken.uid)

        .get();

      if (userDoc.exists) {
        const subscription = userDoc.data().subscription || {};

        isPaidUser =
          subscription.plan === "Paid" &&
          subscription.paid === true &&
          subscription.status === "active";
      }
    }

    // Visitors and Free users see Free posts only

    let postsQuery = db.collection("posts");

    if (!isPaidUser) {
      postsQuery = postsQuery.where("postPlan", "==", "Free");
    }

    // Retrieve accessible posts

    const snapshot = await postsQuery.get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    // Sort posts by newest first

    posts.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;

      const dateB = b.createdAt?.toMillis?.() || 0;

      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,

      userPlan: isPaidUser ? "Paid" : "Free",

      count: posts.length,

      posts,
    });
  } catch (error) {
    console.error("Browse posts error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to retrieve posts.",
    });
  }
});

// ==========================================

// NEWSLETTER SUBSCRIPTION

// ==========================================

app.post("/subscribe", async (req, res) => {
  const email = req.body?.email;

  // Validate email

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      success: false,

      message: "Please enter a valid email address.",
    });
  }

  if (!mg) {
    return res.status(503).json({
      success: false,

      message: "Newsletter service is not configured.",
    });
  }

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Newsletter <postmaster@${process.env.MAILGUN_DOMAIN}>`,

      to: [email.trim()],

      subject: "Welcome to our Newsletter!",

      text: "Thank you for subscribing to our newsletter!",
    });

    console.log("Newsletter subscription successful.");

    return res.status(200).json({
      success: true,

      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Mailgun error:", error.message);

    return res.status(502).json({
      success: false,

      message: "Email could not be sent.",
    });
  }
});

// ==========================================

// HANDLE UNKNOWN ROUTES

// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message: "Route not found.",
  });
});

// ==========================================

// START SERVER

// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
