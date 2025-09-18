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
      <h2 className="text-xl font-bold mb-4">📜 Order History</h2>

      {history.length === 0 ? (
        <div className="text-gray-500">No past history yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
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
                  <td>{order.customerName || "Guest"}</td>
                  <td>{order.tableNo || "-"}</td>
                  <td>
                    <ul className="list-disc list-inside text-sm">
                      {order.items.map((i, idx) => (
                        <li key={idx}>
                          {i.name} × {i.qty || 1} = ₹{i.price * (i.qty || 1)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="font-bold">₹{order.totalAmount}</td>
                  <td>
                    {new Date(order.createdAt.seconds * 1000).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </td>
                  <td>
                    {new Date(order.updatedAt.seconds * 1000).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
