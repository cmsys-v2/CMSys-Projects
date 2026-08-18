/* ==========================================================================
   Special Project System (SPS) - Quantity Surveying & BOQ Engine
   Handles Bill of Quantities (BOQ), Rate Analysis, Material Take-Off (MTO),
   and Earned Value Management (EVM: PV, EV, AC, CPI, SPI metrics)
   ========================================================================== */

class QuantitySurveyingEngine {
  constructor() {
    this.boqItems = [];
    this.evmMetrics = {
      pv: 0, // Planned Value
      ev: 0, // Earned Value
      ac: 0, // Actual Cost
      bac: 0, // Budget at Completion
      cv: 0, // Cost Variance
      sv: 0, // Schedule Variance
      cpi: 1.0, // Cost Performance Index
      spi: 1.0, // Schedule Performance Index
      eac: 0  // Estimate at Completion
    };
  }

  /**
   * Calculate full BOQ & EVM Metrics
   */
  calculateBOQ(items) {
    this.boqItems = items || [];
    let totalBAC = 0;
    let totalPV = 0;
    let totalEV = 0;
    let totalAC = 0;

    this.boqItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.unit_rate) || 0;
      item.total_cost = qty * rate;

      totalBAC += item.total_cost;

      // Planned vs Progress calculation
      const plannedPct = (parseFloat(item.planned_progress) || 0) / 100;
      const actualPct = (parseFloat(item.actual_progress) || 0) / 100;

      item.planned_value = item.total_cost * plannedPct;
      item.earned_value = item.total_cost * actualPct;
      item.actual_cost = parseFloat(item.actual_cost) || (item.earned_value * 0.95); // Default estimate if missing

      totalPV += item.planned_value;
      totalEV += item.earned_value;
      totalAC += item.actual_cost;
    });

    // Compute EVM Metrics
    this.evmMetrics.bac = totalBAC;
    this.evmMetrics.pv = totalPV;
    this.evmMetrics.ev = totalEV;
    this.evmMetrics.ac = totalAC;

    this.evmMetrics.cv = totalEV - totalAC;
    this.evmMetrics.sv = totalEV - totalPV;

    this.evmMetrics.cpi = totalAC > 0 ? (totalEV / totalAC) : 1.0;
    this.evmMetrics.spi = totalPV > 0 ? (totalEV / totalPV) : 1.0;

    this.evmMetrics.eac = this.evmMetrics.cpi > 0 ? (totalBAC / this.evmMetrics.cpi) : totalBAC;

    return {
      items: this.boqItems,
      evm: this.evmMetrics
    };
  }

  /**
   * Render BOQ Dashboard & Master Table HTML
   */
  renderBOQView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { items, evm } = this.calculateBOQ(window.spsStore.state.boqItems);

    container.innerHTML = `
      <div class="qs-container">
        <!-- EVM Executive Cards -->
        <div class="evm-grid">
          <div class="evm-card">
            <span class="evm-card-title">Budget At Completion (BAC)</span>
            <span class="evm-card-value">LKR ${evm.bac.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span class="evm-card-status evm-neutral"><i class="fas fa-coins"></i> Total Approved BOQ</span>
          </div>

          <div class="evm-card">
            <span class="evm-card-title">Earned Value (EV)</span>
            <span class="evm-card-value">LKR ${evm.ev.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span class="evm-card-status evm-positive"><i class="fas fa-check-circle"></i> Work Completed</span>
          </div>

          <div class="evm-card">
            <span class="evm-card-title">Actual Cost (AC)</span>
            <span class="evm-card-value">LKR ${evm.ac.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span class="evm-card-status ${evm.cv >= 0 ? 'evm-positive' : 'evm-negative'}">
              <i class="fas ${evm.cv >= 0 ? 'fa-arrow-down' : 'fa-arrow-up'}"></i> CV: LKR ${Math.abs(evm.cv).toLocaleString()}
            </span>
          </div>

          <div class="evm-card">
            <span class="evm-card-title">Cost Perf. Index (CPI)</span>
            <span class="evm-card-value">${evm.cpi.toFixed(2)}</span>
            <span class="evm-card-status ${evm.cpi >= 1.0 ? 'evm-positive' : 'evm-negative'}">
              <i class="fas ${evm.cpi >= 1.0 ? 'fa-thumbs-up' : 'fa-exclamation-triangle'}"></i> 
              ${evm.cpi >= 1.0 ? 'Under Budget' : 'Over Budget'}
            </span>
          </div>

          <div class="evm-card">
            <span class="evm-card-title">Schedule Perf. Index (SPI)</span>
            <span class="evm-card-value">${evm.spi.toFixed(2)}</span>
            <span class="evm-card-status ${evm.spi >= 1.0 ? 'evm-positive' : 'evm-negative'}">
              <i class="fas ${evm.spi >= 1.0 ? 'fa-clock' : 'fa-history'}"></i> 
              ${evm.spi >= 1.0 ? 'Ahead of Schedule' : 'Behind Schedule'}
            </span>
          </div>
        </div>

        <!-- Master BOQ Table -->
        <div class="boq-table-wrapper">
          <div class="boq-toolbar">
            <div style="display:flex; align-items:center; gap:12px;">
              <h3 style="font-size:1.1rem; font-weight:700;"><i class="fas fa-file-invoice-dollar" style="color:var(--accent-primary)"></i> Bill of Quantities (BOQ) Master Sheet</h3>
            </div>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-primary" onclick="app.openNewBOQItemModal()">
                <i class="fas fa-plus"></i> Add BOQ Item
              </button>
              <button class="btn btn-secondary" onclick="app.exportBOQReport()">
                <i class="fas fa-download"></i> Export Printable Report
              </button>
            </div>
          </div>

          <table class="boq-table">
            <thead>
              <tr>
                <th style="width:70px;">Item</th>
                <th>Work Description</th>
                <th style="width:80px;">Unit</th>
                <th class="num-cell" style="width:100px;">Quantity</th>
                <th class="num-cell" style="width:130px;">Unit Rate (LKR)</th>
                <th class="num-cell" style="width:150px;">Total Cost (LKR)</th>
                <th style="width:120px;">Progress</th>
                <th style="width:80px; text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderBOQRows(items)}
            </tbody>
            <tfoot>
              <tr class="boq-total-row">
                <td colspan="5" style="text-align:right;">TOTAL SPECIAL PROJECT BOQ ESTIMATE:</td>
                <td class="num-cell">LKR ${evm.bac.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  renderBOQRows(items) {
    if (!items || items.length === 0) {
      return `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-dim);">No BOQ items found. Click 'Add BOQ Item' to populate estimate.</td></tr>`;
    }

    let currentCategory = "";
    let html = "";

    items.forEach((item, idx) => {
      if (item.category && item.category !== currentCategory) {
        currentCategory = item.category;
        html += `
          <tr class="boq-category-header">
            <td colspan="8"><i class="fas fa-folder-open"></i> CATEGORY: ${currentCategory.toUpperCase()}</td>
          </tr>
        `;
      }

      html += `
        <tr>
          <td class="boq-item-code">${item.item_code || `BOQ-${idx + 1}`}</td>
          <td>
            <strong>${item.description}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${item.notes || ''}</div>
          </td>
          <td>${item.unit || 'Nos'}</td>
          <td class="num-cell">${parseFloat(item.quantity).toLocaleString()}</td>
          <td class="num-cell">${parseFloat(item.unit_rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="num-cell" style="font-weight:700; color:var(--accent-primary);">
            LKR ${parseFloat(item.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
          <td>
            <div style="font-size:0.78rem; font-weight:600; margin-bottom:4px;">${item.actual_progress || 0}%</div>
            <div style="width:100%; height:6px; background:var(--bg-surface); border-radius:3px; overflow:hidden;">
              <div style="width:${item.actual_progress || 0}%; height:100%; background:var(--accent-success);"></div>
            </div>
          </td>
          <td style="text-align:center;">
            <button class="btn btn-secondary btn-icon" onclick="app.editBOQItem('${item.id}')" title="Edit Item">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `;
    });

    return html;
  }
}

window.QuantitySurveyingEngine = QuantitySurveyingEngine;
