import { useEffect, useState } from "react";
import { useOrder } from "../../context/useOrder";
import { useParams } from "react-router-dom";

export default function Order() {
  const { cafeId } = useParams();
  const [orders, setOrders] = useState([]);
  const { listenOrders, completeOrder, dismissBadge } = useOrder();

  useEffect(() => {
    const unsub = listenOrders(cafeId, setOrders);
    return () => unsub();
  }, [cafeId, listenOrders]);

  /*useEffect(() => {
     console.log("orders = ", orders);
   }, [orders]);*/

  /*const handleItemClick = (orderId, itemName) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) =>
          item.name === itemName ? { ...item, isNew: false } : item
        );

        return { ...order, items: updatedItems };
      })
    );
  };*/

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
              key={order.id}
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
                    <h2 className="card-title">
                      🧾 Order at -{" "}
                      {order.createdAt
                        ? new Date(
                            order.createdAt.seconds * 1000
                          ).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </h2>
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
                      onClick={() =>
                        dismissBadge(cafeId, order.id, item.name)
                      } // mark as seen
                    >
                      <span>
                        {item.qty || 1} × {item.name}
                      </span>
                      {item.isNew && (
                        <span className="badge badge-warning ml-2">NEW</span>
                      )}
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
                      <div className="">
                        <button
                          className="btn btn-sm btn-info join-item mr-2"
                          onClick={() =>
                            completeOrder(cafeId, order.id, "completed")
                          }
                        >
                          Mark Completed
                        </button>
                        <button
                          className="btn btn-sm btn-error join-item"
                          onClick={() =>
                            completeOrder(cafeId, order.id, "cancelled")
                          }
                        >
                          Cancel
                        </button>
                      </div>
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
