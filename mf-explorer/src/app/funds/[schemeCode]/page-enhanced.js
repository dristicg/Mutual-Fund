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

export default function FundDetailPageEnhanced() {
  const theme = useTheme();
  const params = useParams();
  const schemeCode = params.schemeCode;

  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculatorTab, setCalculatorTab] = useState(0);
  const [returns, setReturns] = useState({ '1m': 0, '3m': 0, '6m': 0, '1y': 0 });

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

  const navData = fund.data?.slice(-365).filter((_, i) => i % 7 === 0).map(item => ({
    date: new Date(item.date.split('-').reverse().join('-')).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    nav: parseFloat(item.nav)
  })) || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Fund Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)` }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {fund.meta.scheme_name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Chip label={fund.meta.fund_house} color="primary" variant="outlined" />
          <Chip label={fund.meta.scheme_category} color="secondary" variant="outlined" />
          <Chip label={fund.meta.scheme_type} variant="outlined" />
        </Box>
      </Paper>

      {/* NAV Chart */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            NAV History (Last 1 Year)
          </Typography>
          <Box sx={{ height: 350, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={navData}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8
                  }} 
                />
                <Area type="monotone" dataKey="nav" stroke={theme.palette.primary.main} strokeWidth={2} fillOpacity={1} fill="url(#colorNav)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Calculator Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={calculatorTab} 
          onChange={(e, v) => setCalculatorTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TrendingUpIcon />} label="SIP Calculator" iconPosition="start" />
          <Tab icon={<AccountBalanceIcon />} label="Lumpsum Calculator" iconPosition="start" />
          <Tab icon={<MoneyOffIcon />} label="SWP Calculator" iconPosition="start" />
          <Tab icon={<ShowChartIcon />} label="Step-Up SIP" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Step-Up SWP" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Rolling Returns" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* SIP Calculator */}
      {calculatorTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper component="form" onSubmit={handleSipCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>SIP Calculator</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Investment Amount (₹)" type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Frequency" value={sipFrequency} onChange={e => setSipFrequency(e.target.value)} fullWidth select required>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
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

          <Grid item xs={12} md={8}>
            {sipResult && !sipResult.error && (
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>SIP Results</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Invested</Typography>
                        <Typography variant="h6" fontWeight={600}>₹{formatNumber(sipResult.totalInvested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Current Value</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">₹{formatNumber(sipResult.currentValue)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Gain</Typography>
                        <Typography variant="h6" fontWeight={600} color="secondary.main">₹{formatNumber(sipResult.currentValue - sipResult.totalInvested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">CAGR</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">{formatNumber(sipResult.annualizedReturn)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Growth Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sipResult.growth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => `₹${formatNumber(v)}`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Current Value" stroke={theme.palette.success.main} strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="invested" name="Invested" stroke={theme.palette.text.secondary} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {sipResult && sipResult.error && <Alert severity="error">{sipResult.error}</Alert>}
            {!sipResult && <Alert severity="info">Enter SIP details and click "Calculate Returns"</Alert>}
          </Grid>
        </Grid>
      )}

      {/* Lumpsum Calculator */}
      {calculatorTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper component="form" onSubmit={handleLumpsumCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>Lumpsum Calculator</Typography>
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
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>Lumpsum Results</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Invested</Typography>
                        <Typography variant="h6" fontWeight={600}>₹{formatNumber(lumpsumResult.invested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Current Value</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">₹{formatNumber(lumpsumResult.currentValue)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Gain</Typography>
                        <Typography variant="h6" fontWeight={600} color="secondary.main">₹{formatNumber(lumpsumResult.currentValue - lumpsumResult.invested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">CAGR</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">{formatNumber(lumpsumResult.annualizedReturn)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Growth Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lumpsumResult.growth}>
                        <defs>
                          <linearGradient id="colorLumpsum" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => `₹${formatNumber(v)}`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Area type="monotone" dataKey="value" stroke={theme.palette.success.main} strokeWidth={2} fillOpacity={1} fill="url(#colorLumpsum)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {lumpsumResult && lumpsumResult.error && <Alert severity="error">{lumpsumResult.error}</Alert>}
            {!lumpsumResult && <Alert severity="info">Enter lumpsum details and click "Calculate Returns"</Alert>}
          </Grid>
        </Grid>
      )}

      {/* SWP Calculator */}
      {calculatorTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper component="form" onSubmit={handleSwpCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>SWP Calculator</Typography>
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
                    {swpCalculating ? <CircularProgress size={24} /> : "Calculate Withdrawals"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {swpResult && !swpResult.error && (
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>SWP Results</Typography>
                  {swpResult.exhausted && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      ⚠️ Investment exhausted before end date!
                    </Alert>
                  )}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Initial</Typography>
                        <Typography variant="h6" fontWeight={600}>₹{formatNumber(swpResult.initialInvestment)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Withdrawn</Typography>
                        <Typography variant="h6" fontWeight={600} color="warning.main">₹{formatNumber(swpResult.totalWithdrawn)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Remaining</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">₹{formatNumber(swpResult.remainingValue)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Total Value</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">₹{formatNumber(swpResult.totalValue)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Withdrawal Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={swpResult.growth}>
                        <defs>
                          <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorWithdrawn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => `₹${formatNumber(v)}`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Legend />
                        <Area type="monotone" dataKey="remainingValue" name="Remaining Value" stroke={theme.palette.success.main} strokeWidth={2} fillOpacity={1} fill="url(#colorRemaining)" />
                        <Area type="monotone" dataKey="withdrawn" name="Total Withdrawn" stroke={theme.palette.warning.main} strokeWidth={2} fillOpacity={1} fill="url(#colorWithdrawn)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {swpResult && swpResult.error && <Alert severity="error">{swpResult.error}</Alert>}
            {!swpResult && <Alert severity="info">Enter SWP details and click "Calculate Withdrawals"</Alert>}
          </Grid>
        </Grid>
      )}

      {/* Step-Up SIP Calculator */}
      {calculatorTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper component="form" onSubmit={handleStepUpSipCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>Step-Up SIP Calculator</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Initial Investment Amount (₹)" type="number" value={stepUpSipAmount} onChange={e => setStepUpSipAmount(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Annual Increment (%)" type="number" value={stepUpSipIncrement} onChange={e => setStepUpSipIncrement(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Frequency" value={stepUpSipFrequency} onChange={e => setStepUpSipFrequency(e.target.value)} fullWidth select required>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Start Date" type="date" value={stepUpSipStartDate} onChange={e => setStepUpSipStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="End Date" type="date" value={stepUpSipEndDate} onChange={e => setStepUpSipEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth disabled={stepUpSipCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                    {stepUpSipCalculating ? <CircularProgress size={24} /> : "Calculate Returns"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {stepUpSipResult && !stepUpSipResult.error && (
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>Step-Up SIP Results</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Invested</Typography>
                        <Typography variant="h6" fontWeight={600}>₹{formatNumber(stepUpSipResult.totalInvested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Current Value</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">₹{formatNumber(stepUpSipResult.currentValue)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Gain</Typography>
                        <Typography variant="h6" fontWeight={600} color="secondary.main">₹{formatNumber(stepUpSipResult.currentValue - stepUpSipResult.totalInvested)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">CAGR</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">{formatNumber(stepUpSipResult.annualizedReturn)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Growth Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stepUpSipResult.growth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => `₹${formatNumber(v)}`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Current Value" stroke={theme.palette.success.main} strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="invested" name="Invested" stroke={theme.palette.text.secondary} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {stepUpSipResult && stepUpSipResult.error && <Alert severity="error">{stepUpSipResult.error}</Alert>}
            {!stepUpSipResult && <Alert severity="info">Enter Step-Up SIP details and click "Calculate Returns"</Alert>}
          </Grid>
        </Grid>
      )}

      {/* Step-Up SWP Calculator */}
      {calculatorTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper component="form" onSubmit={handleStepUpSwpCalculate} elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>Step-Up SWP Calculator</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Initial Investment (₹)" type="number" value={stepUpSwpInitial} onChange={e => setStepUpSwpInitial(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Initial Withdrawal Amount (₹)" type="number" value={stepUpSwpWithdrawal} onChange={e => setStepUpSwpWithdrawal(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Annual Increment (%)" type="number" value={stepUpSwpIncrement} onChange={e => setStepUpSwpIncrement(e.target.value)} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Frequency" value={stepUpSwpFrequency} onChange={e => setStepUpSwpFrequency(e.target.value)} fullWidth select required>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Start Date" type="date" value={stepUpSwpStartDate} onChange={e => setStepUpSwpStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="End Date" type="date" value={stepUpSwpEndDate} onChange={e => setStepUpSwpEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth disabled={stepUpSwpCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                    {stepUpSwpCalculating ? <CircularProgress size={24} /> : "Calculate Withdrawals"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {stepUpSwpResult && !stepUpSwpResult.error && (
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>Step-Up SWP Results</Typography>
                  {stepUpSwpResult.exhausted && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      ⚠️ Investment exhausted before end date!
                    </Alert>
                  )}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Initial</Typography>
                        <Typography variant="h6" fontWeight={600}>₹{formatNumber(stepUpSwpResult.initialInvestment)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Withdrawn</Typography>
                        <Typography variant="h6" fontWeight={600} color="warning.main">₹{formatNumber(stepUpSwpResult.totalWithdrawn)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Remaining</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">₹{formatNumber(stepUpSwpResult.remainingValue)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Total Value</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">₹{formatNumber(stepUpSwpResult.totalValue)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Withdrawal Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stepUpSwpResult.growth}>
                        <defs>
                          <linearGradient id="colorStepUpSwpRemaining" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => `₹${formatNumber(v)}`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Legend />
                        <Area type="monotone" dataKey="remainingValue" name="Remaining Value" stroke={theme.palette.success.main} strokeWidth={2} fillOpacity={1} fill="url(#colorStepUpSwpRemaining)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {stepUpSwpResult && stepUpSwpResult.error && <Alert severity="error">{stepUpSwpResult.error}</Alert>}
            {!stepUpSwpResult && <Alert severity="info">Enter Step-Up SWP details and click "Calculate Withdrawals"</Alert>}
          </Grid>
        </Grid>
      )}

      {/* Rolling Returns */}
      {calculatorTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" mb={3} fontWeight={600}>Rolling Returns</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Period" value={rollingPeriod} onChange={e => setRollingPeriod(e.target.value)} fullWidth select required>
                    <MenuItem value="1y">1 Year</MenuItem>
                    <MenuItem value="3y">3 Years</MenuItem>
                    <MenuItem value="5y">5 Years</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth onClick={handleRollingReturnsCalculate} disabled={rollingCalculating} sx={{ py: 1.5, fontWeight: 600 }}>
                    {rollingCalculating ? <CircularProgress size={24} /> : "Calculate Rolling Returns"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {rollingReturns && !rollingReturns.error && (
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>Rolling Returns Analysis</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Average</Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">{formatNumber(rollingReturns.average)}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Max</Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">{formatNumber(rollingReturns.max)}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Min</Typography>
                        <Typography variant="h6" fontWeight={600} color="error.main">{formatNumber(rollingReturns.min)}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <Typography variant="caption" color="text.secondary">Std Dev</Typography>
                        <Typography variant="h6" fontWeight={600} color="warning.main">{formatNumber(rollingReturns.stdDev)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>Rolling Returns Chart</Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rollingReturns.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontSize: 12 }} />
                        <YAxis stroke={theme.palette.text.secondary} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                        <Tooltip formatter={(v) => `${formatNumber(v)}%`} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                        <Legend />
                        <Line type="monotone" dataKey="return" name="Rolling Return" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}
            {rollingReturns && rollingReturns.error && <Alert severity="error">{rollingReturns.error}</Alert>}
            {!rollingReturns && <Alert severity="info">Select a period and click "Calculate Rolling Returns"</Alert>}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
