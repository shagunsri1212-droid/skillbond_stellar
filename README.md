# SkillBond

Trustless milestone escrow for student and freelance work, powered by Stellar.

## Overview

SkillBond is a production-oriented MVP foundation for a Stellar-powered milestone escrow platform. It is designed to connect clients and student freelancers through secure, contract-backed payment flows while keeping the repository focused and easy to evolve.

## Problem

Students and freelance clients often struggle with trust when payment is tied to work milestones. Clients worry about paying early, while freelancers worry about receiving funds after delivering agreed work.

## Solution

SkillBond locks client funds in a Soroban escrow contract and releases milestone payments only after the correct milestone approval action occurs. This removes single-party trust from the payment flow and provides transparent, blockchain-backed milestone settlement.

## Core Workflow

- Client creates project
- Client funds escrow
- Worker accepts the project
- Worker submits a milestone
- Client approves the milestone
- Payment is released from escrow
- Reputation is updated for successful participants
- Event appears in the activity feed

## Planned Features

- Stellar wallet connection
- Project creation
- Milestone management
- Soroban escrow
- Inter-contract communication
- Reputation system
- Smart contract events
- Real-time activity feed
- Transaction status
- Error handling
- Loading states
- Responsive mobile UI
- Contract tests
- Frontend tests
- CI/CD
- Stellar Testnet deployment

## Smart Contracts

- Project Contract: manages project lifecycle, milestones, participants, and approval state.
- Escrow Contract: holds client deposits and releases payments when milestones are approved.
- Reputation Contract: tracks reputation and success metrics for freelancers and clients.

## Architecture

The planned architecture connects the React frontend to a backend API and event processor, which indexes Soroban contract events from Stellar RPC and serves real-time updates.

## Technology Stack

- Rust + Soroban SDK for smart contracts
- React + Vite + TypeScript for frontend
- Node.js + TypeScript for backend
- PostgreSQL for indexed application and event data
- Stellar RPC for blockchain data and events
- GitHub Actions for CI/CD
- Vercel for frontend deployment

## Security

Private keys, Stellar secret keys, wallet credentials, API secrets, and database passwords must never be committed to GitHub. The repository foundation is intentionally kept free of secrets and environment values.

## Development Roadmap

- Phase 1 — Repository and environment
- Phase 2 — Smart contract foundation
- Phase 3 — Contract tests
- Phase 4 — Inter-contract communication
- Phase 5 — Stellar Testnet deployment
- Phase 6 — Backend and event processing
- Phase 7 — Frontend and wallet integration
- Phase 8 — Frontend testing
- Phase 9 — CI/CD
- Phase 10 — Production deployment and documentation

## Project Status

In Development
