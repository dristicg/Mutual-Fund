"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Container,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Box,
  InputAdornment,
  Paper,
  Alert,
  Button,
  ButtonGroup,
  Chip,
  Card,
  CardContent,
  alpha,
  useTheme,
  Pagination,
  Snackbar,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import TrendingUp from "@mui/icons-material/TrendingUp";
import PauseCircle from "@mui/icons-material/PauseCircle";
import AllInclusive from "@mui/icons-material/AllInclusive";
import Code from "@mui/icons-material/Code";
import ArrowForward from "@mui/icons-material/ArrowForward";

export default function FundsPage() {
  const theme = useTheme();
  const [fundData, setFundData] = useState({ activeFunds: [], inactiveFunds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [isBuilding, setIsBuilding] = useState(false);
  const [page, setPage] = useState(1);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("info");
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch("/api/mf");
        if (!response.ok) throw new Error("Failed to fetch funds");
        
        const data = await response.json();

        if (data.status === 'building') {
          setIsBuilding(true);
          setLoading(false);
          showToast("Fund database is being built. Please refresh shortly.", "info");
          return;
        }

        setFundData(data);
        showToast(`Loaded ${data.activeFunds.length + data.inactiveFunds.length} funds successfully!`, "success");
      } catch (err) {
        setError(true);
        showToast("Failed to load funds. Please try again.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  const showToast = (message, severity = "info") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const fundsToDisplay = useMemo(() => {
    let list = [];
    if (filter === 'active') list = fundData.activeFunds;
    else if (filter === 'inactive') list = fundData.inactiveFunds;
    else list = [...fundData.activeFunds, ...fundData.inactiveFunds];

    if (!search) return list;

    return list.filter((fund) =>
      fund.schemeName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, filter, fundData]);

  const paginatedFunds = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return fundsToDisplay.slice(startIndex, endIndex);
  }, [fundsToDisplay, page]);

  const totalPages = Math.ceil(fundsToDisplay.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1); // Reset to first page when filter or search changes
  }, [filter, search]);

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'active': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'inactive': return <PauseCircle sx={{ fontSize: 16 }} />;
      case 'all': return <AllInclusive sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getFilterColor = (filterType) => {
    switch (filterType) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'all': return 'primary';
      default: return 'primary';
    }
  };

  const getStatusChip = (isActive) => (
    <Chip
      label={isActive ? "Active" : "Inactive"}
      size="small"
      color={isActive ? "success" : "warning"}
      variant="outlined"
      sx={{ 
        fontSize: '0.7rem',
        height: 24,
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: theme.palette.primary.main,
          }} 
        />
        <Typography variant="h6" color="text.secondary">
          Loading Funds...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            background: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            '& .MuiAlert-icon': { color: theme.palette.error.main }
          }}
        >
          Failed to load fund list. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (isBuilding) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="info"
          sx={{ 
            background: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          The fund database is being built for the first time. This may take a few minutes. Please refresh the page shortly.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Mutual Fund Explorer
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover and analyze mutual funds with comprehensive data and SIP calculations
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2, 
          alignItems: 'center',
          position: "sticky", 
          top: 80, 
          zIndex: 1000,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search ${filter} funds...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: {
              background: alpha(theme.palette.background.paper, 0.6),
              '&:hover': {
                background: alpha(theme.palette.background.paper, 0.8),
              }
            }
          }}
        />
        <ButtonGroup variant="outlined" sx={{ flexShrink: 0 }}>
          <Button 
            variant={filter === 'active' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('active')}
            startIcon={getFilterIcon('active')}
            color={getFilterColor('active')}
          >
            Active
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('inactive')}
            startIcon={getFilterIcon('inactive')}
            color={getFilterColor('inactive')}
          >
            Inactive
          </Button>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('all')}
            startIcon={getFilterIcon('all')}
            color={getFilterColor('all')}
          >
            All
          </Button>
        </ButtonGroup>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Showing {paginatedFunds.length} of {fundsToDisplay.length} funds (Page {page} of {totalPages})
        </Typography>
        <Chip 
          label={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Funds`}
          color={getFilterColor(filter)}
          variant="outlined"
        />
      </Box>

      {/* Funds Grid */}
      <Grid container spacing={3}>
        {paginatedFunds.length > 0 ? (
          paginatedFunds.map((fund) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={fund.schemeCode}>
              <Link href={`/funds/${fund.schemeCode}`} passHref style={{ textDecoration: "none" }}>
                <Card 
                  sx={{ 
                    height: "100%",
                    minHeight: 180,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderRadius: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: !fund.active ? 0.6 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                    "&::before": {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    },
                    "&:hover": { 
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                      "&::before": {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Fund Status */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {getStatusChip(fund.active)}
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}>
                        <Code 
                          sx={{ 
                            fontSize: 14, 
                            color: 'primary.main',
                          }} 
                        />
                      </Box>
                    </Box>

                    {/* Fund Name */}
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        mb: 2,
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {fund.schemeName}
                    </Typography>

                    {/* Scheme Code */}
                    <Box sx={{ 
                      mt: 'auto', 
                      pt: 2,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: 'primary.main',
                          background: alpha(theme.palette.primary.main, 0.1),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        #{fund.schemeCode}
                      </Typography>
                      <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: theme.palette.primary.main,
                          '& svg': {
                            color: 'white',
                          }
                        }
                      }}>
                        <ArrowForward 
                          sx={{ 
                            fontSize: 14, 
                            color: 'primary.main',
                            transition: 'all 0.3s'
                          }} 
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert 
              severity="info"
              sx={{ 
                background: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              }}
            >
              No funds found for the current filter and search criteria.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Footer */}
      {fundsToDisplay.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total: {fundsToDisplay.length} funds • 
            Active: {fundData.activeFunds.length} • 
            Inactive: {fundData.inactiveFunds.length}
          </Typography>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleToastClose} 
          severity={toastSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}