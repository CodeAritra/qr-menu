import { useState, useEffect } from "react";
import { useMenu } from "../../context/useMenu"; // to get cafe info
import { useParams } from "react-router-dom";

export default function Cart() {
  const [customerName, setCustomerName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const { cafeId } = useParams();
  const { placeOrder } = useMenu(); // ✅ so we know cafeId & name
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  // --- Sync with localStorage ---
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    try {
      await placeOrder(cafeId, cart, true);

      alert("✅ Order placed!");
      setCart([]);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error("🔥 Checkout error:", err);
      alert("Failed to place order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <div className="alert shadow-lg bg-base-200">
          <span>Cart is empty...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow-md border border-base-300"
            >
              <div className="card-body flex-row justify-between items-center">
                <div>
                  <h2 className="card-title">{item.name}</h2>
                  <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => decreaseQty(item.id)}
                  >
                    -
                  </button>
                  <span className="px-2">{item.qty}</span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => increaseQty(item.id)}
                  >
                    +
                  </button>
                </div>

                <p className="font-bold">₹{item.price * item.qty}</p>

                <button
                  className="btn btn-sm btn-error"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Total + Checkout */}
          <div className="card bg-base-100 shadow-lg border border-base-300 mt-6">
            <div className="card-body flex justify-between items-center">
              <h2 className="text-xl font-bold">Total: ₹{totalAmount}</h2>
              <button
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Placing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
