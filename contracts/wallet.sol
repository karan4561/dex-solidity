// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/ERC20.sol)

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity ^0.8.0;

contract wallet {
    struct token {
        bytes32 ticker;
        address tokenAddress;
    }

    mapping(bytes32 => token) public tokenmapping;

    modifier TokenExist(bytes32 ticker) {
        require(tokenmapping[ticker].tokenAddress != address(0));
        _;
    }

    mapping(address => mapping(bytes32 => uint256)) public balance;

    bytes32[] public tokenlist;

    function addToken(bytes32 ticker, address tokenaddress) external {
        tokenlist.push(ticker);
        tokenmapping[ticker] = token(ticker, tokenaddress);
    }

    function deposit(bytes32 ticker, uint256 amt) external TokenExist(ticker) {
        balance[msg.sender][ticker] = balance[msg.sender][ticker] + amt;
        IERC20(tokenmapping[ticker].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amt
        );
    }

    function transfer(bytes32 ticker, uint256 amt) external TokenExist(ticker) {
        balance[msg.sender][ticker] = balance[msg.sender][ticker] - amt;
        IERC20(tokenmapping[ticker].tokenAddress).transfer(msg.sender, amt);
    }
}
