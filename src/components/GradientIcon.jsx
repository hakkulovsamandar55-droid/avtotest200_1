import React from "react";
import logo from "../assets/brand/logo.jpg";

// Logotip — PravaOl rasmiy brend belgisi. Ilova ochilganda (LoginScreen'da)
// va ilova yuklanishini kutish holatida shu logotip ko'rsatiladi.
export default function GradientIcon({ size = 96 }) {
  return (
    <img
      src={logo}
      alt="PravaOl"
      width={size}
      height={size}
      className="rounded-2xl border border-line object-cover"
      style={{ width: size, height: size }}
    />
  );
}
