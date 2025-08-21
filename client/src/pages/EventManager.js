
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Box, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

// Helper to format time to 24-hour
function format24Hour(timeStr) {
  if (!timeStr) return '';
  // If already in 24-hour format (HH:mm)
  if (/^([01]?\d|2[0-3]):[0-5]\d$/.test(timeStr)) return timeStr;
  // If in 12-hour format (HH:mm AM/PM)
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  return timeStr;
}

function EventManager() {
  // State for filter and sort
  const [filterDate, setFilterDate] = useState('');
  const [filterVenue, setFilterVenue] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({ dressCodes: [], venues: [] });
  const [form, setForm] = useState({ date: '', time: '', eventName: '', dressCode: '', venue: '', remarks: '' });
  const [open, setOpen] = useState(false);
  const [editSrNo, setEditSrNo] = useState(null);
  const [newDressCode, setNewDressCode] = useState('');
  const [newVenue, setNewVenue] = useState('');

  const token = localStorage.getItem('token');
  const api = axios.create({ baseURL: 'http://localhost:5001/api', headers: { Authorization: `Bearer ${token}` } });

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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddEvent = async () => {
    await api.post('/events', form);
    fetchEvents();
    setForm({ date: '', time: '', eventName: '', dressCode: '', venue: '', remarks: '' });
    setOpen(false);
  };
  const handleEditEvent = async () => {
    await api.put(`/events/${editSrNo}`, form);
    fetchEvents();
    setForm({ date: '', time: '', eventName: '', dressCode: '', venue: '', remarks: '' });
    setEditSrNo(null);
    setOpen(false);
  };
  const handleDeleteEvent = async srNo => {
    try {
      await api.delete(`/events/${srNo}`);
      fetchEvents();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddDressCode = async () => {
    await api.post('/events/meta', { dressCode: newDressCode });
    fetchMeta();
    setForm({ ...form, dressCode: newDressCode });
    setNewDressCode('');
  };
  const handleAddVenue = async () => {
    await api.post('/events/meta', { venue: newVenue });
    fetchMeta();
    setForm({ ...form, venue: newVenue });
    setNewVenue('');
  };

  const openAddDialog = () => {
    setForm({ date: '', time: '', eventName: '', dressCode: '', venue: '', remarks: '' });
    setEditSrNo(null);
    setOpen(true);
  };
  const openEditDialog = event => {
    setForm(event);
    setEditSrNo(event.srNo);
    setOpen(true);
  };

  // Filter, sort, and map events for display
  const filteredEvents = events
    .filter(event => (!filterDate || event.date === filterDate) && (!filterVenue || event.venue === filterVenue))
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      } else if (sortField === 'venue') {
        return sortOrder === 'asc' ? a.venue.localeCompare(b.venue) : b.venue.localeCompare(a.venue);
      }
      return 0;
    });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Event Manager</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>Add Event</Button>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
          <TextField label="Filter by Date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField select label="Filter by Venue" value={filterVenue} onChange={e => setFilterVenue(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">All Venues</MenuItem>
            {meta.venues.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
          <TextField select label="Sort by" value={sortField} onChange={e => setSortField(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="venue">Venue</MenuItem>
          </TextField>
          <TextField select label="Order" value={sortOrder} onChange={e => setSortOrder(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 6, borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #ff4081 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>SR No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Time</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Event Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Dress Code</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Venue</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Remarks</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event, idx) => (
                <TableRow key={event.srNo} sx={{ backgroundColor: idx % 2 === 0 ? '#f3e5f5' : '#e3f2fd', transition: 'background 0.3s' }}>
                  <TableCell>{event.srNo}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{format24Hour(event.time)}</TableCell>
                  <TableCell>{event.eventName}</TableCell>
                  <TableCell>{event.dressCode}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>{event.remarks}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(event)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDeleteEvent(event.srNo)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editSrNo ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
          <TextField label="Date" name="date" type="date" fullWidth margin="normal" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Time (24-hour)" name="time" type="time" fullWidth margin="normal" value={form.time} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ step: 60 }} />
          <TextField label="Event Name" name="eventName" fullWidth margin="normal" value={form.eventName} onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Dress Code</InputLabel>
            <Select name="dressCode" value={form.dressCode} label="Dress Code" onChange={handleChange}>
              {meta.dressCodes.map(dc => <MenuItem key={dc} value={dc}>{dc}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Add New Dress Code" value={newDressCode} onChange={e => setNewDressCode(e.target.value)} />
            <Button onClick={handleAddDressCode}>Add</Button>
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Venue</InputLabel>
            <Select name="venue" value={form.venue} label="Venue" onChange={handleChange}>
              {meta.venues.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Add New Venue" value={newVenue} onChange={e => setNewVenue(e.target.value)} />
            <Button onClick={handleAddVenue}>Add</Button>
          </Box>
          <TextField label="Remarks" name="remarks" fullWidth margin="normal" value={form.remarks} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={editSrNo ? handleEditEvent : handleAddEvent}>{editSrNo ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}



export default EventManager;
