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
          return;
        }

        setFundData(data);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

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
          zIndex: 10,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          Showing {fundsToDisplay.length} funds
        </Typography>
        <Chip 
          label={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Funds`}
          color={getFilterColor(filter)}
          variant="outlined"
        />
      </Box>

      {/* Funds Grid */}
      <Grid container spacing={3}>
        {fundsToDisplay.length > 0 ? (
          fundsToDisplay.map((fund) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={fund.schemeCode}>
              <Link href={`/funds/${fund.schemeCode}`} passHref style={{ textDecoration: "none" }}>
                <Card 
                  sx={{ 
                    height: "100%",
                    background: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "all 0.3s ease-in-out",
                    opacity: !fund.active ? 0.7 : 1,
                    "&:hover": { 
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Fund Status */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {getStatusChip(fund.active)}
                      <Code 
                        sx={{ 
                          fontSize: 16, 
                          color: 'text.secondary',
                          opacity: 0.7
                        }} 
                      />
                    </Box>

                    {/* Fund Name */}
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                        fontSize: '1rem',
                        lineHeight: 1.4,
                        mb: 2,
                      }}
                    >
                      {fund.schemeName}
                    </Typography>

                    {/* Scheme Code */}
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="primary"
                        sx={{ 
                          fontWeight: 'medium',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      >
                        #{fund.schemeCode}
                      </Typography>
                      <ArrowForward 
                        sx={{ 
                          fontSize: 16, 
                          color: 'primary.main',
                          opacity: 0.8,
                          transition: 'transform 0.2s'
                        }} 
                      />
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

      {/* Footer */}
      {fundsToDisplay.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {fundsToDisplay.length} funds displayed • 
            Active: {fundData.activeFunds.length} • 
            Inactive: {fundData.inactiveFunds.length}
          </Typography>
        </Box>
      )}
    </Container>
  );
}