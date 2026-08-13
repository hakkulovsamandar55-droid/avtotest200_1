import React from "react";
import logo from "../assets/brand/logo.png";

// Logotip — PravaOl rasmiy brend belgisi. Chetlari yumshoq qayrilgan
// to'rtburchak shakli tasvirning o'ziga singdirilgan (shaffof fon), shu
// sababli qo'shimcha rounded/border qo'llash shart emas. Ilova ochilganda
// (LoginScreen'da) va ilova yuklanishini kutish holatida shu logotip
// ko'rsatiladi.
export default function GradientIcon({ size = 96 }) {
  return (
    <img
      src={logo}
      alt="PravaOl"
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
