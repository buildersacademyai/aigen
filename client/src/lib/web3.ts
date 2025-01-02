import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Get the chain ID to ensure we're on the correct network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    // Store both address and chain ID
    localStorage.setItem('lastAddress', accounts[0]);
    localStorage.setItem('lastChainId', chainId);

    return accounts[0];
  } catch (error) {
    throw new Error("Failed to connect wallet");
  }
}

export async function signMessage(address: string, message: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    throw new Error("Failed to sign message");
  }
}