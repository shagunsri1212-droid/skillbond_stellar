#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String,
};

#[contract]
pub struct Contract;

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ProjectStatus {
    Draft,
    Active,
    Completed,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Project {
    pub project_id: u64,
    pub client: Address,
    pub worker: Address,
    pub amount: i128,
    pub milestones: u32,
    pub current: u32,
    pub submitted: bool,
    pub status: ProjectStatus,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    ProjectAlreadyExists = 1,
    ProjectNotFound = 2,
    InvalidAmount = 3,
    InvalidMilestoneCount = 4,
    UnauthorizedClient = 5,
    UnauthorizedWorker = 6,
    InvalidProjectStatus = 7,
    NoMilestonesRemaining = 8,
    MilestoneNotSubmitted = 9,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProjectCreated {
    #[topic]
    pub project_id: u64,
    pub client: Address,
    pub worker: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MilestoneSubmitted {
    #[topic]
    pub project_id: u64,
    pub milestone: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MilestoneApproved {
    #[topic]
    pub project_id: u64,
    pub milestone: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProjectCompleted {
    #[topic]
    pub project_id: u64,
}

impl Contract {
    fn storage_key_project(env: &Env, project_id: u64) -> (String, u64) {
        (String::from_str(env, "PROJECT"), project_id)
    }
}

#[contractimpl]
impl Contract {
    /// Create a new project.
    ///
    /// Authorized: `client` must call and authorize this operation.
    /// State: stores a `Project` with status `Active` and `current` 0.
    pub fn create_project(
        env: Env,
        project_id: u64,
        client: Address,
        worker: Address,
        amount: i128,
        milestones: u32,
    ) -> Result<(), ContractError> {
        client.require_auth();

        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if milestones == 0 {
            return Err(ContractError::InvalidMilestoneCount);
        }

        let key = Contract::storage_key_project(&env, project_id);
        if env.storage().persistent().has(&key) {
            return Err(ContractError::ProjectAlreadyExists);
        }

        let project = Project {
            project_id,
            client: client.clone(),
            worker: worker.clone(),
            amount,
            milestones,
            current: 0,
            submitted: false,
            status: ProjectStatus::Active,
        };

        env.storage().persistent().set(&key, &project);

        ProjectCreated {
            project_id,
            client,
            worker,
        }
        .publish(&env);

        Ok(())
    }

    /// Retrieve a project by id.
    pub fn get_project(env: Env, project_id: u64) -> Result<Project, ContractError> {
        let key = Contract::storage_key_project(&env, project_id);
        match env.storage().persistent().get::<_, Project>(&key) {
            Some(p) => Ok(p),
            None => Err(ContractError::ProjectNotFound),
        }
    }

    /// Worker submits the current milestone. Worker must authorize.
    pub fn submit_milestone(env: Env, project_id: u64) -> Result<(), ContractError> {
        let mut project = Contract::get_project(env.clone(), project_id)?;

        // worker must authorize
        project.worker.require_auth();

        if project.status != ProjectStatus::Active {
            return Err(ContractError::InvalidProjectStatus);
        }

        // ensure there are remaining milestones
        if project.current >= project.milestones {
            return Err(ContractError::NoMilestonesRemaining);
        }

        // only allow submission if not already submitted
        if project.submitted {
            return Err(ContractError::MilestoneNotSubmitted);
        }

        project.submitted = true;

        let key = Contract::storage_key_project(&env, project_id);
        env.storage().persistent().set(&key, &project);

        MilestoneSubmitted {
            project_id,
            milestone: project.current,
        }
        .publish(&env);

        Ok(())
    }

    /// Client approves a submitted milestone. Client must authorize.
    pub fn approve_milestone(env: Env, project_id: u64) -> Result<(), ContractError> {
        let mut project = Contract::get_project(env.clone(), project_id)?;

        project.client.require_auth();

        if project.status != ProjectStatus::Active {
            return Err(ContractError::InvalidProjectStatus);
        }

        if project.current >= project.milestones {
            return Err(ContractError::NoMilestonesRemaining);
        }

        if !project.submitted {
            return Err(ContractError::MilestoneNotSubmitted);
        }

        // advance milestone
        project.current = project.current + 1;
        // reset submitted flag for next milestone
        project.submitted = false;

        // if finished, set status
        if project.current >= project.milestones {
            project.status = ProjectStatus::Completed;
        }

        let key = Contract::storage_key_project(&env, project_id);
        env.storage().persistent().set(&key, &project);

        MilestoneApproved {
            project_id,
            milestone: project.current,
        }
        .publish(&env);

        if project.status == ProjectStatus::Completed {
            ProjectCompleted { project_id }.publish(&env);
        }

        Ok(())
    }
}

mod test;
