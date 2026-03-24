import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDatasheets = (company, material_category) => 
  api.post('/fetch', { company, material_category }).then(res => res.data);

export const getJobStatus = (jobId) => 
  api.get(`/jobs/${jobId}`).then(res => res.data);

export const getCandidates = (jobId) => {
  const url = jobId ? `/candidates?job_id=${jobId}` : '/candidates';
  return api.get(url).then(res => res.data);
};

export const acceptCandidate = (candidateId) => 
  api.post(`/candidates/${candidateId}/accept`).then(res => res.data);

export const rejectCandidate = (candidateId) => 
  api.post(`/candidates/${candidateId}/reject`).then(res => res.data);

export const getMaterials = () => 
  api.get('/materials').then(res => res.data);

export const getStats = () =>
  api.get('/stats').then(res => res.data);

export const getDownloadUrl = (materialId) => 
  `${API_BASE_URL}/download/${materialId}`;

export default api;
