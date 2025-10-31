import { BASE_URL } from '../config';

const API_BASE_URL = `${BASE_URL}/api`;

export const getFreelancerDashboard = async (freelancerId) => {
  const res = await fetch(`${API_BASE_URL}/freelancers/${freelancerId}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch freelancer dashboard");
  return await res.json();
};
