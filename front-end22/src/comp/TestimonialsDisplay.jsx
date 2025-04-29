import React from 'react';

const TestimonialsDisplay = ({ testimonials }) => {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Recent Testimonials
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.img}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <h6 className="font-bold text-sm uppercase text-gray-600 ml-3">
                  {testimonial.name}
                </h6>
              </div>
              <p className="text-sm leading-tight italic text-gray-600">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsDisplay;