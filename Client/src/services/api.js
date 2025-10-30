const API_BASE_URL = "http://localhost:5000/api";

export const getFreelancerDashboard = async (freelancerId) => {
  const res = await fetch(`${API_BASE_URL}/freelancers/${freelancerId}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch freelancer dashboard");
  return await res.json();
};
