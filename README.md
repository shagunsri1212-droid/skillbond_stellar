## SUBMISSION CHECKLIST
## 1) CI PASSING BADGE - [![CI](https://github.com/shagunsri1212-droid/skillbond_stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/shagunsri1212-droid/skillbond_stellar/actions/workflows/ci.yml)

<<<<<<< HEAD
## 2) Live demo link (Verce) - https://skillbond-stellar.vercel.app/
=======
[![CI](https://github.com/shagunsri1212-droid/skillbond_stellar/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shagunsri1212-droid/skillbond_stellar/actions/workflows/ci.yml)

Trustless milestone escrow for student and freelance work, powered by Stellar.
>>>>>>> dfb9df6 (ci badge fix)

## 3) Contract deployment address - VITE_PROJECT_CONTRACT_ID=CA4WFUELYGBCYRGQ7S35RNJHASVFDBYZ5PJ4GA255MIVZNLTJBBRSUHZ

## 4) Transaction hash for contract interaction - 15e00bae68eaa10e6a8ff4b2b925616771b896e905a5258f2e0edd6baaa440ef

## 5) Screenshot showing:
Mobile responsive UI
<img width="1222" height="973" alt="WhatsApp Image 2026-08-31 at 11 05 34 PM" src="https://github.com/user-attachments/assets/75e1daf6-06b2-4b60-80c5-e9f631b0514a" />

CI/CD pipeline running
<img width="895" height="220" alt="WhatsApp Image 2026-08-31 at 11 27 18 PM" src="https://github.com/user-attachments/assets/bb078ee9-54d8-4e6e-b64c-57d2a0238003" />



Test output with 3+ passing tests
<img width="1042" height="573" alt="WhatsApp Image 2026-08-31 at 11 49 01 PM" src="https://github.com/user-attachments/assets/02b08a8b-e00f-442b-9b72-cd2a3b6d2323" />



## 6) Demo video link (1–2 minutes)


<div align="center">

# 🤝 SkillBond

### Stellar-powered milestone escrow for student freelancers

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7b16ff?logo=stellar&logoColor=white)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-7b16ff?logo=stellar&logoColor=white)](https://soroban.stellar.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A simple on-chain milestone workflow for clients and student freelancers.
> SkillBond enables clients and workers to create, submit, and approve project milestones
> using Stellar Soroban smart contracts.

GitHub username → `shagunsri1212-droid`
GitHub repo → Coming soon

</div>

---

## ✨ What is this?

**SkillBond** is a Stellar-based decentralized milestone escrow platform designed for
**clients and student freelancers**.

The platform provides a simple on-chain workflow where a client can create a project,
assign a worker, define an agreed amount and milestones, and release the agreed payment
after the worker submits a completed milestone and the client approves it.

The application uses **Stellar Testnet** and **Soroban smart contracts** to record and
process the project workflow on-chain.

---

## 🚀 Live Links & Testnet Deployments

| | |
|---|---|
| **Live deployed link** | Coming soon |
| **Demo video link** | Coming soon |
| **GitHub repository** | Coming soon |
| **Stellar Testnet Explorer** | Coming soon |

**Network:** Stellar Testnet

**Smart Contract:** Soroban

**Contract ID:** Coming soon

---

## 📸 Screenshots

Coming soon

---

## ✨ Features

- **🔗 Connect Stellar wallet** — Connect a Stellar wallet to interact with the application.
- **📋 Create projects** — A client can create a project agreement by specifying the project ID, worker public address, agreed amount, and milestone count.
- **👨‍💻 Worker assignment** — Each project stores the worker's Stellar public address.
- **💰 Agreed project amount** — The client specifies the amount agreed for the project.
- **🎯 Milestone-based workflow** — Projects can contain one or more milestones.
- **📤 Submit milestone** — Only the worker address stored on the project can submit a milestone.
- **✅ Approve milestone** — Only the client address stored on the project can approve a submitted milestone.
- **🔐 On-chain verification** — Project state and milestone actions are handled through Soroban smart contracts.
- **🔎 Load project state** — Users can enter a project ID and read its current Soroban state.
- **🌐 Stellar Testnet integration** — The application currently operates on Stellar Testnet.
- **🦊 Wallet-based authorization** — Actions are restricted according to the client and worker addresses stored in the project.

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| 🌐 Frontend | React, TypeScript, Vite |
| 👛 Wallet | Stellar wallet / Freighter |
| ⛓️ Blockchain | Stellar Testnet |
| 📜 Smart Contracts | Soroban |
| 🧪 Testing | Coming soon |
| 🚀 Deployment | Vercel |
| 📦 Version Control | GitHub |

---

## 🧪 Test Status

> Test results

Coming soon

| Suite | Result |
|-------|--------|
| Frontend tests | Coming soon |
| Smart contract tests | Coming soon |
| Build | Coming soon |
| GitHub Actions CI | Coming soon |

---

## 🏗️ Smart Contract

SkillBond uses a **Soroban smart contract** to manage the project milestone workflow.

### Project workflow

1. 👛 Client connects their Stellar wallet.
2. 📝 Client creates a project agreement.
3. 👨‍💻 Client specifies the worker's Stellar public address.
4. 💰 Client specifies the agreed project amount.
5. 🎯 Client specifies the number of milestones.
6. ⛓️ Project information is recorded on-chain.
7. 📤 Worker submits the milestone after completing the work.
8. 👀 Client reviews the submitted milestone.
9. ✅ Client approves the milestone.
10. 💸 The milestone payment is processed according to the smart contract logic.

---

## 🔐 Authorization

SkillBond uses wallet addresses to control who can perform specific actions.

### Client

Only the **client address stored on the project** can approve a submitted milestone.

### Worker

Only the **worker address stored on the project** can submit a milestone.

This provides an on-chain authorization mechanism without relying solely on
centralized application logic.

---

## 📊 Example Project

The application has been tested with the following project state:

| Property | Value |
|----------|-------|
| **Project ID** | `1001` |
| **Agreed Amount** | `100000000` |
| **Milestones** | `1` |
| **Current Milestone** | `1 of 1` |
| **Awaiting Client Approval** | `No` |
| **Network** | Stellar Testnet |

The project workflow has also been tested with project IDs:

```text
1001
1002
1003
