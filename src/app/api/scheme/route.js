"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SchemeDetailPage() {
  const params = useParams();
  const code = params.code;

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState({});
  const [sipAmount, setSipAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [sipResult, setSipResult] = useState(null);

  // Fetch scheme metadata
  useEffect(() => {
    async function fetchScheme() {
      try {
        const res = await fetch(`/api/scheme/${code}`);
        const data = await res.json();
        setScheme(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScheme();
  }, [code]);

  // Fetch 1m,3m,6m,1y returns
  useEffect(() => {
    async function fetchReturns() {
      const periods = ["1m", "3m", "6m", "1y"];
      const results = {};
      for (const p of periods) {
        const res = await fetch(`/api/scheme/${code}/returns?period=${p}`);
        results[p] = await res.json();
      }
      setReturns(results);
    }
    fetchReturns();
  }, [code]);

  // Handle SIP submit
  const handleSIP = async () => {
    try {
      const res = await fetch(`/api/scheme/${code}`, {
        method: "POST",
        body: JSON.stringify({
          amount: sipAmount,
          frequency,
          from: startDate,
          to: endDate,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setSipResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !scheme) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Prepare NAV chart (last 1 year)
  const chartData = scheme.data
    .map((d) => ({ date: d.date, nav: parseFloat(d.nav) }))
    .reverse()
    .slice(-365);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">{scheme.meta.scheme_name}</Typography>
          <Typography>Fund House: {scheme.meta.fund_house}</Typography>
          <Typography>Category: {scheme.meta.scheme_category}</Typography>
          <Typography>Type: {scheme.meta.scheme_type}</Typography>
        </CardContent>
      </Card>

      {/* NAV Chart */}
      <Card sx={{ mb: 3, p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          NAV Chart (Last 1 Year)
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={false} />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="nav" stroke="#ff9800" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Returns Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Returns
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Simple Return %</TableCell>
                <TableCell>Annualized Return %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {["1m", "3m", "6m", "1y"].map((p) => (
                <TableRow key={p}>
                  <TableCell>{p}</TableCell>
                  <TableCell>
                    {returns[p]?.simpleReturn
                      ? returns[p].simpleReturn.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {returns[p]?.annualizedReturn
                      ? returns[p].annualizedReturn.toFixed(2)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SIP Calculator */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          SIP Calculator
        </Typography>
        <TextField
          label="SIP Amount"
          type="number"
          value={sipAmount}
          onChange={(e) => setSipAmount(Number(e.target.value))}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Frequency"
          select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ mr: 2, mb: 2 }}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </TextField>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2, mb: 2 }}
        />
        <br />
        <Button variant="contained" onClick={handleSIP}>
          Calculate Returns
        </Button>

        {sipResult && sipResult.status === "ok" && (
          <Card sx={{ mt: 3, p: 2 }}>
            <Typography>Total Invested: ₹{sipResult.totalInvested.toFixed(2)}</Typography>
            <Typography>Current Value: ₹{sipResult.currentValue.toFixed(2)}</Typography>
            <Typography>Absolute Return: {sipResult.absoluteReturn.toFixed(2)}%</Typography>
            <Typography>Annualized Return: {sipResult.annualizedReturn.toFixed(2)}%</Typography>
          </Card>
        )}
        {sipResult && sipResult.status === "needs_review" && (
          <Typography color="error">⚠️ {sipResult.reason}</Typography>
        )}
      </Card>
    </Container>
  );
}
