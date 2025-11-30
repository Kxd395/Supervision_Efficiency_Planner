# Supervision Efficiency Planner - User Guide

## Introduction

The **Supervision Efficiency Planner** is a financial modeling tool designed to help organizations evaluate the return on investment (ROI) of implementing a tiered peer supervision model. This guide will walk you through using the application effectively.

---

## Getting Started

### Understanding the Interface

The application is organized into a **2-column layout** that mirrors the decision-making process:

- **Left Column: Financials & Demand**
  - Compensation Assumptions (wages, benefits, revenue factors)
  - Demand & Utilization (caseload, staffing levels)

- **Right Column: Rules & Risk**
  - Supervision Rules (how supervision hours are allocated)
  - HR & Risk Factors (transition costs, hiring timelines)

This separation helps you move logically from **foundational data** to **strategic modeling**.

---

## Contextual Help System

Every critical input field includes a help tooltip marked with a **?** icon. Hover over or click these icons to see:

- **Description**: What this input represents and how it's measured
- **Impact**: How this variable affects the financial model

### Key Input Tooltips

#### Compensation Assumptions

**CRS Wage**
- **Description**: Hourly base rate for Frontline Certified Recovery Specialists
- **Impact**: Determines the 'Backfill Cost' when a CRS is promoted to CRSS

**CRSS Wage**
- **Description**: Hourly base rate for the Lead/Supervisor Peer
- **Impact**: Determines the 'Payroll Increase' in Scenario B & C

**Supervisor Wage**
- **Description**: Hourly base rate for Clinical Supervisors who oversee the program
- **Impact**: Determines the 'Labor Efficiency' when freed hours are reinvested

**Fringe Benefits (%)**
- **Description**: Employer costs (FICA, Health, Liability, 403b). Jefferson Standard ~35%
- **Impact**: Multiplies ALL base wages. $1.00 becomes $1.35

**FTE Hours/Mo**
- **Description**: Standard monthly hours for a full-time employee (typically 160 hrs)
- **Impact**: Used to convert hourly wages into monthly payroll costs

**Billable Rate ($)**
- **Description**: Hourly billing rate for supervisor's clinical time (e.g., therapy sessions)
- **Impact**: Drives the 'Realized Revenue' calculation when freed hours are billable

**Utilization (%)**
- **Description**: Target percentage of freed time that can be converted to billable activities
- **Impact**: Conservative estimates (60-75%) account for admin time and scheduling gaps

---

## Understanding the Supervision Rules Panel

The **Supervision Rules** panel uses a visual "Delegation Split" design to show how supervision hours are allocated.

### The Two-Column Design

**Left Column: Director Load (Retained)** - *High-cost hours the Director keeps*
- **Retained 1:1**: Individual supervision hours the Director personally provides
- **Director Groups**: Group supervision sessions led only by the Director
- **Oversight of CRSS**: Time spent managing/supervising the CRSS staff

**Right Column: CRSS Load (Delegated)** - *Efficiency hours moved to the CRSS*
- **Delegated 1:1**: Individual supervision hours delegated to CRSS
- **CRSS Groups**: Group supervision sessions led only by CRSS
- **Co-Facilitated Groups**: Shared group sessions (training/mentoring)

### Scenario Tabs

Use the **Scenario B** and **Scenario C** tabs to configure different supervision models:
- **Scenario B (Promotion)**: Promote an existing CRS to CRSS role
- **Scenario C (Expansion)**: Hire a new CRSS from outside

Each scenario can have independent supervision rules, allowing you to model different operational strategies.

---

## HR & Risk Factors Panel

This panel captures the "hidden costs" of organizational change.

### HR Dynamics (Left Column)
**Time & Rates**
- **Typical Promotion Raise ($)**: The hourly wage increase when promoting a CRS to CRSS
- **Credentialing Lag (Months)**: Time required for credential processing before a promoted staff can bill
- **CRS Recruit Time (Months)**: Average time to hire a replacement frontline CRS
- **CRSS Recruit Time (Months)**: Average time to hire an external CRSS candidate

### Financial Impact (Right Column)
**One-Time Costs**
- **CRS Onboarding Cost ($)**: Training and administrative costs for new CRS hires
- **CRSS Onboarding Cost ($)**: Training and administrative costs for new CRSS hires
- **Turnover Cost ($/Departure)**: Financial impact of staff turnover (recruiting, training, productivity loss)

**Risk Sensitivity**
- **Turnover Risk Threshold (Ratio)**: Maximum acceptable supervision ratio before burnout risk increases

---

## Interpreting the Results

### Executive Summary Dashboard

The top dashboard shows the key financial metrics for each scenario:

**Net Monthly Impact Analysis**
- **Hard Cash**: Actual revenue or cost savings (conservative)
- **Soft Value**: Calculated savings not yet realized as cash
- **Compliance Status**: Whether the supervision ratios meet regulatory requirements

**Break-Even Analysis**
- Shows the number of months to recover transition costs
- Accounts for one-time expenses (recruiting, onboarding, training)

### Scenario Modeling

Compare three scenarios side-by-side:

1. **Scenario A (Baseline)**: Current state with Director providing all supervision
   - High cost, high risk, no ROI opportunity

2. **Scenario B (Promotion)**: Promote a CRS to CRSS
   - Headcount neutral
   - Lower cost than expansion
   - May require backfilling the promoted staff's caseload

3. **Scenario C (Expansion)**: Hire a new CRSS
   - Adds +1 FTE
   - Higher upfront cost
   - No caseload displacement issues

---

## Best Practices

### Start with Accurate Baseline Data
1. Enter your current wages precisely (including any local market adjustments)
2. Set realistic fringe benefit rates (review your accounting department's loaded cost multiplier)
3. Use actual FTE hours if your org uses non-standard schedules

### Be Conservative with Revenue Assumptions
- Use lower utilization rates (60-70%) for initial models
- Account for administrative friction and scheduling gaps
- Remember: not all "freed" Director time converts to billable hours

### Model Multiple What-If Scenarios
- Try different CRSS wage levels to see break-even points
- Adjust supervision ratios to find the optimal balance
- Test sensitivity to turnover costs and retention improvements

### Use the Help Tooltips
- Review the **?** tooltips to understand how each variable impacts the model
- Pay special attention to "Impact" statements—these show cause-and-effect relationships

---

## Troubleshooting

### "Non-Compliant" Status
If a scenario shows non-compliant status:
- Check that supervision hours meet regulatory minimums
- Verify that the effective supervision ratio is within acceptable limits
- Adjust the supervision rules (increase allocated hours)

### Negative ROI
If the model shows negative returns:
- Review the utilization rate (is it realistic for your organization?)
- Check if the CRSS wage is appropriately set (too high may eliminate labor arbitrage)
- Consider the long-term turnover savings—these may offset short-term costs

### Break-Even Timeline Too Long
If break-even exceeds your acceptable timeline:
- Reduce one-time transition costs where possible
- Increase the utilization rate if you have high confidence in Director billability
- Consider Scenario B (promotion) instead of Scenario C (expansion)

---

## Technical Notes

### Data Persistence
Your inputs are automatically saved to your browser's local storage. They will persist across page refreshes and browser sessions.

### Exporting Results
Currently, the application displays results on-screen. To share findings:
- Take screenshots of the Executive Summary dashboard
- Document key assumptions in a separate memo
- Use the CALCULATIONS.md and MANAGEMENT_BRIEF.md docs for technical details

---

## Support & Documentation

For detailed calculation formulas and financial logic, see:
- **CALCULATIONS.md**: Complete mathematical documentation
- **MANAGEMENT_BRIEF.md**: Strategic analysis and decision framework
- **SSOT.md**: System requirements and technical specifications

For questions about implementation or customization, contact your system administrator or the development team.

---

# Appendix A: Pennsylvania Billing Configuration Guide

**Region:** Pennsylvania (HealthChoices / PROMISe / Medicare)  
**Last Updated:** 2024-2025 Fee Schedules

Use this guide to configure the **Revenue Assumptions** in the `GlobalAssumptionsPanel` based on standard PA reimbursement rates for Behavioral Health.

## 1. Peer Support (CRSS) Settings

*Configure these in the **"Peer (CRSS) Revenue"** section.*

| Input Field | Recommended Value | Source / Logic |
|:---|:---|:---|
| **Billable Rate ($)** | **$54.00** | Based on **H0038** (Peer Support Services). <br>Avg. Managed Care Rate: **$13.50 per unit** (15 mins). <br>*Calculation:* $13.50 × 4 units = $54.00/hr. |
| **Utilization (%)** | **40% - 50%** | Peers often have higher travel time and no-show rates than clinicians. <br>*Note:* Daily max is usually 16 units (4 hours). |

**Applicable Codes (PA Medicaid):**
- **H0038:** Peer Support Services (Individual).
- **H0038-HQ:** Peer Support Services (Group). *Rate is lower per person (~$2.50/unit).*

**Medicare Opportunity (New 2024):**
- **G0140 (PIN-PS):** Principal Illness Navigation. ~$77.95/month (first hour).
- *Use Case:* If serving older adults/SSDI, your effective hourly rate may be higher.

---

## 2. Clinical Supervisor Settings

*Configure these in the **"Supervisor Revenue"** section.*

| Input Field | Recommended Value | Source / Logic |
|:---|:---|:---|
| **Billable Rate ($)** | **$131.00** | **Conservative:** Based on PA Medicaid (CCBH/Magellan) floor for **90837** (60 min Therapy). |
| **Billable Rate ($)** | **$150.00** | **Aggressive:** Blended rate including Diagnostic Evals (**90791** @ ~$145) and commercial insurance. |
| **Utilization (%)** | **60% - 75%** | Clinical Directors have significant administrative drag. Do not set to 100%. |

---

## 3. Hybrid Funding Logic (Grant vs. Billable)

*Configure this in the **"Grant Availability"** section.*

Many PA providers utilize county (SCA) or state (OMHSAS) grants to fund specific positions.

- **Scenario:** You have a county grant that pays for 2 full-time Peers. You want to hire 4 Peers total.
- **Configuration:**
  1. Set **Grant-Funded Slots** to **2**.
  2. Set **Peer Billable Rate** to **$54.00**.
  3. **Result:** The model will calculate the first 2 hires at **$0 cost** (Grant). The next 2 hires will be calculated using the **$54/hr** revenue offset (Billable).

---

## 4. Cheat Sheet: Input Field Mapping

| UI Section | UI Label | PA Standard Value | Notes |
|:---|:---|:---|:---|
| **Global Assumptions** | `Sup. Billable Rate` | **131** | Code 90837 |
| **Global Assumptions** | `Peer Billable Rate` | **54** | Code H0038 |
| **Global Assumptions** | `Grant Slots` | *(Check Contract)* | e.g., "2 FTEs" |
| **Supervision Rules** | `Max Ratio` | **1:10** | PA State Regs typically cap full-time peers per supervisor. |

---

## 5. Additional Resources

### Pennsylvania-Specific Rate Sheets
- **HealthChoices (Medicaid):** Contact your local MCO (e.g., CCBH, AmeriHealth Caritas, UPMC)
- **PROMISe:** [OMHSAS Fee Schedule](https://www.dhs.pa.gov/providers/Providers/Pages/Behavioral-Health-Services.aspx)
- **Medicare:** [CMS Physician Fee Schedule Lookup](https://www.cms.gov/medicare/physician-fee-schedule/search)

### Billing Code References
- **H0038:** Peer Support Services (Individual/Group)
- **90837:** Psychotherapy, 60 minutes
- **90791:** Psychiatric Diagnostic Evaluation
- **G0140:** Principal Illness Navigation - Peer Support (Medicare, effective 2024)

---

*Last Updated: November 2024*
