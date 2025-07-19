import { useEffect, useState } from "react";

export default function Tile({ letter, status,className }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (status) {
      const timeout = setTimeout(() => setFlipped(true), 50);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  return (
    <div className={`tile ${status} ${flipped ? "flip" : ""} ${className}`}>
      {letter}
    </div>
  );
}