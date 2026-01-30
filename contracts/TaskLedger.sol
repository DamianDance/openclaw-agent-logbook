// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TaskLedger {
    struct Task {
        string text;
        address sender;
        uint256 timestamp;
    }

    Task[] public tasks;

    event TaskAdded(uint256 indexed index, address indexed sender, string text, uint256 timestamp);

    function addTask(string calldata text) external {
        require(bytes(text).length > 0, "EMPTY");
        require(bytes(text).length <= 280, "TOO_LONG");
        tasks.push(Task({
            text: text,
            sender: msg.sender,
            timestamp: block.timestamp
        }));
        emit TaskAdded(tasks.length - 1, msg.sender, text, block.timestamp);
    }

    function taskCount() external view returns (uint256) {
        return tasks.length;
    }
}
