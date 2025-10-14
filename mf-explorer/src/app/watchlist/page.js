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
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [allFunds, setAllFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchWatchlist();
    fetchAllFunds();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/watchlist?userId=default-user');
      const data = await res.json();
      setWatchlist(data.funds || []);
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

  const handleAddFund = async () => {
    if (!selectedFund) return;
    
    try {
      setAdding(true);
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          schemeCode: selectedFund.schemeCode,
          schemeName: selectedFund.schemeName
        })
      });
      
      if (res.ok) {
        setOpenDialog(false);
        setSelectedFund(null);
        fetchWatchlist();
      }
    } catch (err) {
      console.error('Error adding fund:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFund = async (schemeCode) => {
    try {
      await fetch(`/api/watchlist?userId=default-user&schemeCode=${schemeCode}`, {
        method: 'DELETE'
      });
      fetchWatchlist();
    } catch (err) {
      console.error('Error removing fund:', err);
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
        <Typography variant="h4" fontWeight={600} color="#fff">My Watchlist</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          Add Fund
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {watchlist.length === 0 ? (
        <Card elevation={3} sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="#94a3b8" gutterBottom>No funds in watchlist</Typography>
          <Typography variant="body2" color="#64748b" mb={3}>Add mutual funds to track their performance</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Your First Fund
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
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>1 Day</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>1 Month</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>3 Months</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>6 Months</TableCell>
                    <TableCell align="right" sx={{ color: '#e2e8f0', fontWeight: 600 }}>1 Year</TableCell>
                    <TableCell align="center" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {watchlist.map((fund) => (
                    <TableRow key={fund.schemeCode} hover sx={{ '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)' }, cursor: 'pointer' }} onClick={() => router.push(`/funds/${fund.schemeCode}`)}>
                      <TableCell sx={{ color: '#e2e8f0' }}>{fund.schemeName}</TableCell>
                      <TableCell align="right" sx={{ color: (fund.performance?.['1d'] || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(fund.performance?.['1d'] || 0) >= 0 ? '+' : ''}{fund.performance?.['1d'] || 0}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: (fund.performance?.['1m'] || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(fund.performance?.['1m'] || 0) >= 0 ? '+' : ''}{fund.performance?.['1m'] || 0}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: (fund.performance?.['3m'] || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(fund.performance?.['3m'] || 0) >= 0 ? '+' : ''}{fund.performance?.['3m'] || 0}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: (fund.performance?.['6m'] || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(fund.performance?.['6m'] || 0) >= 0 ? '+' : ''}{fund.performance?.['6m'] || 0}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: (fund.performance?.['1y'] || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(fund.performance?.['1y'] || 0) >= 0 ? '+' : ''}{fund.performance?.['1y'] || 0}%
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => handleRemoveFund(fund.schemeCode)} sx={{ color: '#ef4444' }}>
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

      {/* Add Fund Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(99, 102, 241, 0.3)' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Add Fund to Watchlist</DialogTitle>
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleAddFund} variant="contained" disabled={!selectedFund || adding}>
            {adding ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
