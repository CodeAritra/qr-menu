import { useEffect, useState } from "react";
import { useMenu } from "../context/useMenu";
import { useParams } from "react-router-dom";

export default function ViewMenu() {
  const { menu, loading, updateItem, deleteItem, user, cafe, fetchCafe } =
    useMenu();
  const [editItem, setEditItem] = useState(null);

  const { cafeName, cafeId } = useParams();

  useEffect(() => {
    if (!cafeId) return; // only run on customer pages
    console.log("Cafe id ", cafeId);

    fetchCafe(cafeId, cafeName);
  }, [fetchCafe, cafeId, cafeName]);

  useEffect(() => {
    console.log("user == ", user);
    console.log("menu == ", menu);
    console.log("cafe == ", cafe);
  }, [user, menu, cafe]);

  if (loading) return <div className="p-4 text-center">Loading menu...</div>;

  return (
    <div className="overflow-x-auto p-3">
      {Object.values(menu).map((section) => (
        <div key={section.category} className="mb-8">
          {/* Category Heading */}
          <h2 className="text-2xl font-bold mb-4">{section.category}</h2>

          {/* Items inside category */}
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-white cursor-pointer"
                onClick={() =>
                  setEditItem({
                    userId: user?.uid || cafe?.ownerId,
                    category: section.category,
                    ...item,
                  })
                }
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.available ? "Available ✅" : "Not Available ❌"}
                  </p>
                </div>
                <span className="font-semibold">₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* --- Admin Edit Modal --- */}
      {user && editItem && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Edit Item</h3>
              <button
                className="btn btn-outline btn-error"
                onClick={() => {
                  deleteItem(editItem.userId,editItem.category, editItem.id);
                  setEditItem(null);
                }}
              >
                Delete
              </button>
            </div>

            <div>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
                className="input input-bordered w-full mt-2"
              />
              <input
                type="number"
                value={editItem.price}
                onChange={(e) =>
                  setEditItem({ ...editItem, price: Number(e.target.value) })
                }
                className="input input-bordered w-full mt-2"
              />
              <label className="label cursor-pointer mt-3">
                <span className="label-text">Available</span>
                <input
                  type="checkbox"
                  checked={editItem.available}
                  onChange={(e) =>
                    setEditItem({ ...editItem, available: e.target.checked })
                  }
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateItem(editItem.userId,editItem.category, editItem);
                  setEditItem(null);
                }}
              >
                Save
              </button>
              <button className="btn" onClick={() => setEditItem(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* --- Client Order Modal --- */}
      {!user && cafe?.serviceType === "order" && editItem && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold mb-3">Order Item</h3>

            <div className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-white">
              <p className="font-medium">{editItem.name}</p>
              <p className="text-sm text-gray-500">
                {editItem.available ? "Available ✅" : "Not Available ❌"}
              </p>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  // 👉 Hook order logic here
                  console.log("Order placed:", editItem);
                  setEditItem(null);
                }}
              >
                Order
              </button>
              <button className="btn" onClick={() => setEditItem(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
