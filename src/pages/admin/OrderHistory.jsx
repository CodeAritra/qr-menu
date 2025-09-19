import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useOrder } from "../../context/useOrder";

export default function OrderHistory() {
  const [history, setHistory] = useState([]);
  const { cafeId } = useParams();
  const { listenOrderHistory } = useOrder();

  useEffect(() => {
    if (!cafeId) return;
    const unsub = listenOrderHistory(cafeId, setHistory);
    return () => unsub(); // cleanup
  }, [cafeId, listenOrderHistory]);

  /*useEffect(() => {
    console.log("History = ", history);
  }, [history]);*/

  return (
    <div className="p-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center sm:text-left">
        Order History
      </h2>

      {history.length === 0 ? (
        <div className="text-gray-500 text-center sm:text-left">
          No past history yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-sm sm:text-base">
            {/* head */}
            <thead>
              <tr>
                <th>Customer</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Order At</th>
                <th>Completed At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap">
                    {order.customerName || "Guest"}
                  </td>
                  <td className="whitespace-nowrap">{order.tableNo || "-"}</td>
                  <td>
                    <ul className="list-disc list-inside text-xs sm:text-sm">
                      {order.items.map((i, idx) => (
                        <li key={idx} className="whitespace-nowrap">
                          {i.name} × {i.qty || 1} = ₹{i.price * (i.qty || 1)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="font-bold whitespace-nowrap">
                    ₹{order.totalAmount}
                  </td>
                  <td className="whitespace-nowrap">
                    {new Date(order.createdAt.seconds * 1000).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    {new Date(order.updatedAt.seconds * 1000).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "completed"
                          ? "badge-success"
                          : order.status === "cancelled"
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
