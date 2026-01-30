// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentLogbook {
    struct Entry {
        string task;
        address agent;
        uint256 timestamp;
    }

    Entry[] public entries;

    event TaskLogged(uint256 indexed index, address indexed agent, string task, uint256 timestamp);

    function logTask(string calldata task) external {
        require(bytes(task).length > 0, "EMPTY");
        require(bytes(task).length <= 280, "TOO_LONG");
        entries.push(Entry({
            task: task,
            agent: msg.sender,
            timestamp: block.timestamp
        }));
        emit TaskLogged(entries.length - 1, msg.sender, task, block.timestamp);
    }

    function entryCount() external view returns (uint256) {
        return entries.length;
    }
}
