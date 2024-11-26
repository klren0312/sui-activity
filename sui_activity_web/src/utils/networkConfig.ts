import { getFullnodeUrl } from '@mysten/sui/client'
import {
	TESTNET_PACKAGE_ID,
	DEVNET_PACKAGE_ID,
} from './constants'
import { createNetworkConfig } from '@mysten/dapp-kit'

const { networkConfig, useNetworkVariable, useNetworkVariables } =
	createNetworkConfig({
		/**
		  sui-api.rpcpool.com
			sui-rpc.testnet.lgns.net
			rpc-sui-testnet.cosmostation.io
			https://testnet.artifact.systems/sui
			https://sui-testnet-rpc.bartestnet.com/
			https://sui-testnet-rpc.allthatnode.com
			https://sui-rpc-pt.testnet-pride.com/
			https://sui-testnet-endpoint.blockvision.org/
			https://rpc-testnet.suiscan.xyz/
			https://sui-testnet.brightlystake.com/
			https://sui-testnet-rpc-germany.allthatnode.com/
			https://sui-testnet-rpc-korea.allthatnode.com/
			PUBLIC: https://fullnode.testnet.sui.io
		 */
		testnet: {
			url: getFullnodeUrl('testnet'),
			variables: {
				packageId: TESTNET_PACKAGE_ID,
			},
		},
		devnet: {
			url: getFullnodeUrl('devnet'),
			variables: {
				packageId: DEVNET_PACKAGE_ID,
			},
		},
	})

export { useNetworkVariable, useNetworkVariables, networkConfig }
