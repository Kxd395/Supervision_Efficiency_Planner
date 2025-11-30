# Supervision Efficiency Planner: Calculation Logic & Proofs

This document details the mathematical models, formulas, and business logic used in the Supervision Efficiency Planner. It serves as the "Proof of Work" for how the application derives its financial and operational metrics.

---

## 1. Core Financial Definitions

### Fully Loaded Cost
We calculate the true cost of an employee by adding a "Benefit Load" (taxes, insurance, benefits) to their base hourly wage.

$$ \text{Loaded Rate} = \text{Base Rate} \times (1 + \text{Benefit Load}) $$

**Example:**
*   Supervisor Base: $45/hr
*   Benefit Load: 35% (0.35)
*   Loaded Rate = $45 * 1.35 = **$60.75/hr**

### Monthly Payroll
We assume a standard Full-Time Equivalent (FTE) month of **160 hours** (40 hours/week * 4 weeks).

$$ \text{Monthly Cost} = \text{FTE Count} \times \text{Loaded Rate} \times 160 $$

---

### Grant Funding (Dual Pools)
We model grant funding as a "First-In Priority" offset. This means the first $N$ hires are covered by grants (costing the hospital $0), and only hires $N+1$ onwards hit the P&L.

We split this into two distinct pools to prevent "Average Cost" errors:
1.  **Frontline CRS Grants**: Covers entry-level staff (e.g., SOR Grant).
2.  **Supervisor CRSS Grants**: Covers leadership roles (e.g., County Funding).

$$ \text{Grant Savings} = (\text{Grant Slots}_{CRS} \times \text{Cost}_{CRS}) + (\text{Grant Slots}_{CRSS} \times \text{Cost}_{CRSS}) $$

---

## 2. Workload Modeling (The "Engine")

The core of the planner is calculating **Supervisor Load**: How many hours of work does the Clinical Supervisor need to perform to support the staff?

### Scenario A: Baseline (Traditional Model)
In the baseline, the Clinical Supervisor does **everything**.

$$ \text{Load}_A = (\text{Staff Count} \times \text{Indiv Hrs/Staff}) + \text{Group Hrs/Team} $$

**Proof/Logic:**
*   Every staff member needs $X$ hours of individual supervision.
*   The team needs $Y$ hours of group supervision.
*   Since there are no CRSS leads, the Supervisor must provide 100% of this volume.

### Scenario B & C: Tiered Model (Delegated Supervision)
In the tiered model, we introduce a **CRSS (Certified Recovery Support Specialist)** who takes on some supervision duties. The Supervisor's load is reduced, but not eliminated.

The Supervisor's new load consists of three buckets:
1.  **Direct Retention**: Clinical hours the Supervisor *keeps* (e.g., high-risk cases).
2.  **Group Facilitation**: Groups the Supervisor runs (alone or co-facilitated).
3.  **Management Oversight**: Time spent managing/supervising the CRSS leads themselves.

$$ \text{Load}_{Tiered} = \underbrace{(\text{Frontline} \times \text{Sup Indiv})}_{\text{Direct Work}} + \underbrace{(\text{Sup Group} + \text{Co-Facilitated})}_{\text{Group Work}} + \underbrace{(\text{CRSS Count} \times \text{Mgmt Overhead})}_{\text{Management}} $$

**Why this works:**
*   It accounts for the fact that delegating work isn't "free"—it creates a new management task (supervising the supervisor).
*   It allows for "Split" configurations where the Supervisor keeps 1 hour and delegates 1 hour.

---

## 3. Compliance & Safety

We calculate whether the proposed staffing model is safe and compliant.

### Required Hours (Total Demand)
This is the total volume of supervision the *staff needs*, regardless of who provides it.

$$ \text{Total Demand} = (\text{Frontline} \times (\text{Sup Indiv} + \text{CRSS Indiv})) + \text{All Group Hours} $$

### Capacity & Ratios
*   **Effective Ratio**: $\frac{\text{Frontline Count}}{\text{CRSS Count}}$
*   **Safety Check**: If $\text{Effective Ratio} > \text{Internal Max Ratio}$, the status is **OVERLOADED**.

---

## 4. Financial Impact Analysis

How do we turn "Freed Hours" into money?

### A. Freed Supervisor Hours
$$ \text{Freed Hours} = \text{Baseline Load} - \text{New Scenario Load} $$

### B. Realized Revenue (Dual Streams)
We calculate revenue from two sources:

#### 1. Supervisor Repurposing
If the Supervisor is not doing supervision, they can bill for services (e.g., Outpatient Counseling).

$$ \text{Sup Revenue} = \text{Freed Hours} \times \text{Utilization \%} \times \text{Billable Rate} $$

#### 2. Peer (CRSS) Revenue (Gap Fill)
CRSS staff can bill for services (e.g., H0038), but only if the hospital is paying for them.
*   **Safety Valve**: Revenue is 0 if `enablePeerBilling` is false.
*   **Credentialing**: We limit billable FTEs to `min(Billable Staff, Credentialed Count)`.

$$ \text{Peer Revenue} = \text{Eligible FTEs} \times (\text{FTE Hours} \times \text{Peer Util \%}) \times \text{Peer Rate} $$

### C. Labor Efficiency (Arbitrage)
This measures the savings from having a lower-cost employee (CRSS) do work previously done by a high-cost employee (Supervisor).

$$ \text{Arbitrage/Hr} = \text{Sup Loaded Rate} - \text{CRSS Loaded Rate} $$
$$ \text{Efficiency Savings} = \text{Freed Hours} \times \text{Arbitrage/Hr} $$

**Logic Rule (The "Double Dip" Prevention):**
*   If we calculate **Revenue**, we usually set **Hard Labor Savings** to 0. Why? Because you can't *both* save the Supervisor's salary (by firing them/cutting hours) *AND* use their time to generate revenue. You have to pick one.
*   In this model:
    *   **Hard Cash Flow** = Revenue - (Payroll Increase - Grant Savings).
    *   **Soft Value** = Efficiency Savings (we treat arbitrage as "Soft" value when Revenue is active, representing the *quality* of the spend).

### D. Retention Savings (Soft)
Reducing burnout saves money on turnover.

$$ \text{Savings} = \text{Total Staff} \times \text{Reduction Rate (10\%)} \times \text{Cost per Departure} $$

---

## 5. Return on Investment (ROI)

### Net Monthly Steady State (Hard)
This is the "CFO Number"—the actual cash impact on the P&L.

$$ \text{Net Hard} = (\text{Sup Revenue} + \text{Peer Revenue}) - (\text{Payroll Delta} - \text{Grant Savings}) $$

*   If positive: The change pays for itself immediately.
*   If negative: The efficiency gains are not enough to cover the new hire costs (yet).

### Break-Even Point
How long until the investment pays off?

$$ \text{Months to Break Even} = \frac{\text{One-Time Transition Costs}}{\text{Net Monthly Steady State}} $$

*   **Transition Costs**: Recruiting, Onboarding, Training time.

---

## Summary of Logic Flow

1.  **Define Rules**: Set how many hours of supervision are needed (Baseline vs Tiered).
2.  **Calculate Load**: Determine how much work the Supervisor drops.
3.  **Calculate Cost**: Determine how much the new CRSS costs.
4.  **Compare**:
    *   Is (Revenue from Freed Time) > (Cost of CRSS)?
    *   If yes, the model is **Profitable**.
    *   If no, is the (Retention + Quality) value worth the cost?
