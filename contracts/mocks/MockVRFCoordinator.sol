// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract MockVRFCoordinator is VRFCoordinatorV2Interface {
    uint256 private nonce = 0;
    mapping(uint256 => address) private consumers;

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = nonce++;
        consumers[requestId] = msg.sender;
        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        VRFConsumerBaseV2(consumers[requestId]).rawFulfillRandomWords(
            requestId,
            randomWords
        );
    }

    // Unused interface methods
    function getRequestConfig() external pure returns (uint16, uint32, bytes32[] memory) {
        revert("Not implemented");
    }

    function createSubscription() external pure returns (uint64) {
        revert("Not implemented");
    }

    function getSubscription(uint64) external pure returns (uint96, uint64, address, address[] memory) {
        revert("Not implemented");
    }

    function requestSubscriptionOwnerTransfer(uint64, address) external pure {
        revert("Not implemented");
    }

    function acceptSubscriptionOwnerTransfer(uint64) external pure {
        revert("Not implemented");
    }

    function addConsumer(uint64, address) external pure {
        revert("Not implemented");
    }

    function removeConsumer(uint64, address) external pure {
        revert("Not implemented");
    }

    function cancelSubscription(uint64, address) external pure {
        revert("Not implemented");
    }

    function pendingRequestExists(uint64) external pure returns (bool) {
        revert("Not implemented");
    }
}
