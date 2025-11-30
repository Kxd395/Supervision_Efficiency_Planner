# Single Source of Truth (SSOT) - Supervision Efficiency Planner

**Version:** 2.1 (Gold Master)
**Last Updated:** 2025-11-29

## 1. Project Overview

The Supervision Efficiency Planner is a financial modeling tool designed to demonstrate the ROI of shifting clinical supervision duties from high-cost Clinical Supervisors to Peer Supervisors (CRSS).

## 2. Core Logic & Formulas

### 2.1 Payroll Calculations

*   **Scenario A (Baseline):** 3 Frontline CRS, 0 CRSS.
*   **Scenario B (Promotion):** 2 Frontline CRS, 1 CRSS. Cost is the Differential between CRS and CRSS wage.
*   **Scenario C (Expansion):** 3 Frontline CRS, 1 CRSS. Cost is a full new CRSS salary + benefits.

### 2.2 Revenue & Productivity (Volume Logic)

*   **Baseline Load:** `(Staff_Count * Indiv_Hrs) + Group_Hrs`
*   **Tiered Model (New):**
    *   `Supervisor_Indiv_Retained + Supervisor_Group_Only + Supervisor_Mgmt_of_CRSS`
*   **Freed Hours:** `Baseline_Load - New_Scenario_Supervisor_Load`
*   **Revenue:** `Freed_Hours * Utilization (75%) * Billable_Rate ($150)`

### 2.3 Cost Avoidance

*   **Labor Efficiency:**
    *   If `Revenue > 0`, Arbitrage is a **SOFT** metric (Operational Value).
    *   If `Revenue == 0`, Arbitrage is a **HARD** metric (Cost Cutting).
*   **Retention:** Always **SOFT**.

### 2.4 Net Impact (Hard vs Soft)

*   **Net Hard (Cash):** `Revenue - Payroll_Delta + (Hard_Efficiency)`
*   **Net Soft (Value):** `Retention + (Soft_Efficiency)`

## 3. Data Dictionary

*   **Clinical Supervisor:** The licensed professional (LPC/LCSW).
*   **CRSS:** Certified Recovery Specialist Supervisor (Lead Peer).
*   **Burden:** 35% (Benefits + Liability).
*   **Utilization:** 75% (Standard billable efficiency).
