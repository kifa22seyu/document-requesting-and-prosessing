import React from "react";
import Pay from "./pay";

function Chapapayment() {
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [amount, setAmount] = React.useState("");

  const tx_ref = `${fname}-tx-2752025`;
  const public_key = "CHAPUBK_TEST-3Ar3yapaLX6mzbA0RVXIcc94aqzzgEaL";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Payment Gateway
              </h1>
              <p className="text-gray-600 mt-2">Secure payment processing with Chapa</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              {amount && (
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Amount to pay:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {parseFloat(amount).toLocaleString('en-US')} ETB
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Transaction ID: {tx_ref}
                  </div>
                </div>
              )}

              <Pay 
                public_key={public_key} 
                tx_ref={tx_ref} 
                amount={amount} 
                email={email} 
                fname={fname} 
                lname={lname} 
              />

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={() => {
                  if (amount && email && fname) {
                    document.querySelector('form[action="https://api.chapa.co/v1/hosted/pay"]').submit();
                  } else {
                    alert("Please fill all required fields");
                  }
                }}
              >
                Proceed to Payment
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>Secured by Chapa Payment Gateway</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chapapayment;