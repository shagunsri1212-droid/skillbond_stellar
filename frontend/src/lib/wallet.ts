import { isConnected, requestAccess } from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  const connection = await isConnected();
  if (connection.error) {
    throw new Error(connection.error);
  }
  if (!connection.isConnected) {
    throw new Error("Freighter wallet is not installed or available.");
  }

  const access = await requestAccess();
  if (access.error || !access.address) {
    throw new Error(access.error ?? "Wallet connection was declined.");
  }

  return access.address;
}
