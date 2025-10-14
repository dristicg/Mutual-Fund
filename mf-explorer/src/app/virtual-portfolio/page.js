"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  MenuItem,
  Chip,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const formatNumber = (num) => num ? num.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0';

export default function VirtualPortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [allFunds, setAllFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [adding, setAdding] = useState(false);
  
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipFrequency, setSipFrequency] = useState('monthly');
  const [sipStartDate, setSipStartDate] = useState('2023-01-01');

  useEffect(() => {
    fetchPortfolio();
    fetchAllFunds();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/virtual-portfolio?userId=default-user');
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFunds = async () => {
    try {
      const res = await fetch('/api/mf');
      const data = await res.json();
      setAllFunds(data.activeFunds || []);
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  const handleCreateSIP = async () => {
    if (!selectedFund) return;
    
    try {
      setAdding(true);
      const res = await fetch('/api/virtual-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          schemeCode: selectedFund.schemeCode,
          schemeName: selectedFund.schemeName,
          amount: sipAmount,
          frequency: sipFrequency,
          startDate: sipStartDate
        })
      });
      
      if (res.ok) {
        setOpenDialog(false);
        setSelectedFund(null);
        fetchPortfolio();
      }
    } catch (err) {
      console.error('Error creating SIP:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSIP = async (sipId) => {
    try {
      await fetch(`/api/virtual-portfolio?userId=default-user&sipId=${sipId}`, {
        method: 'DELETE'
      });
      fetchPortfolio();
    } catch (err) {
      console.error('Error removing SIP:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={600} color="#fff">Virtual Portfolio</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          Create SIP
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Virtual Balance</Typography>
              <Typography variant="h5" fontWeight={700} color="#fff" mt={1}>
                ₹{formatNumber(portfolio?.balance || 1000000)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Invested</Typography>
              <Typography variant="h5" fontWeight={700} color="#fff" mt={1}>
                ₹{formatNumber(portfolio?.totalInvested || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Current Value</Typography>
              <Typography variant="h5" fontWeight={700} color="#fff" mt={1}>
                ₹{formatNumber(portfolio?.currentValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Returns</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: (portfolio?.totalReturns || 0) >= 0 ? '#22c55e' : '#ef4444' }} mt={1}>
                {(portfolio?.totalReturns || 0) >= 0 ? '+' : ''}₹{formatNumber(portfolio?.totalReturns || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SIPs Table */}
      {!portfolio?.sips || portfolio.sips.length === 0 ? (
        <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="#94a3b8" gutterBottom>No SIPs Created</Typography>
          <Typography variant="body2" color="#64748b" mb={3}>Create virtual SIPs to track performance with virtual money</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Create Your First SIP
          </Button>
        </Card>
      ) : (
        <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
                    <TableCell sx={{ color: '#e2e8f0', fontWeight: 600 }}>Fund Name</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell align="center" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Frequency</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Invested</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Current Value</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Returns</TableCell>
                    <TableCell align="center" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.sips.map((sip) => (
                    <TableRow key={sip.id} hover sx={{ '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)' } }}>
                      <TableCell sx={{ color: '#e2e8f0' }}>{sip.schemeName}</TableCell>
                      <TableCell align="right" sx={{ color: '#e2e8f0' }}>₹{formatNumber(sip.amount)}</TableCell>
                      <TableCell align="center">
                        <Chip label={sip.frequency} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#e2e8f0' }}>₹{formatNumber(sip.totalInvested || 0)}</TableCell>
                      <TableCell align="right" sx={{ color: '#e2e8f0' }}>₹{formatNumber(sip.currentValue || 0)}</TableCell>
                      <TableCell align="right" sx={{ color: (sip.returns || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(sip.returns || 0) >= 0 ? '+' : ''}{formatNumber(sip.returns || 0)}%
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleRemoveSIP(sip.id)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Create SIP Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(99, 102, 241, 0.3)' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Create Virtual SIP</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={allFunds}
            getOptionLabel={(option) => option.schemeName}
            value={selectedFund}
            onChange={(e, newValue) => setSelectedFund(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Search Fund" margin="normal" fullWidth />
            )}
            sx={{ mt: 2 }}
          />
          <TextField
            label="SIP Amount (₹)"
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Frequency"
            value={sipFrequency}
            onChange={(e) => setSipFrequency(e.target.value)}
            fullWidth
            select
            margin="normal"
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
          </TextField>
          <TextField
            label="Start Date"
            type="date"
            value={sipStartDate}
            onChange={(e) => setSipStartDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateSIP} variant="contained" disabled={!selectedFund || adding}>
            {adding ? <CircularProgress size={24} /> : 'Create SIP'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
