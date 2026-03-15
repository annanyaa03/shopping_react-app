// ============================================================
//         FAKE STORE API - Complete JavaScript Guide
//         Base URL: https://fakestoreapi.com
// ============================================================

const BASE_URL = "https://fakestoreapi.com";

// ============================================================
// 1. PRODUCTS
// ============================================================

// GET ALL PRODUCTS
async function getAllProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  const data = await res.json();
  console.log("All Products:", data);
  return data;
}

// GET SINGLE PRODUCT BY ID
async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  const data = await res.json();
  console.log(`Product #${id}:`, data);
  return data;
}

// GET LIMITED PRODUCTS
async function getLimitedProducts(limit = 5) {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}`);
  const data = await res.json();
  console.log(`Top ${limit} Products:`, data);
  return data;
}

// GET SORTED PRODUCTS (asc / desc)
async function getSortedProducts(order = "asc") {
  const res = await fetch(`${BASE_URL}/products?sort=${order}`);
  const data = await res.json();
  console.log(`Sorted (${order}):`, data);
  return data;
}

// GET ALL CATEGORIES
async function getAllCategories() {
  const res = await fetch(`${BASE_URL}/products/categories`);
  const data = await res.json();
  console.log("Categories:", data);
  return data;
}

// GET PRODUCTS BY CATEGORY
async function getProductsByCategory(category) {
  const res = await fetch(`${BASE_URL}/products/category/${category}`);
  const data = await res.json();
  console.log(`Products in "${category}":`, data);
  return data;
}

// ADD NEW PRODUCT (POST)
async function addProduct(productData) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  console.log("Added Product:", data);
  return data;
}

// UPDATE PRODUCT (PUT)
async function updateProduct(id, updatedData) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  const data = await res.json();
  console.log(`Updated Product #${id}:`, data);
  return data;
}

// PARTIALLY UPDATE PRODUCT (PATCH)
async function patchProduct(id, partialData) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partialData),
  });
  const data = await res.json();
  console.log(`Patched Product #${id}:`, data);
  return data;
}

// DELETE PRODUCT
async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  console.log(`Deleted Product #${id}:`, data);
  return data;
}

// ============================================================
// 2. CART
// ============================================================

// GET ALL CARTS
async function getAllCarts() {
  const res = await fetch(`${BASE_URL}/carts`);
  const data = await res.json();
  console.log("All Carts:", data);
  return data;
}

// GET SINGLE CART BY ID
async function getCartById(id) {
  const res = await fetch(`${BASE_URL}/carts/${id}`);
  const data = await res.json();
  console.log(`Cart #${id}:`, data);
  return data;
}

// GET CARTS BY USER ID
async function getCartByUserId(userId) {
  const res = await fetch(`${BASE_URL}/carts/user/${userId}`);
  const data = await res.json();
  console.log(`Carts for User #${userId}:`, data);
  return data;
}

// ADD TO CART (POST)
async function addToCart(userId, products) {
  const res = await fetch(`${BASE_URL}/carts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      date: new Date().toISOString().split("T")[0],
      products, // [{ productId: 1, quantity: 2 }]
    }),
  });
  const data = await res.json();
  console.log("Cart Created:", data);
  return data;
}

// UPDATE CART (PUT)
async function updateCart(cartId, userId, products) {
  const res = await fetch(`${BASE_URL}/carts/${cartId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      date: new Date().toISOString().split("T")[0],
      products,
    }),
  });
  const data = await res.json();
  console.log(`Updated Cart #${cartId}:`, data);
  return data;
}

// DELETE CART
async function deleteCart(cartId) {
  const res = await fetch(`${BASE_URL}/carts/${cartId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  console.log(`Deleted Cart #${cartId}:`, data);
  return data;
}

// ============================================================
// 3. USERS
// ============================================================

// GET ALL USERS
async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  const data = await res.json();
  console.log("All Users:", data);
  return data;
}

// GET SINGLE USER
async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  const data = await res.json();
  console.log(`User #${id}:`, data);
  return data;
}

// ADD NEW USER (POST)
async function addUser(userData) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  console.log("Added User:", data);
  return data;
}

// UPDATE USER (PUT)
async function updateUser(id, userData) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  console.log(`Updated User #${id}:`, data);
  return data;
}

// DELETE USER
async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  console.log(`Deleted User #${id}:`, data);
  return data;
}

// ============================================================
// 4. AUTH / LOGIN
// ============================================================

// LOGIN AND GET JWT TOKEN
async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  console.log("JWT Token:", data.token);
  return data.token;
}

// TEST CREDENTIALS (provided by FakeStoreAPI)
// username: "mor_2314"
// password: "83r5^_"

// ============================================================
// 5. HELPER UTILITIES
// ============================================================

// FORMAT PRICE
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

// CALCULATE CART TOTAL
function calculateCartTotal(cartProducts, allProducts) {
  return cartProducts.reduce((total, cartItem) => {
    const product = allProducts.find((p) => p.id === cartItem.productId);
    return total + (product ? product.price * cartItem.quantity : 0);
  }, 0);
}

// FILTER PRODUCTS BY MAX PRICE
function filterByMaxPrice(products, maxPrice) {
  return products.filter((p) => p.price <= maxPrice);
}

// SORT PRODUCTS BY PRICE
function sortByPrice(products, order = "asc") {
  return [...products].sort((a, b) =>
    order === "asc" ? a.price - b.price : b.price - a.price
  );
}

// SEARCH PRODUCTS BY TITLE
function searchProducts(products, query) {
  return products.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );
}

// ============================================================
// 6. EXAMPLE USAGE (Uncomment to run)
// ============================================================

// getAllProducts();
// getProductById(1);
// getLimitedProducts(5);
// getSortedProducts("desc");
// getAllCategories();
// getProductsByCategory("electronics");

// addProduct({ title: "New Item", price: 29.99, category: "electronics", description: "Test", image: "" });
// updateProduct(1, { title: "Updated Title", price: 49.99 });
// patchProduct(1, { price: 19.99 });
// deleteProduct(1);

// getAllCarts();
// getCartById(1);
// getCartByUserId(2);
// addToCart(1, [{ productId: 3, quantity: 2 }, { productId: 5, quantity: 1 }]);
// updateCart(1, 1, [{ productId: 2, quantity: 3 }]);
// deleteCart(1);

// getAllUsers();
// getUserById(1);
// addUser({ email: "test@test.com", username: "testuser", password: "pass123", name: { firstname: "John", lastname: "Doe" } });
// updateUser(1, { email: "new@email.com" });
// deleteUser(1);

// login("mor_2314", "83r5^_");

// ============================================================
// EXPORTS (for use in other files / React)
// ============================================================

export {
  // Products
  getAllProducts,
  getProductById,
  getLimitedProducts,
  getSortedProducts,
  getAllCategories,
  getProductsByCategory,
  addProduct,
  updateProduct,
  patchProduct,
  deleteProduct,

  // Cart
  getAllCarts,
  getCartById,
  getCartByUserId,
  addToCart,
  updateCart,
  deleteCart,

  // Users
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,

  // Auth
  login,

  // Helpers
  formatPrice,
  calculateCartTotal,
  filterByMaxPrice,
  sortByPrice,
  searchProducts,
};
