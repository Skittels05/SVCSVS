import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ logo }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navItems = [
    { text: 'Home', path: '/' },
    { text: 'About', path: '/about' },
    { text: 'Blog', path: '/blog' },
    { text: 'Contact', path: '/contact' },
    { text: 'Cart (0)', path: '/cart' },
  ];

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, sm: 7.4 }, 
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <img
            src={logo}
            alt="roby_header"
            style={{ width: '10rem', height: '5.5rem', marginTop: '15%' }}
          />
        </Box>

        
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography
            sx={{
              marginTop: '4.1rem',
              marginBottom: '1.3rem',
              fontSize: '1.8rem',
              fontWeight: 'bold',
            }}
          >
            A creative agency based in Helsinki.
          </Typography>
          <Typography sx={{ color: 'black', fontSize: '1.8rem' }}>
            hello@robi.com
          </Typography>
        </Box>

        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '2.4rem', mt: '3.1rem' }}>
          {navItems.map((item) => (
            <Button
              key={item.text}
              component={NavLink}
              to={item.path}
              sx={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: '1.8rem',
                '&.active': { borderBottom: '2px solid black' },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        
        <IconButton
          color="inherit"
          edge="end"
          onClick={toggleDrawer(true)}
          sx={{ display: { md: 'none' }, mt: '3.1rem' }}
        >
          <MenuIcon sx={{ fontSize: '3rem' }} />
        </IconButton>
      </Toolbar>

      
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img
              src={logo}
              alt="logo"
              style={{ height: 40, maxWidth: '100%', marginBottom: 8 }}
            />
            <Typography sx={{ fontSize: '1.8rem', color: 'black' }}>
              hello@robi.com
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{ fontSize: '1.8rem' }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '1.8rem', fontWeight: 'bold' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;