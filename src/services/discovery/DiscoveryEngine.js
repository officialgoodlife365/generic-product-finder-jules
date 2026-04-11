const SourceModuleManager = require('../source_modules/SourceModuleManager');
const db = require('../../db');
const { getTriangulationStatus, calculateMaturityStage, createFingerprint } = require('./utils');
const logger = require('../../utils/logger');

class DiscoveryEngine {
  constructor() {
    this.runId = null;
    this.runStats = {
      startTime: null,
      totalSignalsFound: 0,
      triangulatedCount: 0,
      watchListCount: 0,
      problemsAdvanced: 0,
      leadsCaptured: 0
    };
  }

  /**
   * Phase 1A: Broad Sweep
   * @param {string[]} niches Array of target niches
   * @param {Object} keywords Dictionary of keywords grouped by type (frustration, demand, etc.)
   */
  async runPhase1A(niches, keywords, options = {}) {
    this.runStats = {
      startTime: Date.now(),
      totalSignalsFound: 0,
      triangulatedCount: 0,
      watchListCount: 0,
      problemsAdvanced: 0,
      leadsCaptured: 0
    };
    logger.info(`[DiscoveryEngine] Starting Phase 1A for ${niches.length} niches...`);

    // 1. Run all enabled modules
    const rawSignals = await SourceModuleManager.runDiscoveryPhase1A(niches, keywords, null, options);
    this.runStats.totalSignalsFound = rawSignals.length;

    // 2. Deduplicate signals by problem_fingerprint
    const dedupedSignals = this.deduplicateSignals(rawSignals);
    logger.info(`[DiscoveryEngine] Phase 1A complete. Extracted ${dedupedSignals.length} unique problems.`);

    // Proceed to Phase 1B
    return this.runPhase1B(dedupedSignals);
  }

  /**
   * Deduplicates array of raw SignalResults based on problem_fingerprint.
   */
  deduplicateSignals(rawSignals) {
    const grouped = new Map();

    for (const signal of rawSignals) {
      const fp = signal.problem_fingerprint || createFingerprint(signal.problem_name);

      if (!grouped.has(fp)) {
        grouped.set(fp, {
          fingerprint: fp,
          name: signal.problem_name,
          niche: signal.niche,
          sub_niche: signal.sub_niche,
          signal_type: signal.signal_type,
          emotional_intensity: signal.emotional_intensity,
          categories_hit: new Set([signal.source_category]),
          total_engagement: signal.engagement_score || 0,
          max_freshness: signal.freshness_weight || 1.0,
          source_urls: [signal.source_url],
          money_signals: [...(signal.money_signals || [])],
          raw_signals: [signal] // Keep references to raw signals for lead generation
        });
      } else {
        const existing = grouped.get(fp);
        existing.categories_hit.add(signal.source_category);
        existing.total_engagement += (signal.engagement_score || 0);
        existing.max_freshness = Math.max(existing.max_freshness, signal.freshness_weight || 1.0);

        if (!existing.source_urls.includes(signal.source_url)) {
          existing.source_urls.push(signal.source_url);
        }

        if (signal.money_signals && signal.money_signals.length) {
          existing.money_signals.push(...signal.money_signals);
        }

        existing.raw_signals.push(signal);
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Phase 1B: Deep Extraction & Filtering
   */
  async runPhase1B(dedupedSignals) {
    logger.info(`[DiscoveryEngine] Starting Phase 1B for ${dedupedSignals.length} problems...`);
    const finalizedOpportunities = [];

    for (const signalGroup of dedupedSignals) {
      // Step 1: Status & Maturity
      const status = getTriangulationStatus(signalGroup.categories_hit);
      const maturity = calculateMaturityStage(signalGroup.raw_signals.length, signalGroup.total_engagement);

      if (status === 'watch_list') this.runStats.watchListCount++;
      if (status === 'triangulated' || status === 'corroborated') this.runStats.triangulatedCount++;

      // Step 2: Scoring Transformation
      // Base score is engagement * freshness + (bonus if triangulated).
      // Max score normalized to ~75. Real scoring engine does this in Phase 2.
      let rawScore = Math.min((signalGroup.total_engagement / 10) * signalGroup.max_freshness, 50);
      if (status === 'triangulated') rawScore += 10;
      if (status === 'corroborated') rawScore += 25;

      const opportunity = {
        name: signalGroup.name,
        fingerprint: signalGroup.fingerprint,
        niche: signalGroup.niche,
        sub_niche: signalGroup.sub_niche,
        phase: 'discovery',
        maturity_stage: maturity,
        triangulation_status: status,
        triangulation_categories: Array.from(signalGroup.categories_hit),
        raw_score: parseFloat(rawScore.toFixed(2)),
        weighted_score: parseFloat(rawScore.toFixed(2)), // Initial state matches raw
        source_urls: signalGroup.source_urls,
        // The raw_signals are attached temporarily for lead capture persistence
        _raw_signals: signalGroup.raw_signals
      };

      // Selection Criteria (Architecture logic): We only persist top signals, or triangulated signals.
      if (status !== 'watch_list' || signalGroup.total_engagement > 50) {
        finalizedOpportunities.push(opportunity);
        this.runStats.problemsAdvanced++;
      }
    }

    // Persist to DB
    await this.persistResults(finalizedOpportunities);

    return finalizedOpportunities;
  }

  /**
   * Saves opportunities, leads, and run logs to the database.
   */
  async persistResults(opportunities) {
    logger.info(`[DiscoveryEngine] Persisting ${opportunities.length} opportunities to the database...`);

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Log the run
      const durationSeconds = Math.round((Date.now() - this.runStats.startTime) / 1000);
      const runQuery = `
        INSERT INTO discovery_runs (run_duration_seconds, total_signals_found, triangulated_count, watch_list_count, problems_advanced)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `;
      const runRes = await client.query(runQuery, [
        durationSeconds,
        this.runStats.totalSignalsFound,
        this.runStats.triangulatedCount,
        this.runStats.watchListCount,
        this.runStats.problemsAdvanced
      ]);
      this.runId = runRes.rows[0].id;

      // 2. Insert Opportunities & Leads
      for (const opp of opportunities) {
        // Upsert opportunity based on name (in a real system, use problem_fingerprint if schema supports unique constraints)
        // Here we do a simplistic select then insert/update
        const checkRes = await client.query('SELECT id, raw_score FROM opportunities WHERE name = $1 AND niche = $2', [opp.name, opp.niche]);

        let opportunityId;

        if (checkRes.rows.length > 0) {
          // Update existing
          opportunityId = checkRes.rows[0].id;
          const oldScore = parseFloat(checkRes.rows[0].raw_score || 0);
          // Simple Velocity Bonus logic (+2 if reappearing)
          const newScore = Math.max(opp.raw_score, oldScore) + 2;

          await client.query(`
            UPDATE opportunities
            SET raw_score = $1, weighted_score = $1, triangulation_status = $2, triangulation_categories = $3, source_urls = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
          `, [newScore, opp.triangulation_status, JSON.stringify(opp.triangulation_categories), JSON.stringify(opp.source_urls), opportunityId]);
        } else {
          // Insert new
          const insertRes = await client.query(`
            INSERT INTO opportunities (name, niche, sub_niche, phase, maturity_stage, triangulation_status, triangulation_categories, raw_score, weighted_score, source_urls)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
          `, [
            opp.name, opp.niche, opp.sub_niche, opp.phase, opp.maturity_stage,
            opp.triangulation_status, JSON.stringify(opp.triangulation_categories),
            opp.raw_score, opp.weighted_score, JSON.stringify(opp.source_urls)
          ]);
          opportunityId = insertRes.rows[0].id;
        }

        // 3. Extract and insert leads from the raw signals forming this opportunity
        for (const rawSignal of opp._raw_signals) {
          if (rawSignal.username) {
            // Check if lead already exists to avoid dupes
            const leadCheck = await client.query('SELECT id FROM warm_leads WHERE username = $1 AND opportunity_id = $2', [rawSignal.username, opportunityId]);
            if (leadCheck.rows.length === 0) {
              await client.query(`
                INSERT INTO warm_leads (opportunity_id, username, platform, community, post_url, pain_quote, engagement_score, lead_score)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [
                opportunityId, rawSignal.username, rawSignal.platform, rawSignal.community,
                rawSignal.source_url, rawSignal.raw_quote, rawSignal.engagement_metrics.upvotes, rawSignal.engagement_score
              ]);
              this.runStats.leadsCaptured++;
            }
          }
        }
      }

      // 4. Update run with lead count
      await client.query('UPDATE discovery_runs SET leads_captured = $1 WHERE id = $2', [this.runStats.leadsCaptured, this.runId]);

      await client.query('COMMIT');
      logger.info(`[DiscoveryEngine] Database persistence completed.`);
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[DiscoveryEngine] Database persistence failed: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new DiscoveryEngine();
