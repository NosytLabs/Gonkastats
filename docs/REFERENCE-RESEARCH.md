# VeniceStats reference -> Gonka implementation

Research date: 2026-09-21. Sources: https://venicestats.com/developers#reference (REST tab inspected with Firecrawl), https://rpc.gonka.gg/agents, https://rpc.gonka.gg/api/endpoints, public Gonka docs, OpenBroker/Proxy documentation and observed JSON. Context7 supplied current Next.js Route Handler documentation.

| Observed reference pattern | GonkaStats implementation |
| --- | --- |
| Consolidated protocol metrics | /api/v1/overview and /metrics, with explicit metric units, source IDs and scope |
| Historical chart endpoints | /history and /charts, bounded to retained observations; no fabricated history |
| Pipeline freshness/health | /health, /status, source radar |
| Simulator matching the page | Cost Lab and /simulate-cost share src/core/cost.ts |
| Real-time activity | /live returns retained indexed block observations, explicitly not a complete inference feed |
| Searchable API groups and Try it | /developers grouped interactive reference, generated from the same registry as OpenAPI |
| Agent-facing tools | Upstream discovery catalog, own llms.txt, AGENTS.md, OpenAPI; no fictitious remote MCP count |

Venice-specific mechanics (VVV/DIEM staking, burns, airdrops, free float and insider classifications) are not re-labelled as Gonka features. No proprietary Venice code or assets are copied.

## Directly checked response contracts

The RPC endpoint catalog had groups with label/endpoints and metadata method/path/description/params/cache. Its authentication object described api_key although the agents guide described open access; individual public reads succeeded without authentication. We expose that discrepancy instead of silently choosing one claim.

Proxy capabilities returned models[] with id, context_length/max_model_len, max_output_tokens, supports_tools, supports_reasoning, hf_repo, hf_commit and v_ram_gb. Proxy pricing returned gonka_usd, fx_updated_at, pricing_updated_at and per-model usd_per_million_tokens/ngonka_per_token. These remain provider reports, not trade execution or settled account bills.

Native supply returned amount.denom=ngonka and an exact integer string. Tokenomics returned total_fees, total_subsidies, total_refunded and total_burned. The hardware registry includes many historical participants, so inventory is matched to epoch participant/node identifiers before aggregation.

Public JSON observations are point checks, not authenticated tests, permission grants, capacity tests or independent correctness audits.
