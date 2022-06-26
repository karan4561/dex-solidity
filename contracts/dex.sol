// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/ERC20.sol)

import './wallet.sol';

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract Dex is wallet {

    enum Side {
        buy,
        sell
    }

    uint public counter;

    struct order{
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

    mapping (bytes32=>mapping(uint=>order[])) orderlist;

      function depositEth() payable external {
        balance[msg.sender][bytes32("ETH")] = balance[msg.sender][bytes32("ETH")]+(msg.value);
    }

    function getOrderBook(bytes32 ticker, Side side) view public returns(order[] memory){
        return orderlist[ticker][uint(side)];
    }

    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public{
    
        if(side==Side.buy){
            require(balance[msg.sender]["ETH"]>=amount*price);
        }

        if(side==Side.sell){
            require(balance[msg.sender][ticker]>amount);
        }

        order[] storage orders = orderlist[ticker][uint(side)];

        orders.push(order(counter,msg.sender,side,ticker,amount,price,0));

        uint i=orders.length-1;
        if(i<=0)
            i=0;

        if(side==Side.buy){

        while(i>0){

                if(orders[i-1].price>orders[i].price)
                    break;

                else {
                    order memory vari = orders[i];
                    orders[i]=orders[i-1];
                    orders[i-1]=vari;
                    i--;
                }
            
            }
        }

        if(side==Side.sell){

            while(i>0){

                if(orders[i].price>orders[i-1].price)
                    break;
                
                else{
                    order memory vari=orders[i-1];
                    orders[i-1]=orders[i];
                    orders[i]=vari;
                    i--;
                }
            }
        }
        
                counter++;

    }

    function createMarketOrder(Side side,bytes32 ticker,uint amount) public{
        
        if(side==Side.sell)
        {
            require(balance[msg.sender][ticker]>=amount,"Insuffiecient Balance");
        }
        
        uint total;
        order[] storage orders = orderlist[ticker][uint(side)];

        for (uint256 i = 0; i < orders.length && total<amount; i++) {
            //how much we can fill from order[i]

            uint ans;
            uint left = amount-total;
            uint req = orders[i].amount - orders[i].filled;

            if(left>req)
                ans=req;
            else
                ans=left;

            total+=ans;

            orders[i].filled+=ans;

            if(side==Side.buy)
            {
                //verify that the buyer has enough eth
                require(balance[msg.sender]["ETH"]>=ans*(orders[i].price));

                balance[msg.sender]["ETH"]-=ans*(orders[i].price);
                balance[msg.sender][ticker]+=ans;

                balance[orders[i].trader]["ETH"]+=ans*(orders[i].price);
                balance[orders[i].trader][ticker]-=ans;
                //IERC20(tokenmapping[ticker].tokenAddress).transfer(msg.sender,amount);
                //execute the trade
            }

            if(side==Side.sell){
                balance[msg.sender]["ETH"]+=ans*(orders[i].price);
                balance[msg.sender][ticker]-=ans;

                balance[orders[i].trader]["ETH"]-=ans*(orders[i].price);
                balance[orders[i].trader][ticker]+=ans;
                
               // IERC20(tokenmapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
            }
            //update total

            //adjust trade of buyer seller


            //verify that the buyer has enough eth
        }


        while(orders.length>0 && orders[0].filled==orders[0].amount){

                for (uint i=0;i<orders.length-1;i++){
                    
                    orders[i]=orders[i+1];

                }

                orders.pop();

            }

        //remove 100% filled orders
    }
}