/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useMenu } from "../context/useMenu";
import { useCart } from "../context/useCart";
import { useParams } from "react-router-dom";

export default function ViewMenu() {
  const { menu, loading, updateItem, deleteItem, user, cafe, fetchCafe } =
    useMenu();
  const { addToCart } = useCart();
  const [editItem, setEditItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  const { cafeName, cafeId } = useParams();

  // console.log("menu = ",menu);

  const sectionRefs = useRef({});

  // Attach refs dynamically
  useEffect(() => {
    menu.forEach((section) => {
      if (!sectionRefs.current[section.name]) {
        sectionRefs.current[section.name] = React.createRef();
      }
      if (menu && menu.length > 0) {
      // Extract only section names
      const extracted = [...new Set(menu.map((section) => section.name))];
      setCategories(extracted);
      setActiveCategory(extracted[0]); // Default first category active
    }
    });
  }, [menu]);

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0.1 } // middle of screen
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [menu]);

  // Scroll to section when clicking category
  const handleCategoryClick = (cat) => {
    const ref = sectionRefs.current[cat];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  console.log("categories = ", categories);

  useEffect(() => {
    if (!cafeId) return;
    fetchCafe(cafeId, cafeName);
  }, [fetchCafe, cafeId, cafeName]);

  if (loading) return <div className="p-4 text-center">Loading menu...</div>;

  return (
    <div className="flex flex-col overflow-y-auto h-screen bg-base-100">
      {/* Category Row */}
         <div className="flex gap-4 overflow-x-auto p-3 shadow-sm no-scrollbar sticky top-0 z-20 bg-base-100">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`flex flex-col items-center px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-orange-100 text-orange-600 font-semibold"
                : "bg-base-100"
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            <span className="text-sm">{cat}</span>
          </button>
        ))}
      </div>

      {/* Menu Sections */}
      <div className="flex-1 p-2 space-y-6">
        {menu?.map((section) => (
          <div
            key={section.name}
            ref={sectionRefs.current[section.name]}
            data-category={section.name}
            className="scroll-mt-20" // padding offset for sticky header
          >
            <details open className="collapse collapse-arrow bg-base-100 shadow-sm">
              <summary className="collapse-title font-bold text-lg">
                {section.name} ({section.items.length})
              </summary>
              <div className="collapse-content space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-base-100 p-4 rounded-lg border shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">₹ {item.price}</p>
                    </div>
                    {!user ? (
                      <button
                        className="btn btn-sm btn-outline btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        + Add
                      </button>
                    ) : (
                      <span
                        className={`badge ${
                          item.available ? "badge-success" : "badge-error"
                        }`}
                      >
                        {item.available ? "Available" : "Not Available"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>

      {/* --- Admin Edit Modal --- */}
      {user && editItem && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Edit Item</h3>
              <button
                className="btn btn-outline btn-error"
                onClick={() => {
                  deleteItem(editItem.userId, editItem.category, editItem.id);
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
                  updateItem(editItem.userId, editItem.category, editItem);
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
