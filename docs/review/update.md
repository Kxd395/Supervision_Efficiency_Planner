> **STATUS: IMPLEMENTED (2025-11-30)**
> This prompt has been fully executed. The Supervisor Opportunity Cost mode is now live in the application.
> - Logic: `src/logic.ts`
> - UI: `SensitivityBar.tsx`, `ExecutiveSummary.tsx`, `ScenarioCard.tsx`
> - Documentation: Updated `CALCULATIONS.md`, `SSOT.md`, `USER_GUIDE.md`

You have all the right ingredients. What you are really asking for now is a single, clean “master prompt” that:

* Keeps your existing CFO Hard logic intact.
* Adds Opportunity Cost as an overlay mode.
* Makes Scenario A visibly negative when that overlay is on.

You are not missing any huge conceptual pieces. The gaps are mostly about wiring and clarity. So I will give you a fresh, full prompt that merges:

* Your other agent’s “Cost of Doing Nothing” framing.
* The more precise math and no double dip rules we worked out.

You can hand this straight to an agent or a human engineer.

---

### Master Product Requirements Prompt – Supervisor Opportunity Cost and Negative Baseline

````markdown
Role: You are a senior TypeScript and React engineer who understands financial modeling. You will update an existing Supervision Efficiency Planner. The current app already has correct CFO "Hard Net" logic, grants, and scenario modeling. Your job is to add an explicit Supervisor Opportunity Cost mode without breaking any existing math.

Context:

- Existing stack: React + TypeScript front end, calculation engine in logic.ts, types in types.ts.
- Existing scenarios:
  - Scenario A: Baseline. Director provides all supervision. No new wages. No revenue.
  - Scenario B: Restructure. Internal promotion to CRSS. Headcount neutral.
  - Scenario C: Expansion. External CRSS hire. Net new FTE.
- Existing metrics:
  - `freedSupervisorHours` (hours per month of Director time freed from supervision).
  - `supervisorBillableRate` and `utilizationPercent`.
  - `netMonthlySteadyStateHard` (CFO Hard Net) and `netMonthlySteadyStateSoft`.
  - Sensitivity toggles: `includeRevenue`, `includeRetention`, `includeTransitionCost`.
- Existing UX:
  - Executive Summary bar chart uses `netMonthlySteadyState` as the primary CFO number.
  - A sensitivity strip lets users toggle revenue, retention, and transition costs.
  - Scenario cards already show "Clinical Capacity Restored" in hours per month and revenue composition bars.

High level goal:

Add an "Opportunity Cost" mode that reveals the hidden cost of the Clinical Director being stuck in non billable supervision. When enabled:

- Each scenario is penalized by the estimated lost revenue from supervision hours.
- Scenario A becomes explicitly negative (red bar) because it is all supervision and no billing.
- Scenario B and C can show improvement because they convert some of that lost revenue back into billable work.

You must preserve the existing CFO Hard Net definition. Opportunity Cost is an overlay mode, not a replacement.

-------------------------------------------------
1. Data model and types
-------------------------------------------------

Update `types.ts` to support new metrics and the toggle.

1.1 Update `SensitivityFactors`:

- Add:
  - `includeOpportunityCost: boolean`

1.2 Update `ComputedMetrics`:

- Add:
  - `supervisionHours: number`  
    - Monthly Director hours still spent on supervision after tiering.
  - `opportunityCostMonthly: number`  
    - Lost revenue per month from those supervision hours.
  - `netMonthlySteadyStateHardWithOpportunity: number`  
    - Hard Net minus Opportunity Cost. This is the "Economic Reality" number when the toggle is on.

You may introduce helper types if needed, but keep the names above so they are easy to wire into the UI.

-------------------------------------------------
2. Core math – Opportunity Cost logic
-------------------------------------------------

All opportunity cost math lives in `computeScenarioMetrics` in logic.ts.

2.1 Reuse existing data and constants:

- Use existing global values:
  - `global.supervisorBillableRate`
  - `global.utilizationPercent`
  - `global.hoursPerFtePerMonth` or, if not present, add a constant `HOURS_PER_FTE_MONTH = 160`.

- Use existing metric:
  - `freedSupervisorHours` – monthly Director time freed by tiering.

2.2 Compute supervision hours:

For each scenario, compute the Director's total monthly capacity and the remaining supervision load.

- Let `totalDirectorCapacity` equal:
  - `scenarioInputs.supervisorFte * HOURS_PER_FTE_MONTH`

- Compute monthly supervision hours as:
  - `supervisionHours = Math.max(0, totalDirectorCapacity - freedSupervisorHours)`

Store `supervisionHours` in the `ComputedMetrics` object.

2.3 Compute Opportunity Cost:

Use the following formula:

- `billableRate = global.supervisorBillableRate` (or scenario override if your model already supports overrides.)
- `utilization = global.utilizationPercent` (0 to 1).

- `lostRevenueHours = supervisionHours * utilization`
- `opportunityCostMonthly = lostRevenueHours * billableRate`

Interpretation:

- These are hours that could have been billed at the Director's rate but are instead consumed by non billable supervision.
- This is a modeled counterfactual. It does not alter Realized Revenue from freed hours.

Store `opportunityCostMonthly` in `ComputedMetrics`.

2.4 Preserve existing Hard Net, then create an overlay version:

Do not change the existing CFO Hard Net formula. Keep it as is.

Assume the current code:

```ts
const totalNewIncome = realizedRevenue + grantOffset.grantSavings;
const totalNewCost = payrollDeltaLoaded;
const netMonthlySteadyStateHard = (totalNewIncome - totalNewCost) + hardLaborSavings;
````

This must remain the canonical CFO Hard Net.

Now create the overlay version:

```ts
let netMonthlySteadyStateHardWithOpportunity = netMonthlySteadyStateHard;

if (enabledFactors.includeOpportunityCost) {
  netMonthlySteadyStateHardWithOpportunity =
    netMonthlySteadyStateHard - opportunityCostMonthly;
}
```

Store both values on `ComputedMetrics`.

Rules:

* `netMonthlySteadyStateHard` stays the same regardless of the toggle.
* `netMonthlySteadyStateHardWithOpportunity` changes when `includeOpportunityCost` is true.

No double dip guarantee:

* Arbitrage and hard efficiency still use `freedSupervisorHours` and wage differences.
* Realized Revenue uses freed hours times utilization times rate.
* Opportunity Cost uses supervision hours times utilization times rate.
* Freed hours and supervision hours partition the Director's capacity, so the same hour is never counted both as realized revenue and lost revenue.

---

3. Sensitivity Bar – new toggle

---

Update the component that renders the sensitivity toggles (for example `SensitivityBar.tsx`).

3.1 Add a new toggle in the same style as the others:

* Label: `Include Opportunity Cost`
* Tooltip: `Factors in lost revenue from the Director's non billable supervision time.`
* Color: use a rose or red accent to signal risk.

3.2 Wire it to `enabledFactors.includeOpportunityCost` in state.

3.3 Default:

* `includeOpportunityCost` should default to `false` so that the app opens in standard CFO Hard view.

---

4. Executive Summary – Negative baseline and table

---

Update `ExecutiveSummary.tsx` to support the overlay.

4.1 Bar chart data:

Currently, the bar chart uses:

* `0` for Scenario A.
* `metricsB.netMonthlySteadyState` and `metricsC.netMonthlySteadyState` for B and C.

Adjust the data source based on the toggle:

* When `includeOpportunityCost` is false:

  * Keep the current behavior.
  * Use `netMonthlySteadyStateHard` as you do today.

* When `includeOpportunityCost` is true:

  * Scenario A value:

    * `value = -metricsA.opportunityCostMonthly`

      * This will usually be negative since baseline has no realized revenue and heavy supervision load.
  * Scenario B and C values:

    * `value = metricsX.netMonthlySteadyStateHardWithOpportunity`

      * Use the overlay Hard Net for each scenario.

4.2 Bar colors and tooltips:

* Use existing positive or negative coloring logic. If you do not yet color by sign, you can:

  * Show negative values in a red tone.
  * Show positive values in a green tone.

* Tooltip text:

  * When toggle off:

    * `"Net Monthly Impact (Hard Cash)"`
  * When toggle on:

    * `"Net Monthly Impact (Hard Cash, after Supervisor Opportunity Cost)"`

4.3 Table rows:

Maintain existing rows:

* `Net Annual Impact (Steady State)`
* `Monthly Net Cash (Hard)`
* `Monthly Operational Value (Soft)`
* etc.

Add a new row immediately under Monthly Net Cash (Hard):

* Label: `Supervisor Opportunity Cost`
* When toggle off:

  * Show `0` or `n/a` for each scenario in a muted color.
* When toggle on:

  * Show `-opportunityCostMonthly` for each scenario, formatted as a negative amount.

Add another row or adjust existing net row:

* Label: `Monthly Net Cash (Hard + Opportunity Cost)`
* Values:

  * Use `netMonthlySteadyStateHardWithOpportunity` for each scenario.

This way, a CFO can see:

* The original Hard Net.
* The explicit Opportunity Cost line.
* The final overlayed Hard Net that matches the bar chart.

Add a small caption under the table:

* `"Opportunity Cost view: ON"` or `"Opportunity Cost view: OFF"`

Include this caption in the print view.

---

5. Scenario Modeling – Revenue leak visual

---

Update `ScenarioCard.tsx`.

We already show:

* "Clinical Capacity Restored" block using `freedSupervisorHours`.

Add a companion block that visualizes the revenue leak from supervision when the opportunity cost toggle is ON.

5.1 Lost revenue block:

Inside the "Value Generated" section, after the restored capacity metric:

```tsx
{enabledFactors.includeOpportunityCost && metrics.opportunityCostMonthly > 0 && (
  <div className="flex items-center gap-2 mb-2">
    <div className="p-1.5 bg-rose-500/10 rounded border border-rose-500/20">
      {/* Icon hinting at money leaking or risk */}
      <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v18m4-14H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H8"
        />
      </svg>
    </div>
    <div className="text-xs">
      <span className="block font-bold text-rose-100">
        {formatMoney(metrics.opportunityCostMonthly)} monthly revenue at risk
      </span>
      <span className="text-[10px] text-slate-400">
        {metrics.supervisionHours.toFixed(1)} hrs of Director time in non billable supervision
      </span>
    </div>
  </div>
)}
```

This block should:

* Only render when the toggle is ON.
* Use a red color theme to signal risk.
* Use the same `formatMoney` helper used elsewhere.

Optional: Add a thin red progress bar that shows the ratio of supervisionHours to totalDirectorCapacity so the user can see how much of the Director's month is tied up.

---

6. "Cost of Doing Nothing" framing

---

The objective is to make Scenario A feel like an active loss, not a neutral line.

When `includeOpportunityCost` is ON:

* Scenario A:

  * `netMonthlySteadyStateHard` remains zero by design.
  * `opportunityCostMonthly` is large and negative.
  * `netMonthlySteadyStateHardWithOpportunity` is negative and should show as a red bar in the Executive Summary.

* Scenario B and C:

  * Have the same Hard Net as before.
  * Lose a smaller amount to supervision.
  * Show a smaller negative opportunity cost line and a higher netHardWithOpportunity.

This turns the decision narrative into:

* "If we do nothing, we are losing X per month in Director revenue."
* "If we restructure or expand, we recover Y of that loss, plus any additional hard and soft value."

---

7. Acceptance criteria – CFO test

---

Create at least one test scenario with simple numbers:

* Director:

  * `supervisorFte = 1`
  * `billableRate = 150`
  * `utilization = 0.75`
  * `HOURS_PER_FTE_MONTH = 160`

* Scenario A:

  * `freedSupervisorHours = 0` (Director does only supervision).

* Scenario B:

  * `freedSupervisorHours = 40` (one full day per week freed).

Check:

1. Toggle OFF:

   * `opportunityCostMonthly` is still calculated but does not affect `netMonthlySteadyStateHard`.
   * Executive Summary bar chart uses plain `netMonthlySteadyStateHard` and shows 0 for Scenario A.

2. Toggle ON:

   * Scenario A:

     * `supervisionHours = 160`
     * `lostRevenueHours = 160 * 0.75 = 120`
     * `opportunityCostMonthly = 120 * 150 = 18,000`
     * `netMonthlySteadyStateHardWithOpportunity = 0 - 18,000 = -18,000`
     * Executive Summary bar should show a red bar at -18,000.

   * Scenario B:

     * `supervisionHours = 160 - 40 = 120`
     * `lostRevenueHours = 120 * 0.75 = 90`
     * `opportunityCostMonthly = 90 * 150 = 13,500`
     * `netMonthlySteadyStateHardWithOpportunity = netMonthlySteadyStateHard - 13,500`
     * This value should be less negative or more positive than Scenario A, depending on the existing Hard Net.

3. Visual:

   * Sensitivity bar clearly shows when Opportunity Cost is ON.
   * Executive Summary table and bar chart clearly label that the view includes Opportunity Cost.
   * Scenario cards show both:

     * Monthly hours restored for clinical work.
     * Monthly revenue at risk from remaining supervision.

Once these criteria pass, the feature is considered complete.

```

---

That prompt folds in:

- Your other agent’s “negative baseline” idea.  
- The more precise overlay vs base metric distinction.  
- Explicit no double dip rules and acceptance tests.

You can still tweak wording, but structurally this is a full spec.


```
Always update the DOC, SSOT, logic, calculation ect.
