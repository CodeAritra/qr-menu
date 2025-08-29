import { useState } from "react";

export default function MenuTable({
  menu,
  updateItem,
  deleteItem,
  showQR,
  user,
  pro,
}) {
  const [editItem, setEditItem] = useState(null);

  return (
    <div className="overflow-x-auto p-3">
      <div className="">
        {menu.map((section) => (
          <div key={section.category} className="mb-8">
            {/* Category Heading */}
            <h2 className="text-2xl font-bold mb-4">{section.category}</h2>

            {/* Items inside category */}
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-white"
                  onClick={() => setEditItem(item)}
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
      </div>

      {/*Admin Edit Modal */}
      {user && editItem && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Edit Item</h3>
              <button
                className="btn btn-outline btn-error"
                onClick={() => deleteItem(editItem)}
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
                  setEditItem({ ...editItem, price: e.target.value })
                }
                className="input input-bordered w-full mt-2"
              />
              <select
                value={editItem.category}
                onChange={(e) =>
                  setEditItem({ ...editItem, category: e.target.value })
                }
                className="select select-bordered w-full mt-2"
              >
                <option disabled>Select Category</option>
                {menu.map((section) => (
                  <option key={section.category} value={section.category}>
                    {section.category}
                  </option>
                ))}
              </select>
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
                  updateItem(editItem);
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

      {/* client order modal */}
      {!user && editItem && pro && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Order Item</h3>
            </div>

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
                  updateItem(editItem);
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
    </div>
  );
}
