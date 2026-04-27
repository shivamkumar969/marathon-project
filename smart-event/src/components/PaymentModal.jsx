import React, { useState, useEffect } from "react";

function PaymentModal({ amount, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setStep(2); // Processing
    
    // Simulate network request to payment gateway
    setTimeout(() => {
      setStep(3); // Success
      
      // Close and trigger success callback after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none"></div>

        {step === 1 && (
          <div className="relative z-10 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Secure Checkout</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-3xl font-black text-white">₹{amount}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xl shadow-inner shadow-indigo-500/50">
                🔒
              </div>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-slate-800 rounded-xl">
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setPaymentMethod('card')}
              >
                Card
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'upi' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              {paymentMethod === 'card' ? (
                <>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1">Card Number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" required maxLength={19} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs font-semibold mb-1">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" required maxLength={5} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs font-semibold mb-1">CVV</label>
                      <input type="password" placeholder="•••" required maxLength={3} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1">Cardholder Name</label>
                    <input type="text" placeholder="John Doe" required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">UPI ID</label>
                  <input type="text" placeholder="username@upi" required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  <p className="text-xs text-slate-500 mt-2">Open your UPI app to approve the payment request after clicking Pay Now.</p>
                </div>
              )}

              <button type="submit" className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]">
                Pay ₹{amount} Now
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-12 relative z-10 animate-fadeIn">
            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
            <p className="text-slate-400 text-sm">Please do not close this window or press back.</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-12 relative z-10 animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <span className="text-emerald-400 text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">Payment Successful!</h3>
            <p className="text-slate-400 text-sm">Your registration is confirmed.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentModal;
