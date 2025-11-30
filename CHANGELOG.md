# Changelog

All notable changes to the "Supervision Efficiency Planner" project will be documented in this file.

## [Unreleased] - 2025-11-30

### Economic Reality Mode Hardened

- **Feature**: Implemented Supervisor Opportunity Cost as an explicit overlay on top of Net Monthly Hard.
- **Logic**:
    - Preserved CFO Hard Net formula as the primary cash metric.
    - Defined Net Economic Impact as `Net_Hard - Opportunity_Cost` for all scenarios.
- **UI Updates**:
    - **Executive Summary**:
        - Added "Supervisor Opportunity Cost" row.
        - Added "Net Monthly Impact (Economic Reality)" row.
        - Net Impact bar chart now uses Net Economic values when the "Include Opportunity Cost" toggle is active, including a negative baseline for Scenario A.
    - **Scenario Cards**:
        - Restored "Clinical Capacity Restored" block that displays freed supervisor hours per month.
        - Added "Revenue leak" visual that shows monthly opportunity cost and remaining supervision hours.
        - Display Net Monthly Economic at the bottom of each card.
- **Verification**:
    - Added automated CFO Test coverage in `src/verify_logic.ts`:
        - Double Dip enforcement (revenue vs labor savings).
        - Grant Shield behavior (grants offset cost only).
        - Opportunity Cost overlay behavior (baseline negative, improved B/C).
- **Documentation**:
    - Updated `task.md` and `walkthrough.md` to document the new behavior and verification steps.
