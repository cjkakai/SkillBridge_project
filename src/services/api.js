const API_BASE_URL = 'http://localhost:5555/api';

export const fetchClients = async () => {
  const response = await fetch(`${API_BASE_URL}/clients`);
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
};

export const fetchFreelancers = async () => {
  const response = await fetch(`${API_BASE_URL}/freelancers`);
  if (!response.ok) throw new Error('Failed to fetch freelancers');
  return response.json();
};

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchContracts = async () => {
  const response = await fetch(`${API_BASE_URL}/contracts`);
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

export const fetchPayments = async () => {
  const response = await fetch(`${API_BASE_URL}/payments`);
  if (!response.ok) throw new Error('Failed to fetch payments');
  return response.json();
};

export const fetchComplaints = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/complaints`);
  if (!response.ok) throw new Error('Failed to fetch complaints');
  return response.json();
};

export const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/current_user`);
  if (!response.ok) throw new Error('Failed to fetch current user');
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to logout');
  return response.json();
};

// Helper functions to compute dashboard data
export const getDashboardStats = async () => {
  try {
    const [clients, freelancers, tasks, contracts, payments] = await Promise.all([
      fetchClients(),
      fetchFreelancers(),
      fetchTasks(),
      fetchContracts(),
      fetchPayments()
    ]);

    const totalUsers = clients.length + freelancers.length;
    const activeProjects = tasks.length; // Tasks without contracts
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Growth rate: assume last month vs previous
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentMonthUsers = [...clients, ...freelancers].filter(u => new Date(u.created_at).getMonth() === currentMonth).length;
    const lastMonthUsers = [...clients, ...freelancers].filter(u => new Date(u.created_at).getMonth() === lastMonth).length;
    const growthRate = lastMonthUsers > 0 ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : 0;

    return {
      totalUsers,
      activeProjects,
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      growthRate: `${growthRate}%`
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      activeProjects: 0,
      totalRevenue: '$0',
      growthRate: '0%'
    };
  }
};

export const getRevenueChartData = async () => {
  try {
    const payments = await fetchPayments();
    const monthlyData = {};

    payments.forEach(p => {
      const date = new Date(p.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, transactions: 0 };
      }
      monthlyData[month].revenue += parseFloat(p.amount);
      monthlyData[month].transactions += 1;
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      revenue: monthlyData[month].revenue,
      transactions: monthlyData[month].transactions
    }));
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    return [];
  }
};

export const getUserGrowthChartData = async () => {
  try {
    const [clients, freelancers] = await Promise.all([fetchClients(), fetchFreelancers()]);
    const users = [...clients, ...freelancers];
    const monthlyData = {};

    users.forEach(u => {
      const date = new Date(u.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += 1;
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      users: monthlyData[month]
    }));
  } catch (error) {
    console.error('Error fetching user growth chart data:', error);
    return [];
  }
};

export const getRecentTransactions = async () => {
  try {
    const payments = await fetchPayments();
    const contracts = await fetchContracts();
    const clients = await fetchClients();
    const freelancers = await fetchFreelancers();

    const recentPayments = payments.slice(-5).reverse(); // Last 5, most recent first

    return recentPayments.map(p => {
      const contract = contracts.find(c => c.id === p.contract_id);
      const client = clients.find(c => c.id === contract?.client_id);
      const freelancer = freelancers.find(f => f.id === contract?.freelancer_id);

      return {
        id: `TXN-${p.id}`,
        client: client?.name || 'Unknown',
        freelancer: freelancer?.name || 'Unknown',
        project: contract?.task?.title || 'Unknown',
        amount: `$${parseFloat(p.amount).toLocaleString()}`
      };
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
};

export const getTopPerformers = async () => {
  try {
    const [payments, freelancers] = await Promise.all([fetchPayments(), fetchFreelancers()]);
    const freelancerEarnings = {};

    payments.forEach(p => {
      if (!freelancerEarnings[p.contract?.freelancer_id]) {
        freelancerEarnings[p.contract?.freelancer_id] = { amount: 0, projects: 0 };
      }
      freelancerEarnings[p.contract?.freelancer_id].amount += parseFloat(p.amount);
      freelancerEarnings[p.contract?.freelancer_id].projects += 1;
    });

    const topFreelancers = Object.keys(freelancerEarnings)
      .map(id => {
        const freelancer = freelancers.find(f => f.id === parseInt(id));
        return {
          rank: 0, // Will set after sorting
          initials: freelancer?.name?.split(' ').map(n => n[0]).join('') || '??',
          name: freelancer?.name || 'Unknown',
          role: freelancer?.bio || 'Freelancer',
          amount: `$${freelancerEarnings[id].amount.toLocaleString()}`,
          projects: freelancerEarnings[id].projects,
          rating: freelancer?.ratings || 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((f, index) => ({ ...f, rank: index + 1 }));

    return topFreelancers;
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
};

export const getPlatformStats = async () => {
  try {
    const [clients, freelancers, tasks, contracts, payments] = await Promise.all([
      fetchClients(),
      fetchFreelancers(),
      fetchTasks(),
      fetchContracts(),
      fetchPayments()
    ]);

    const totalFreelancers = freelancers.length;
    const totalClients = clients.length;
    const jobsPosted30d = tasks.filter(t => {
      const created = new Date(t.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created >= thirtyDaysAgo;
    }).length;
    const completedProjects = contracts.filter(c => c.status === 'completed').length;
    const avgProjectValue = payments.length > 0 ? payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) / payments.length : 0;
    const successRate = contracts.length > 0 ? (completedProjects / contracts.length * 100).toFixed(1) : 0;

    return [
      { label: "Total Freelancers", value: totalFreelancers.toLocaleString(), icon: "👨‍💻" },
      { label: "Total Clients", value: totalClients.toLocaleString(), icon: "👥" },
      { label: "Jobs Posted (30d)", value: jobsPosted30d.toLocaleString(), icon: "📝" },
      { label: "Completed Projects", value: completedProjects.toLocaleString(), icon: "✅" },
      { label: "Avg. Project Value", value: `$${avgProjectValue.toFixed(0)}`, icon: "💰" },
      { label: "Success Rate", value: `${successRate}%`, icon: "🏆" },
    ];
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return [];
  }
};
