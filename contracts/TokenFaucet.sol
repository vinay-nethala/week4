// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";

contract TokenFaucet {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Tokens distributed per claim (100 tokens)
    uint256 public constant FAUCET_AMOUNT = 100 * 1e18;

    /// @notice Cooldown period between claims (24 hours)
    uint256 public constant COOLDOWN_TIME = 24 hours;

    /// @notice Maximum tokens claimable per address in lifetime
    uint256 public constant MAX_CLAIM_AMOUNT = 1_000 * 1e18;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice ERC20 token distributed by the faucet
    YourToken public token;

    /// @notice Faucet admin (deployer)
    address public immutable admin;

    /// @notice Pause state
    bool private paused;

    /// @notice Last claim timestamp per address
    mapping(address => uint256) public lastClaimAt;

    /// @notice Total tokens claimed per address
    mapping(address => uint256) public totalClaimed;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event TokensClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event FaucetPaused(bool paused);

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address tokenAddress) {
        admin = msg.sender;
        paused = false;

        // Token may be set later (useful for tests & deployment)
        if (tokenAddress != address(0)) {
            token = YourToken(tokenAddress);
        }
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets token address (admin-only, one-time)
     */
    function setToken(address tokenAddress) external {
        require(msg.sender == admin, "Caller is not admin");
        require(address(token) == address(0), "Token already set");
        require(tokenAddress != address(0), "Invalid token address");

        token = YourToken(tokenAddress);
    }

    /**
     * @notice Pause or unpause faucet (admin-only)
     */
    function setPaused(bool _paused) external {
        require(msg.sender == admin, "Caller is not admin");
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    /*//////////////////////////////////////////////////////////////
                           FAUCET LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Request faucet tokens
     */
    function requestTokens() external {
        require(!paused, "Faucet is paused");
        require(address(token) != address(0), "Token not set");

        require(
            block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME,
            "Cooldown period not elapsed"
        );

        require(
            totalClaimed[msg.sender] + FAUCET_AMOUNT <= MAX_CLAIM_AMOUNT,
            "Lifetime claim limit reached"
        );

        // ---- Effects ----
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        // ---- Interaction ----
        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(
            msg.sender,
            FAUCET_AMOUNT,
            block.timestamp
        );
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function canClaim(address user) external view returns (bool) {
        if (paused) return false;
        if (address(token) == address(0)) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user)
        external
        view
        returns (uint256)
    {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function isPaused() external view returns (bool) {
        return paused;
    }
}
