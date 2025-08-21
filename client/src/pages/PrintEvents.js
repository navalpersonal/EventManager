import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

function PrintEvents() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem('token');
  const api = axios.create({ baseURL: 'http://localhost:5001/api', headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        alert('Failed to fetch events: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchEvents();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Printable Events Report</Typography>
        <Button variant="contained" onClick={handlePrint} sx={{ mb: 2 }}>Print</Button>
        <TableContainer component={Paper} sx={{ boxShadow: 6, borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #ff4081 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>SR No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Time</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Event Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Dress Code</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Venue</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, idx) => (
                <TableRow key={event.srNo} sx={{ backgroundColor: idx % 2 === 0 ? '#f3e5f5' : '#e3f2fd' }}>
                  <TableCell>{event.srNo}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.eventName}</TableCell>
                  <TableCell>{event.dressCode}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>{event.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default PrintEvents;
