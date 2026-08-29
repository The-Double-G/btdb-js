<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

const AI_PROTOCOL_VERSION = 1;
const AI_MODEL_SCHEMA = 9;
const AI_GAME_VERSION = 'v2.6.0';
const AI_MAX_BODY_BYTES = 8388608;
const AI_MAX_CONTRIBUTION_BYTES = 131072;
const AI_MAX_CONTRIBUTION_OBSERVATIONS = 320;
const AI_MAX_DECISION_SAMPLES = 32;
const AI_MAX_DECISION_SAMPLE_AGE = 1000000;
const AI_MAX_CONTRIBUTION_POLICY_DELTA_NORM = 0.35;
const AI_CONTRIBUTION_RATE_LIMIT = 120;
const AI_CONTRIBUTION_WINDOW_SECONDS = 3600;
const AI_CONTRIBUTION_TOKEN_SECONDS = 21600;
const AI_MAX_CONTRIBUTION_REVISION_LAG = 2048;
const AI_STRATEGY_COUNT = 75;
const AI_FEATURE_COUNT = 17;
const AI_HIDDEN_1 = 64;
const AI_HIDDEN_2 = 32;
const AI_LEGACY_HIDDEN_1 = 12;
const AI_LEGACY_HIDDEN_2 = 8;
const AI_POLICY_FORMAT_VERSION = 2;
const AI_DECISION_STATE_INPUT = 48;
const AI_DECISION_CANDIDATE_INPUT = 32;
const AI_DECISION_STATE_HIDDEN = 96;
const AI_DECISION_CANDIDATE_HIDDEN = 48;
const AI_DECISION_EMBEDDING = 48;
const AI_DECISION_FAMILY_COUNT = 8;
const AI_WEIGHT_LIMIT = 4.0;
const AI_MAX_SAFE_INTEGER = 9007199254740991;

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$stateFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-learning-global.json';
$lockFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-learning-global.lock';
$keyHashFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-trainer-key.sha256';
$promotionKeyHashFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-policy-promotion-key.sha256';
$contributionSecretFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-contribution-secret';

function send_json(int $statusCode, array $payload): void {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail_json(int $statusCode, string $code, string $message): void {
    send_json($statusCode, [
        'ok' => false,
        'error' => ['code' => $code, 'message' => $message],
    ]);
}

function is_list_array(array $value): bool {
    return $value === [] || array_keys($value) === range(0, count($value) - 1);
}

function valid_number($value, float $limit = INF): bool {
    return (is_int($value) || is_float($value)) && is_finite((float)$value) && abs((float)$value) <= $limit;
}

function valid_nonnegative_integer($value): bool {
    return is_int($value) && $value >= 0 && $value <= AI_MAX_SAFE_INTEGER;
}

function valid_vector($value, int $length, float $limit): bool {
    if (!is_array($value) || !is_list_array($value) || count($value) !== $length) {
        return false;
    }
    foreach ($value as $number) {
        if (!valid_number($number, $limit)) {
            return false;
        }
    }
    return true;
}

function valid_matrix($value, int $rows, int $columns, float $limit): bool {
    if (!is_array($value) || !is_list_array($value) || count($value) !== $rows) {
        return false;
    }
    foreach ($value as $row) {
        if (!valid_vector($row, $columns, $limit)) {
            return false;
        }
    }
    return true;
}

function valid_counter_vector($value, int $length): bool {
    if (!is_array($value) || !is_list_array($value) || count($value) !== $length) {
        return false;
    }
    foreach ($value as $counter) {
        if (!valid_nonnegative_integer($counter)) {
            return false;
        }
    }
    return true;
}

function valid_strategy($strategy): bool {
    if (!is_array($strategy) || !exact_keys($strategy, ['hiddenSize1', 'hiddenSize2', 'W1', 'b1', 'W2', 'b2', 'W3', 'b3'])) {
        return false;
    }
    if (($strategy['hiddenSize1'] ?? null) !== AI_HIDDEN_1 || ($strategy['hiddenSize2'] ?? null) !== AI_HIDDEN_2) {
        return false;
    }
    return valid_matrix($strategy['W1'] ?? null, AI_HIDDEN_1, AI_FEATURE_COUNT, AI_WEIGHT_LIMIT)
        && valid_vector($strategy['b1'] ?? null, AI_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_matrix($strategy['W2'] ?? null, AI_HIDDEN_2, AI_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_vector($strategy['b2'] ?? null, AI_HIDDEN_2, AI_WEIGHT_LIMIT)
        && valid_matrix($strategy['W3'] ?? null, AI_STRATEGY_COUNT, AI_HIDDEN_2, AI_WEIGHT_LIMIT)
        && valid_vector($strategy['b3'] ?? null, AI_STRATEGY_COUNT, AI_WEIGHT_LIMIT);
}

function valid_decision($decision): bool {
    if (!is_array($decision) || !exact_keys($decision, [
        'stateInputSize', 'candidateInputSize', 'stateHiddenSize', 'candidateHiddenSize', 'embeddingSize',
        'trainingSamples',
        'WState1', 'bState1', 'WState2', 'bState2', 'WCandidate1', 'bCandidate1', 'WCandidate2',
        'bCandidate2', 'familyBias',
    ])) {
        return false;
    }
    if (($decision['stateInputSize'] ?? null) !== AI_DECISION_STATE_INPUT
        || ($decision['candidateInputSize'] ?? null) !== AI_DECISION_CANDIDATE_INPUT
        || ($decision['stateHiddenSize'] ?? null) !== AI_DECISION_STATE_HIDDEN
        || ($decision['candidateHiddenSize'] ?? null) !== AI_DECISION_CANDIDATE_HIDDEN
        || ($decision['embeddingSize'] ?? null) !== AI_DECISION_EMBEDDING) {
        return false;
    }
    return valid_counter_vector($decision['trainingSamples'] ?? null, AI_DECISION_FAMILY_COUNT)
        && valid_matrix($decision['WState1'] ?? null, AI_DECISION_STATE_HIDDEN, AI_DECISION_STATE_INPUT, AI_WEIGHT_LIMIT)
        && valid_vector($decision['bState1'] ?? null, AI_DECISION_STATE_HIDDEN, AI_WEIGHT_LIMIT)
        && valid_matrix($decision['WState2'] ?? null, AI_DECISION_EMBEDDING, AI_DECISION_STATE_HIDDEN, AI_WEIGHT_LIMIT)
        && valid_vector($decision['bState2'] ?? null, AI_DECISION_EMBEDDING, AI_WEIGHT_LIMIT)
        && valid_matrix($decision['WCandidate1'] ?? null, AI_DECISION_CANDIDATE_HIDDEN, AI_DECISION_CANDIDATE_INPUT, AI_WEIGHT_LIMIT)
        && valid_vector($decision['bCandidate1'] ?? null, AI_DECISION_CANDIDATE_HIDDEN, AI_WEIGHT_LIMIT)
        && valid_matrix($decision['WCandidate2'] ?? null, AI_DECISION_EMBEDDING, AI_DECISION_CANDIDATE_HIDDEN, AI_WEIGHT_LIMIT)
        && valid_vector($decision['bCandidate2'] ?? null, AI_DECISION_EMBEDDING, AI_WEIGHT_LIMIT)
        && valid_vector($decision['familyBias'] ?? null, AI_DECISION_FAMILY_COUNT, AI_WEIGHT_LIMIT);
}

function valid_policy($policy): bool {
    if (!is_array($policy) || !exact_keys($policy, ['formatVersion', 'strategyLearningRate', 'decisionLearningRate', 'strategy', 'decision'])) {
        return false;
    }
    $strategyLearningRate = $policy['strategyLearningRate'] ?? null;
    $decisionLearningRate = $policy['decisionLearningRate'] ?? null;
    return ($policy['formatVersion'] ?? null) === AI_POLICY_FORMAT_VERSION
        && valid_number($strategyLearningRate, 0.2)
        && (float)$strategyLearningRate > 0
        && valid_number($decisionLearningRate, 0.1)
        && (float)$decisionLearningRate > 0
        && valid_strategy($policy['strategy'] ?? null)
        && valid_decision($policy['decision'] ?? null);
}

function valid_legacy_policy($policy): bool {
    if (!is_array($policy) || !exact_keys($policy, ['hiddenSize1', 'hiddenSize2', 'learningRate', 'W1', 'b1', 'W2', 'b2', 'W3', 'b3'])) {
        return false;
    }
    $learningRate = $policy['learningRate'] ?? null;
    return ($policy['hiddenSize1'] ?? null) === AI_LEGACY_HIDDEN_1
        && ($policy['hiddenSize2'] ?? null) === AI_LEGACY_HIDDEN_2
        && valid_number($learningRate, 0.2)
        && (float)$learningRate > 0
        && valid_matrix($policy['W1'] ?? null, AI_LEGACY_HIDDEN_1, AI_FEATURE_COUNT, AI_WEIGHT_LIMIT)
        && valid_vector($policy['b1'] ?? null, AI_LEGACY_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_matrix($policy['W2'] ?? null, AI_LEGACY_HIDDEN_2, AI_LEGACY_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_vector($policy['b2'] ?? null, AI_LEGACY_HIDDEN_2, AI_WEIGHT_LIMIT)
        && valid_matrix($policy['W3'] ?? null, AI_STRATEGY_COUNT, AI_LEGACY_HIDDEN_2, AI_WEIGHT_LIMIT)
        && valid_vector($policy['b3'] ?? null, AI_STRATEGY_COUNT, AI_WEIGHT_LIMIT);
}

function valid_finite_tree($value, int $depth = 0): bool {
    if ($depth > 18) {
        return false;
    }
    if (is_int($value) || is_float($value)) {
        return is_finite((float)$value);
    }
    if (is_string($value) || is_bool($value) || $value === null) {
        return true;
    }
    if (!is_array($value)) {
        return false;
    }
    foreach ($value as $key => $child) {
        if (is_string($key) && (strlen($key) > 240 || $key === '__proto__' || $key === 'prototype' || $key === 'constructor')) {
            return false;
        }
        if (!valid_finite_tree($child, $depth + 1)) {
            return false;
        }
    }
    return true;
}

function integer_tree_has_headroom($value, int $increments, int $depth = 0): bool {
    if ($depth > 18 || $increments < 0) {
        return false;
    }
    if (is_int($value)) {
        return $value <= AI_MAX_SAFE_INTEGER - $increments;
    }
    if (!is_array($value)) {
        return true;
    }
    foreach ($value as $child) {
        if (!integer_tree_has_headroom($child, $increments, $depth + 1)) {
            return false;
        }
    }
    return true;
}

function valid_model_for_schema($model, bool $legacy): bool {
    $modelKeys = [
        'version', 'modelFamily', 'totalGames', 'totalSyntheticEpisodes', 'totalPolicySamples',
        'totalLoadoutSamples', 'totalHumanDemonstrations', 'playerProfile', 'strategyStats', 'loadoutStats',
        'placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats',
        'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats', 'totalTacticalSamples', 'candidateGeneration',
        'championGeneration', 'policy', 'championPolicy', 'populationPolicies',
    ];
    if (!$legacy) {
        $modelKeys[] = 'totalDecisionSamples';
    }
    if (!is_array($model)
        || !exact_keys($model, $modelKeys)
        || ($model['version'] ?? null) !== ($legacy ? 8 : AI_MODEL_SCHEMA)
        || ($model['modelFamily'] ?? null) !== ($legacy ? 'bounded-contextual-bandit-v1' : 'shared-neural-controller-v1')) {
        return false;
    }
    $counters = ['totalGames', 'totalSyntheticEpisodes', 'totalPolicySamples', 'totalLoadoutSamples', 'totalHumanDemonstrations', 'totalTacticalSamples', 'candidateGeneration', 'championGeneration'];
    if (!$legacy) {
        $counters[] = 'totalDecisionSamples';
    }
    foreach ($counters as $counter) {
        if (!valid_nonnegative_integer($model[$counter] ?? null)) {
            return false;
        }
    }
    if ($model['totalPolicySamples'] !== $model['totalGames'] + $model['totalSyntheticEpisodes']) {
        return false;
    }
    $profile = $model['playerProfile'] ?? null;
    if (!is_array($profile)
        || !exact_keys($profile, ['games', 'features'])
        || !valid_nonnegative_integer($profile['games'] ?? null)
        || !valid_unit_vector($profile['features'] ?? null, AI_FEATURE_COUNT)) {
        return false;
    }
    if (!isset($model['strategyStats'])
        || !is_array($model['strategyStats'])
        || !is_list_array($model['strategyStats'])
        || count($model['strategyStats']) !== AI_STRATEGY_COUNT) {
        return false;
    }
    $totalGames = 0;
    $totalSyntheticEpisodes = 0;
    foreach ($model['strategyStats'] as $record) {
        if (!is_array($record) || !exact_keys($record, ['games', 'wins', 'losses', 'ties', 'syntheticEpisodes', 'lastReward'])) {
            return false;
        }
        foreach (['games', 'wins', 'losses', 'ties', 'syntheticEpisodes'] as $counter) {
            if (!valid_nonnegative_integer($record[$counter] ?? null)) {
                return false;
            }
        }
        if ($record['games'] < $record['wins'] + $record['losses'] + $record['ties']
            || !valid_number($record['lastReward'] ?? null, 1.0)) {
            return false;
        }
        $totalGames += $record['games'];
        $totalSyntheticEpisodes += $record['syntheticEpisodes'];
    }
    if ($model['totalGames'] !== $totalGames || $model['totalSyntheticEpisodes'] !== $totalSyntheticEpisodes) {
        return false;
    }
    $policyValidator = $legacy ? 'valid_legacy_policy' : 'valid_policy';
    if (!$policyValidator($model['policy'] ?? null) || !$policyValidator($model['championPolicy'] ?? null)) {
        return false;
    }
    foreach (['loadoutStats', 'placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats', 'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats'] as $storeName) {
        if (!isset($model[$storeName]) || !is_array($model[$storeName]) || count($model[$storeName]) > 12000) {
            return false;
        }
    }
    $loadoutSamples = 0;
    foreach ($model['loadoutStats'] as $record) {
        if (!is_array($record) || !exact_keys($record, ['games', 'wins', 'losses', 'ties', 'lastReward'])) {
            return false;
        }
        foreach (['games', 'wins', 'losses', 'ties'] as $counter) {
            if (!valid_nonnegative_integer($record[$counter] ?? null)) {
                return false;
            }
        }
        if ($record['games'] !== $record['wins'] + $record['losses'] + $record['ties']
            || !valid_number($record['lastReward'] ?? null, 1.0)) {
            return false;
        }
        $loadoutSamples += $record['games'];
    }
    foreach (['placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats', 'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats'] as $storeName) {
        foreach ($model[$storeName] as $record) {
            if (!is_array($record)
                || !exact_keys($record, ['samples', 'score', 'mean', 'm2'])
                || !valid_nonnegative_integer($record['samples'] ?? null)
                || !valid_number($record['score'] ?? null, 1.0)
                || !valid_number($record['mean'] ?? null, 1.0)
                || !valid_number($record['m2'] ?? null)
                || (float)$record['m2'] < 0) {
                return false;
            }
        }
    }
    $population = $model['populationPolicies'] ?? null;
    if (!is_array($population) || !is_list_array($population) || count($population) > ($legacy ? 4 : 2)) {
        return false;
    }
    foreach ($population as $policy) {
        if (!$policyValidator($policy)) {
            return false;
        }
    }
    return $model['totalLoadoutSamples'] === $loadoutSamples
        && valid_finite_tree($model);
}

function valid_model($model): bool {
    return valid_model_for_schema($model, false);
}

function valid_legacy_model($model): bool {
    return valid_model_for_schema($model, true);
}

function valid_fresh_model($model): bool {
    if (!valid_model($model)) {
        return false;
    }
    foreach (['totalGames', 'totalSyntheticEpisodes', 'totalPolicySamples', 'totalLoadoutSamples', 'totalTacticalSamples', 'totalHumanDemonstrations', 'totalDecisionSamples', 'candidateGeneration', 'championGeneration'] as $counter) {
        if ((int)($model[$counter] ?? 0) !== 0) {
            return false;
        }
    }
    if ((int)($model['playerProfile']['games'] ?? 0) !== 0 || !valid_vector($model['playerProfile']['features'] ?? null, AI_FEATURE_COUNT, 0.0)) {
        return false;
    }
    foreach (['loadoutStats', 'placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats', 'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats'] as $storeName) {
        if (($model[$storeName] ?? null) !== []) {
            return false;
        }
    }
    foreach ($model['strategyStats'] as $stats) {
        foreach (['games', 'wins', 'losses', 'ties', 'syntheticEpisodes'] as $counter) {
            if ((int)($stats[$counter] ?? 0) !== 0) {
                return false;
            }
        }
    }
    return ($model['populationPolicies'] ?? null) === [];
}

function canonical_digest_encode($value): string {
    if ($value === null) {
        return 'null';
    }
    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }
    if (is_int($value) || is_float($value)) {
        $number = (float)$value;
        if (!is_finite($number)) {
            throw new RuntimeException('Cannot digest a non-finite number.');
        }
        if ($number >= -AI_MAX_SAFE_INTEGER && $number <= AI_MAX_SAFE_INTEGER && floor($number) === $number) {
            return 'i:' . (string)(int)$number;
        }
        return 'f:' . bin2hex(pack('E', $number));
    }
    if (is_string($value)) {
        return 's:' . bin2hex($value);
    }
    if (is_object($value)) {
        $value = get_object_vars($value);
        $encodedEntries = [];
        foreach ($value as $key => $child) {
            $encodedEntries[] = ['key' => canonical_digest_encode((string)$key), 'value' => $child];
        }
        usort($encodedEntries, function (array $left, array $right): int {
            return strcmp($left['key'], $right['key']);
        });
        $parts = [];
        foreach ($encodedEntries as $entry) {
            $parts[] = $entry['key'] . ':' . canonical_digest_encode($entry['value']);
        }
        return '{' . implode(',', $parts) . '}';
    }
    if (!is_array($value)) {
        throw new RuntimeException('Cannot digest an unsupported value.');
    }
    if (is_list_array($value)) {
        return '[' . implode(',', array_map('canonical_digest_encode', $value)) . ']';
    }
    $encodedEntries = [];
    foreach ($value as $key => $child) {
        $encodedEntries[] = ['key' => canonical_digest_encode((string)$key), 'value' => $child];
    }
    usort($encodedEntries, function (array $left, array $right): int {
        return strcmp($left['key'], $right['key']);
    });
    $parts = [];
    foreach ($encodedEntries as $entry) {
        $parts[] = $entry['key'] . ':' . canonical_digest_encode($entry['value']);
    }
    return '{' . implode(',', $parts) . '}';
}

function model_digest(array $model): string {
    return 'sha256:' . hash('sha256', canonical_digest_encode(model_for_response($model)));
}

function valid_digest($value): bool {
    return is_string($value) && preg_match('/^sha256:[a-f0-9]{64}$/D', $value) === 1;
}

function promotion_base_digest(array $model): string {
    return model_digest([
        'version' => $model['version'] ?? null,
        'modelFamily' => $model['modelFamily'] ?? null,
        'candidateGeneration' => $model['candidateGeneration'] ?? null,
        'championGeneration' => $model['championGeneration'] ?? null,
        'championPolicy' => $model['championPolicy'] ?? null,
        'populationPolicies' => $model['populationPolicies'] ?? null,
    ]);
}

function retained_population_policies(array $model): array {
    $previousChampion = $model['championPolicy'];
    $previousChampionDigest = model_digest($previousChampion);
    $policies = [];
    foreach (($model['populationPolicies'] ?? []) as $policy) {
        if (model_digest($policy) !== $previousChampionDigest) {
            $policies[] = $policy;
        }
    }
    $policies[] = $previousChampion;
    return array_slice($policies, -2);
}

function valid_policy_promotion($request): bool {
    if (!is_array($request) || !exact_keys($request, [
        'protocolVersion',
        'promotionId',
        'sourceRevision',
        'expectedContributionEpoch',
        'expectedPromotionBaseDigest',
        'expectedPolicyDigest',
        'expectedChampionGeneration',
        'policy',
    ])) {
        return false;
    }
    return ($request['protocolVersion'] ?? null) === AI_PROTOCOL_VERSION
        && valid_digest($request['promotionId'] ?? null)
        && is_int($request['sourceRevision'] ?? null)
        && $request['sourceRevision'] >= 0
        && is_int($request['expectedContributionEpoch'] ?? null)
        && $request['expectedContributionEpoch'] >= 1
        && valid_digest($request['expectedPromotionBaseDigest'] ?? null)
        && valid_digest($request['expectedPolicyDigest'] ?? null)
        && is_int($request['expectedChampionGeneration'] ?? null)
        && $request['expectedChampionGeneration'] >= 0
        && valid_policy($request['policy'] ?? null);
}

function clamp_number(float $value, float $minimum, float $maximum): float {
    return max($minimum, min($maximum, $value));
}

function zero_vector(int $length): array {
    return array_fill(0, $length, 0.0);
}

function zero_matrix(int $rows, int $columns): array {
    $matrix = [];
    for ($row = 0; $row < $rows; $row++) {
        $matrix[] = zero_vector($columns);
    }
    return $matrix;
}

function canonical_weight(int $index, float $scale, int $salt): float {
    $state = (((($index + 1) * 1664525) + ($salt * 1013904223)) & 0xFFFFFFFF);
    $state = ((($state * 1664525) + 1013904223) & 0xFFFFFFFF);
    return (((float)$state / 4294967295.0) * 2.0 - 1.0) * $scale;
}

function canonical_matrix(int $rows, int $columns, float $scale, int $salt): array {
    $matrix = [];
    for ($row = 0; $row < $rows; $row++) {
        $values = [];
        for ($column = 0; $column < $columns; $column++) {
            $values[] = canonical_weight($row * $columns + $column, $scale, $salt + $row * 17);
        }
        $matrix[] = $values;
    }
    return $matrix;
}

function create_migrated_decision(): array {
    return [
        'stateInputSize' => AI_DECISION_STATE_INPUT,
        'candidateInputSize' => AI_DECISION_CANDIDATE_INPUT,
        'stateHiddenSize' => AI_DECISION_STATE_HIDDEN,
        'candidateHiddenSize' => AI_DECISION_CANDIDATE_HIDDEN,
        'embeddingSize' => AI_DECISION_EMBEDDING,
        'trainingSamples' => array_fill(0, AI_DECISION_FAMILY_COUNT, 0),
        'WState1' => canonical_matrix(AI_DECISION_STATE_HIDDEN, AI_DECISION_STATE_INPUT, 0.08, 11),
        'bState1' => zero_vector(AI_DECISION_STATE_HIDDEN),
        'WState2' => canonical_matrix(AI_DECISION_EMBEDDING, AI_DECISION_STATE_HIDDEN, 0.07, 23),
        'bState2' => zero_vector(AI_DECISION_EMBEDDING),
        'WCandidate1' => canonical_matrix(AI_DECISION_CANDIDATE_HIDDEN, AI_DECISION_CANDIDATE_INPUT, 0.09, 37),
        'bCandidate1' => zero_vector(AI_DECISION_CANDIDATE_HIDDEN),
        'WCandidate2' => canonical_matrix(AI_DECISION_EMBEDDING, AI_DECISION_CANDIDATE_HIDDEN, 0.07, 53),
        'bCandidate2' => zero_vector(AI_DECISION_EMBEDDING),
        'familyBias' => zero_vector(AI_DECISION_FAMILY_COUNT),
    ];
}

function migrate_legacy_policy(array $legacyPolicy): array {
    $strategy = [
        'hiddenSize1' => AI_HIDDEN_1,
        'hiddenSize2' => AI_HIDDEN_2,
        'W1' => zero_matrix(AI_HIDDEN_1, AI_FEATURE_COUNT),
        'b1' => zero_vector(AI_HIDDEN_1),
        'W2' => zero_matrix(AI_HIDDEN_2, AI_HIDDEN_1),
        'b2' => zero_vector(AI_HIDDEN_2),
        'W3' => zero_matrix(AI_STRATEGY_COUNT, AI_HIDDEN_2),
        'b3' => $legacyPolicy['b3'],
    ];
    for ($row = 0; $row < AI_HIDDEN_1; $row++) {
        if ($row < AI_LEGACY_HIDDEN_1) {
            $strategy['W1'][$row] = $legacyPolicy['W1'][$row];
            $strategy['b1'][$row] = $legacyPolicy['b1'][$row];
        } else {
            for ($column = 0; $column < AI_FEATURE_COUNT; $column++) {
                $strategy['W1'][$row][$column] = canonical_weight($row * AI_FEATURE_COUNT + $column, 0.08, 71);
            }
        }
    }
    for ($row = 0; $row < AI_HIDDEN_2; $row++) {
        if ($row < AI_LEGACY_HIDDEN_2) {
            $strategy['b2'][$row] = $legacyPolicy['b2'][$row];
            for ($column = 0; $column < AI_LEGACY_HIDDEN_1; $column++) {
                $strategy['W2'][$row][$column] = $legacyPolicy['W2'][$row][$column];
            }
        } else {
            for ($column = 0; $column < AI_HIDDEN_1; $column++) {
                $strategy['W2'][$row][$column] = canonical_weight($row * AI_HIDDEN_1 + $column, 0.07, 83);
            }
        }
    }
    for ($output = 0; $output < AI_STRATEGY_COUNT; $output++) {
        for ($column = 0; $column < AI_LEGACY_HIDDEN_2; $column++) {
            $strategy['W3'][$output][$column] = $legacyPolicy['W3'][$output][$column];
        }
    }
    return [
        'formatVersion' => AI_POLICY_FORMAT_VERSION,
        'strategyLearningRate' => $legacyPolicy['learningRate'],
        'decisionLearningRate' => 0.018,
        'strategy' => $strategy,
        'decision' => create_migrated_decision(),
    ];
}

function migrate_legacy_model(array $legacyModel): array {
    $model = $legacyModel;
    $model['version'] = AI_MODEL_SCHEMA;
    $model['modelFamily'] = 'shared-neural-controller-v1';
    $model['totalDecisionSamples'] = 0;
    $model['policy'] = migrate_legacy_policy($legacyModel['policy']);
    $model['championPolicy'] = migrate_legacy_policy($legacyModel['championPolicy']);
    $model['populationPolicies'] = array_map('migrate_legacy_policy', array_slice($legacyModel['populationPolicies'], -2));
    return $model;
}

function valid_unit_vector($value, int $length): bool {
    if (!is_array($value) || !is_list_array($value) || count($value) !== $length) {
        return false;
    }
    foreach ($value as $number) {
        if (!valid_number($number, 1.0) || (float)$number < 0) {
            return false;
        }
    }
    return true;
}

function exact_keys(array $value, array $expectedKeys): bool {
    $keys = array_keys($value);
    sort($keys);
    sort($expectedKeys);
    return $keys === $expectedKeys;
}

function contribution_store_limits(): array {
    return [
        'placementStats' => 1800,
        'loadoutPlacementStats' => 1800,
        'timingStats' => 1800,
        'loadoutStrategyStats' => 1800,
        'crosspathStats' => 1400,
        'loadoutCounterStats' => 2400,
        'tacticalStats' => 5000,
        'tacticalFamilyStats' => 1000,
    ];
}

function valid_contribution_observation($observation): bool {
    if (!is_array($observation) || !exact_keys($observation, ['store', 'key', 'value'])) {
        return false;
    }
    $limits = contribution_store_limits();
    $store = $observation['store'] ?? null;
    $key = $observation['key'] ?? null;
    $value = $observation['value'] ?? null;
    return is_string($store)
        && isset($limits[$store])
        && is_string($key)
        && preg_match('/^[A-Za-z0-9_.|,:-]{1,240}$/D', $key) === 1
        && valid_number($value, 1.0);
}

function valid_decision_sample($sample): bool {
    if (!is_array($sample) || !exact_keys($sample, ['familyIndex', 'stateFeatures', 'candidateFeatures', 'localReward', 'age'])) {
        return false;
    }
    return is_int($sample['familyIndex'] ?? null)
        && $sample['familyIndex'] >= 0
        && $sample['familyIndex'] < AI_DECISION_FAMILY_COUNT
        && valid_vector($sample['stateFeatures'] ?? null, AI_DECISION_STATE_INPUT, 1.0)
        && valid_vector($sample['candidateFeatures'] ?? null, AI_DECISION_CANDIDATE_INPUT, 1.0)
        && valid_number($sample['localReward'] ?? null, 1.0)
        && is_int($sample['age'] ?? null)
        && $sample['age'] >= 0
        && $sample['age'] <= AI_MAX_DECISION_SAMPLE_AGE;
}

function valid_contribution($request): bool {
    if (!is_array($request)) {
        return false;
    }
    $expectedKeys = [
        'protocolVersion',
        'contributionId',
        'baseRevision',
        'strategyIndex',
        'selectionFeatures',
        'matchFeatures',
        'aiLives',
        'enemyLives',
        'loadoutKey',
        'observations',
        'selfPlay',
    ];
    if (array_key_exists('contributionEpoch', $request)) {
        $expectedKeys[] = 'contributionEpoch';
    }
    if (array_key_exists('decisionSamples', $request)) {
        $expectedKeys[] = 'decisionSamples';
    }
    if (!exact_keys($request, $expectedKeys)) {
        return false;
    }
    if (($request['protocolVersion'] ?? null) !== AI_PROTOCOL_VERSION) {
        return false;
    }
    if (!is_string($request['contributionId']) || preg_match('/^[a-f0-9]{32}$/D', $request['contributionId']) !== 1) {
        return false;
    }
    if (!is_int($request['baseRevision']) || $request['baseRevision'] < 0) {
        return false;
    }
    if (array_key_exists('contributionEpoch', $request) && (!is_int($request['contributionEpoch']) || $request['contributionEpoch'] < 1)) {
        return false;
    }
    if (!is_int($request['strategyIndex']) || $request['strategyIndex'] < 0 || $request['strategyIndex'] >= AI_STRATEGY_COUNT) {
        return false;
    }
    if (!valid_unit_vector($request['selectionFeatures'] ?? null, AI_FEATURE_COUNT)) {
        return false;
    }
    $selfPlay = $request['selfPlay'] ?? null;
    if (!is_bool($selfPlay)) {
        return false;
    }
    $matchFeatures = $request['matchFeatures'] ?? null;
    if ((!$selfPlay && !valid_unit_vector($matchFeatures, AI_FEATURE_COUNT)) || ($selfPlay && $matchFeatures !== null)) {
        return false;
    }
    foreach (['aiLives', 'enemyLives'] as $livesKey) {
        if (!valid_number($request[$livesKey] ?? null, 100000.0) || (float)$request[$livesKey] < 0) {
            return false;
        }
    }
    $loadoutKey = $request['loadoutKey'] ?? null;
    if (!is_string($loadoutKey) || strlen($loadoutKey) > 180 || ($loadoutKey !== '' && preg_match('/^[a-z0-9_.|,-]+$/D', $loadoutKey) !== 1)) {
        return false;
    }
    $observations = $request['observations'] ?? null;
    if (!is_array($observations) || !is_list_array($observations) || count($observations) > AI_MAX_CONTRIBUTION_OBSERVATIONS) {
        return false;
    }
    foreach ($observations as $observation) {
        if (!valid_contribution_observation($observation)) {
            return false;
        }
    }
    if (array_key_exists('decisionSamples', $request)) {
        $decisionSamples = $request['decisionSamples'];
        if (!is_array($decisionSamples) || !is_list_array($decisionSamples) || count($decisionSamples) > AI_MAX_DECISION_SAMPLES) {
            return false;
        }
        foreach ($decisionSamples as $sample) {
            if (!valid_decision_sample($sample)) {
                return false;
            }
        }
    }
    return true;
}

function valid_human_demonstration($request): bool {
    if (!is_array($request)) {
        return false;
    }
    $expectedKeys = [
        'protocolVersion',
        'eventType',
        'contributionId',
        'baseRevision',
        'matchFeatures',
        'aiLives',
        'enemyLives',
        'loadoutKey',
        'opponentLoadoutKey',
    ];
    if (array_key_exists('contributionEpoch', $request)) {
        $expectedKeys[] = 'contributionEpoch';
    }
    if (!exact_keys($request, $expectedKeys)) {
        return false;
    }
    if (($request['protocolVersion'] ?? null) !== AI_PROTOCOL_VERSION || ($request['eventType'] ?? null) !== 'human-demo-v1') {
        return false;
    }
    if (!is_string($request['contributionId']) || preg_match('/^[a-f0-9]{32}$/D', $request['contributionId']) !== 1) {
        return false;
    }
    if (!is_int($request['baseRevision']) || $request['baseRevision'] < 0 || !valid_unit_vector($request['matchFeatures'] ?? null, AI_FEATURE_COUNT)) {
        return false;
    }
    if (array_key_exists('contributionEpoch', $request) && (!is_int($request['contributionEpoch']) || $request['contributionEpoch'] < 1)) {
        return false;
    }
    foreach (['aiLives', 'enemyLives'] as $livesKey) {
        if (!valid_number($request[$livesKey] ?? null, 100000.0) || (float)$request[$livesKey] < 0) {
            return false;
        }
    }
    $loadoutKey = $request['loadoutKey'] ?? null;
    $opponentLoadoutKey = $request['opponentLoadoutKey'] ?? null;
    foreach ([$loadoutKey, $opponentLoadoutKey] as $key) {
        if (!is_string($key) || strlen($key) < 1 || strlen($key) > 120 || preg_match('/^[a-z0-9_.|,-]+$/D', $key) !== 1) {
            return false;
        }
    }
    $counterKey = $opponentLoadoutKey . '|' . $loadoutKey;
    return strlen($counterKey) <= 240 && preg_match('/^[A-Za-z0-9_.|,:-]{1,240}$/D', $counterKey) === 1;
}

function read_json_request(int $maximumBytes): array {
    $rawBody = file_get_contents('php://input', false, null, 0, $maximumBytes + 1);
    if ($rawBody === false || strlen($rawBody) > $maximumBytes) {
        fail_json(413, 'payload_too_large', 'Request payload exceeds the size limit.');
    }
    $request = json_decode($rawBody, true);
    if (!is_array($request)) {
        fail_json(400, 'malformed_request', 'Request body must be a JSON object.');
    }
    return $request;
}

function client_fingerprint(): string {
    $address = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $userAgent = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300);
    return hash('sha256', $address . '|' . $userAgent);
}

function client_rate_key(): string {
    return hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
}

function contribution_secret(string $secretFile): string {
    $handle = @fopen($secretFile, 'c+b');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        fail_json(503, 'contribution_unavailable', 'Global contribution tokens are unavailable.');
    }
    rewind($handle);
    $secret = trim((string)stream_get_contents($handle));
    if (strlen($secret) < 64) {
        $secret = bin2hex(random_bytes(32));
        ftruncate($handle, 0);
        rewind($handle);
        if (fwrite($handle, $secret . "\n") === false || !fflush($handle)) {
            flock($handle, LOCK_UN);
            fclose($handle);
            fail_json(503, 'contribution_unavailable', 'Unable to initialize global contribution tokens.');
        }
    }
    flock($handle, LOCK_UN);
    fclose($handle);
    return $secret;
}

function contribution_token(string $secret): string {
    $bucket = (int)floor(time() / AI_CONTRIBUTION_TOKEN_SECONDS);
    $signature = hash_hmac('sha256', $bucket . '|' . client_fingerprint(), $secret);
    return $bucket . '.' . $signature;
}

function valid_contribution_token(string $token, string $secret): bool {
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2 || !ctype_digit($parts[0]) || preg_match('/^[a-f0-9]{64}$/D', $parts[1]) !== 1) {
        return false;
    }
    $providedBucket = (int)$parts[0];
    $currentBucket = (int)floor(time() / AI_CONTRIBUTION_TOKEN_SECONDS);
    if ($providedBucket < $currentBucket - 1 || $providedBucket > $currentBucket) {
        return false;
    }
    $expected = hash_hmac('sha256', $providedBucket . '|' . client_fingerprint(), $secret);
    return hash_equals($expected, $parts[1]);
}

function request_has_valid_origin(): bool {
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return false;
    }
    $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string)parse_url('http://' . (string)($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST));
    return $originHost !== '' && $originHost === $requestHost;
}

function ai_policy_forward(array $features, array $strategy): array {
    $hidden1 = [];
    for ($row = 0; $row < AI_HIDDEN_1; $row++) {
        $sum = (float)$strategy['b1'][$row];
        for ($column = 0; $column < AI_FEATURE_COUNT; $column++) {
            $sum += (float)$strategy['W1'][$row][$column] * (float)$features[$column];
        }
        $hidden1[] = tanh($sum);
    }
    $hidden2 = [];
    for ($row = 0; $row < AI_HIDDEN_2; $row++) {
        $sum = (float)$strategy['b2'][$row];
        for ($column = 0; $column < AI_HIDDEN_1; $column++) {
            $sum += (float)$strategy['W2'][$row][$column] * $hidden1[$column];
        }
        $hidden2[] = tanh($sum);
    }
    $outputs = [];
    for ($output = 0; $output < AI_STRATEGY_COUNT; $output++) {
        $sum = (float)$strategy['b3'][$output];
        for ($column = 0; $column < AI_HIDDEN_2; $column++) {
            $sum += (float)$strategy['W3'][$output][$column] * $hidden2[$column];
        }
        $outputs[] = $sum;
    }
    return ['hidden1' => $hidden1, 'hidden2' => $hidden2, 'outputs' => $outputs];
}

function train_candidate_policy(array &$model, array $features, int $chosenIndex, float $reward): void {
    $policy =& $model['policy'];
    $strategy =& $policy['strategy'];
    $forward = ai_policy_forward($features, $strategy);
    $prediction = tanh($forward['outputs'][$chosenIndex]);
    $target = clamp_number($reward, -0.98, 0.98);
    $error = clamp_number($target - $prediction, -1.0, 1.0);
    $outputDelta = $error * (1.0 - $prediction * $prediction);
    $stats = $model['strategyStats'][$chosenIndex];
    $sampleCount = max(0.0, (float)($stats['games'] ?? 0) + (float)($stats['syntheticEpisodes'] ?? 0));
    $learningRate = (float)$policy['strategyLearningRate'] / sqrt(1.0 + $sampleCount / 40.0);
    $originalOutputWeights = $strategy['W3'][$chosenIndex];
    $originalHiddenWeights = $strategy['W2'];

    for ($hidden = 0; $hidden < AI_HIDDEN_2; $hidden++) {
        $strategy['W3'][$chosenIndex][$hidden] = clamp_number((float)$strategy['W3'][$chosenIndex][$hidden] + $learningRate * $outputDelta * $forward['hidden2'][$hidden], -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
    }
    $strategy['b3'][$chosenIndex] = clamp_number((float)$strategy['b3'][$chosenIndex] + $learningRate * $outputDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);

    $hidden2Errors = [];
    for ($hidden2 = 0; $hidden2 < AI_HIDDEN_2; $hidden2++) {
        $activation = $forward['hidden2'][$hidden2];
        $hiddenError = (1.0 - $activation * $activation) * (float)$originalOutputWeights[$hidden2] * $outputDelta;
        $hidden2Errors[] = $hiddenError;
        $strategy['b2'][$hidden2] = clamp_number((float)$strategy['b2'][$hidden2] + $learningRate * $hiddenError, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($hidden1 = 0; $hidden1 < AI_HIDDEN_1; $hidden1++) {
            $next = (float)$strategy['W2'][$hidden2][$hidden1] + $learningRate * $hiddenError * $forward['hidden1'][$hidden1];
            $strategy['W2'][$hidden2][$hidden1] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }

    for ($hidden1 = 0; $hidden1 < AI_HIDDEN_1; $hidden1++) {
        $downstreamError = 0.0;
        for ($hidden2 = 0; $hidden2 < AI_HIDDEN_2; $hidden2++) {
            $downstreamError += (float)$originalHiddenWeights[$hidden2][$hidden1] * $hidden2Errors[$hidden2];
        }
        $activation = $forward['hidden1'][$hidden1];
        $hiddenError = (1.0 - $activation * $activation) * $downstreamError;
        $strategy['b1'][$hidden1] = clamp_number((float)$strategy['b1'][$hidden1] + $learningRate * $hiddenError, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($feature = 0; $feature < AI_FEATURE_COUNT; $feature++) {
            $next = (float)$strategy['W1'][$hidden1][$feature] + $learningRate * $hiddenError * (float)$features[$feature];
            $strategy['W1'][$hidden1][$feature] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }
}

function decision_forward(array $stateFeatures, array $candidateFeatures, int $familyIndex, array $decision): array {
    $stateHidden = [];
    for ($row = 0; $row < AI_DECISION_STATE_HIDDEN; $row++) {
        $sum = (float)$decision['bState1'][$row];
        for ($column = 0; $column < AI_DECISION_STATE_INPUT; $column++) {
            $sum += (float)$decision['WState1'][$row][$column] * (float)$stateFeatures[$column];
        }
        $stateHidden[] = tanh($sum);
    }
    $stateEmbedding = [];
    for ($row = 0; $row < AI_DECISION_EMBEDDING; $row++) {
        $sum = (float)$decision['bState2'][$row];
        for ($column = 0; $column < AI_DECISION_STATE_HIDDEN; $column++) {
            $sum += (float)$decision['WState2'][$row][$column] * $stateHidden[$column];
        }
        $stateEmbedding[] = tanh($sum);
    }
    $candidateHidden = [];
    for ($row = 0; $row < AI_DECISION_CANDIDATE_HIDDEN; $row++) {
        $sum = (float)$decision['bCandidate1'][$row];
        for ($column = 0; $column < AI_DECISION_CANDIDATE_INPUT; $column++) {
            $sum += (float)$decision['WCandidate1'][$row][$column] * (float)$candidateFeatures[$column];
        }
        $candidateHidden[] = tanh($sum);
    }
    $candidateEmbedding = [];
    for ($row = 0; $row < AI_DECISION_EMBEDDING; $row++) {
        $sum = (float)$decision['bCandidate2'][$row];
        for ($column = 0; $column < AI_DECISION_CANDIDATE_HIDDEN; $column++) {
            $sum += (float)$decision['WCandidate2'][$row][$column] * $candidateHidden[$column];
        }
        $candidateEmbedding[] = tanh($sum);
    }
    $dot = 0.0;
    $stateSquared = 0.0;
    $candidateSquared = 0.0;
    for ($index = 0; $index < AI_DECISION_EMBEDDING; $index++) {
        $dot += $stateEmbedding[$index] * $candidateEmbedding[$index];
        $stateSquared += $stateEmbedding[$index] * $stateEmbedding[$index];
        $candidateSquared += $candidateEmbedding[$index] * $candidateEmbedding[$index];
    }
    $stateNorm = sqrt($stateSquared + 0.000001);
    $candidateNorm = sqrt($candidateSquared + 0.000001);
    $normalizedDot = $dot / ($stateNorm * $candidateNorm);
    return [
        'stateHidden' => $stateHidden,
        'stateEmbedding' => $stateEmbedding,
        'candidateHidden' => $candidateHidden,
        'candidateEmbedding' => $candidateEmbedding,
        'stateNorm' => $stateNorm,
        'candidateNorm' => $candidateNorm,
        'normalizedDot' => $normalizedDot,
        'prediction' => tanh($normalizedDot + (float)$decision['familyBias'][$familyIndex]),
    ];
}

function train_candidate_decision(array &$model, array $sample, float $matchReward): void {
    $policy =& $model['policy'];
    $decision =& $policy['decision'];
    $familyIndex = $sample['familyIndex'];
    $forward = decision_forward($sample['stateFeatures'], $sample['candidateFeatures'], $familyIndex, $decision);
    $target = clamp_number(
        0.7 * (float)$sample['localReward'] + $matchReward * (0.3 * pow(0.985, (int)$sample['age'])),
        -1.0,
        1.0
    );
    $prediction = $forward['prediction'];
    $error = clamp_number($target - $prediction, -1.0, 1.0);
    $outputDelta = $error * (1.0 - $prediction * $prediction);
    $sampleCount = (float)$decision['trainingSamples'][$familyIndex];
    $learningRate = (float)$policy['decisionLearningRate'] / sqrt(1.0 + $sampleCount / 500.0);
    $originalStateWeights = $decision['WState2'];
    $originalCandidateWeights = $decision['WCandidate2'];

    $decision['familyBias'][$familyIndex] = clamp_number(
        (float)$decision['familyBias'][$familyIndex] + $learningRate * $outputDelta,
        -AI_WEIGHT_LIMIT,
        AI_WEIGHT_LIMIT
    );

    $stateEmbeddingDeltas = [];
    $candidateEmbeddingDeltas = [];
    for ($embedding = 0; $embedding < AI_DECISION_EMBEDDING; $embedding++) {
        $stateActivation = $forward['stateEmbedding'][$embedding];
        $candidateActivation = $forward['candidateEmbedding'][$embedding];
        $stateCosineGradient = $candidateActivation / ($forward['stateNorm'] * $forward['candidateNorm'])
            - $forward['normalizedDot'] * $stateActivation / ($forward['stateNorm'] * $forward['stateNorm']);
        $candidateCosineGradient = $stateActivation / ($forward['stateNorm'] * $forward['candidateNorm'])
            - $forward['normalizedDot'] * $candidateActivation / ($forward['candidateNorm'] * $forward['candidateNorm']);
        $stateDelta = clamp_number($outputDelta * $stateCosineGradient * (1.0 - $stateActivation * $stateActivation), -1.0, 1.0);
        $candidateDelta = clamp_number($outputDelta * $candidateCosineGradient * (1.0 - $candidateActivation * $candidateActivation), -1.0, 1.0);
        $stateEmbeddingDeltas[] = $stateDelta;
        $candidateEmbeddingDeltas[] = $candidateDelta;
        $decision['bState2'][$embedding] = clamp_number((float)$decision['bState2'][$embedding] + $learningRate * $stateDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        $decision['bCandidate2'][$embedding] = clamp_number((float)$decision['bCandidate2'][$embedding] + $learningRate * $candidateDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($hidden = 0; $hidden < AI_DECISION_STATE_HIDDEN; $hidden++) {
            $next = (float)$decision['WState2'][$embedding][$hidden] + $learningRate * $stateDelta * $forward['stateHidden'][$hidden];
            $decision['WState2'][$embedding][$hidden] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
        for ($hidden = 0; $hidden < AI_DECISION_CANDIDATE_HIDDEN; $hidden++) {
            $next = (float)$decision['WCandidate2'][$embedding][$hidden] + $learningRate * $candidateDelta * $forward['candidateHidden'][$hidden];
            $decision['WCandidate2'][$embedding][$hidden] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }

    for ($hidden = 0; $hidden < AI_DECISION_STATE_HIDDEN; $hidden++) {
        $downstream = 0.0;
        for ($embedding = 0; $embedding < AI_DECISION_EMBEDDING; $embedding++) {
            $downstream += (float)$originalStateWeights[$embedding][$hidden] * $stateEmbeddingDeltas[$embedding];
        }
        $activation = $forward['stateHidden'][$hidden];
        $hiddenDelta = clamp_number($downstream * (1.0 - $activation * $activation), -1.0, 1.0);
        $decision['bState1'][$hidden] = clamp_number((float)$decision['bState1'][$hidden] + $learningRate * $hiddenDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($feature = 0; $feature < AI_DECISION_STATE_INPUT; $feature++) {
            $next = (float)$decision['WState1'][$hidden][$feature] + $learningRate * $hiddenDelta * (float)$sample['stateFeatures'][$feature];
            $decision['WState1'][$hidden][$feature] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }
    for ($hidden = 0; $hidden < AI_DECISION_CANDIDATE_HIDDEN; $hidden++) {
        $downstream = 0.0;
        for ($embedding = 0; $embedding < AI_DECISION_EMBEDDING; $embedding++) {
            $downstream += (float)$originalCandidateWeights[$embedding][$hidden] * $candidateEmbeddingDeltas[$embedding];
        }
        $activation = $forward['candidateHidden'][$hidden];
        $hiddenDelta = clamp_number($downstream * (1.0 - $activation * $activation), -1.0, 1.0);
        $decision['bCandidate1'][$hidden] = clamp_number((float)$decision['bCandidate1'][$hidden] + $learningRate * $hiddenDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($feature = 0; $feature < AI_DECISION_CANDIDATE_INPUT; $feature++) {
            $next = (float)$decision['WCandidate1'][$hidden][$feature] + $learningRate * $hiddenDelta * (float)$sample['candidateFeatures'][$feature];
            $decision['WCandidate1'][$hidden][$feature] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }
    $decision['trainingSamples'][$familyIndex]++;
    $model['totalDecisionSamples']++;
}

function parameter_delta_squared($candidate, $baseline): float {
    if (is_array($candidate) && is_array($baseline)) {
        $sum = 0.0;
        foreach ($candidate as $key => $value) {
            $sum += parameter_delta_squared($value, $baseline[$key]);
        }
        return $sum;
    }
    $delta = (float)$candidate - (float)$baseline;
    return $delta * $delta;
}

function scale_parameter_delta(&$candidate, $baseline, float $scale): void {
    if (is_array($candidate) && is_array($baseline)) {
        foreach ($candidate as $key => &$value) {
            scale_parameter_delta($value, $baseline[$key], $scale);
        }
        unset($value);
        return;
    }
    $candidate = (float)$baseline + ((float)$candidate - (float)$baseline) * $scale;
}

function limit_policy_parameter_delta(array &$policy, array $baseline, float $maximumNorm): void {
    $strategyKeys = ['W1', 'b1', 'W2', 'b2', 'W3', 'b3'];
    $decisionKeys = ['WState1', 'bState1', 'WState2', 'bState2', 'WCandidate1', 'bCandidate1', 'WCandidate2', 'bCandidate2', 'familyBias'];
    $squaredNorm = 0.0;
    foreach ($strategyKeys as $key) {
        $squaredNorm += parameter_delta_squared($policy['strategy'][$key], $baseline['strategy'][$key]);
    }
    foreach ($decisionKeys as $key) {
        $squaredNorm += parameter_delta_squared($policy['decision'][$key], $baseline['decision'][$key]);
    }
    if ($squaredNorm <= $maximumNorm * $maximumNorm) {
        return;
    }
    $scale = $maximumNorm / sqrt($squaredNorm);
    foreach ($strategyKeys as $key) {
        scale_parameter_delta($policy['strategy'][$key], $baseline['strategy'][$key], $scale);
    }
    foreach ($decisionKeys as $key) {
        scale_parameter_delta($policy['decision'][$key], $baseline['decision'][$key], $scale);
    }
}

function update_score_record(array &$store, string $key, float $nextScore): void {
    $record = isset($store[$key]) && is_array($store[$key]) ? $store[$key] : ['samples' => 0, 'score' => 0, 'mean' => 0, 'm2' => 0];
    $observation = clamp_number($nextScore, -1.0, 1.0);
    $samples = max(0, (int)($record['samples'] ?? 0)) + 1;
    $previousMean = valid_number($record['mean'] ?? null) ? (float)$record['mean'] : (float)($record['score'] ?? 0);
    $delta = $observation - $previousMean;
    $mean = $previousMean + $delta / $samples;
    $store[$key] = [
        'samples' => $samples,
        'score' => $mean,
        'mean' => $mean,
        'm2' => max(0.0, (float)($record['m2'] ?? 0)) + $delta * ($observation - $mean),
    ];
}

function prune_score_store(array &$store, int $limit): void {
    if (count($store) <= $limit) {
        return;
    }
    uksort($store, function (string $leftKey, string $rightKey) use ($store): int {
        $left = max(0, (int)($store[$leftKey]['samples'] ?? 0));
        $right = max(0, (int)($store[$rightKey]['samples'] ?? 0));
        return $left === $right ? strcmp($leftKey, $rightKey) : $right <=> $left;
    });
    $store = array_slice($store, 0, $limit, true);
}

function prune_loadout_stats(array &$store, int $limit): void {
    if (count($store) <= $limit) {
        return;
    }
    uksort($store, function (string $leftKey, string $rightKey) use ($store): int {
        $left = max(0, (int)($store[$leftKey]['games'] ?? 0));
        $right = max(0, (int)($store[$rightKey]['games'] ?? 0));
        return $left === $right ? strcmp($leftKey, $rightKey) : $right <=> $left;
    });
    $store = array_slice($store, 0, $limit, true);
}

function loadout_sample_count(array $store): int {
    $samples = 0;
    foreach ($store as $record) {
        $samples += max(0, (int)($record['games'] ?? 0));
    }
    return $samples;
}

function normalize_model_accounting(array &$model): void {
    if (isset($model['loadoutStats']) && is_array($model['loadoutStats'])) {
        $model['totalLoadoutSamples'] = loadout_sample_count($model['loadoutStats']);
    }
}

function model_for_response(array $model): array {
    foreach (['loadoutStats', 'placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats', 'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats'] as $storeName) {
        if (($model[$storeName] ?? null) === []) {
            $model[$storeName] = (object)[];
        }
    }
    return $model;
}

function match_reward(float $aiLives, float $enemyLives): float {
    $result = $aiLives > $enemyLives ? 1.0 : ($aiLives < $enemyLives ? -1.0 : 0.0);
    $lifeMargin = clamp_number(($aiLives - $enemyLives) / 150.0, -1.0, 1.0);
    return clamp_number($result * 0.9 + $lifeMargin * 0.1, -1.0, 1.0);
}

function increment_match_record(array &$record, float $aiLives, float $enemyLives, float $reward): void {
    $record['games'] = max(0, (int)($record['games'] ?? 0)) + 1;
    $record['wins'] = max(0, (int)($record['wins'] ?? 0));
    $record['losses'] = max(0, (int)($record['losses'] ?? 0));
    $record['ties'] = max(0, (int)($record['ties'] ?? 0));
    $record['syntheticEpisodes'] = max(0, (int)($record['syntheticEpisodes'] ?? 0));
    $record['lastReward'] = $reward;
    if ($aiLives > $enemyLives) {
        $record['wins']++;
    } elseif ($aiLives < $enemyLives) {
        $record['losses']++;
    } else {
        $record['ties']++;
    }
}

function apply_public_contribution(array &$model, array $request): void {
    $strategyIndex = $request['strategyIndex'];
    $aiLives = (float)$request['aiLives'];
    $enemyLives = (float)$request['enemyLives'];
    $reward = match_reward($aiLives, $enemyLives);
    $baselinePolicy = $model['policy'];
    train_candidate_policy($model, $request['selectionFeatures'], $strategyIndex, $reward);
    foreach (($request['decisionSamples'] ?? []) as $sample) {
        train_candidate_decision($model, $sample, $reward);
    }
    limit_policy_parameter_delta($model['policy'], $baselinePolicy, AI_MAX_CONTRIBUTION_POLICY_DELTA_NORM);

    if (!$request['selfPlay']) {
        $profileGames = max(0, (int)($model['playerProfile']['games'] ?? 0)) + 1;
        for ($feature = 0; $feature < AI_FEATURE_COUNT; $feature++) {
            $previous = (float)$model['playerProfile']['features'][$feature];
            $next = (float)$request['matchFeatures'][$feature];
            $model['playerProfile']['features'][$feature] = $previous + ($next - $previous) / $profileGames;
        }
        $model['playerProfile']['games'] = $profileGames;
    }

    $tacticalSamples = 0;
    foreach ($request['observations'] as $observation) {
        $storeName = $observation['store'];
        update_score_record($model[$storeName], $observation['key'], (float)$observation['value']);
        if ($storeName === 'tacticalStats') {
            $tacticalSamples++;
        }
    }
    $model['totalTacticalSamples'] = max(0, (int)($model['totalTacticalSamples'] ?? 0)) + $tacticalSamples;

    increment_match_record($model['strategyStats'][$strategyIndex], $aiLives, $enemyLives, $reward);
    $loadoutKey = $request['loadoutKey'];
    if ($loadoutKey !== '') {
        if (!isset($model['loadoutStats'][$loadoutKey]) || !is_array($model['loadoutStats'][$loadoutKey])) {
            $model['loadoutStats'][$loadoutKey] = ['games' => 0, 'wins' => 0, 'losses' => 0, 'ties' => 0, 'lastReward' => 0];
        }
        increment_match_record($model['loadoutStats'][$loadoutKey], $aiLives, $enemyLives, $reward);
        unset($model['loadoutStats'][$loadoutKey]['syntheticEpisodes']);
        $model['totalLoadoutSamples'] = max(0, (int)($model['totalLoadoutSamples'] ?? 0)) + 1;
    }
    $model['totalGames'] = max(0, (int)($model['totalGames'] ?? 0)) + 1;
    $model['totalPolicySamples'] = max(0, (int)($model['totalPolicySamples'] ?? 0)) + 1;

    foreach (contribution_store_limits() as $storeName => $limit) {
        prune_score_store($model[$storeName], $limit);
    }
    prune_loadout_stats($model['loadoutStats'], 1800);
    $model['totalLoadoutSamples'] = loadout_sample_count($model['loadoutStats']);
}

function apply_human_demonstration(array &$model, array $request): void {
    $aiLives = (float)$request['aiLives'];
    $enemyLives = (float)$request['enemyLives'];
    $reward = match_reward($aiLives, $enemyLives);
    $profileGames = max(0, (int)($model['playerProfile']['games'] ?? 0)) + 1;
    for ($feature = 0; $feature < AI_FEATURE_COUNT; $feature++) {
        $previous = (float)$model['playerProfile']['features'][$feature];
        $next = (float)$request['matchFeatures'][$feature];
        $model['playerProfile']['features'][$feature] = $previous + ($next - $previous) / $profileGames;
    }
    $model['playerProfile']['games'] = $profileGames;

    $loadoutKey = $request['loadoutKey'];
    if (!isset($model['loadoutStats'][$loadoutKey]) || !is_array($model['loadoutStats'][$loadoutKey])) {
        $model['loadoutStats'][$loadoutKey] = ['games' => 0, 'wins' => 0, 'losses' => 0, 'ties' => 0, 'lastReward' => 0];
    }
    increment_match_record($model['loadoutStats'][$loadoutKey], $aiLives, $enemyLives, $reward);
    unset($model['loadoutStats'][$loadoutKey]['syntheticEpisodes']);
    $counterKey = $request['opponentLoadoutKey'] . '|' . $loadoutKey;
    update_score_record($model['loadoutCounterStats'], $counterKey, $reward);
    $model['totalLoadoutSamples'] = max(0, (int)($model['totalLoadoutSamples'] ?? 0)) + 1;
    $model['totalHumanDemonstrations'] = max(0, (int)($model['totalHumanDemonstrations'] ?? 0)) + 1;
    prune_score_store($model['loadoutCounterStats'], contribution_store_limits()['loadoutCounterStats']);
    prune_loadout_stats($model['loadoutStats'], 1800);
    $model['totalLoadoutSamples'] = loadout_sample_count($model['loadoutStats']);
}

function normalized_contribution_guard(array $state): array {
    $guard = isset($state['contributionGuard']) && is_array($state['contributionGuard']) ? $state['contributionGuard'] : [];
    return [
        'recent' => isset($guard['recent']) && is_array($guard['recent']) ? $guard['recent'] : [],
        'rates' => isset($guard['rates']) && is_array($guard['rates']) ? $guard['rates'] : [],
    ];
}

function state_contribution_epoch(array $state): int {
    return max(1, (int)($state['contributionEpoch'] ?? 1));
}

function request_contribution_epoch(array $request): int {
    return max(1, (int)($request['contributionEpoch'] ?? 1));
}

function prepare_contribution_guard(array $state, string $contributionId): array {
    $now = time();
    $guard = normalized_contribution_guard($state);
    foreach ($guard['recent'] as $id => $timestamp) {
        if (!is_string($id) || !is_int($timestamp) || $timestamp < $now - AI_CONTRIBUTION_WINDOW_SECONDS * 2) {
            unset($guard['recent'][$id]);
        }
    }
    if (isset($guard['recent'][$contributionId])) {
        return ['duplicate' => true, 'guard' => $guard];
    }

    foreach ($guard['rates'] as $key => $rate) {
        if (!is_array($rate) || (int)($rate['windowStart'] ?? 0) < $now - AI_CONTRIBUTION_WINDOW_SECONDS * 2) {
            unset($guard['rates'][$key]);
        }
    }
    $rateKey = client_rate_key();
    $rate = isset($guard['rates'][$rateKey]) && is_array($guard['rates'][$rateKey]) ? $guard['rates'][$rateKey] : ['windowStart' => $now, 'count' => 0];
    if ((int)$rate['windowStart'] <= $now - AI_CONTRIBUTION_WINDOW_SECONDS) {
        $rate = ['windowStart' => $now, 'count' => 0];
    }
    if ((int)$rate['count'] >= AI_CONTRIBUTION_RATE_LIMIT) {
        header('Retry-After: ' . max(1, AI_CONTRIBUTION_WINDOW_SECONDS - ($now - (int)$rate['windowStart'])));
        fail_json(429, 'contribution_rate_limited', 'This client has submitted too many AI contributions.');
    }
    $rate['count'] = (int)$rate['count'] + 1;
    $guard['rates'][$rateKey] = $rate;
    $guard['recent'][$contributionId] = $now;
    if (count($guard['recent']) > 512) {
        asort($guard['recent']);
        $guard['recent'] = array_slice($guard['recent'], -512, null, true);
    }
    if (count($guard['rates']) > 256) {
        uasort($guard['rates'], function (array $left, array $right): int {
            return (int)($right['windowStart'] ?? 0) <=> (int)($left['windowStart'] ?? 0);
        });
        $guard['rates'] = array_slice($guard['rates'], 0, 256, true);
    }
    return ['duplicate' => false, 'guard' => $guard];
}

function write_model_state(string $stateFile, int $revision, array $model, array $guard, int $contributionEpoch): array {
    if (!valid_nonnegative_integer($revision) || !valid_nonnegative_integer($contributionEpoch) || $contributionEpoch < 1) {
        fail_json(409, 'state_counter_exhausted', 'The AI state has exhausted a safe integer counter.');
    }
    $digest = model_digest($model);
    $nextState = [
        'protocolVersion' => AI_PROTOCOL_VERSION,
        'revision' => $revision,
        'modelDigest' => $digest,
        'updatedAt' => gmdate('c'),
        'model' => $model,
        'contributionGuard' => $guard,
        'contributionEpoch' => max(1, $contributionEpoch),
    ];
    $encoded = json_encode($nextState, JSON_UNESCAPED_SLASHES);
    if ($encoded === false || strlen($encoded) > AI_MAX_BODY_BYTES) {
        fail_json(413, 'payload_too_large', 'Canonical AI model exceeds the size limit.');
    }
    $temporaryFile = $stateFile . '.tmp.' . bin2hex(random_bytes(8));
    $temporaryHandle = @fopen($temporaryFile, 'x+b');
    if ($temporaryHandle === false || fwrite($temporaryHandle, $encoded . "\n") === false || !fflush($temporaryHandle)) {
        if (is_resource($temporaryHandle)) {
            fclose($temporaryHandle);
        }
        @unlink($temporaryFile);
        fail_json(500, 'write_failed', 'Unable to write AI model.');
    }
    if (function_exists('fsync')) {
        @fsync($temporaryHandle);
    }
    fclose($temporaryHandle);
    if (!@rename($temporaryFile, $stateFile)) {
        @unlink($temporaryFile);
        fail_json(500, 'write_failed', 'Unable to commit AI model.');
    }
    return $nextState;
}

function decode_state(string $contents): array {
    $decoded = json_decode($contents, true);
    if (!is_array($decoded)) {
        fail_json(503, 'storage_corrupt', 'AI model storage is invalid.');
    }
    if (isset($decoded['protocolVersion'], $decoded['revision'], $decoded['model']) && is_array($decoded['model'])) {
        if ($decoded['protocolVersion'] !== AI_PROTOCOL_VERSION
            || !valid_nonnegative_integer($decoded['revision'])
            || (isset($decoded['contributionEpoch']) && (!valid_nonnegative_integer($decoded['contributionEpoch']) || $decoded['contributionEpoch'] < 1))) {
            fail_json(503, 'storage_corrupt', 'AI model storage metadata is invalid.');
        }
        return $decoded;
    }
    if (isset($decoded['version'], $decoded['policy'])) {
        return [
            'protocolVersion' => AI_PROTOCOL_VERSION,
            'revision' => 1,
            'modelDigest' => model_digest($decoded),
            'updatedAt' => gmdate('c'),
            'model' => $decoded,
        ];
    }
    if ($decoded === []) {
        return [
            'protocolVersion' => AI_PROTOCOL_VERSION,
            'revision' => 0,
            'modelDigest' => '',
            'updatedAt' => null,
            'model' => [],
        ];
    }
    fail_json(503, 'storage_corrupt', 'AI model storage is invalid.');
}

function migrate_state_locked(array $state, string $stateFile): array {
    if (valid_model($state['model'] ?? null)) {
        return $state;
    }
    $legacyModel = $state['model'] ?? null;
    if (!is_array($legacyModel)) {
        return $state;
    }
    normalize_model_accounting($legacyModel);
    if (!valid_legacy_model($legacyModel)) {
        return $state;
    }
    $model = migrate_legacy_model($legacyModel);
    if (!valid_model($model)) {
        fail_json(500, 'migration_failed_validation', 'The legacy AI model could not be migrated safely.');
    }
    return write_model_state(
        $stateFile,
        (int)($state['revision'] ?? 0) + 1,
        $model,
        normalized_contribution_guard($state),
        state_contribution_epoch($state)
    );
}

function read_state_locked(string $stateFile, string $lockFile): array {
    $lock = @fopen($lockFile, 'c+');
    if ($lock === false || !flock($lock, LOCK_EX)) {
        fail_json(503, 'lock_unavailable', 'AI model storage is busy.');
    }
    $contents = is_file($stateFile) ? @file_get_contents($stateFile) : '{}';
    if ($contents === false || trim($contents) === '') {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'storage_corrupt', 'AI model storage is empty.');
    }
    $state = migrate_state_locked(decode_state($contents), $stateFile);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $state;
}

function configured_key_hash(string $keyHashFile): string {
    $environmentHash = trim((string)getenv('AI_TRAINER_KEY_SHA256'));
    if ($environmentHash !== '') {
        return strtolower($environmentHash);
    }
    if (is_file($keyHashFile)) {
        return strtolower(trim((string)file_get_contents($keyHashFile)));
    }
    return '';
}

function configured_promotion_key_hash(string $keyHashFile): string {
    $environmentHash = trim((string)getenv('AI_POLICY_PROMOTION_KEY_SHA256'));
    if ($environmentHash !== '') {
        return strtolower($environmentHash);
    }
    if (is_file($keyHashFile)) {
        return strtolower(trim((string)file_get_contents($keyHashFile)));
    }
    return '';
}

if (!is_dir($dataDir) && !mkdir($dataDir, 0775, true) && !is_dir($dataDir)) {
    fail_json(500, 'storage_unavailable', 'Unable to initialize AI model storage.');
}
if (!is_file($stateFile) && file_put_contents($stateFile, "{}\n", LOCK_EX) === false) {
    fail_json(500, 'storage_unavailable', 'Unable to initialize AI model storage.');
}

$protocol = (int)($_GET['protocol'] ?? 0);
if ($protocol !== AI_PROTOCOL_VERSION) {
    fail_json(400, 'unsupported_protocol', 'Use AI learning protocol version 1.');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    $state = read_state_locked($stateFile, $lockFile);
    $model = $state['model'];
    $contributionEnabled = valid_model($model);
    $token = $contributionEnabled ? contribution_token(contribution_secret($contributionSecretFile)) : '';
    $policyDigest = $contributionEnabled ? model_digest($model['policy']) : '';
    $championPolicyDigest = $contributionEnabled ? model_digest($model['championPolicy']) : '';
    $promotionBaseDigest = $contributionEnabled ? promotion_base_digest($model) : '';
    send_json(200, [
        'ok' => true,
        'protocolVersion' => AI_PROTOCOL_VERSION,
        'gameVersion' => AI_GAME_VERSION,
        'modelSchema' => AI_MODEL_SCHEMA,
        'revision' => (int)$state['revision'],
        'modelDigest' => $contributionEnabled ? model_digest($model) : (string)($state['modelDigest'] ?? ''),
        'policyDigest' => $policyDigest,
        'championPolicyDigest' => $championPolicyDigest,
        'promotionBaseDigest' => $promotionBaseDigest,
        'updatedAt' => $state['updatedAt'] ?? null,
        'model' => model_for_response($model),
        'writeEnabled' => configured_key_hash($keyHashFile) !== '',
        'promotionEnabled' => configured_promotion_key_hash($promotionKeyHashFile) !== '',
        'contributionEnabled' => $contributionEnabled,
        'contributionToken' => $token,
        'contributionRateLimit' => AI_CONTRIBUTION_RATE_LIMIT,
        'contributionEpoch' => state_contribution_epoch($state),
    ]);
}

if ($method !== 'POST') {
    fail_json(405, 'method_not_allowed', 'Only GET and supported POST actions are allowed.');
}

$contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
if (strpos($contentType, 'application/json') !== 0) {
    fail_json(415, 'unsupported_media_type', 'Content-Type must be application/json.');
}
$action = (string)($_GET['action'] ?? '');
if ($action === 'contribute') {
    if (!request_has_valid_origin()) {
        fail_json(403, 'invalid_origin', 'AI contributions must come from this website.');
    }
    $secret = contribution_secret($contributionSecretFile);
    $providedToken = (string)($_SERVER['HTTP_X_AI_CONTRIBUTION_TOKEN'] ?? '');
    if ($providedToken === '' || !valid_contribution_token($providedToken, $secret)) {
        fail_json(401, 'invalid_contribution_token', 'AI contribution token is missing or expired.');
    }
    $request = read_json_request(AI_MAX_CONTRIBUTION_BYTES);
    $isHumanDemonstration = valid_human_demonstration($request);
    if (!$isHumanDemonstration && !valid_contribution($request)) {
        fail_json(422, 'invalid_contribution', 'AI match contribution schema or values are invalid.');
    }

    $lock = @fopen($lockFile, 'c+');
    if ($lock === false || !flock($lock, LOCK_EX)) {
        fail_json(503, 'lock_unavailable', 'AI model storage is busy.');
    }
    $currentContents = @file_get_contents($stateFile);
    if ($currentContents === false || trim($currentContents) === '') {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'storage_corrupt', 'AI model storage is invalid.');
    }
    $current = migrate_state_locked(decode_state($currentContents), $stateFile);
    if (!valid_model($current['model'])) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'model_not_initialized', 'The global AI model must be initialized before accepting contributions.');
    }
    $baseRevision = $request['baseRevision'];
    $currentRevision = (int)$current['revision'];
    $currentEpoch = state_contribution_epoch($current);
    if ($currentRevision >= AI_MAX_SAFE_INTEGER) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(409, 'state_counter_exhausted', 'The AI state has exhausted a safe integer counter.');
    }
    $requestHasEpoch = array_key_exists('contributionEpoch', $request);
    if (request_contribution_epoch($request) !== $currentEpoch) {
        flock($lock, LOCK_UN);
        fclose($lock);
        if (!$requestHasEpoch) {
            send_json(200, [
                'ok' => true,
                'duplicate' => false,
                'discarded' => true,
                'protocolVersion' => AI_PROTOCOL_VERSION,
                'revision' => $currentRevision,
                'modelDigest' => (string)($current['modelDigest'] ?? ''),
                'contributionEpoch' => $currentEpoch,
            ]);
        }
        send_json(409, [
            'ok' => false,
            'error' => ['code' => 'contribution_epoch_mismatch', 'message' => 'This contribution belongs to an older AI knowledge epoch.'],
            'currentRevision' => $currentRevision,
            'currentModelDigest' => (string)($current['modelDigest'] ?? ''),
            'currentContributionEpoch' => $currentEpoch,
        ]);
    }
    if ($baseRevision > $currentRevision || $baseRevision < max(0, $currentRevision - AI_MAX_CONTRIBUTION_REVISION_LAG)) {
        flock($lock, LOCK_UN);
        fclose($lock);
        send_json(409, [
            'ok' => false,
            'error' => ['code' => 'contribution_revision_stale', 'message' => 'Refresh the global AI model before contributing.'],
            'currentRevision' => $currentRevision,
            'currentModelDigest' => (string)($current['modelDigest'] ?? ''),
        ]);
    }
    $guardResult = prepare_contribution_guard($current, $request['contributionId']);
    if ($guardResult['duplicate']) {
        flock($lock, LOCK_UN);
        fclose($lock);
        send_json(200, [
            'ok' => true,
            'duplicate' => true,
            'protocolVersion' => AI_PROTOCOL_VERSION,
            'revision' => $currentRevision,
            'modelDigest' => (string)($current['modelDigest'] ?? ''),
            'contributionEpoch' => $currentEpoch,
        ]);
    }

    $requiredCounterHeadroom = $isHumanDemonstration
        ? 1
        : max(1, count($request['decisionSamples'] ?? []), count($request['observations'] ?? []));
    if (!integer_tree_has_headroom($current['model'], $requiredCounterHeadroom)) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(409, 'model_counter_exhausted', 'The AI model has exhausted a safe integer counter.');
    }

    $model = $current['model'];
    if ($isHumanDemonstration) {
        apply_human_demonstration($model, $request);
    } else {
        apply_public_contribution($model, $request);
    }
    if (!valid_model($model)) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(500, 'contribution_failed_validation', 'The bounded AI contribution did not produce a valid model.');
    }
    $nextState = write_model_state($stateFile, $currentRevision + 1, $model, $guardResult['guard'], $currentEpoch);
    flock($lock, LOCK_UN);
    fclose($lock);
    send_json(200, [
        'ok' => true,
        'duplicate' => false,
        'protocolVersion' => AI_PROTOCOL_VERSION,
        'revision' => $nextState['revision'],
        'modelDigest' => $nextState['modelDigest'],
        'contributionEpoch' => $currentEpoch,
    ]);
}

if ($action === 'promote') {
    $configuredHash = configured_promotion_key_hash($promotionKeyHashFile);
    if ($configuredHash === '') {
        fail_json(503, 'promotion_not_configured', 'Hosted policy promotion is not configured.');
    }
    $providedKey = (string)($_SERVER['HTTP_X_AI_POLICY_PROMOTION_KEY'] ?? '');
    if ($providedKey === '' || !hash_equals($configuredHash, hash('sha256', $providedKey))) {
        fail_json(401, 'invalid_promotion_key', 'Policy promotion authentication failed.');
    }
    $request = read_json_request(AI_MAX_BODY_BYTES);
    if (!valid_policy_promotion($request)) {
        fail_json(422, 'invalid_promotion', 'AI policy promotion schema or values are invalid.');
    }

    $lock = @fopen($lockFile, 'c+');
    if ($lock === false || !flock($lock, LOCK_EX)) {
        fail_json(503, 'lock_unavailable', 'AI model storage is busy.');
    }
    $currentContents = @file_get_contents($stateFile);
    if ($currentContents === false || trim($currentContents) === '') {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'storage_corrupt', 'AI model storage is invalid.');
    }
    $current = migrate_state_locked(decode_state($currentContents), $stateFile);
    if (!valid_model($current['model'])) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'model_not_initialized', 'The hosted AI model must be initialized before promoting a policy.');
    }

    $currentModel = $current['model'];
    $currentRevision = (int)$current['revision'];
    $currentEpoch = state_contribution_epoch($current);
    $currentChampionGeneration = (int)($currentModel['championGeneration'] ?? 0);
    $promotedPolicyDigest = model_digest($request['policy']);
    if ($currentChampionGeneration === $request['expectedChampionGeneration'] + 1
        && model_digest($currentModel['championPolicy']) === $promotedPolicyDigest) {
        $candidatePolicyPreserved = model_digest($currentModel['policy']) !== $promotedPolicyDigest;
        flock($lock, LOCK_UN);
        fclose($lock);
        send_json(200, [
            'ok' => true,
            'protocolVersion' => AI_PROTOCOL_VERSION,
            'promotionId' => $request['promotionId'],
            'duplicate' => true,
            'revision' => $currentRevision,
            'modelDigest' => (string)($current['modelDigest'] ?? ''),
            'contributionEpoch' => $currentEpoch,
            'championGeneration' => $currentChampionGeneration,
            'promotedPolicyDigest' => $promotedPolicyDigest,
            'candidatePolicyPreserved' => $candidatePolicyPreserved,
        ]);
    }

    $currentPromotionBaseDigest = promotion_base_digest($currentModel);
    if ($request['sourceRevision'] > $currentRevision
        || $request['expectedContributionEpoch'] !== $currentEpoch
        || $request['expectedChampionGeneration'] !== $currentChampionGeneration
        || !hash_equals($currentPromotionBaseDigest, $request['expectedPromotionBaseDigest'])) {
        flock($lock, LOCK_UN);
        fclose($lock);
        send_json(409, [
            'ok' => false,
            'error' => ['code' => 'promotion_conflict', 'message' => 'The hosted champion or knowledge epoch changed after training began.'],
            'currentRevision' => $currentRevision,
            'currentModelDigest' => (string)($current['modelDigest'] ?? ''),
            'currentContributionEpoch' => $currentEpoch,
            'currentChampionGeneration' => $currentChampionGeneration,
            'currentPromotionBaseDigest' => $currentPromotionBaseDigest,
        ]);
    }

    $candidatePolicyPreserved = model_digest($currentModel['policy']) !== $request['expectedPolicyDigest'];
    if ($currentChampionGeneration >= AI_MAX_SAFE_INTEGER || $currentRevision >= AI_MAX_SAFE_INTEGER) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(409, 'model_counter_exhausted', 'The AI model has exhausted a safe integer counter.');
    }
    $nextModel = $currentModel;
    $nextModel['populationPolicies'] = retained_population_policies($currentModel);
    $nextModel['championPolicy'] = $request['policy'];
    if (!$candidatePolicyPreserved) {
        $nextModel['policy'] = $request['policy'];
    }
    $nextModel['championGeneration'] = $currentChampionGeneration + 1;
    $nextModel['candidateGeneration'] = $nextModel['championGeneration'];
    if (!valid_model($nextModel)) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(500, 'promotion_failed_validation', 'The policy promotion did not produce a valid model.');
    }

    $nextState = write_model_state($stateFile, $currentRevision + 1, $nextModel, normalized_contribution_guard($current), $currentEpoch);
    flock($lock, LOCK_UN);
    fclose($lock);
    send_json(200, [
        'ok' => true,
        'protocolVersion' => AI_PROTOCOL_VERSION,
        'promotionId' => $request['promotionId'],
        'duplicate' => false,
        'revision' => $nextState['revision'],
        'modelDigest' => $nextState['modelDigest'],
        'contributionEpoch' => $currentEpoch,
        'championGeneration' => $nextModel['championGeneration'],
        'promotedPolicyDigest' => $promotedPolicyDigest,
        'candidatePolicyPreserved' => $candidatePolicyPreserved,
    ]);
}

if ($action !== 'commit' && $action !== 'reset') {
    fail_json(405, 'method_not_allowed', 'Only public contribution, authenticated policy promotion, commit, and reset POST requests are supported.');
}

$configuredHash = configured_key_hash($keyHashFile);
if ($configuredHash === '') {
    fail_json(503, 'trainer_not_configured', 'Hosted trainer commits are not configured.');
}
$providedKey = (string)($_SERVER['HTTP_X_AI_TRAINER_KEY'] ?? '');
if ($providedKey === '' || !hash_equals($configuredHash, hash('sha256', $providedKey))) {
    fail_json(401, 'invalid_trainer_key', 'Trainer authentication failed.');
}

$request = read_json_request(AI_MAX_BODY_BYTES);
$expectedRevision = $request['expectedRevision'] ?? null;
$model = $request['model'] ?? null;
$isKnowledgeReset = $action === 'reset';
if (!valid_nonnegative_integer($expectedRevision) || ($isKnowledgeReset ? !valid_fresh_model($model) : !valid_model($model))) {
    fail_json(422, 'invalid_model', 'AI model schema or values are invalid.');
}

$lock = @fopen($lockFile, 'c+');
if ($lock === false || !flock($lock, LOCK_EX)) {
    fail_json(503, 'lock_unavailable', 'AI model storage is busy.');
}
$currentContents = @file_get_contents($stateFile);
if ($currentContents === false || trim($currentContents) === '') {
    flock($lock, LOCK_UN);
    fclose($lock);
    fail_json(503, 'storage_corrupt', 'AI model storage is invalid.');
}
$current = migrate_state_locked(decode_state($currentContents), $stateFile);
if ((int)$current['revision'] !== $expectedRevision) {
    flock($lock, LOCK_UN);
    fclose($lock);
    send_json(409, [
        'ok' => false,
        'error' => ['code' => 'revision_conflict', 'message' => 'The AI model changed after it was loaded.'],
        'currentRevision' => (int)$current['revision'],
        'currentModelDigest' => (string)($current['modelDigest'] ?? ''),
    ]);
}

if ($expectedRevision >= AI_MAX_SAFE_INTEGER || ($isKnowledgeReset && state_contribution_epoch($current) >= AI_MAX_SAFE_INTEGER)) {
    flock($lock, LOCK_UN);
    fclose($lock);
    fail_json(409, 'state_counter_exhausted', 'The AI state has exhausted a safe integer counter.');
}

$nextRevision = $expectedRevision + 1;
$nextEpoch = state_contribution_epoch($current) + ($isKnowledgeReset ? 1 : 0);
$nextGuard = $isKnowledgeReset ? ['recent' => [], 'rates' => []] : normalized_contribution_guard($current);
$nextState = write_model_state($stateFile, $nextRevision, $model, $nextGuard, $nextEpoch);
flock($lock, LOCK_UN);
fclose($lock);

send_json(200, [
    'ok' => true,
    'protocolVersion' => AI_PROTOCOL_VERSION,
    'revision' => $nextRevision,
    'modelDigest' => $nextState['modelDigest'],
    'contributionEpoch' => $nextEpoch,
    'knowledgeReset' => $isKnowledgeReset,
]);
