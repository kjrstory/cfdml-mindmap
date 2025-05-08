// src/App.tsx
import { useEffect, useState } from "react";

interface Row {
  Method: string;
  Year: number;
  Source: string;
  Backbone: string;
}

function App() {
  const [data, setData] = useState<Row[]>([]);
  useEffect(() => {
    fetch("/assets/data.json")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{padding:20}}>
      <h1>CFD Surrogate Dashboard</h1>
      <ul>
        {data.map(r => (
          <li key={r.Method}>
            {r.Method} ({r.Year}) – {r.Source} [{r.Backbone}]
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
