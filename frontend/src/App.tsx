import { FormEvent, useState } from "react";
import {
  approveMilestone,
  createProject,
  getProject,
  type Project,
  submitMilestone,
} from "./lib/projectClient";
import { connectWallet } from "./lib/wallet";

type Notice = {
  kind: "success" | "error" | "pending";
  message: string;
} | null;

const initialForm = {
  projectId: "",
  client: "",
  worker: "",
  amount: "",
  milestones: "1",
};

export default function App() {
  const [showApp, setShowApp] = useState(false);

  const [wallet, setWallet] = useState("");
  const [form, setForm] = useState(initialForm);
  const [lookupId, setLookupId] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  const enterApp = () => {
    setShowApp(true);

    setTimeout(() => {
      document
        .getElementById("workspace")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const run = async (work: () => Promise<string>) => {
    setBusy(true);
    setNotice({
      kind: "pending",
      message: "Waiting for wallet confirmation and Stellar RPC...",
    });

    try {
      setNotice({
        kind: "success",
        message: await work(),
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unexpected error.",
      });
    } finally {
      setBusy(false);
    }
  };

  const requireWallet = (): string => {
    if (!wallet) {
      throw new Error("Connect Freighter before continuing.");
    }

    return wallet;
  };

  const loadProject = async (projectId: string): Promise<Project> => {
    const loaded = await getProject(requireWallet(), projectId);

    setProject(loaded);
    setLookupId(loaded.projectId);

    return loaded;
  };

  const handleConnect = () =>
    void run(async () => {
      const address = await connectWallet();

      setWallet(address);

      setForm((current) => ({
        ...current,
        client: address,
      }));

      return `Connected ${shortAddress(address)}.`;
    });

  const handleDisconnect = () => {
    setWallet("");
    setProject(null);
    setNotice({
      kind: "success",
      message: "Wallet disconnected from this app.",
    });
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
      const result = await createProject({
        ...form,
        sourceAddress: requireWallet(),
      });

      await loadProject(form.projectId);

      return `Project created and confirmed. Transaction: ${result.hash}`;
    });
  };

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
      const loaded = await loadProject(lookupId);

      return `Loaded project ${loaded.projectId}.`;
    });
  };

  const handleSubmit = () =>
    void run(async () => {
      if (!project) {
        throw new Error("Find a project before submitting a milestone.");
      }

      if (wallet !== project.worker) {
        throw new Error(
          "Connect the worker wallet to submit this milestone.",
        );
      }

      const result = await submitMilestone(
        wallet,
        project.projectId,
      );

      await loadProject(project.projectId);

      return `Milestone submitted and confirmed. Transaction: ${result.hash}`;
    });

  const handleApprove = () =>
    void run(async () => {
      if (!project) {
        throw new Error("Find a project before approving a milestone.");
      }

      if (wallet !== project.client) {
        throw new Error(
          "Connect the client wallet to approve this milestone.",
        );
      }

      const result = await approveMilestone(
        wallet,
        project.projectId,
      );

      await loadProject(project.projectId);

      return `Milestone approved and confirmed. Transaction: ${result.hash}`;
    });

  /* -------------------------------------------------------
     LANDING PAGE
  ------------------------------------------------------- */

  if (!showApp) {
    return (
      <main className="landing-page">

        <nav className="landing-nav">
          <div className="brand-mark">
            SkillBond
          </div>

          <div className="nav-right">
            <span className="nav-network">
              <span />
              Stellar Testnet
            </span>

            <button
              className="nav-button"
              type="button"
              onClick={enterApp}
            >
              Launch app
            </button>
          </div>
        </nav>

        <section className="landing-hero">

          <div className="landing-hero-copy">

            <p className="eyebrow">
              ON-CHAIN WORK AGREEMENTS · STELLAR
            </p>

            <h1>
              Work first.
              <br />
              Trust the chain.
            </h1>

            <p className="landing-description">
              SkillBond gives students, freelancers and clients
              a simple milestone-based agreement system where
              progress and approvals are recorded on-chain.
            </p>

            <div className="landing-actions">

              <button
                className="landing-primary"
                type="button"
                onClick={enterApp}
              >
                Start an agreement
                <span>→</span>
              </button>

              <button
                className="landing-secondary"
                type="button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                How it works
              </button>

            </div>

          </div>

          <div className="landing-visual">

            <div className="agreement-sheet">

              <div className="sheet-top">
                <span>SKILLBOND / 001</span>
                <span>ACTIVE</span>
              </div>

              <div className="sheet-title">
                Website redesign
              </div>

              <div className="sheet-meta">
                <div>
                  <small>CLIENT</small>
                  <strong>G...7K2M</strong>
                </div>

                <div>
                  <small>WORKER</small>
                  <strong>G...92PX</strong>
                </div>
              </div>

              <div className="sheet-progress">
                <div className="progress-label">
                  <span>Milestone progress</span>
                  <strong>02 / 03</strong>
                </div>

                <div className="progress-line">
                  <span />
                </div>
              </div>

              <div className="sheet-status">
                <span className="status-dot" />
                Awaiting client approval
              </div>

            </div>

          </div>

        </section>

        <section
          id="how-it-works"
          className="how-section"
        >

          <div className="section-intro">
            <p className="eyebrow">
              A SIMPLE WORKFLOW
            </p>

            <h2>
              Agreements without
              <br />
              unnecessary friction.
            </h2>
          </div>

          <div className="steps">

            <article className="landing-step">
              <span className="step-number">01</span>

              <h3>Create</h3>

              <p>
                A client creates an agreement with a
                worker, amount and milestone count.
              </p>
            </article>

            <article className="landing-step">
              <span className="step-number">02</span>

              <h3>Submit</h3>

              <p>
                The assigned worker submits completed
                work through their connected wallet.
              </p>
            </article>

            <article className="landing-step">
              <span className="step-number">03</span>

              <h3>Approve</h3>

              <p>
                The client reviews the milestone and
                records approval directly on-chain.
              </p>
            </article>

          </div>

        </section>

        <section className="landing-bottom">

          <div>
            <p className="eyebrow">
              BUILT ON STELLAR
            </p>

            <h2>
              A lightweight foundation
              for independent work.
            </h2>
          </div>

          <button
            className="landing-primary"
            type="button"
            onClick={enterApp}
          >
            Enter SkillBond
            <span>→</span>
          </button>

        </section>

        <footer className="landing-footer">
          <span>SkillBond</span>
          <span>Stellar Testnet · Soroban</span>
        </footer>

      </main>
    );
  }

  /* -------------------------------------------------------
     APPLICATION
  ------------------------------------------------------- */

  return (
    <main id="workspace" className="app-shell">

      <section className="hero">

        <div>
          <p className="eyebrow">
            STELLAR TESTNET · SOROBAN
          </p>

          <h1>SkillBond</h1>

          <p className="hero-copy">
            A simple on-chain milestone workflow for
            clients and student freelancers.
          </p>
        </div>

        <div className="network-badge">
          <span />
          Testnet
        </div>

      </section>

      <div className="back-to-home">
        <button
          className="secondary-button"
          type="button"
          onClick={() => setShowApp(false)}
        >
          ← Back to SkillBond
        </button>
      </div>

      <section className="wallet-card card">

        <div>
          <p className="card-kicker">
            01 · CONNECT WALLET
          </p>

          <h2>
            {wallet
              ? "Wallet connected"
              : "Connect your Freighter wallet"}
          </h2>

          <p className="secondary">
            {wallet
              ? "Use this account to create, submit, or approve a project."
              : "Freighter is required to sign Testnet transactions."}
          </p>

          <p
            className={`wallet-address ${
              wallet ? "connected" : ""
            }`}
          >
            {wallet || "No wallet connected"}
          </p>
        </div>

        {wallet ? (
          <button
            className="secondary-button"
            type="button"
            onClick={handleDisconnect}
            disabled={busy}
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={busy}
          >
            Connect Freighter
          </button>
        )}

      </section>

      {notice && (
        <p
          role="status"
          className={`notice ${notice.kind}`}
        >
          {notice.message}
        </p>
      )}

      <section className="workflow-grid">

        <form
          className="card create-card"
          onSubmit={handleCreate}
        >

          <p className="card-kicker">
            02 · CREATE PROJECT
          </p>

          <h2>Start an agreement</h2>

          <p className="secondary">
            The connected wallet is recorded as the client.
          </p>

          <label>
            Project ID
            <input
              required
              inputMode="numeric"
              placeholder="e.g. 1001"
              value={form.projectId}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectId: e.target.value,
                })
              }
            />
          </label>

          <label>
            Worker public address
            <input
              required
              placeholder="G..."
              value={form.worker}
              onChange={(e) =>
                setForm({
                  ...form,
                  worker: e.target.value,
                })
              }
            />
          </label>

          <label>
            Agreed amount (base units)
            <input
              required
              inputMode="numeric"
              placeholder="e.g. 10000000"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
            />
          </label>

          <label>
            Milestone count
            <input
              required
              min="1"
              type="number"
              value={form.milestones}
              onChange={(e) =>
                setForm({
                  ...form,
                  milestones: e.target.value,
                })
              }
            />
          </label>

          <button
            type="submit"
            disabled={busy || !wallet}
          >
            Create project
          </button>

        </form>

        <form
          className="card find-card"
          onSubmit={handleLookup}
        >

          <p className="card-kicker">
            03 · FIND PROJECT
          </p>

          <h2>Load an agreement</h2>

          <p className="secondary">
            Enter a project ID to read its current
            Soroban state.
          </p>

          <label>
            Project ID
            <input
              required
              inputMode="numeric"
              placeholder="e.g. 1001"
              value={lookupId}
              onChange={(e) =>
                setLookupId(e.target.value)
              }
            />
          </label>

          <button
            type="submit"
            disabled={busy || !wallet}
          >
            Get project
          </button>

          <p className="helper">
            A connected, funded Testnet account is used
            as the RPC source account.
          </p>

        </form>

      </section>

      <section className="project-section">

        <div className="section-heading">

          <div>
            <p className="card-kicker">
              PROJECT STATE
            </p>

            <h2>
              {project
                ? `Project #${project.projectId}`
                : "Find a project to continue"}
            </h2>
          </div>

          {project && (
            <span
              className={`status-pill ${project.status.toLowerCase()}`}
            >
              {project.status}
            </span>
          )}

        </div>

        {project ? (
          <div className="project-details card">

            <div className="project-detail">
              <span className="label">Client</span>
              <strong>{project.client}</strong>
            </div>

            <div className="project-detail">
              <span className="label">Worker</span>
              <strong>{project.worker}</strong>
            </div>

            <div className="project-detail">
              <span className="label">Agreed amount</span>
              <strong>{project.amount}</strong>
            </div>

            <div className="project-detail">
              <span className="label">Milestones</span>
              <strong>{project.milestones}</strong>
            </div>

            <div className="project-detail">
              <span className="label">Current milestone</span>
              <strong>
                {project.current} of {project.milestones}
              </strong>
            </div>

            <div className="project-detail">
              <span className="label">
                Awaiting client approval
              </span>

              <strong>
                {project.submitted ? "Yes" : "No"}
              </strong>
            </div>

          </div>
        ) : (
          <div className="empty-state">
            No project loaded. Connect Freighter,
            then enter a project ID above.
          </div>
        )}

      </section>

      <section className="role-grid">

        <article className="card role-card">

          <p className="card-kicker">
            04 · WORKER FLOW
          </p>

          <h2>Submit milestone</h2>

          <p className="secondary">
            Only the worker address stored on the project
            can sign this action.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              busy ||
              !project ||
              project.submitted ||
              wallet !== project?.worker
            }
          >
            Submit milestone
          </button>

          {!project ? (
            <p className="helper">
              Find a project first.
            </p>
          ) : wallet !== project.worker ? (
            <p className="helper">
              Connect the worker wallet to enable this action.
            </p>
          ) : null}

        </article>

        <article className="card role-card">

          <p className="card-kicker">
            05 · CLIENT FLOW
          </p>

          <h2>Approve milestone</h2>

          <p className="secondary">
            Only the client address stored on the project
            can approve a submitted milestone.
          </p>

          <button
            className="olive-button"
            type="button"
            onClick={handleApprove}
            disabled={
              busy ||
              !project ||
              !project.submitted ||
              wallet !== project?.client
            }
          >
            Approve milestone
          </button>

          {!project ? (
            <p className="helper">
              Find a project first.
            </p>
          ) : wallet !== project.client ? (
            <p className="helper">
              Connect the client wallet to enable this action.
            </p>
          ) : !project.submitted ? (
            <p className="helper">
              Waiting for the worker to submit.
            </p>
          ) : null}

        </article>

      </section>

      <footer>
        SkillBond · Stellar Testnet · Soroban
      </footer>

    </main>
  );
}

function shortAddress(address: string): string {
  return address.length > 14
    ? `${address.slice(0, 7)}...${address.slice(-5)}`
    : address;
}