const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");
const Product = require("./models/Product");
const Review = require("./models/Review");
const Order = require("./models/Order");
const Category = require("./models/Category");
const Cart = require("./models/Cart"); // Add this line
const app = express();
const PORT = 5000;
const JWT_SECRET = "your_jwt_secret_key";

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

mongoose
  .connect("mongodb://127.0.0.1:27017/fancyStore", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Server is running! Use /api/auth/login or /api/auth/signup.");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Authentication Routes (unchanged)
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
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Routes (unchanged)
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

// Product Routes (unchanged)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products." });
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

// Category and Instagram Routes (unchanged)
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
    const instagramPosts = []; // Placeholder
    res.status(200).json(instagramPosts);
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    res.status(500).json({ message: "Failed to fetch Instagram posts" });
  }
});

// Cart Routes (Updated GET /api/cart)
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId, items: [], totalQuantity: 0, totalPrice: 0 });
      await cart.save();
    }

    // Sanitize items to handle populate failures
    const sanitizedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId?._id || item.productId, // Fallback if not populated
      quantity: item.quantity,
      color: item.color,
      price: item.price,
      imageUrl: item.imageUrl,
      name: item.name,
    }));

    res.status(200).json({
      items: sanitizedItems,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error('Error fetching cart:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, color, price, imageUrl, name } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    if (!price || price < 0) {
      return res.status(400).json({ message: 'Price must be a non-negative number' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalQuantity: 0, totalPrice: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.color === (color || null)
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        color: color || null,
        price: price || product.price,
        imageUrl: imageUrl || product.imageUrl || '/uploads/default.jpg',
        name: name || product.name,
      });
    }

    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      message: 'Item added to cart',
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
});

app.delete('/api/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      message: 'Item removed from cart',
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

app.put('/api/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      message: 'Cart item updated',
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      message: 'Cart cleared',
      cart: { items: cart.items, totalQuantity: cart.totalQuantity, totalPrice: cart.totalPrice },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});