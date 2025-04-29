import React, { useState } from "react";

const TestimonialsPage = ({ addTestimonial }) => {
  const [formData, setFormData] = useState({ name: "", img: "", text: "" });

  const handleChange = (e) => {
    if (e.target.name === "img") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, img: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.img && formData.text) {
      const newTestimonial = { ...formData, id: Date.now() };
      addTestimonial(newTestimonial); // Pass the new testimonial to the parent
      setFormData({ name: "", img: "", text: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-5">
      <div className="w-full max-w-6xl bg-white border-t border-b border-gray-200 px-5 py-16 text-gray-800">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-6xl font-bold mb-5 text-gray-600">What people are saying.</h1>
          <h3 className="text-xl mb-5 font-light">Submit your testimonial below.</h3>
        </div>

        <form className="mb-10 max-w-lg mx-auto bg-white p-5 border border-gray-200 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full mb-3 p-2 border rounded" required />
          <input type="file" name="img" accept="image/*" onChange={handleChange} className="w-full mb-3 p-2 border rounded" required />
          <textarea name="text" placeholder="Your Testimonial" value={formData.text} onChange={handleChange} className="w-full mb-3 p-2 border rounded" required></textarea>
          <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsPage;