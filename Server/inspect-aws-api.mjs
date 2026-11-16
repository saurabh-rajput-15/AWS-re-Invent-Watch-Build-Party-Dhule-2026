import dotenv from 'dotenv';
dotenv.config();
import { builderCenterAgentService } from './dist/services/builderCenterAgent.service.js';

await builderCenterAgentService.loadSession();

console.log('--- Testing Strategy 2: Lazy / On-Demand Live Check ---');
const lazyCheck1 = await builderCenterAgentService.fetchRequestedAliasLive('agentviru');
console.log('Lazy check @agentviru:', lazyCheck1);

const lazyCheck2 = await builderCenterAgentService.fetchRequestedAliasLive('sankya');
console.log('Lazy check @sankya:', lazyCheck2);

const lazyCheck3 = await builderCenterAgentService.fetchRequestedAliasLive('nonexistentperson999');
console.log('Lazy check nonexistent:', lazyCheck3);

console.log('\n--- Testing Strategy 1: Sync & Cache (Fetch All 500+ Pages) ---');
const syncResult = await builderCenterAgentService.syncRosterFromBuilderCenter('dual_strategy_test');
console.log('Sync Result:', syncResult);
