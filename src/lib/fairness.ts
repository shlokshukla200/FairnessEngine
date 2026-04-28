/**
 * AIF360-inspired Fairness Engine for TypeScript
 * Implements core metrics and algorithms for algorithmic fairness.
 */

export interface DataRow {
  [key: string]: any;
}

export interface FairnessMetrics {
  disparateImpact: number;
  statisticalParityDifference: number;
  equalOpportunityDifference: number;
  averageOddsDifference: number;
  theilIndex: number;
}

export class FairnessEngine {
  /**
   * Calculates Disparate Impact Ratio
   * (unprivileged_success_rate / privileged_success_rate)
   */
  static calculateDisparateImpact(
    data: DataRow[],
    targetVar: string,
    protectedAttr: string,
    privilegedValue: string,
    favorableValue: string
  ): number {
    const privilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase());
    const unprivilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() !== String(privilegedValue).toLowerCase());

    if (privilegedGroup.length === 0 || unprivilegedGroup.length === 0) return 1.0;

    const getSuccessRate = (group: DataRow[]) => {
      if (group.length === 0) return 0;
      const successes = group.filter(row => this.isPositiveOutcome(row[targetVar], favorableValue));
      return successes.length / group.length;
    };

    const privRate = getSuccessRate(privilegedGroup);
    const unprivRate = getSuccessRate(unprivilegedGroup);

    if (privRate === 0) return unprivRate > 0 ? 2.0 : 1.0; // Avoid division by zero
    return unprivRate / privRate;
  }

  /**
   * Calculates Statistical Parity Difference
   * (unprivileged_success_rate - privileged_success_rate)
   */
  static calculateStatisticalParity(
    data: DataRow[],
    targetVar: string,
    protectedAttr: string,
    privilegedValue: string,
    favorableValue: string
  ): number {
    const privilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase());
    const unprivilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() !== String(privilegedValue).toLowerCase());

    if (privilegedGroup.length === 0 || unprivilegedGroup.length === 0) return 0;

    const getSuccessRate = (group: DataRow[]) => {
      if (group.length === 0) return 0;
      const successes = group.filter(row => this.isPositiveOutcome(row[targetVar], favorableValue));
      return successes.length / group.length;
    };

    return getSuccessRate(unprivilegedGroup) - getSuccessRate(privilegedGroup);
  }

  /**
   * Calculates Equal Opportunity Difference
   * (TPR_unprivileged - TPR_privileged)
   * Requires ground truth (actual favorable outcomes)
   */
  static calculateEqualOpportunityDifference(
    data: DataRow[],
    targetVar: string,
    protectedAttr: string,
    privilegedValue: string,
    favorableValue: string,
    actualVar: string // The actual outcome column
  ): number {
    const privilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase());
    const unprivilegedGroup = data.filter(row => String(row[protectedAttr]).toLowerCase() !== String(privilegedValue).toLowerCase());

    const getTPR = (group: DataRow[]) => {
      const actualPositives = group.filter(row => this.isPositiveOutcome(row[actualVar], favorableValue));
      if (actualPositives.length === 0) return 0;
      const truePositives = actualPositives.filter(row => this.isPositiveOutcome(row[targetVar], favorableValue));
      return truePositives.length / actualPositives.length;
    };

    return getTPR(unprivilegedGroup) - getTPR(privilegedGroup);
  }

  /**
   * Simple Reweighing Mitigation Simulation
   * Returns weights for each row to balance the dataset.
   */
  static computeReweighingWeights(
    data: DataRow[],
    targetVar: string,
    protectedAttr: string,
    privilegedValue: string,
    favorableValue: string
  ): number[] {
    const n = data.length;
    if (n === 0) return [];

    const n_fav = data.filter(row => this.isPositiveOutcome(row[targetVar], favorableValue)).length;
    const n_unfav = n - n_fav;
    
    const n_priv = data.filter(row => String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase()).length;
    const n_unpriv = n - n_priv;

    const n_priv_fav = data.filter(row => String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase() && this.isPositiveOutcome(row[targetVar], favorableValue)).length;
    const n_priv_unfav = n_priv - n_priv_fav;
    const n_unpriv_fav = data.filter(row => String(row[protectedAttr]).toLowerCase() !== String(privilegedValue).toLowerCase() && this.isPositiveOutcome(row[targetVar], favorableValue)).length;
    const n_unpriv_unfav = n_unpriv - n_unpriv_fav;

    return data.map(row => {
      const isPriv = String(row[protectedAttr]).toLowerCase() === String(privilegedValue).toLowerCase();
      const isFav = this.isPositiveOutcome(row[targetVar], favorableValue);

      let weight = 1.0;
      if (isPriv && isFav) weight = (n_priv * n_fav) / (n * n_priv_fav);
      else if (isPriv && !isFav) weight = (n_priv * n_unfav) / (n * n_priv_unfav);
      else if (!isPriv && isFav) weight = (n_unpriv * n_fav) / (n * n_unpriv_fav);
      else if (!isPriv && !isFav) weight = (n_unpriv * n_unfav) / (n * n_unpriv_unfav);

      return isFinite(weight) ? weight : 1.0;
    });
  }

  static isPositiveOutcome(val: any, favorableValue: string): boolean {
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1 || String(val) === favorableValue;
    
    const s = String(val).toLowerCase().trim();
    const fav = String(favorableValue).toLowerCase().trim();
    
    return s === fav || ['yes', 'approved', '1', 'true', 'success', 'hired', 'positive'].includes(s);
  }
}
