#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal,
};

fn setup<'a>() -> (Env, ContractClient<'a>) {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id).mock_all_auths();
    (env, client)
}

#[test]
fn test_create_project() {
    let (env, client) = setup();

    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&1u64, &client_addr, &worker_addr, &100i128, &2u32);

    let project = client.get_project(&1u64);
    assert_eq!(project.project_id, 1u64);
    assert_eq!(project.client, client_addr);
    assert_eq!(project.worker, worker_addr);
    assert_eq!(project.amount, 100i128);
    assert_eq!(project.milestones, 2u32);
    assert_eq!(project.current, 0u32);
    assert_eq!(project.status, ProjectStatus::Active);
}

#[test]
fn test_duplicate_project_rejected() {
    let (env, client) = setup();
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&2u64, &client_addr, &worker_addr, &50i128, &1u32);

    let res = client.try_create_project(&2u64, &client_addr, &worker_addr, &50i128, &1u32);
    assert!(matches!(
        res,
        Err(Ok(ContractError::ProjectAlreadyExists))
    ));
}

#[test]
fn test_worker_can_submit_milestone() {
    let (env, client) = setup();
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&3u64, &client_addr, &worker_addr, &200i128, &2u32);

    // worker submits
    client.submit_milestone(&3u64);

    let proj = client.get_project(&3u64);
    assert!(proj.submitted);
}

#[test]
fn test_client_can_approve_submitted_milestone() {
    let (env, client) = setup();
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&4u64, &client_addr, &worker_addr, &300i128, &2u32);

    client.submit_milestone(&4u64);

    client.approve_milestone(&4u64);

    let proj = client.get_project(&4u64);
    assert_eq!(proj.current, 1u32);
}

#[test]
fn test_client_cannot_approve_without_submission() {
    let (env, client) = setup();
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&5u64, &client_addr, &worker_addr, &400i128, &1u32);

    // client tries to approve without submission
    let res = client.try_approve_milestone(&5u64);
    assert!(matches!(
        res,
        Err(Ok(ContractError::MilestoneNotSubmitted))
    ));
}

#[test]
fn test_non_worker_cannot_submit() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);
    let other = Address::generate(&env);

    client
        .mock_all_auths()
        .create_project(&6u64, &client_addr, &worker_addr, &150i128, &1u32);

    // other tries to submit
    let res = client
        .mock_auths(&[MockAuth {
            address: &other,
            invoke: &MockAuthInvoke {
                contract: &contract_id,
                fn_name: "submit_milestone",
                args: (&6u64,).into_val(&env),
                sub_invokes: &[],
            },
        }])
        .try_submit_milestone(&6u64);
    assert!(res.is_err());
}

#[test]
fn test_project_completes_after_final_milestone() {
    let (env, client) = setup();
    let client_addr = Address::generate(&env);
    let worker_addr = Address::generate(&env);

    client
        .create_project(&7u64, &client_addr, &worker_addr, &500i128, &2u32);

    // first milestone
    client.submit_milestone(&7u64);
    client.approve_milestone(&7u64);

    // second milestone
    client.submit_milestone(&7u64);
    client.approve_milestone(&7u64);

    let proj = client.get_project(&7u64);
    assert_eq!(proj.status, ProjectStatus::Completed);
}
