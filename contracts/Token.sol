// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourToken is ERC20 {
    /// @notice Maximum token supply (1 million tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000 * 1e18;

    /// @notice Faucet contract allowed to mint tokens
    address public immutable minter;

    constructor(
        string memory name_,
        string memory symbol_,
        address faucetAddress
    ) ERC20(name_, symbol_) {
        require(faucetAddress != address(0), "Invalid faucet address");
        minter = faucetAddress;
    }

    /**
     * @notice Mint new tokens (only callable by faucet)
     * @param to Recipient address
     * @param amount Amount to mint (in base units)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Caller is not faucet");
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Max supply exceeded"
        );

        _mint(to, amount);
    }
}
