const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { GridFSBucket } = require("mongodb");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("./models/User");
const Product = require("./models/Product");
const Review = require("./models/Review");
const Order = require("./models/Order");
const Category = require("./models/Category");
const Cart = require("./models/Cart");
const Wishlist = require("./models/Wishlist");

const app = express();
const PORT = 5000;
const JWT_SECRET = "murali555";
const client = new OAuth2Client("118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "Uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://mmuralikarthick:murali555@cluster0.vhygzo6.mongodb.net/fancyStore?retryWrites=true&w=majority";

let gfs;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    gfs = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    console.log("✅ GridFS initialized");
  })
  .catch((err) => console.error("MongoDB Atlas connection error:", err));

app.get("/", (req, res) => {
  res.send("Server is running! Use /api/auth/login or /api/auth/signup.");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please login.",
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Invalid or expired token. Please login again.",
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

// Authentication Routes
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully.", userId: newUser._id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error occurred during signup." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle Google users
    if (user.isGoogle) {
      return res.status(400).json({
        message: "Please use Google Sign-In for this account",
      });
    }

    // Handle regular users
    if (!password) {
      return res.status(400).json({ message: "Password is required for non-Google accounts" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/google-login", async (req, res) => {
  try {
    console.log("Received Google auth request:", req.body);
    const { idToken, email, googleId } = req.body;

    if (!idToken) {
      console.log("No ID token provided");
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: "118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    console.log("Google payload:", payload);
    if (payload.email !== email || payload.sub !== googleId) {
      console.log("Token validation failed");
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleIdFromToken, email: emailFromToken, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ email: emailFromToken }, { googleId: googleIdFromToken }] });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email: emailFromToken,
        googleId: googleIdFromToken,
        profilePicture: picture,
        isGoogle: true,
        lastLogin: new Date(),
      });
      console.log("Creating new Google user:", { name, email: emailFromToken, googleId: googleIdFromToken });
      await user.save();
      console.log("New Google user created with ID:", user._id);
    } else {
      // Update existing user
      user.lastLogin = new Date();
      user.googleId = googleIdFromToken;
      user.name = name;
      if (picture) user.profilePicture = picture;
      user.isGoogle = true;
      console.log("Updating existing user:", user._id);
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Sending successful response for user:", user._id);
    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
      },
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: "Invalid Google token or server error" });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('Received Google auth request');
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    console.log('Google payload:', payload);
    const { email, name, picture, sub: googleId } = payload;

    try {
      // Find user by email or googleId
      let user = await User.findOne({ $or: [{ email }, { googleId }] });
      
      if (!user) {
        // Create new user
        const newUser = new User({
          name,
          email,
          googleId,
          profilePicture: picture,
          isGoogle: true,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
          createdAt: new Date(),
          lastLogin: new Date()
        });

        user = await newUser.save();
        console.log('Created new Google user:', user._id);
      } else {
        // Update existing user
        user.lastLogin = new Date();
        user.googleId = googleId;
        user.name = name;
        if (picture) user.profilePicture = picture;
        user.isGoogle = true;
        await user.save();
        console.log('Updated existing user:', user._id);
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        token
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ message: 'Database error occurred' });
    }

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// User Routes
app.get("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.post("/api/users/me/profile-picture", authenticateToken, upload.single("profilePicture"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.status(200).json({ message: "Profile picture updated", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
});

app.delete("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Order.deleteMany({ userId });
    await Review.deleteMany({ userId });
    await Cart.deleteOne({ userId });
    await Wishlist.deleteOne({ userId });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

app.get("/api/user/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }
  if (req.user.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Error fetching user data." });
  }
});

// Admin Analytics
app.get("/api/admin/users-orders", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    console.log("Fetching users and orders for admin");
    const users = await User.find().select("-password").lean();
    console.log("Found users:", users.length);

    const orders = await Order.find().lean();
    console.log("Found orders:", orders.length);

    const wishlists = await Wishlist.find().lean();
    console.log("Found wishlists:", wishlists.length);

    const analyticsData = users.map((user) => {
      const userOrders = orders.filter((order) => order.userId.toString() === user._id.toString());
      const userWishlist = wishlists.find((w) => w.userId.toString() === user._id.toString());

      return {
        user: {
          id: user._id,
          name: user.name || "Unknown",
          email: user.email || "No email",
          profilePicture: user.profilePicture ? `http://localhost:5000${user.profilePicture}` : null,
        },
        orders: userOrders.map((order) => ({
          id: order._id,
          totalAmount: order.totalAmount || 0,
          status: order.status || "Unknown",
          createdAt: order.createdAt || new Date(),
          items: Array.isArray(order.items)
            ? order.items.map((item) => ({
                productId: item.productId || "Unknown",
                quantity: item.quantity || 0,
                price: item.price || 0,
                name: item.name || "Unknown",
                imageUrl: item.imageUrl ? `http://localhost:5000${item.imageUrl}` : null,
                color: item.color || null,
              }))
            : [],
        })),
        wishlist: userWishlist && Array.isArray(userWishlist.items)
          ? userWishlist.items.map((item) => ({
              productId: item.productId || "Unknown",
              name: item.name || "Unknown",
              price: item.price || 0,
              imageUrl: item.imageUrl ? `http://localhost:5000${item.imageUrl}` : null,
            }))
          : [],
      };
    });

    const ordersOverTime = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const summary = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalWishlistItems: analyticsData.reduce((sum, data) => sum + data.wishlist.length, 0),
      ordersByStatus: analyticsData.reduce((acc, data) => {
        data.orders.forEach((order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
        });
        return acc;
      }, {}),
      topUsersByOrders: analyticsData
        .sort((a, b) => b.orders.length - a.orders.length)
        .slice(0, 5)
        .map((data) => ({
          name: data.user.name,
          orderCount: data.orders.length,
        })),
      ordersOverTime: ordersOverTime.map((entry) => ({
        label: `${entry._id.month}/${entry._id.year}`,
        count: entry.count,
      })),
    };

    console.log("Sending admin users-orders response:", { totalUsers: summary.totalUsers });
    res.status(200).json({ analyticsData, summary });
  } catch (error) {
    console.error("Error fetching users-orders:", error.stack);
    res.status(500).json({ message: "Failed to fetch users and orders" });
  }
});

// Product Routes
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ dateAdded: -1 });
    const productsWithUrls = products.map((product) => ({
      ...product._doc,
      imageUrl: product.imageId ? `/api/images/${product.imageId}` : null,
    }));
    res.status(200).json(productsWithUrls);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products: " + error.message });
  }
});

app.get("/api/products/:productId/reviews", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  try {
    const reviews = await Review.find({ productId }).populate("userId", "name email");
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
});


app.post("/api/products/:productId/reviews", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { reviewText, rating } = req.body;
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  if (!reviewText || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Review text and a valid rating (1-5) are required." });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    const review = new Review({ userId, productId, reviewText, rating });
    await review.save();
    res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Failed to submit review." });
  }
});

// Category and Instagram Routes
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
});

app.get("/api/instagram-posts", authenticateToken, async (req, res) => {
  try {
    const instagramPosts = [];
    res.status(200).json(instagramPosts);
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    res.status(500).json({ message: "Failed to fetch Instagram posts" });
  }
});

// Wishlist Routes
app.get("/api/wishlist", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let wishlist = await Wishlist.findOne({ userId }).populate("items.productId");
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    const sanitizedItems = wishlist.items.map((item) => ({
      _id: item._id,
      productId: item.productId?._id || item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    }));

    res.status(200).json({ items: sanitizedItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

app.post("/api/wishlist/add", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingItem = wishlist.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    wishlist.items.push({
      productId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || "/Uploads/default.jpg",
    });

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Item added to wishlist",
      productId,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", {
      error: error.message,
      stack: error.stack,
      productId: req.body.productId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
});

app.delete("/api/wishlist/remove/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((item) => item.productId.toString() !== productId);

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      productId,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", {
      error: error.message,
      stack: error.stack,
      productId: req.params.productId,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
});

// Order Routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, shippingInfo, deliveryType, giftOptions, orderNotes, totalAmount } = req.body;
    const userId = req.user.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.contact) {
      return res.status(400).json({ message: "Complete shipping information is required" });
    }

    const processedItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity || 1,
      price: item.price,
      name: item.name,
      imageUrl: item.imageUrl,
      color: item.color,
    }));

    const order = new Order({
      userId,
      items: processedItems,
      shippingInfo,
      deliveryType: deliveryType || "normal",
      giftOptions: giftOptions || { wrapping: false, message: "" },
      orderNotes: orderNotes || "",
      totalAmount,
      status: "Pending",
      orderDate: new Date(),
      paymentStatus: "Pending",
      paymentMethod: "COD",
    });

    await order.save();

    await Cart.findOneAndUpdate({ userId }, { items: [], totalQuantity: 0, totalPrice: 0 });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        items: order.items,
        deliveryType: order.deliveryType,
        status: order.status,
        shippingInfo: order.shippingInfo,
        orderDate: order.orderDate,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).populate("items.productId").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: orderId, userId }).populate("items.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Cart Routes
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      });
      await cart.save();
    }

    res.status(200).json({
      items: cart.items,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error("Cart fetch error:", error);
    res.status(500).json({
      message: "Error fetching cart",
      error: error.message,
    });
  }
});

app.post("/api/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1, color, price, name, imageUrl } = req.body;
    const userId = req.user.userId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.color === color
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        color,
        price,
        name,
        imageUrl,
      });
    }

    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cart: {
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      message: "Error adding item to cart",
      error: error.message,
    });
  }
});

app.delete("/api/cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate("items.productId");

    res.status(200).json({
      message: "Item removed from cart",
      cart: {
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice,
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Error removing item from cart", error: error.message });
  }
});

app.put("/api/cart/:itemId", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate("items.productId");

    res.status(200).json({
      message: "Cart item updated",
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
});

app.delete("/api/cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

// Admin Dashboard APIs
app.get("/api/admin/data", async (req, res) => {
  try {
    const [users, orders, products, categories] = await Promise.all([
      User.find().select("-password").lean(),
      Order.find().sort({ createdAt: -1 }).lean(),
      Product.find().lean(),
      Category.find().lean(),
    ]);

    const productsWithUrls = products.map((product) => ({
      ...product,
      imageUrl: product.imageUrl
        ? product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `http://localhost:5000${product.imageUrl}`
        : "http://localhost:5000/uploads/default.jpg",
    }));

    const ordersWithUrls = orders.map((order) => ({
      ...order,
      items: order.items?.map((item) => ({
        ...item,
        imageUrl: item.imageUrl
          ? item.imageUrl.startsWith("http")
            ? item.imageUrl
            : `http://localhost:5000${item.imageUrl}`
          : "http://localhost:5000/uploads/default.jpg",
      })),
    }));

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: users.length,
          orders: orders.length,
          products: products.length,
          categories: categories.length,
          revenue: totalRevenue,
        },
        recent: {
          orders: ordersWithUrls.slice(0, 5),
          users: users.slice(0, 5),
          products: productsWithUrls.slice(0, 5),
        },
        stats: {
          ordersByStatus,
          lowStock: products.filter((p) => (p.stock || 0) < 10).length,
          activeUsers: users.filter((u) => u.lastLogin > Date.now() - 86400000).length,
        },
      },
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    const productsWithFullUrls = products.map((product) => ({
      ...product,
      imageUrl: product.imageUrl
        ? product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `http://localhost:5000${product.imageUrl}`
        : "http://localhost:5000/uploads/default.jpg",
    }));

    res.status(200).json({
      success: true,
      data: productsWithFullUrls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Overview API
app.get("/api/admin/overview", async (req, res) => {
  try {
    const [usersCount, ordersCount, productsCount] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
    ]);

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          users: usersCount,
          orders: ordersCount,
          products: productsCount,
          revenue: totalRevenue[0]?.total || 0,
        },
        recent: {
          orders: recentOrders,
          users: recentUsers,
          lowStock: lowStockProducts,
        },
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overview data",
      error: error.message,
    });
  }
});

// Additional admin endpoints
app.get("/api/admin/orders-stats", async (req, res) => {
  try {
    const orders = await Order.find().lean();
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/admin/products-stats", async (req, res) => {
  try {
    const [products, categories] = await Promise.all([Product.find().lean(), Category.find().lean()]);

    res.json({
      success: true,
      data: {
        total: products.length,
        lowStock: products.filter((p) => (p.stock || 0) < 10).length,
        categories: categories.map((cat) => ({
          name: cat.name,
          count: products.filter((p) => p.category === cat.name).length,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GridFS setup
let gridfsBucket;
mongoose.connection.once("open", () => {
  gridfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "images",
  });
  console.log("GridFS bucket is ready");
});

// Helper function to upload image to GridFS
const uploadImageToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const filename = `${crypto.randomBytes(16).toString("hex")}-${file.originalname}`;
    const uploadStream = gridfsBucket.openUploadStream(filename, {
      contentType: file.mimetype,
    });

    const readStream = require("stream").Readable.from(file.buffer);
    readStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id);
    });

    uploadStream.on("error", reject);
  });
};

// Add route to serve images
app.get("/api/images/:id", async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ error: "GridFS not initialized" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfs.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    const file = files[0];
    res.set("Content-Type", file.contentType);

    const readStream = gfs.openDownloadStream(fileId);
    readStream.pipe(res);

    readStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      res.status(500).json({ error: "Error streaming file" });
    });
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Add error handler for GridFS operations
app.use((error, req, res, next) => {
  if (error.name === "MongoError" || error.name === "MongoGridFSError") {
    console.error("GridFS Error:", error);
    return res.status(

500).json({ error: "File system error" });
  }
  next(error);
});

// Update Product routes to use GridFS
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, rating, colors, availableQuantity, stock, sold, description, offerEnds } = req.body;

    if (!name?.trim() || !price || !category || !description?.trim()) {
      return res.status(400).json({
        error: "Name, price, category, and description are required.",
      });
    }

    let imageId = null;
    if (req.file) {
      imageId = await uploadImageToGridFS(req.file);
    }

    const product = new Product({
      name: name.trim(),
      price: parseFloat(price),
      category,
      rating: parseInt(rating) || 0,
      colors: colors ? colors.split(",").map((color) => color.trim()) : [],
      availableQuantity: parseInt(availableQuantity) || parseInt(stock) || 0,
      stock: parseInt(stock) || parseInt(availableQuantity) || 0,
      sold: parseInt(sold) || 0,
      description: description.trim(),
      imageId,
      offerEnds: offerEnds ? new Date(offerEnds) : undefined,
    });

    await product.save();
    res.status(201).json({
      message: "Product added successfully!",
      product: {
        ...product._doc,
        _id: product._id,
        imageUrl: imageId ? `/api/images/${imageId}` : null,
      },
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Failed to save product: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});