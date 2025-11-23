import React, { useState } from 'react';
import './AddListingDialog.css';

function AddListingDialog({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    seller: '',
    address: '',
    price: '',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddImage = () => {
    setForm({ ...form, images: [...form.images, ''] });
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...form.images];
    updatedImages[index] = value;
    setForm({ ...form, images: updatedImages });
  };

  const handleSubmit = () => {
    onAdd({
      ...form,
      price: Number(form.price),
      categoryClass: form.category.toLowerCase(),
    });
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2>Add New Listing</h2>

        <input name="title" placeholder="Title" onChange={handleChange} />
        <input name="category" placeholder="Category" onChange={handleChange} />
        <input name="seller" placeholder="Seller Name" onChange={handleChange} />
        <input name="address" placeholder="Pick-up Address" onChange={handleChange} />
        <input name="price" placeholder="Price" type="number" onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />

        <h4>Images (paste URLs)</h4>
        {form.images.map((img, index) => (
          <input
            key={index}
            value={img}
            onChange={(e) => handleImageChange(index, e.target.value)}
            placeholder={`Image URL ${index + 1}`}
          />
        ))}
        <button onClick={handleAddImage}>+ Add Image</button>

        <div className="dialog-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Add Listing</button>
        </div>
      </div>
    </div>
  );
}

export default AddListingDialog;
