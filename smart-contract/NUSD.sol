
// SPDX-License-Identifier: MIT

import "./Ownable.sol";

pragma solidity ^0.8.0;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

pragma solidity ^0.8.0;

interface AggregatorV3Interface {

  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  ) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

  function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

pragma solidity ^0.8.13;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}


pragma solidity ^0.8.13;

/*
* @author @pikachulfg Priyanshu Gaikwad
*/

contract NUSD is IERC20,Ownable {
    using SafeMath for uint256;
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "nUSD";
    string public symbol = "nUSD";
    uint8 public decimals = 18;

    AggregatorV3Interface internal dataFeed;

    constructor()  {
        dataFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e  //Price Feed
        );

    }

    function transfer(address recipient, uint amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    /*
    * @dev Deposit function to convert ETH to nUSD
           1 ETH = Current ETHUSD Rate/2 nUSD
           Mints nUSD to sender
    */
    function deposit() external payable {
        require(msg.value > 0,"Zero Ether");
        mint(msg.sender,msg.value);       
    }

    /*
    * @dev Redeem function to convert nUSD to ETH
           x nUSD = x/Current ETHUSD Rate ETH
           Transfers ETH to sender
    */
    function redeem(uint amount) external  {
        require(balanceOf[msg.sender] >= amount,"Not Enough Balance");
        require(allowance[msg.sender][address(this)] >= amount,"No Allowance");
        burn(payable(msg.sender),amount);       
    }

    /*
    * @dev Redeem complete nUSD balance of the sender
    */
    function redeemAll() external  {
        require(balanceOf[msg.sender] > 0,"Not Enough Balance");
        uint amount = balanceOf[msg.sender];
        require(allowance[msg.sender][address(this)] >= amount,"No Allowance");
        
        burn(payable(msg.sender),amount);       
    }

    /*
    * @dev Internal Minter
    */
    function mint(address account,uint amount) internal {
        uint price = uint(getLatestData());
        uint mintable = price.div(10**8).mul(amount).div(2);
        balanceOf[account] += mintable;
        totalSupply += mintable;
        emit Transfer(address(0), account, mintable);
    }

    /*
    * @dev Internal Burner
    */
    function burn(address payable account,uint amount) internal {
        uint price = uint(getLatestData());
        uint redeemable = amount.div(price.div(10**8)).div(2);
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        account.transfer(redeemable);
        emit Transfer(msg.sender, address(0), amount);
    }

    function supply() public view returns(uint){
        return totalSupply;
    }

    /*
    * @dev Gets current ETHUSD Rate
    */
    function getLatestData() public view returns (int) {
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    /*
    * @dev EMERGENCY WITHDRAW
    */
    function emergencyWithdraw(address payable account) external payable onlyOwner{
        require(address(this).balance > 0,"No Balance");
        account.transfer(address(this).balance);
    }

}
