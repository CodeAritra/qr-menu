import { useEffect, useState } from "react";
import { useMenu } from "../../context/useMenu";
import { useParams } from "react-router-dom";

export default function Order() {
  const { cafeId } = useParams();
  const [orders, setOrders] = useState([]);
  const { listenOrders, updateOrderStatus } = useMenu();

  useEffect(() => {
    const unsub = listenOrders(cafeId, setOrders);
    return () => unsub();
  }, [cafeId, listenOrders]);

  // useEffect(() => {
  //   console.log("orders = ", orders);
  // }, [orders]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Orders Dashboard</h1>

      {orders.length === 0 ? (
        <div className="alert shadow-lg bg-base-200">
          <span>No orders yet...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="card bg-base-100 shadow-xl border border-base-300"
            >
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="card-title">
                      🧾 Name - {order.customerName}
                    </h2>
                    <h2 className="card-title">
                      🧾 Table no - {order.tableNo}
                    </h2>
                    <h2 className="card-title">🧾 Order date - {order.date}</h2>
                    <h2 className="card-title">🧾 Order time - {order.time}</h2>
                  </div>

                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items list */}
                <ul className="mt-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center p-2 bg-base-200 rounded-lg"
                    >
                      <span>
                        {item.qty || 1} × {item.name}
                      </span>
                      <span className="font-semibold">₹{item.price}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4">
                  <p className="font-bold text-lg">
                    💰 Total: ₹{order.totalAmount}
                  </p>

                  <div className="join">
                    {order.status === "pending" && (
                      <button
                        className="btn btn-sm btn-info join-item"
                        onClick={() => updateOrderStatus(cafeId,order.orderId, "completed")}
                      >
                        Mark Completed
                      </button>
                    )}
                    {order.status === "completed" && (
                      <button
                        className="btn btn-sm btn-success join-item"
                        disabled
                      >
                        ✅ Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
