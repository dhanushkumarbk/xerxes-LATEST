export const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'https://xerxes-api-dwhvdsbddvaqdja4.centralindia-01.azurewebsites.net/api';

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('token') && {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })
});

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export const getToken = () => localStorage.getItem('token');

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getPdfDownloadUrl = (pdfPath) => {
  if (!pdfPath) return null;
  if (pdfPath.startsWith('http')) return pdfPath;
  const base = process.env.REACT_APP_API_URL
    || 'https://xerxes-api-dwhvdsbddvaqdja4.centralindia-01.azurewebsites.net';
  return `${base}${pdfPath}`;
};

export const downloadPdf = async (program) => {
  const url = getPdfDownloadUrl(program.pdf_url || program.pdfUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${program.program_name || 'xerxes-plan'}.pdf`;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
};

export const registerUser = (data) =>
  fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const loginUser = (data) =>
  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const fetchProfile = () =>
  fetch(`${API_BASE}/profile`, { headers: authHeaders() }).then(r => r.json());

export const fetchUserPrograms = () =>
  fetch(`${API_BASE}/user-programs`, { headers: authHeaders() }).then(r => r.json());

export const createOrder = (data) =>
  fetch(`${API_BASE}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const requestDietPlan = (data) =>
  fetch(`${API_BASE}/diet-plan-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const requestWorkoutPlan = (data) =>
  fetch(`${API_BASE}/workout-plan-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const requestComboPlan = (data) =>
  fetch(`${API_BASE}/combo-plan-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const storeUserProgram = (data) =>
  fetch(`${API_BASE}/store-user-program`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  }).then(r => r.json());

export const logPdfDownload = (data) =>
  fetch(`${API_BASE}/log-pdf-download`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  }).then(r => r.json());
