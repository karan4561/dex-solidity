// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/ERC20.sol)

import '../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';


pragma solidity ^0.8.0;

contract link is ERC20{

    constructor() ERC20("CHAINLINK","LINK") public{

        _mint(msg.sender,1000);

    }

}