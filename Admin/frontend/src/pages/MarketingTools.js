import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Switch, Button, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const ToolCard = ({ title, idLabel }) => {
  const [helpOpen, setHelpOpen] = useState(false);

  const getHelpContent = (toolTitle) => {
    switch(toolTitle) {
      case 'Google Analytics':
        return {
          title: 'Google Analytics Setup',
          content: 'To set up Google Analytics:\n1. Create a Google Analytics account\n2. Set up a new property\n3. Get your Measurement ID (format: G-XXXXXXXXXX)\n4. Add the ID to the field above\n5. Enable the toggle to activate tracking'
        };
      case 'Google Tag Manager':
        return {
          title: 'Google Tag Manager Setup', 
          content: 'To set up GTM:\n1. Create a GTM account\n2. Set up a new container\n3. Get your Container ID (format: GTM-XXXXXXX)\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Meta Pixel':
        return {
          title: 'Meta Pixel Setup',
          content: 'To set up Meta Pixel:\n1. Go to Facebook Business Manager\n2. Create a new Pixel\n3. Get your Pixel ID (15-digit number)\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'LinkedIn Insight':
        return {
          title: 'LinkedIn Insight Tag Setup',
          content: 'To set up LinkedIn Insight:\n1. Go to LinkedIn Campaign Manager\n2. Create Insight Tag\n3. Get your Partner ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Pinterest Pixel':
        return {
          title: 'Pinterest Tag Setup',
          content: 'To set up Pinterest Tag:\n1. Go to Pinterest Ads\n2. Create conversion tag\n3. Get your Tag ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Snapchat Pixel':
        return {
          title: 'Snapchat Pixel Setup',
          content: 'To set up Snapchat Pixel:\n1. Go to Snapchat Ads Manager\n2. Create Pixel\n3. Get your Pixel ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Twitter Pixel':
        return {
          title: 'Twitter Pixel Setup',
          content: 'To set up Twitter Pixel:\n1. Go to Twitter Ads dashboard\n2. Create conversion tracking\n3. Get your Pixel ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'TikTok Pixel':
        return {
          title: 'TikTok Pixel Setup',
          content: 'To set up TikTok Pixel:\n1. Go to TikTok Ads Manager\n2. Create Pixel\n3. Get your Pixel ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Google Ads Conversion':
        return {
          title: 'Google Ads Conversion Setup',
          content: 'To set up Google Ads Conversion:\n1. Go to Google Ads\n2. Create conversion action\n3. Get your Conversion ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'Facebook Custom Audience':
        return {
          title: 'Facebook Custom Audience Setup',
          content: 'To set up Facebook Custom Audience:\n1. Go to Facebook Business Manager\n2. Create custom audience\n3. Get your Audience ID\n4. Add the ID to the field above\n5. Enable the toggle to activate'
        };
      case 'HubSpot Tracking':
        return {
          title: 'HubSpot Tracking Setup',
          content: 'To set up HubSpot Tracking:\n1. Go to HubSpot dashboard\n2. Get your Tracking ID\n3. Add the ID to the field above\n4. Enable the toggle to activate'
        };
      case 'Segment Analytics':
        return {
          title: 'Segment Analytics Setup',
          content: 'To set up Segment Analytics:\n1. Go to Segment dashboard\n2. Get your Write Key\n3. Add the Key to the field above\n4. Enable the toggle to activate'
        };
      default:
        return {
          title: `${toolTitle} Setup`,
          content: `Follow the official documentation to get your ${idLabel} and configure the tracking.`
        };
    }
  };

  const helpData = getHelpContent(title);

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='h6'>{title}</Typography>
            <Switch />
          </Box>

          <Typography sx={{ fontSize: 14, mb: 1 }}>{idLabel}</Typography>

          <TextField
            fullWidth
            size='small'
            placeholder='Enter ID'
            sx={{ mb: 2 }}
          />

          <Link 
            component='button'
            onClick={() => setHelpOpen(true)}
            underline='hover'
            sx={{ cursor: 'pointer' }}
          >
            How It Work
          </Link>

          <Box sx={{ mt: 2 }}>
            <Button variant='contained'>Submit</Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{helpData.title}</DialogTitle>
        <DialogContent>
          <Typography component='pre' sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {helpData.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function MarketingTools() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h5' sx={{ mb: 3 }}>
        Marketing Tools
      </Typography>

      <ToolCard title='Google Analytics' idLabel='Measurement ID' />
      <ToolCard title='Google Tag Manager' idLabel='GTM Container ID' />
      <ToolCard title='Meta Pixel' idLabel='Meta Pixel ID' />
      <ToolCard title='LinkedIn Insight' idLabel='LinkedIn Partner ID' />
      <ToolCard title='Pinterest Pixel' idLabel='Pinterest Tag ID' />
      <ToolCard title='Snapchat Pixel' idLabel='Snap Pixel ID' />
      <ToolCard title='Twitter Pixel' idLabel='Twitter Pixel ID' />
      <ToolCard title='TikTok Pixel' idLabel='TikTok Pixel ID' />
      <ToolCard title='Google Ads Conversion' idLabel='Conversion ID' />
      <ToolCard title='Facebook Custom Audience' idLabel='Audience ID' />
      <ToolCard title='HubSpot Tracking' idLabel='HubSpot ID' />
      <ToolCard title='Segment Analytics' idLabel='Segment Write Key' />
    </Box>
  );
}

export default MarketingTools;
