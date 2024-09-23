"use client";

import { useEffect, useState } from "react";
import { getTopic } from "@/lib/Salesforce";

type Props = {};

export default function Scratch() {
  const [data, setData] = useState();

  return (
    <>
      <div>Scratch page for Developers 😝</div>
    </>
  );
}
