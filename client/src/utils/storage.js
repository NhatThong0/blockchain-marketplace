// Lưu user data
export const saveUserData = (account, data) => {
  localStorage.setItem(`user_${account}`, JSON.stringify(data));
};

// Load user data
export const loadUserData = (account) => {
  const data = localStorage.getItem(`user_${account}`);
  return data ? JSON.parse(data) : null;
};

// Lưu items
export const saveItems = (items) => {
  localStorage.setItem('marketplace_items', JSON.stringify(items));
};

// Load items
export const loadItems = () => {
  const items = localStorage.getItem('marketplace_items');
  return items ? JSON.parse(items) : [];
};

// Lưu transactions
export const saveTransactions = (account, transactions) => {
  localStorage.setItem(`transactions_${account}`, JSON.stringify(transactions));
};

// Load transactions
export const loadTransactions = (account) => {
  const txs = localStorage.getItem(`transactions_${account}`);
  return txs ? JSON.parse(txs) : [];
};