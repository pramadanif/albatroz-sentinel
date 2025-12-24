// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {AlbatrozSentinel} from "./AlbatrozSentinel.sol";

contract DeployReactive is Script {
    // Sepolia contract addresses (from deployment)
    address constant VAULT_ADDRESS = 0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66;
    address constant POOL_A_ADDRESS = 0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47;
    address constant POOL_B_ADDRESS = 0xBE2bcf983b84c030b0C851989aDF351816fA21D2;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy AlbatrozSentinel contract directly
        AlbatrozSentinel sentinel = new AlbatrozSentinel(VAULT_ADDRESS, POOL_A_ADDRESS, POOL_B_ADDRESS);

        vm.stopBroadcast();

        console.log("AlbatrozSentinel deployed at:", address(sentinel));
        console.log("Vault Address:", VAULT_ADDRESS);
        console.log("Pool A Address:", POOL_A_ADDRESS);
        console.log("Pool B Address:", POOL_B_ADDRESS);
    }
}
