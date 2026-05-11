import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ---------- MOCK DATA ----------
function generateMockData() {
  const industries = ["Metal", "Food", "Chemicals", "Machinery"];
  return Array.from({ length: 50 }, (_, i) => ({
    Company_Name: "Company " + (i + 1),
    City: "City",
    County: ["Cook", "DuPage", "Lake"][i % 3],
    Latitude: 41.5 + Math.random(),
    Longitude: -88 + Math.random(),
    Revenue_History: Array.from({ length: 10 }, () => Math.random() * 1000000),
    Profit_History: Array.from({ length: 10 }, () => Math.random() * 200000),
    Employee_Count: Math.floor(Math.random() * 500),
    Industry_Domain: industries[i % industries.length],
  }));
}

// ---------- COMPONENT ----------
export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateMockData());
  }, []);

  const latestRevenue = (d) => d.Revenue_History[9];

  const totalRevenueTrend = useMemo(() => {
    const years = Array.from({ length: 10 }, (_, i) => 2016 + i);
    return years.map((year, idx) => ({
      year,
      revenue: data.reduce((sum, d) => sum + d.Revenue_History[idx], 0),
    }));
  }, [data]);

  const industryDist = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.Industry_Domain] = (map[d.Industry_Domain] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Illinois Manufacturing Intelligence Dashboard</h1>

      {/* MAP */}
      <div style={{ height: 400, marginBottom: 30 }}>
        <MapContainer center={[41.8, -89]} zoom={6} style={{ height: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data.map((d, i) => (
            <CircleMarker
              key={i}
              center={[d.Latitude, d.Longitude]}
              radius={5 + d.Employee_Count / 100}
            >
              <LeafletTooltip>
                <div>
                  <b>{d.Company_Name}</b><br />
                  Employees: {d.Employee_Count}<br />
                  Revenue: {latestRevenue(d).toFixed(0)}
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* LINE CHART */}
      <h3>Revenue Trend</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={totalRevenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line dataKey="revenue" stroke="blue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PIE */}
      <h3>Industry Distribution</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={industryDist} dataKey="value" outerRadius={100}>
              {industryDist.map((entry, i) => (
                <Cell key={i} fill={`hsl(${i * 60},70%,50%)`} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BAR */}
      <h3>Employees by Company</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data.slice(0, 10)}>
            <XAxis dataKey="Company_Name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Employee_Count" fill="green" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
