import { useState } from "react";
import { useMenu } from "../../context/useMenu"; // to get cafe info
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [customerName, setCustomerName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const { cafeId, cafeName } = useParams();
  const {
    placeOrder,
    clearCart,
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalAmount,
    loading,
    setLoading,
  } = useMenu();

  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    try {
      await placeOrder(cafeId, cart, true, customerName, tableNo);

      toast.success("Order placed!");
      clearCart();
      localStorage.removeItem("cart");
      navigate(`/${cafeName}/${cafeId}`);
    } catch (err) {
      console.error("🔥 Checkout error:", err);
      toast.error("Failed to place order!");
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
          <div className="form-control mb-3">
            <label className="label">Customer Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="input input-bordered"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">Table No.</label>
            <input
              type="text"
              placeholder="Enter table number"
              className="input input-bordered"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
            />
          </div>

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
                  onClick={() => removeFromCart(item.id)}
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
