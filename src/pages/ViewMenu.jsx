import React, { useEffect, useRef, useState } from "react";
import { useMenu } from "../context/useMenu";
import { useCart } from "../context/useCart";
import { useParams } from "react-router-dom";

export default function ViewMenu() {
  const { menu, loading, updateItem, deleteItem, user, fetchCafe } = useMenu();
  const { addToCart } = useCart();
  const [editItem, setEditItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [headerHeight, setHeaderHeight] = useState(0); // 👈 track dynamic height

  const { cafeName, cafeId } = useParams();
  const sectionRefs = useRef({});

  // Extract categories & attach refs
  useEffect(() => {
    if (menu && menu.length > 0) {
      const extracted = [...new Set(menu.map((section) => section.name))];
      setCategories(extracted);
      setActiveCategory(extracted[0]);

      extracted.forEach((name) => {
        if (!sectionRefs.current[name]) {
          sectionRefs.current[name] = React.createRef();
        }
      });
    }
  }, [menu]);

  // Measure sticky-header height dynamically
  useEffect(() => {
    const stickyHeader = document.querySelector(".sticky-header");
    if (stickyHeader) {
      const resizeObserver = new ResizeObserver(() => {
        setHeaderHeight(stickyHeader.offsetHeight);
      });
      resizeObserver.observe(stickyHeader);
      setHeaderHeight(stickyHeader.offsetHeight);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Intersection Observer → update activeCategory on scroll
  useEffect(() => {
    if (!categories.length) return;

    const categoryRow = document.querySelector(".category-row");
    const totalOffset =
      (document.querySelector(".sticky-header")?.offsetHeight || 0) +
      (categoryRow?.offsetHeight || 0);

    const observer = new IntersectionObserver(
      (entries) => {
        let visibleEntry = entries.find((e) => e.isIntersecting);
        if (visibleEntry) {
          setActiveCategory(visibleEntry.target.dataset.category);
        }
      },
      {
        root: null, // window scrolling
        rootMargin: `-${totalOffset}px 0px -60% 0px`,
        threshold: 0.1,
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [categories, headerHeight]);

  // Handle category click → scroll to section
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const ref = sectionRefs.current[cat];
    if (ref?.current) {
      const stickyHeader = document.querySelector(".sticky-header");
      const categoryRow = document.querySelector(".category-row");

      const totalHeaderHeight =
        (stickyHeader?.offsetHeight || 0) + (categoryRow?.offsetHeight || 0);

      const itemTop = ref.current.getBoundingClientRect().top + window.scrollY;
      const scrollOffset = itemTop - totalHeaderHeight;

      window.scrollTo({ top: scrollOffset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (cafeId) {
      fetchCafe(cafeId, cafeName);
    }
  }, [fetchCafe, cafeId, cafeName]);

  if (loading) return <div className="p-4 text-center">Loading menu...</div>;

  return (
    <div className="flex-1 flex-col bg-base-100">
      {/* Sticky Category Row */}
      <div
        className="category-row flex gap-4 overflow-x-auto p-3 shadow-sm no-scrollbar sticky z-10 bg-base-100 border-b"
        style={{ top: `${headerHeight}px` }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            className={`flex flex-col items-center px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-purple-100 text-primary font-semibold"
                : "bg-base-100"
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            <span className="text-sm">{cat}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Menu Sections */}
      <div id="menu-scroll" className="flex-1 p-2 space-y-6 ">
        {menu?.map((section) => (
          <div
            key={section.name}
            ref={sectionRefs.current[section.name]}
            data-category={section.name}
            style={{
              scrollMarginTop: "calc(80px + env(safe-area-inset-top))",
            }}
          >
            <details
              open
              className="collapse collapse-arrow bg-base-100 shadow-sm"
            >
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

      {/* ✅ Admin Edit Modal */}
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
