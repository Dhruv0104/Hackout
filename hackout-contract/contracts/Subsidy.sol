// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Subsidy {
    address public government;
    address public producer;

    struct Milestone {
        string description;
        uint256 amountWei;
        bool released;
        uint256 releasedAt;
    }

    Milestone[] public milestones;

    event Funded(address indexed from, uint256 value);
    event MilestoneAdded(uint256 indexed index, string description, uint256 amountWei);
    event MilestoneReleased(uint256 indexed index, uint256 amountWei, address indexed to);

    modifier onlyGovernment() {
        require(msg.sender == government, "Only government");
        _;
    }

    constructor(address _producer) payable {
        government = msg.sender;
        producer = _producer;
        if (msg.value > 0) {
            emit Funded(msg.sender, msg.value);
        }
    }

    function addMilestone(string memory _desc, uint256 _amountWei) external onlyGovernment {
        milestones.push(Milestone({
            description: _desc,
            amountWei: _amountWei,
            released: false,
            releasedAt: 0
        }));
        emit MilestoneAdded(milestones.length - 1, _desc, _amountWei);
    }

    function fund() external payable onlyGovernment {
        require(msg.value > 0, "No value");
        emit Funded(msg.sender, msg.value);
    }

    function releaseMilestone(uint256 index) external onlyGovernment {
        require(index < milestones.length, "Bad index");
        Milestone storage m = milestones[index];
        require(!m.released, "Already released");
        require(address(this).balance >= m.amountWei, "Insufficient escrow");
        m.released = true;
        m.releasedAt = block.timestamp;
        (bool ok, ) = payable(producer).call{value: m.amountWei}("");
        require(ok, "Transfer failed");
        emit MilestoneReleased(index, m.amountWei, producer);
    }

    function milestonesCount() external view returns (uint256) {
        return milestones.length;
    }

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }
}
