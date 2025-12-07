// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address payable seller;
        address buyer;
        bool sold;
    }
    
    struct User {
        address userAddress;
        uint256 balance;
        bool registered;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => Item) public items;
    uint256 public itemCount;
    
    event UserRegistered(address indexed user, uint256 initialBalance);
    event ItemListed(uint256 indexed itemId, string name, uint256 price, address seller);
    event ItemPurchased(uint256 indexed itemId, address buyer, address seller);
    
    // Đăng ký tài khoản và cấp tiền ban đầu
    function registerUser() public {
        require(!users[msg.sender].registered, "User already registered");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            balance: 1000 ether, // Cấp 1000 token ban đầu
            registered: true
        });
        
        emit UserRegistered(msg.sender, 1000 ether);
    }
    
    // Đăng bán vật phẩm
    function listItem(string memory _name, string memory _description, uint256 _price) public {
        require(users[msg.sender].registered, "User not registered");
        require(_price > 0, "Price must be greater than 0");
        
        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            name: _name,
            description: _description,
            price: _price,
            seller: payable(msg.sender),
            buyer: address(0),
            sold: false
        });
        
        emit ItemListed(itemCount, _name, _price, msg.sender);
    }
    
    // Mua vật phẩm
    function purchaseItem(uint256 _itemId) public {
        require(users[msg.sender].registered, "User not registered");
        require(_itemId > 0 && _itemId <= itemCount, "Invalid item ID");
        
        Item storage item = items[_itemId];
        require(!item.sold, "Item already sold");
        require(msg.sender != item.seller, "Cannot buy your own item");
        require(users[msg.sender].balance >= item.price, "Insufficient balance");
        
        // Chuyển tiền
        users[msg.sender].balance -= item.price;
        users[item.seller].balance += item.price;
        
        // Cập nhật trạng thái
        item.buyer = msg.sender;
        item.sold = true;
        
        emit ItemPurchased(_itemId, msg.sender, item.seller);
    }
    
    // Lấy số dư
    function getBalance() public view returns (uint256) {
        return users[msg.sender].balance;
    }
    
    // Kiểm tra đã đăng ký chưa
    function isRegistered() public view returns (bool) {
        return users[msg.sender].registered;
    }
}