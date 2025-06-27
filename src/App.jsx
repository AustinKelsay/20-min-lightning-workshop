import React, { useEffect, useState } from "react";
import { getInfo, getBalances, createInvoice, payInvoice } from "./lib/lnd";
import "./App.css";

export default function App() {
  const [info, setInfo] = useState({});
  const [lightningBalance, setLightningBalance] = useState(null);
  const [inbound, setInbound] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [paymentRequest, setPaymentRequest] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);



  const fetchInfo = async () => {
    try {
      const fetchedInfo = await getInfo();
      console.log(fetchedInfo);
      setInfo(fetchedInfo);
    } catch (error) {
      console.error("Error fetching LND info:", error);
    }
  };

  const fetchBalances = async () => {
    try {
      const fetchedBalance = await getBalances();
      setLightningBalance(fetchedBalance.local_balance.sat);
      setInbound(fetchedBalance.remote_balance.sat);
    } catch (error) {
      console.error("Error fetching Lightning balances:", error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const createdInvoice = await createInvoice(parseInt(invoiceAmount));
      console.log(createdInvoice);
      setInvoice(createdInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };
  const handlePayInvoice = async () => {
    try {
      const paymentResponse = await payInvoice(paymentRequest);
      console.log(paymentResponse);
      if (paymentResponse.payment_preimage) {
        setPaymentResponse(
          `Payment successful! Payment preimage: ${paymentResponse.payment_preimage}`
        );
      } else {
        setPaymentResponse(
          `Payment failed. Error: ${paymentResponse.payment_error}`
        );
      }
    } catch (error) {
      console.error("Error paying invoice:", error);
      setPaymentResponse(`Error: ${error.message}`);
    }
  };


  useEffect(() => {
    fetchInfo();

    // Set up polling for balances and Bitcoin Core stats
    const pollInterval = setInterval(() => {
      fetchBalances();
    }, 5000); // Poll every 5 seconds

    // Initial fetch for balances and Bitcoin Core stats
    fetchBalances();

    // Clean up interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <main>
      {info && info?.alias && (
        <div>
          <h1>Connected to {info.alias}</h1>
          <p>Pubkey: {info.identity_pubkey}</p>
        </div>
      )}
      {lightningBalance && inbound && (
        <div>
          <h2>Lightning Balance</h2>
          <p>Balance: {lightningBalance} sats</p>
          <p>Inbound: {inbound} sats</p>
        </div>
      )}
      {info && (
        <div>
          <h2>Create Invoice</h2>
          <input
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value)}
            placeholder="Amount in sats"
          />
          <button onClick={handleCreateInvoice}>Create Invoice</button>
        </div>
      )}
      {invoice && (
        <div>
          <h2>Created Invoice</h2>
          <p>Payment Request: {invoice.payment_request}</p>
        </div>
      )}
      {info && (
        <div>
          <h2>Pay Invoice</h2>
          <input
            type="text"
            value={paymentRequest}
            onChange={(e) => setPaymentRequest(e.target.value)}
            placeholder="Payment Request"
          />
          <button onClick={handlePayInvoice}>Pay Invoice</button>
        </div>
      )}
      {paymentResponse && (
        <div>
          <p>{paymentResponse}</p>
        </div>
      )}
    </main>
  );
}
