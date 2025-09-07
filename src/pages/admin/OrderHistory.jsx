import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const { cafeId } = useParams();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "cafes", cafeId), (snap) => {
      if (snap.exists()) {
        setOrders(snap.data().orderHistory || []);
      }
    });
    return () => unsub();
  }, [cafeId]);

  useEffect(() => {
    console.log("orders = ", orders);
  }, [orders]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📜 Order History</h2>

      {orders.length === 0 ? (
        <div className="text-gray-500">No past orders yet.</div>
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
              </tr>
            </thead>
            <tbody>
              {orders
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                )
                .map((order) => (
                  <tr key={order.orderId}>
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
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      {new Date(order.updatedAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
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
