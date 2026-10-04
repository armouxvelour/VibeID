// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// Self-claimed badges. Eligibility is checked in the app, not onchain.
contract VibeIDAchievements {
    uint256 public constant MAX_ID = 6;
    mapping(address => mapping(uint256 => bool)) public claimed;
    event AchievementClaimed(address indexed user, uint256 indexed id);
    function claimAchievement(uint256 id) external {
        require(id >= 1 && id <= MAX_ID, "unknown id");
        require(!claimed[msg.sender][id], "already claimed");
        claimed[msg.sender][id] = true;
        emit AchievementClaimed(msg.sender, id);
    }
}
