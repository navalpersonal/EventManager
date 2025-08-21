import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function Report() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({ dressCodes: [], venues: [] });
  const [filters, setFilters] = useState({ date: '', venue: '' });

  const token = localStorage.getItem('token');
  const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${token}` } });

  const fetchEvents = async () => {
    const res = await api.get('/events');
    setEvents(res.data);
  };
  const fetchMeta = async () => {
    const res = await api.get('/events/meta');
    setMeta(res.data);
  };
  useEffect(() => {
    fetchEvents();
    fetchMeta();
  }, []);

  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const filteredEvents = events.filter(e => {
    return (!filters.date || e.date === filters.date) && (!filters.venue || e.venue === filters.venue);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Event Report</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Date" name="date" type="date" value={filters.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField select label="Venue" name="venue" value={filters.venue} onChange={handleChange} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Venues</MenuItem>
            {meta.venues.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
          <Button variant="outlined" onClick={handlePrint}>Print</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SR No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Event Name</TableCell>
                <TableCell>Dress Code</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map(event => (
                <TableRow key={event.srNo}>
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

export default Report;
