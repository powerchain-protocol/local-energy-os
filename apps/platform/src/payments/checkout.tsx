"use client";
import { PaymentForm } from "./payment-form";
export function Checkout() { return <PaymentForm onCheckout={async(input)=>{const response=await fetch("/api/v1/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});if(!response.ok)throw new Error("Checkout failed");}}/>; }
