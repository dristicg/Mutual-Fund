"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Chip,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';

const formatNumber = (num) => num ? num.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0';

export default function FundDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const schemeCode = params.schemeCode;

  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculatorTab, setCalculatorTab] = useState(0);
  const [returns, setReturns] = useState({ '1m': 0, '3m': 0, '6m': 0, '1y': 0 });
  const [navPeriod, setNavPeriod] = useState('1y');

  // SIP State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipFrequency, setSipFrequency] = useState("monthly");
  const [sipStartDate, setSipStartDate] = useState("2021-01-01");
  const [sipEndDate, setSipEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sipResult, setSipResult] = useState(null);
  const [sipCalculating, setSipCalculating] = useState(false);

  // Lumpsum State
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumStartDate, setLumpsumStartDate] = useState("2021-01-01");
  const [lumpsumEndDate, setLumpsumEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lumpsumResult, setLumpsumResult] = useState(null);
  const [lumpsumCalculating, setLumpsumCalculating] = useState(false);

  // SWP State
  const [swpInitial, setSwpInitial] = useState(500000);
  const [swpWithdrawal, setSwpWithdrawal] = useState(5000);
  const [swpFrequency, setSwpFrequency] = useState("monthly");
  const [swpStartDate, setSwpStartDate] = useState("2021-01-01");
  const [swpEndDate, setSwpEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [swpResult, setSwpResult] = useState(null);
  const [swpCalculating, setSwpCalculating] = useState(false);

  // Step-Up SIP State
  const [stepUpSipAmount, setStepUpSipAmount] = useState(5000);
  const [stepUpSipIncrement, setStepUpSipIncrement] = useState(10);
  const [stepUpSipFrequency, setStepUpSipFrequency] = useState("monthly");
  const [stepUpSipStartDate, setStepUpSipStartDate] = useState("2021-01-01");
  const [stepUpSipEndDate, setStepUpSipEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [stepUpSipResult, setStepUpSipResult] = useState(null);
  const [stepUpSipCalculating, setStepUpSipCalculating] = useState(false);

  // Step-Up SWP State
  const [stepUpSwpInitial, setStepUpSwpInitial] = useState(500000);
  const [stepUpSwpWithdrawal, setStepUpSwpWithdrawal] = useState(5000);
  const [stepUpSwpIncrement, setStepUpSwpIncrement] = useState(10);
  const [stepUpSwpFrequency, setStepUpSwpFrequency] = useState("monthly");
  const [stepUpSwpStartDate, setStepUpSwpStartDate] = useState("2021-01-01");
  const [stepUpSwpEndDate, setStepUpSwpEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [stepUpSwpResult, setStepUpSwpResult] = useState(null);
  const [stepUpSwpCalculating, setStepUpSwpCalculating] = useState(false);

  // Rolling Returns State
  const [rollingPeriod, setRollingPeriod] = useState("1y");
  const [rollingReturns, setRollingReturns] = useState(null);
  const [rollingCalculating, setRollingCalculating] = useState(false);

  // Fetch fund details on page load
  useEffect(() => {
    if (schemeCode) {
      const fetchFundDetails = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/scheme/${schemeCode}`);
          if (!res.ok) {
            throw new Error(`Fund not found or API error: ${res.statusText}`);
          }
          const data = await res.json();
          setFund(data);
          
          // Fetch returns data
          const returnsRes = await fetch(`/api/scheme/${schemeCode}/returns?period=1m,3m,6m,1y`);
          if (returnsRes.ok) {
            const returnsData = await returnsRes.json();
            setReturns(returnsData.returns || { '1m': 0, '3m': 0, '6m': 0, '1y': 0 });
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchFundDetails();
    }
  }, [schemeCode]);

  const handleSipCalculate = async (e) => {
    e.preventDefault();
    setSipCalculating(true);
    setSipResult(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(sipAmount),
          frequency: sipFrequency,
          from: sipStartDate,
          to: sipEndDate,
        }),
      });
      const result = await res.json();
      if (result.status === 'needs_review') throw new Error(result.reason);
      setSipResult(result);
    } catch (err) {
      setSipResult({ error: err.message });
    } finally {
      setSipCalculating(false);
    }
  };

  const handleLumpsumCalculate = async (e) => {
    e.preventDefault();
    setLumpsumCalculating(true);
    setLumpsumResult(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/lumpsum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(lumpsumAmount),
          from: lumpsumStartDate,
          to: lumpsumEndDate,
        }),
      });
      const result = await res.json();
      if (result.status === 'needs_review') throw new Error(result.reason);
      setLumpsumResult(result);
    } catch (err) {
      setLumpsumResult({ error: err.message });
    } finally {
      setLumpsumCalculating(false);
    }
  };

  const handleSwpCalculate = async (e) => {
    e.preventDefault();
    setSwpCalculating(true);
    setSwpResult(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/swp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: Number(swpInitial),
          withdrawalAmount: Number(swpWithdrawal),
          frequency: swpFrequency,
          from: swpStartDate,
          to: swpEndDate,
        }),
      });
      const result = await res.json();
      if (result.status === 'needs_review') throw new Error(result.reason);
      setSwpResult(result);
    } catch (err) {
      setSwpResult({ error: err.message });
    } finally {
      setSwpCalculating(false);
    }
  };

  const handleStepUpSipCalculate = async (e) => {
    e.preventDefault();
    setStepUpSipCalculating(true);
    setStepUpSipResult(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/step-up-sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(stepUpSipAmount),
          incrementPercentage: Number(stepUpSipIncrement),
          frequency: stepUpSipFrequency,
          from: stepUpSipStartDate,
          to: stepUpSipEndDate,
        }),
      });
      const result = await res.json();
      if (result.status === 'needs_review') throw new Error(result.reason);
      setStepUpSipResult(result);
    } catch (err) {
      setStepUpSipResult({ error: err.message });
    } finally {
      setStepUpSipCalculating(false);
    }
  };

  const handleStepUpSwpCalculate = async (e) => {
    e.preventDefault();
    setStepUpSwpCalculating(true);
    setStepUpSwpResult(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/step-up-swp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: Number(stepUpSwpInitial),
          withdrawalAmount: Number(stepUpSwpWithdrawal),
          incrementPercentage: Number(stepUpSwpIncrement),
          frequency: stepUpSwpFrequency,
          from: stepUpSwpStartDate,
          to: stepUpSwpEndDate,
        }),
      });
      const result = await res.json();
      if (result.status === 'needs_review') throw new Error(result.reason);
      setStepUpSwpResult(result);
    } catch (err) {
      setStepUpSwpResult({ error: err.message });
    } finally {
      setStepUpSwpCalculating(false);
    }
  };

  const handleRollingReturnsCalculate = async () => {
    setRollingCalculating(true);
    setRollingReturns(null);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/rolling-returns?period=${rollingPeriod}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setRollingReturns(result);
    } catch (err) {
      setRollingReturns({ error: err.message });
    } finally {
      setRollingCalculating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!fund) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">No fund data available.</Alert>
      </Container>
    );
  }

  const getNavData = () => {
    if (!fund?.data) return [];
    let days = 365;
    if (navPeriod === '6m') days = 180;
    else if (navPeriod === '3y') days = 1095;
    else if (navPeriod === '5y') days = 1825;
    else if (navPeriod === 'all') days = fund.data.length;
    
    return fund.data.slice(-days).filter((_, i) => i % 7 === 0).map(item => ({
      date: new Date(item.date.split('-').reverse().join('-')).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      nav: parseFloat(item.nav)
    }));
  };
  
  const navData = getNavData();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Fund Header */}
          <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600} color="#fff">{fund.meta.scheme_name}</Typography>
            <Typography variant="subtitle1" color="primary.light" sx={{ color: '#a5b4fc' }}>{fund.meta.fund_house}</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Category: {fund.meta.scheme_category}</Typography>
          </Paper>

          {/* NAV Chart & Returns Table */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600} color="#fff">NAV History</Typography>
                    <Box>
                      <Button size="small" onClick={() => setNavPeriod('6m')} variant={navPeriod === '6m' ? 'contained' : 'outlined'} sx={{ mr: 1 }}>6M</Button>
                      <Button size="small" onClick={() => setNavPeriod('1y')} variant={navPeriod === '1y' ? 'contained' : 'outlined'} sx={{ mr: 1 }}>1Y</Button>
                      <Button size="small" onClick={() => setNavPeriod('3y')} variant={navPeriod === '3y' ? 'contained' : 'outlined'} sx={{ mr: 1 }}>3Y</Button>
                      <Button size="small" onClick={() => setNavPeriod('5y')} variant={navPeriod === '5y' ? 'contained' : 'outlined'} sx={{ mr: 1 }}>5Y</Button>
                      <Button size="small" onClick={() => setNavPeriod('all')} variant={navPeriod === 'all' ? 'contained' : 'outlined'}>All</Button>
                    </Box>
                  </Box>
                  <Box sx={{ height: 400, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={navData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Line type="monotone" dataKey="nav" stroke="#60a5fa" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Returns Table */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="#fff">Returns</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Period</TableCell>
                          <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600 }}>Return %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(returns).map(([period, value]) => (
                          <TableRow key={period}>
                            <TableCell sx={{ fontSize: '0.95rem', color: '#e2e8f0' }}>{period.toUpperCase()}</TableCell>
                            <TableCell align="right" sx={{ color: value >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>
                              {value >= 0 ? '+' : ''}{value}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Calculator Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={calculatorTab} 
              onChange={(e, v) => setCalculatorTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<TrendingUpIcon />} label="SIP" iconPosition="start" sx={{ color: '#e2e8f0' }} />
              <Tab icon={<AccountBalanceIcon />} label="Lumpsum" iconPosition="start" sx={{ color: '#e2e8f0' }} />
              <Tab icon={<MoneyOffIcon />} label="SWP" iconPosition="start" sx={{ color: '#e2e8f0' }} />
              <Tab icon={<ShowChartIcon />} label="Step-Up SIP" iconPosition="start" sx={{ color: '#e2e8f0' }} />
              <Tab icon={<TimelineIcon />} label="Step-Up SWP" iconPosition="start" sx={{ color: '#e2e8f0' }} />
              <Tab icon={<TimelineIcon />} label="Rolling Returns" iconPosition="start" sx={{ color: '#e2e8f0' }} />
            </Tabs>
          </Paper>

          {/* SIP Calculator */}
          {calculatorTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper component="form" onSubmit={handleSipCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 80, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Typography variant="h6" mb={3} fontWeight={600} color="#fff">SIP Calculator</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Investment Amount (₹)" type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)} fullWidth required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Frequency" value={sipFrequency} onChange={e => setSipFrequency(e.target.value)} fullWidth select required>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Start Date" type="date" value={sipStartDate} onChange={e => setSipStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="End Date" type="date" value={sipEndDate} onChange={e => setSipEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" fullWidth disabled={sipCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                      {sipCalculating ? <CircularProgress size={24} /> : "Calculate Returns"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Results Section */}
            <Grid item xs={12} md={8}>
              {sipResult && !sipResult.error && (
                <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight={600} color="#fff">Calculation Results</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Invested</Typography>
                          <Typography variant="h6" fontWeight={600} color="#fff">₹{formatNumber(sipResult.totalInvested)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Current Value</Typography>
                          <Typography variant="h6" fontWeight={600} color="#fff">₹{formatNumber(sipResult.currentValue)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Gain</Typography>
                          <Typography variant="h6" sx={{ color: '#22c55e' }} fontWeight={600}>₹{formatNumber(sipResult.currentValue - sipResult.totalInvested)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Absolute Return</Typography>
                          <Typography variant="h6" fontWeight={600} color="#fff">{formatNumber(sipResult.absoluteReturn)}%</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(167, 139, 250, 0.1)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Annualized Return (CAGR)</Typography>
                          <Typography variant="h5" sx={{ color: '#a855f7' }} fontWeight={700}>{formatNumber(sipResult.annualizedReturn)}%</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom fontWeight={600} color="#fff">Investment Growth</Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sipResult.growth} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis width={80} tickFormatter={(value) => `₹${(value/1000)}k`} stroke="#94a3b8" />
                          <Tooltip formatter={(value) => `₹${formatNumber(value)}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                          <Legend />
                          <Line type="monotone" dataKey="value" name="Current Value" stroke="#60a5fa" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="invested" name="Total Invested" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}
              {sipResult && sipResult.error && (
                <Alert severity="error">{sipResult.error}</Alert>
              )}
              {!sipResult && (
                <Alert severity="info" sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)' }}>Enter your SIP details and click "Calculate Returns" to see the results.</Alert>
              )}
            </Grid>
          </Grid>
          )}

          {/* Lumpsum Calculator */}
          {calculatorTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper component="form" onSubmit={handleLumpsumCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 80, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Typography variant="h6" mb={3} fontWeight={600} color="#fff">Lumpsum Calculator</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Investment Amount (₹)" type="number" value={lumpsumAmount} onChange={e => setLumpsumAmount(e.target.value)} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Start Date" type="date" value={lumpsumStartDate} onChange={e => setLumpsumStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="End Date" type="date" value={lumpsumEndDate} onChange={e => setLumpsumEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" fullWidth disabled={lumpsumCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                        {lumpsumCalculating ? <CircularProgress size={24} /> : "Calculate Returns"}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                {lumpsumResult && !lumpsumResult.error && (
                  <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom fontWeight={600} color="#fff">Lumpsum Results</Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Invested</Typography>
                            <Typography variant="h6" fontWeight={600} color="#fff">₹{formatNumber(lumpsumResult.invested)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Current Value</Typography>
                            <Typography variant="h6" fontWeight={600} color="#fff">₹{formatNumber(lumpsumResult.currentValue)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Gain</Typography>
                            <Typography variant="h6" sx={{ color: '#22c55e' }} fontWeight={600}>₹{formatNumber(lumpsumResult.currentValue - lumpsumResult.invested)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(167, 139, 250, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>CAGR</Typography>
                            <Typography variant="h6" sx={{ color: '#a855f7' }} fontWeight={600}>{formatNumber(lumpsumResult.annualizedReturn)}%</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
                {lumpsumResult && lumpsumResult.error && (
                  <Alert severity="error">{lumpsumResult.error}</Alert>
                )}
              </Grid>
            </Grid>
          )}

          {/* SWP Calculator */}
          {calculatorTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper component="form" onSubmit={handleSwpCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 80, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Typography variant="h6" mb={3} fontWeight={600} color="#fff">SWP Calculator</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Initial Investment (₹)" type="number" value={swpInitial} onChange={e => setSwpInitial(e.target.value)} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Withdrawal Amount (₹)" type="number" value={swpWithdrawal} onChange={e => setSwpWithdrawal(e.target.value)} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Frequency" value={swpFrequency} onChange={e => setSwpFrequency(e.target.value)} fullWidth select required>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Start Date" type="date" value={swpStartDate} onChange={e => setSwpStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="End Date" type="date" value={swpEndDate} onChange={e => setSwpEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" fullWidth disabled={swpCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                        {swpCalculating ? <CircularProgress size={24} /> : "Calculate SWP"}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                {swpResult && !swpResult.error && (
                  <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom fontWeight={600} color="#fff">SWP Results</Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(96, 165, 250, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Initial Investment</Typography>
                            <Typography variant="h6" fontWeight={600} color="#fff">₹{formatNumber(swpResult.initialInvestment)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Withdrawn</Typography>
                            <Typography variant="h6" sx={{ color: '#ef4444' }} fontWeight={600}>₹{formatNumber(swpResult.totalWithdrawn)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Remaining Value</Typography>
                            <Typography variant="h6" sx={{ color: '#22c55e' }} fontWeight={600}>₹{formatNumber(swpResult.remainingValue)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(167, 139, 250, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Withdrawals</Typography>
                            <Typography variant="h6" sx={{ color: '#a855f7' }} fontWeight={600}>{swpResult.withdrawals}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      {swpResult.exhausted && (
                        <Alert severity="warning" sx={{ mb: 2 }}>Fund exhausted before end date!</Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
                {swpResult && swpResult.error && (
                  <Alert severity="error">{swpResult.error}</Alert>
                )}
              </Grid>
            </Grid>
          )}

    </Container>
  );
}
