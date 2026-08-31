import { signTransaction } from "@stellar/freighter-api";
import {
  BASE_FEE,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc as StellarRpc,
} from "@stellar/stellar-sdk";

const rpcUrl =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
const networkPassphrase =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;

export type Project = {
  projectId: string;
  client: string;
  worker: string;
  amount: string;
  milestones: number;
  current: number;
  submitted: boolean;
  status: string;
};

export type TransactionResult = {
  hash: string;
  status: string;
};

function contractId(): string {
  const id = import.meta.env.VITE_PROJECT_CONTRACT_ID?.trim();
  if (!id) {
    throw new Error("Set VITE_PROJECT_CONTRACT_ID before using the project contract.");
  }
  return id;
}

function server(): StellarRpc.Server {
  return new StellarRpc.Server(rpcUrl);
}

function parseProjectId(value: string): bigint {
  try {
    const id = BigInt(value);
    if (id < 0n) throw new Error();
    return id;
  } catch {
    throw new Error("Project ID must be a non-negative whole number.");
  }
}

function normalizeStatus(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const variant = Object.keys(value as Record<string, unknown>)[0];
    if (variant) return variant;
  }
  return "Unknown";
}

function toProject(value: unknown): Project {
  const raw = value as Record<string, unknown>;
  return {
    projectId: String(raw.project_id),
    client: String(raw.client),
    worker: String(raw.worker),
    amount: String(raw.amount),
    milestones: Number(raw.milestones),
    current: Number(raw.current),
    submitted: Boolean(raw.submitted),
    status: normalizeStatus(raw.status),
  };
}

async function buildInvocation(
  sourceAddress: string,
  functionName: string,
  args: ReturnType<typeof nativeToScVal>[],
) {
  const rpc = server();
  const source = await rpc.getAccount(sourceAddress);
  const transaction = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId(),
        function: functionName,
        args,
      }),
    )
    .setTimeout(30)
    .build();

  return { rpc, transaction };
}

async function submitInvocation(
  sourceAddress: string,
  functionName: string,
  args: ReturnType<typeof nativeToScVal>[],
): Promise<TransactionResult> {
  const { rpc, transaction } = await buildInvocation(sourceAddress, functionName, args);
  const prepared = await rpc.prepareTransaction(transaction);
  const signature = await signTransaction(prepared.toXdr(), {
    address: sourceAddress,
    networkPassphrase,
  });

  if (signature.error || !signature.signedTxXdr) {
    throw new Error(signature.error ?? "Wallet did not return a signed transaction.");
  }

  const signed = TransactionBuilder.fromXdr(signature.signedTxXdr, networkPassphrase);
  const sent = await rpc.sendTransaction(signed);
  if (sent.status !== "PENDING") {
    throw new Error(`Transaction was not accepted: ${sent.status}`);
  }

  const result = await rpc.pollTransaction(sent.hash, {
    attempts: 30,
    sleepStrategy: () => 1_000,
  });
  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction did not succeed: ${result.status}`);
  }

  return { hash: sent.hash, status: result.status };
}

export async function createProject(input: {
  sourceAddress: string;
  projectId: string;
  client: string;
  worker: string;
  amount: string;
  milestones: string;
}): Promise<TransactionResult> {
  if (input.client !== input.sourceAddress) {
    throw new Error("The connected wallet must be the project client.");
  }

  let amount: bigint;
  let milestones: number;
  try {
    amount = BigInt(input.amount);
    milestones = Number(input.milestones);
  } catch {
    throw new Error("Amount and milestone count must be whole numbers.");
  }
  if (amount <= 0n || !Number.isInteger(milestones) || milestones <= 0) {
    throw new Error("Amount and milestone count must be greater than zero.");
  }

  return submitInvocation(input.sourceAddress, "create_project", [
    nativeToScVal(parseProjectId(input.projectId), { type: "u64" }),
    nativeToScVal(input.client, { type: "address" }),
    nativeToScVal(input.worker, { type: "address" }),
    nativeToScVal(amount, { type: "i128" }),
    nativeToScVal(milestones, { type: "u32" }),
  ]);
}

export async function getProject(
  sourceAddress: string,
  projectId: string,
): Promise<Project> {
  const { rpc, transaction } = await buildInvocation(sourceAddress, "get_project", [
    nativeToScVal(parseProjectId(projectId), { type: "u64" }),
  ]);
  const simulation = await rpc.simulateTransaction(transaction);
  if ("error" in simulation) {
    throw new Error(`Project lookup failed: ${simulation.error}`);
  }
  if (!simulation.result?.retval) {
    throw new Error("Project lookup failed or the project was not found.");
  }
  return toProject(scValToNative(simulation.result.retval));
}

export async function submitMilestone(
  sourceAddress: string,
  projectId: string,
): Promise<TransactionResult> {
  return submitInvocation(sourceAddress, "submit_milestone", [
    nativeToScVal(parseProjectId(projectId), { type: "u64" }),
  ]);
}

export async function approveMilestone(
  sourceAddress: string,
  projectId: string,
): Promise<TransactionResult> {
  return submitInvocation(sourceAddress, "approve_milestone", [
    nativeToScVal(parseProjectId(projectId), { type: "u64" }),
  ]);
}
