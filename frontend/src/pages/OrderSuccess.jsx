import { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";

const OrderSuccess = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const state = location.state || {};

  const orderMeta = useMemo(() => {
    const fallbackCode = `SN${Date.now().toString().slice(-10)}`;
    return {
      orderId: state.orderId || fallbackCode,
      amount: typeof state.amount === "number" ? state.amount : null,
      date: state.date ? new Date(state.date) : new Date(),
      customer: state.cardHolder || user?.name || "ShopNext Customer",
      last4: state.last4Digits || "",
      barcode: state.barcodeValue || `289372${Date.now().toString().slice(-8)}`,
    };
  }, [state, user]);

  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center px-4 py-12">
      
      <AnimatedTicket
        ticketId={orderMeta.orderId}
        amount={orderMeta.amount}
        date={orderMeta.date}
        cardHolder={orderMeta.customer}
        last4Digits={orderMeta.last4}
        barcodeValue={orderMeta.barcode}
        title="Payment Successful!"
        subtitle="Thank you for your order. We are preparing your shipment."
        idLabel="Order ID"
        footer={
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/shop" className="btn flex-1 text-center">
              Continue Shopping
            </Link>
            <Link
              to="/profile"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f9fafb] transition-colors"
            >
              View Orders
            </Link>
          </div>
        }
      />
    </div>
  );
};

export default OrderSuccess;
