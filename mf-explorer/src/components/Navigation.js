"use client";
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Explore Funds', path: '/funds', icon: <SearchIcon /> },
    { label: 'Watchlist', path: '/watchlist', icon: <BookmarkIcon /> },
    { label: 'Virtual Portfolio', path: '/virtual-portfolio', icon: <AccountBalanceWalletIcon /> },
  ];

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(99, 102, 241, 0.3)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 0, 
              mr: 4, 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/')}
          >
            MF Explorer
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => router.push(item.path)}
                sx={{
                  color: pathname === item.path ? '#fff' : '#94a3b8',
                  bgcolor: pathname === item.path ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    color: '#fff'
                  },
                  fontWeight: pathname === item.path ? 600 : 400,
                  borderRadius: 2,
                  px: 2
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
