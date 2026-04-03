import React from "react";
import { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import axios from "axios";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id: deleteConfirm.id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      {list.length === 0 ? (
        <div className="py-16 text-center text-gray-600">
          <p className="text-lg font-medium mb-2">No products found</p>
          <p className="text-sm">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* -------- List Table Title --------- */}

          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Action</b>
          </div>
          {/* -------Product List---------- */}
          {list.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              key={index}
            >
              <img src={item.image[0]} alt={item.name} className="w-12 h-12 object-cover" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <div className="flex flex-wrap items-center gap-2">
                {item.saleApplied && item.finalPrice && item.finalPrice !== item.price ? (
                  <>
                    <span className="font-medium text-gray-900">
                      {currency}{Number(item.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-400 line-through text-xs">
                      {currency}{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    {item.saleDiscountPercentage > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded">
                        {item.saleDiscountPercentage}% OFF
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-medium">
                    {currency}{Number(item.price || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteClick(item._id, item.name)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                title="Delete product"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Product?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete <b>"{deleteConfirm.name}"</b>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
