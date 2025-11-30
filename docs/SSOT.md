# Single Source of Truth (SSOT) - Supervision Efficiency Planner
**Version:** 2.0 (Gold Master)
**Status:** Live
**Last Updated:** 2025-11-29

## 1. Project Overview
The **Supervision Efficiency Planner** is a financial modeling tool designed to demonstrate the ROI of shifting clinical supervision duties from high-cost Clinical Directors to Peer Supervisors (CRSS). It allows organizations to model staffing scenarios, calculate "Hard" (Cash Flow) and "Soft" (Value) impacts, and visualize the break-even point of this transition.

---

## 2. Core Logic & Formulas

### 2.1 Payroll Calculations
The model calculates the monthly payroll impact based on the staffing configuration of each scenario.

*   **Scenario A (Baseline):** Represents the current state.
    *   `Payroll = (Frontline_CRS * Wage_CRS) + (Supervisor_FTE * Wage_Supervisor)`
*   **Scenario B (Restructure):** Modeled as a **Promotion** (Headcount Neutral).
    *   Staff are promoted from CRS to CRSS.
    *   **Cost:** The *Differential* between CRS and CRSS wage (e.g., +$4.50/hr), not a full new salary.
*   **Scenario C (Expansion):** Modeled as **Expansion** (Growth).
    *   New CRSS staff are hired externally.
    *   **Cost:** A full new CRSS salary + benefits.

### 2.2 Revenue & Productivity (The "Blue" Numbers)
This section calculates the financial value of the Clinical Director's time liberated by the new staffing model.

*   **Supervision Volume Logic:**
    *   **Baseline:** `Required_Hours = (Staff_Count * Individual_Hrs_Per_Staff) + Group_Hrs_Per_Team`
    *   **Tiered Model (Scenarios B & C):** Workload is split between Director and CRSS.
*   **Freed Hours (Tiered Logic):**
    *   `Freed_Hours = Baseline_Load - (Retained_Clinical + CRSS_Mgmt_Cost)`
    *   *Retained Clinical:* Hours the Director keeps (e.g., high-risk cases).
    *   *CRSS Mgmt Cost:* Hours the Director spends supervising the CRSS.
*   **Revenue Formula:**
    *   `Realized_Revenue = Freed_Hours * Utilization_Rate (75%) * Billable_Rate ($150)`
    *   *Note:* This assumes the Director repurposes their time into billable services (e.g., Outpatient Counseling).

### 2.3 Cost Avoidance (The "Green" Numbers)
These metrics represent savings that do not necessarily generate new cash but avoid existing costs.

*   **Labor Efficiency (Arbitrage):**
    *   The savings from having a lower-cost employee (CRSS) perform a task previously done by a high-cost employee (Director).
    *   **"No Double Dip" Rule:**
        *   **If Revenue > 0:** Arbitrage is treated as a **SOFT** metric (Value KPI). We count the Revenue as the "Hard" benefit.
        *   **If Revenue == 0:** Arbitrage is treated as a **HARD** metric (Cost Cutting). We count the salary difference as the benefit.
*   **Retention Savings:**
    *   Calculated based on reduced turnover risk due to better supervision ratios.
    *   `Savings = (Total_Staff * 10%_Reduction * Cost_Per_Departure) / 12`
    *   **Status:** Always treated as **SOFT** value (Cost Avoidance), never Cash Flow.

### 2.4 Net Impact (The CFO Standard)
The final "Bottom Line" metrics used for decision making.

*   **Hard Net Impact (Primary KPI):**
    *   The actual effect on the bank account.
    *   `Net_Hard = (Realized_Revenue + Grant_Savings) - Payroll_Delta_Loaded + (Hard_Efficiency)`
*   **Soft Value (Secondary KPI):**
    *   The estimated operational value.
    *   `Soft_Value = Retention_Savings + (Soft_Efficiency)`
*   **Break-Even Point:**
    *   The time required to recover the initial transition costs.
    *   `Break_Even_Months = Transition_Cost / Net_Monthly_Hard`

---

## 3. Data Dictionary

### 3.1 Global Assumptions
Inputs that apply across all scenarios.

| Field | Type | Description |
| :--- | :--- | :--- |
| `crsBaseHourly` | Number | Hourly wage for Frontline CRS. |
| `crssBaseHourly` | Number | Hourly wage for Peer Supervisor (CRSS). |
| `supervisorBaseHourly` | Number | Hourly wage for Clinical Director. |
| `benefitLoad` | Number | Percentage added to wages for benefits (e.g., 0.35). |
| `supervisorBillableRate` | Number | Revenue generated per billable hour by Director. |
| `utilizationPercent` | Number | % of freed hours converted to billable time (Default: 75%). |
| `fundingSource` | String | 'Billable' or 'Grant'. Contextualizes revenue label. |
| `reinvestmentTask` | String | Description of the Director's new activity (e.g., "Outpatient Counseling"). |

### 3.2 Supervision Rules
Rules defining the required workload.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `individualHoursPerStaff` | Number | 2.0 | Hours of 1:1 supervision required per staff member per month. |
| `groupHoursPerTeam` | Number | 2.0 | Hours of group supervision required per team per month. |
| `internalMaxRatio` | Number | 5 | Max safe ratio of CRS to CRSS. Triggers "Overloaded" warning. |
| **Tiered Model** | | | **Configuration for Scenarios B & C** |
| `supervisorIndivPerStaff` | Number | 1.0 | Hours of 1:1 the Director **retains** per staff. |
| `crssIndivPerStaff` | Number | 1.0 | Hours of 1:1 delegated to the CRSS. |
| `groupCrssOnly` | Number | 2.0 | Group hours run independently by the CRSS. |
| `crssSupervisionHrs` | Number | 1.0 | Hours the Director spends supervising the CRSS. |

### 3.3 Sensitivity Factors
Toggles to adjust the financial model's conservatism.

| Toggle | Description |
| :--- | :--- |
| `includeRevenue` | **ON:** Adds `Realized_Revenue` to Net Impact. **OFF:** Revenue is $0 (Cost Center view). |
| `includeRetention` | **ON:** Adds `Retention_Savings` to Soft Value. **OFF:** Hidden. |
| `includeTransitionCost` | **ON:** Deducts Year 1 OT bridge costs from Annual Net. **OFF:** Steady-state only. |

---

## 4. Architecture

### 4.1 Component Map
The application is structured as a single-page React dashboard.

*   **`App.tsx`**: Main container and state manager.
    *   **`Header`**: Sticky top bar with Theme Toggle and Print Button.
    *   **`ExecutiveSummary`**: Collapsible top section with the Net Impact Bar Chart.
    *   **`SensitivityBar`**: Floating bar for the 3 financial toggles.
    *   **`AssumptionsDeck`**: Collapsible middle section containing:
        *   `GlobalAssumptionsPanel`
        *   `DemandUtilizationPanel`
        *   `SupervisionRulesPanel` (Includes Tiered Model inputs)
        *   `HRRiskPanel`
    *   **`ScenarioGrid`**: The main workspace displaying 3 `ScenarioCard` components (A, B, C).

### 4.2 Persistence
*   **Storage:** All user inputs (Assumptions, Rules, Scenarios) are saved to the browser's `localStorage` via the `usePersistedState` hook.
*   **Reset:** The "Reset to Defaults" button clears all logic data but preserves User Preferences (Dark Mode).

---

## 5. Style Guide
*   **Framework:** Tailwind CSS.
*   **Theme:** Dark Mode first (Slate/Indigo palette).
*   **Typography:** Inter (Standard sans-serif).
*   **Print:** Custom `@media print` styles to hide UI elements and force a clean white layout for PDF export.
