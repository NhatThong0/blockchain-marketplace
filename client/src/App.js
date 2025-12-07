import React, { useState, useEffect } from 'react';
import { Wallet, ShoppingCart, Package, LogIn, LogOut, Plus, History } from 'lucide-react';

const BlockchainMarketplace = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [privateKey, setPrivateKey] = useState('');

  // Load items khi app khởi động
  useEffect(() => {
    const savedItems = localStorage.getItem('marketplace_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Load user data khi account thay đổi
  useEffect(() => {
    if (account) {
      loadUserData(account);
    }
  }, [account]);

  // Lưu items mỗi khi thay đổi
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('marketplace_items', JSON.stringify(items));
    }
  }, [items]);

  const loadUserData = (userAccount) => {
    const userData = localStorage.getItem(`user_${userAccount}`);
    if (userData) {
      const data = JSON.parse(userData);
      setBalance(data.balance || 0);
      setIsRegistered(data.isRegistered || false);
      setTransactions(data.transactions || []);
    }
  };

  const saveUserData = (userAccount, newBalance, isReg, txs) => {
    const userData = {
      balance: newBalance,
      isRegistered: isReg,
      transactions: txs
    };
    localStorage.setItem(`user_${userAccount}`, JSON.stringify(userData));
  };

  const connectWallet = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setAccount(mockAddress);
      setLoading(false);
    }, 500);
  };

  const loginWithKey = () => {
    if (privateKey.length < 10) {
      alert('Private key quá ngắn! Tối thiểu 10 ký tự');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const mockAddress = '0x' + privateKey.substr(0, 40).padEnd(40, '0');
      setAccount(mockAddress);
      setPrivateKey('');
      setLoading(false);
    }, 500);
  };

  const registerUser = () => {
    setLoading(true);
    setTimeout(() => {
      const initialBalance = 1000;
      const newTransaction = {
        id: Date.now(),
        type: 'register',
        amount: initialBalance,
        description: 'Bonus đăng ký tài khoản',
        timestamp: new Date().toISOString(),
        from: 'System',
        to: account
      };

      setIsRegistered(true);
      setBalance(initialBalance);
      setTransactions([newTransaction]);
      
      saveUserData(account, initialBalance, true, [newTransaction]);
      setLoading(false);
      alert('Đăng ký thành công! Bạn được cấp 1000 ETH');
    }, 500);
  };

  const listItem = () => {
    if (!newItem.name || !newItem.price) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (parseFloat(newItem.price) <= 0) {
      alert('Giá phải lớn hơn 0!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const item = {
        id: Date.now(),
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        seller: account,
        sellerShort: account.substring(0, 10),
        sold: false,
        createdAt: new Date().toISOString()
      };

      const newItems = [...items, item];
      setItems(newItems);
      localStorage.setItem('marketplace_items', JSON.stringify(newItems));

      const newTransaction = {
        id: Date.now(),
        type: 'list',
        itemName: item.name,
        price: item.price,
        amount: 0,
        description: `Đăng bán ${item.name} với giá ${item.price} ETH`,
        timestamp: new Date().toISOString(),
        from: account,
        to: 'Marketplace'
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      saveUserData(account, balance, isRegistered, updatedTransactions);

      setNewItem({ name: '', description: '', price: '' });
      setLoading(false);
      setActiveTab('marketplace');
      alert(`Đăng bán thành công!\n${item.name} đã được thêm vào chợ với giá ${item.price} ETH`);
    }, 500);
  };

  const purchaseItem = (item) => {
    if (balance < item.price) {
      alert(`Số dư không đủ!\nSố dư hiện tại: ${balance} ETH\nGiá vật phẩm: ${item.price} ETH`);
      return;
    }

    if (item.seller === account) {
      alert('Bạn không thể mua vật phẩm của chính mình!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Cập nhật số dư người mua
      const newBuyerBalance = balance - item.price;
      setBalance(newBuyerBalance);

      // Tạo giao dịch người mua
      const buyerTransaction = {
        id: Date.now(),
        type: 'purchase',
        itemName: item.name,
        amount: -item.price,
        description: `Mua ${item.name} từ ${item.seller.substring(0, 10)}...`,
        timestamp: new Date().toISOString(),
        from: account,
        to: item.seller
      };

      const updatedBuyerTransactions = [...transactions, buyerTransaction];
      setTransactions(updatedBuyerTransactions);
      saveUserData(account, newBuyerBalance, isRegistered, updatedBuyerTransactions);

      // Cập nhật số dư người bán
      const sellerData = localStorage.getItem(`user_${item.seller}`);
      if (sellerData) {
        const seller = JSON.parse(sellerData);
        const newSellerBalance = (seller.balance || 1000) + item.price;
        
        const sellerTransaction = {
          id: Date.now() + 1,
          type: 'sale',
          itemName: item.name,
          amount: item.price,
          description: `Bán ${item.name} cho ${account.substring(0, 10)}...`,
          timestamp: new Date().toISOString(),
          from: account,
          to: item.seller
        };

        const updatedSellerTransactions = [...(seller.transactions || []), sellerTransaction];
        saveUserData(item.seller, newSellerBalance, seller.isRegistered, updatedSellerTransactions);
      }

      // Cập nhật trạng thái item
      const updatedItems = items.map(i => 
        i.id === item.id ? { ...i, sold: true, buyer: account, soldAt: new Date().toISOString() } : i
      );
      setItems(updatedItems);
      localStorage.setItem('marketplace_items', JSON.stringify(updatedItems));

      setLoading(false);
      alert(`Mua thành công!\n${item.name} đã được thêm vào tài khoản của bạn\nSố dư còn lại: ${newBuyerBalance.toFixed(2)} ETH`);
    }, 500);
  };

  const logout = () => {
    setAccount('');
    setBalance(0);
    setIsRegistered(false);
    setPrivateKey('');
    setTransactions([]);
    setActiveTab('marketplace');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'register': return '🎁';
      case 'purchase': return '🛒';
      case 'sale': return '💰';
      case 'list': return '📦';
      default: return '💳';
    }
  };

  const getTransactionTypeText = (type) => {
    switch(type) {
      case 'register': return 'Đăng ký';
      case 'purchase': return 'Mua hàng';
      case 'sale': return 'Bán hàng';
      case 'list': return 'Đăng bán';
      default: return 'Giao dịch';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)',
    },
    header: {
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4F46E5',
      margin: 0,
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    },
    balanceBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#EEF2FF',
      padding: '8px 16px',
      borderRadius: '8px',
    },
    balanceText: {
      fontWeight: '600',
      color: '#4F46E5',
    },
    addressText: {
      fontSize: '14px',
      color: '#6B7280',
      fontFamily: 'monospace',
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s',
      fontSize: '14px',
    },
    buttonPrimary: {
      background: '#4F46E5',
      color: 'white',
    },
    buttonDanger: {
      background: '#EF4444',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tabActive: {
      background: '#4F46E5',
      color: 'white',
    },
    tabInactive: {
      background: 'white',
      color: '#6B7280',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      padding: '40px',
    },
    itemCard: {
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    itemImage: {
      height: '192px',
      background: 'linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemContent: {
      padding: '24px',
    },
    itemTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '16px',
      minHeight: '40px',
    },
    itemFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    itemPrice: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4F46E5',
    },
    itemSeller: {
      fontSize: '12px',
      color: '#9CA3AF',
    },
    buttonFull: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    transactionCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      transition: 'all 0.3s',
    },
    transactionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    transactionLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    transactionIcon: {
      fontSize: '32px',
    },
    transactionInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    transactionType: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1F2937',
    },
    transactionDesc: {
      fontSize: '14px',
      color: '#6B7280',
    },
    transactionAmount: {
      fontSize: '20px',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    amountPositive: {
      color: '#10B981',
    },
    amountNegative: {
      color: '#EF4444',
    },
    transactionTime: {
      fontSize: '12px',
      color: '#9CA3AF',
      marginTop: '8px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9CA3AF',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    myItem: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    statusBadge: {
      fontSize: '14px',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      marginTop: '4px',
      display: 'inline-block',
    },
    statusSold: {
      background: '#D1FAE5',
      color: '#065F46',
    },
    statusSelling: {
      background: '#FEF3C7',
      color: '#92400E',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <Package size={32} color="#4F46E5" />
            <h1 style={styles.title}>Blockchain Marketplace</h1>
          </div>
          
          {account ? (
            <div style={styles.userSection}>
              <div style={styles.balanceBox}>
                <Wallet size={20} color="#4F46E5" />
                <span style={styles.balanceText}>{balance.toFixed(2)} ETH</span>
              </div>
              <div style={styles.addressText}>
                {account.substring(0, 6)}...{account.substring(38)}
              </div>
              <button
                onClick={logout}
                style={{...styles.button, ...styles.buttonDanger}}
                disabled={loading}
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              style={{...styles.button, ...styles.buttonPrimary}}
              disabled={loading}
            >
              {loading ? 'Đang kết nối...' : 'Kết nối Wallet'}
            </button>
          )}
        </div>
      </header>

      <div style={styles.mainContent}>
        {!account ? (
          <div style={{maxWidth: '450px', margin: '80px auto'}}>
            <div style={styles.card}>
              <div style={{textAlign: 'center', marginBottom: '24px'}}>
                <LogIn size={64} color="#4F46E5" style={{margin: '0 auto 16px'}} />
                <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '8px'}}>Đăng nhập</h2>
                <p style={{color: '#6B7280'}}>Sử dụng private key để đăng nhập</p>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={styles.label}>Private Key</label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Nhập private key (tối thiểu 10 ký tự)"
                    style={styles.input}
                  />
                </div>

                <button
                  onClick={loginWithKey}
                  style={{...styles.buttonFull, background: '#4F46E5', color: 'white'}}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>

                <div style={{textAlign: 'center', color: '#9CA3AF'}}>hoặc</div>

                <button
                  onClick={connectWallet}
                  style={{...styles.buttonFull, background: '#F3F4F6', color: '#1F2937', border: '2px solid #E5E7EB'}}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản mới'}
                </button>
              </div>
            </div>
          </div>
        ) : !isRegistered ? (
          <div style={{maxWidth: '450px', margin: '80px auto'}}>
            <div style={styles.card}>
              <div style={{textAlign: 'center'}}>
                <Wallet size={64} color="#4F46E5" style={{margin: '0 auto 16px'}} />
                <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '8px'}}>Chào mừng!</h2>
                <p style={{color: '#6B7280', marginBottom: '16px'}}>
                  Địa chỉ ví của bạn: <br />
                  <span style={{fontFamily: 'monospace', fontSize: '14px'}}>{account}</span>
                </p>
                <p style={{color: '#6B7280', marginBottom: '24px'}}>
                  Đăng ký để nhận 1000 ETH miễn phí và bắt đầu mua bán
                </p>
              </div>
              <button
                onClick={registerUser}
                style={{...styles.buttonFull, background: '#4F46E5', color: 'white', padding: '16px', fontSize: '18px'}}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={styles.tabs}>
              <button
                onClick={() => setActiveTab('marketplace')}
                style={{...styles.tab, ...(activeTab === 'marketplace' ? styles.tabActive : styles.tabInactive)}}
              >
                <ShoppingCart size={20} />
                Chợ ({items.filter(i => !i.sold).length})
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                style={{...styles.tab, ...(activeTab === 'sell' ? styles.tabActive : styles.tabInactive)}}
              >
                <Plus size={20} />
                Đăng bán
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{...styles.tab, ...(activeTab === 'history' ? styles.tabActive : styles.tabInactive)}}
              >
                <History size={20} />
                Lịch sử ({transactions.length})
              </button>
            </div>

            {activeTab === 'marketplace' && (
              <div>
                <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '24px'}}>
                  Chợ mua bán
                </h2>
                {items.filter(item => !item.sold).length === 0 ? (
                  <div style={styles.emptyState}>
                    <Package size={64} style={{margin: '0 auto 16px', opacity: 0.3}} />
                    <p>Chưa có vật phẩm nào được đăng bán</p>
                    <button
                      onClick={() => setActiveTab('sell')}
                      style={{...styles.button, ...styles.buttonPrimary, marginTop: '16px'}}
                    >
                      Đăng bán vật phẩm đầu tiên
                    </button>
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {items.filter(item => !item.sold).map((item) => (
                      <div key={item.id} style={styles.itemCard}>
                        <div style={styles.itemImage}>
                          <Package size={80} color="white" style={{opacity: 0.5}} />
                        </div>
                        <div style={styles.itemContent}>
                          <h3 style={styles.itemTitle}>{item.name}</h3>
                          <p style={styles.itemDescription}>{item.description || 'Không có mô tả'}</p>
                          <div style={styles.itemFooter}>
                            <span style={styles.itemPrice}>{item.price} ETH</span>
                            <span style={styles.itemSeller}>
                              👤 {item.sellerShort}...
                            </span>
                          </div>
                          <button
                            onClick={() => purchaseItem(item)}
                            disabled={item.seller === account || loading}
                            style={{
                              ...styles.buttonFull,
                              background: item.seller === account || loading ? '#D1D5DB' : '#4F46E5',
                              color: item.seller === account || loading ? '#6B7280' : 'white',
                              cursor: item.seller === account || loading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {loading ? 'Đang xử lý...' : item.seller === account ? 'Vật phẩm của bạn' : '🛒 Mua ngay'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sell' && (
              <div style={{maxWidth: '800px', margin: '0 auto'}}>
                <div style={styles.card}>
                  <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '24px'}}>
                    📦 Đăng bán vật phẩm
                  </h2>
                  
                  <div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tên vật phẩm *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="VD: Laptop Gaming ROG"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Mô tả</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Mô tả chi tiết về vật phẩm: tình trạng, đặc điểm..."
                        rows={4}
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Giá (ETH) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="0.00"
                        style={styles.input}
                      />
                    </div>

                    <button
                      onClick={listItem}
                      style={{...styles.buttonFull, background: '#10B981', color: 'white', padding: '14px'}}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : '🚀 Đăng bán ngay'}
                    </button>
                  </div>
                </div>

                <div style={{marginTop: '32px'}}>
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px'}}>
                    Vật phẩm của tôi
                  </h3>
                  {items.filter(item => item.seller === account).length === 0 ? (
                    <div style={styles.emptyState}>
                      <p>Bạn chưa đăng bán vật phẩm nào</p>
                    </div>
                  ) : (
                    items.filter(item => item.seller === account).map((item) => (
                      <div key={item.id} style={styles.myItem}>
                        <div style={{flex: 1}}>
                          <h4 style={{fontWeight: '600', color: '#1F2937', marginBottom: '4px'}}>{item.name}</h4>
                          <p style={{fontSize: '14px', color: '#6B7280'}}>{item.description || 'Không có mô tả'}</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '18px', fontWeight: 'bold', color: '#4F46E5', marginBottom: '4px'}}>
                            {item.price} ETH
                          </div>
                          <div style={{...styles.statusBadge, ...(item.sold ? styles.statusSold : styles.statusSelling)}}>
                            {item.sold ? '✅ Đã bán' : '⏳ Đang bán'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '24px'}}>
                  📊 Lịch sử giao dịch
                </h2>
                {transactions.length === 0 ? (
                  <div style={styles.emptyState}>
                    <History size={64} style={{margin: '0 auto 16px', opacity: 0.3}} />
                    <p>Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  [...transactions].reverse().map((tx) => {
                    const amount = tx.amount !== undefined ? tx.amount : 0;
                    return (
                      <div key={tx.id} style={styles.transactionCard}>
                        <div style={styles.transactionHeader}>
                          <div style={styles.transactionLeft}>
                            <div style={styles.transactionIcon}>{getTransactionIcon(tx.type)}</div>
                            <div style={styles.transactionInfo}>
                              <div style={styles.transactionType}>{getTransactionTypeText(tx.type)}</div>
                              <div style={styles.transactionDesc}>{tx.description}</div>
                            </div>
                          </div>
                          <div style={{
                            ...styles.transactionAmount,
                            ...(amount >= 0 ? styles.amountPositive : styles.amountNegative)
                          }}>
                            {amount >= 0 ? '+' : ''}{amount.toFixed(2)} ETH
                          </div>
                        </div>
                        <div style={styles.transactionTime}>
                          🕐 {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainMarketplace;