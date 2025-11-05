import React from 'react';
import { Box, Typography, Button, Link, Grid, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import roby from '../../images/roby.png';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        backgroundColor: '#fff',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '4rem', 
      }}
    >
     
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '5rem',
          flexDirection: { xs: 'column', md: 'row' },
          textAlign: { xs: 'center', md: 'left' },
          gap: { xs: '2rem', md: 0 },
          px: { xs: 2, md: '7.4rem' }, 
        }}
      >
        
        <Box>
          <Box component="img" src={roby} alt="roby" sx={{ height: '6rem', maxWidth: '100%' }} />
        </Box>

       
        <Box
          sx={{
            display: 'flex',
            gap: '1rem',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <IconButton
            component="a"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'black' }}
          >
            <Facebook />
          </IconButton>
          <IconButton
            component="a"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'black' }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            component="a"
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'black' }}
          >
            <Twitter />
          </IconButton>
          <IconButton
            component="a"
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'black' }}
          >
            <LinkedIn />
          </IconButton>
          <IconButton
            component="a"
            href="https://dribbble.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'black' }}
          >
            <SportsBasketballIcon />
          </IconButton>
        </Box>
      </Box>

      
      <Grid
        container
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
          maxWidth: '1400px',
          width: '100%',
          mx: 'auto',
          gap: { xs: '4rem', md: 0 },
          px: { xs: 2, md: '7.4rem' }, 
        }}
      >
        
        <Grid item xs={12} md={3}>
          <Typography
            variant="h6"
            sx={{ textTransform: 'uppercase', fontSize: '1.8rem', mb: '1rem' }}
          >
            address
          </Typography>
          <Typography sx={{ fontSize: '1.8rem' }}>14 New South Head Rd,</Typography>
          <Typography sx={{ fontSize: '1.8rem' }}>Triple Bay 3148</Typography>
          <Typography sx={{ fontSize: '1.8rem' }}>London, UK</Typography>
          <Button
            variant="outlined"
            sx={{
              mt: '1.5rem',
              textTransform: 'none',
              fontSize: '1.6rem',
              borderColor: 'black',
              color: 'black',
              '&:hover': { backgroundColor: 'black', color: 'white' },
            }}
          >
            find on map
          </Button>
        </Grid>

        
        <Grid item xs={12} md={5}>
          <Typography
            variant="h6"
            sx={{ textTransform: 'uppercase', fontSize: '1.8rem', mb: '1rem' }}
          >
            sitemap
          </Typography>
          <Box component="nav">
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {[
                { text: 'Home', href: '/' },
                { text: 'About', href: '/about' },
                { text: 'Blog', href: '/blog' },
                { text: 'Pricing', href: '/pricing' },
                { text: 'Style Guide', href: '/style-guide' },
                { text: 'Image Licensing', href: '/image-licensing' },
              ].map((item) => (
                <Box component="li" key={item.text} sx={{ mb: '0.5rem' }}>
                  <Link
                    href={item.href}
                    underline="none"
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '1.8rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {item.text}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

       
        <Grid item xs={12} md={3}>
          <Typography
            variant="h6"
            sx={{ textTransform: 'uppercase', fontSize: '1.8rem', mb: '1rem' }}
          >
            contact
          </Typography>
          <Typography sx={{ fontSize: '1.8rem' }}>
            P: 3740 213 301
            <br />
            E: contact@robi.com
          </Typography>
        </Grid>
      </Grid>

      
      <Box
        sx={{
          width: '100%',
          mt: '4rem',
          py: '2rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.6rem',
            color: 'rgba(116, 116, 116, 1)',
            textAlign: 'center',
          }}
        >
          &copy; This is a Deni Bozo template powered by Webflow.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;