<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

const AI_PROTOCOL_VERSION = 1;
const AI_MODEL_SCHEMA = 8;
const AI_MAX_BODY_BYTES = 2097152;
const AI_MAX_CONTRIBUTION_BYTES = 131072;
const AI_MAX_CONTRIBUTION_OBSERVATIONS = 320;
const AI_CONTRIBUTION_RATE_LIMIT = 120;
const AI_CONTRIBUTION_WINDOW_SECONDS = 3600;
const AI_CONTRIBUTION_TOKEN_SECONDS = 21600;
const AI_MAX_CONTRIBUTION_REVISION_LAG = 2048;
const AI_STRATEGY_COUNT = 75;
const AI_FEATURE_COUNT = 17;
const AI_HIDDEN_1 = 12;
const AI_HIDDEN_2 = 8;
const AI_WEIGHT_LIMIT = 4.0;

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$stateFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-learning-global.json';
$lockFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-learning-global.lock';
$keyHashFile = $dataDir . DIRECTORY_SEPARATOR . 'ai-trainer-key.sha256';
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

function valid_policy($policy): bool {
    if (!is_array($policy)) {
        return false;
    }
    if (($policy['hiddenSize1'] ?? null) !== AI_HIDDEN_1 || ($policy['hiddenSize2'] ?? null) !== AI_HIDDEN_2) {
        return false;
    }
    $learningRate = $policy['learningRate'] ?? null;
    if (!valid_number($learningRate, 0.2) || (float)$learningRate <= 0) {
        return false;
    }
    return valid_matrix($policy['W1'] ?? null, AI_HIDDEN_1, AI_FEATURE_COUNT, AI_WEIGHT_LIMIT)
        && valid_vector($policy['b1'] ?? null, AI_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_matrix($policy['W2'] ?? null, AI_HIDDEN_2, AI_HIDDEN_1, AI_WEIGHT_LIMIT)
        && valid_vector($policy['b2'] ?? null, AI_HIDDEN_2, AI_WEIGHT_LIMIT)
        && valid_matrix($policy['W3'] ?? null, AI_STRATEGY_COUNT, AI_HIDDEN_2, AI_WEIGHT_LIMIT)
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

function valid_model($model): bool {
    if (!is_array($model) || ($model['version'] ?? null) !== AI_MODEL_SCHEMA) {
        return false;
    }
    if (!isset($model['strategyStats']) || !is_array($model['strategyStats']) || count($model['strategyStats']) !== AI_STRATEGY_COUNT) {
        return false;
    }
    if (!valid_policy($model['policy'] ?? null) || !valid_policy($model['championPolicy'] ?? null)) {
        return false;
    }
    foreach (['loadoutStats', 'placementStats', 'loadoutPlacementStats', 'timingStats', 'loadoutStrategyStats', 'crosspathStats', 'loadoutCounterStats', 'tacticalStats', 'tacticalFamilyStats'] as $storeName) {
        if (!isset($model[$storeName]) || !is_array($model[$storeName]) || count($model[$storeName]) > 12000) {
            return false;
        }
    }
    return valid_finite_tree($model);
}

function valid_fresh_model($model): bool {
    if (!valid_model($model)) {
        return false;
    }
    foreach (['totalGames', 'totalSyntheticEpisodes', 'totalPolicySamples', 'totalLoadoutSamples', 'totalTacticalSamples', 'totalHumanDemonstrations', 'candidateGeneration', 'championGeneration'] as $counter) {
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

function model_digest(array $model): string {
    return 'sha256:' . hash('sha256', json_encode($model, JSON_UNESCAPED_SLASHES));
}

function clamp_number(float $value, float $minimum, float $maximum): float {
    return max($minimum, min($maximum, $value));
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
        return true;
    }
    $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string)parse_url('http://' . (string)($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST));
    return $originHost !== '' && $originHost === $requestHost;
}

function ai_policy_forward(array $features, array $policy): array {
    $hidden1 = [];
    for ($row = 0; $row < AI_HIDDEN_1; $row++) {
        $sum = (float)$policy['b1'][$row];
        for ($column = 0; $column < AI_FEATURE_COUNT; $column++) {
            $sum += (float)$policy['W1'][$row][$column] * (float)$features[$column];
        }
        $hidden1[] = tanh($sum);
    }
    $hidden2 = [];
    for ($row = 0; $row < AI_HIDDEN_2; $row++) {
        $sum = (float)$policy['b2'][$row];
        for ($column = 0; $column < AI_HIDDEN_1; $column++) {
            $sum += (float)$policy['W2'][$row][$column] * $hidden1[$column];
        }
        $hidden2[] = tanh($sum);
    }
    $outputs = [];
    for ($output = 0; $output < AI_STRATEGY_COUNT; $output++) {
        $sum = (float)$policy['b3'][$output];
        for ($column = 0; $column < AI_HIDDEN_2; $column++) {
            $sum += (float)$policy['W3'][$output][$column] * $hidden2[$column];
        }
        $outputs[] = $sum;
    }
    return ['hidden1' => $hidden1, 'hidden2' => $hidden2, 'outputs' => $outputs];
}

function train_candidate_policy(array &$model, array $features, int $chosenIndex, float $reward): void {
    $policy =& $model['policy'];
    $forward = ai_policy_forward($features, $policy);
    $prediction = tanh($forward['outputs'][$chosenIndex]);
    $target = clamp_number($reward, -0.98, 0.98);
    $error = clamp_number($target - $prediction, -1.0, 1.0);
    $outputDelta = $error * (1.0 - $prediction * $prediction);
    $stats = $model['strategyStats'][$chosenIndex];
    $sampleCount = max(0.0, (float)($stats['games'] ?? 0) + (float)($stats['syntheticEpisodes'] ?? 0));
    $learningRate = (float)$policy['learningRate'] / sqrt(1.0 + $sampleCount / 40.0);
    $originalOutputWeights = $policy['W3'][$chosenIndex];
    $originalHiddenWeights = $policy['W2'];

    for ($hidden = 0; $hidden < AI_HIDDEN_2; $hidden++) {
        $policy['W3'][$chosenIndex][$hidden] = clamp_number((float)$policy['W3'][$chosenIndex][$hidden] + $learningRate * $outputDelta * $forward['hidden2'][$hidden], -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
    }
    $policy['b3'][$chosenIndex] = clamp_number((float)$policy['b3'][$chosenIndex] + $learningRate * $outputDelta, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);

    $hidden2Errors = [];
    for ($hidden2 = 0; $hidden2 < AI_HIDDEN_2; $hidden2++) {
        $activation = $forward['hidden2'][$hidden2];
        $hiddenError = (1.0 - $activation * $activation) * (float)$originalOutputWeights[$hidden2] * $outputDelta;
        $hidden2Errors[] = $hiddenError;
        $policy['b2'][$hidden2] = clamp_number((float)$policy['b2'][$hidden2] + $learningRate * $hiddenError, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($hidden1 = 0; $hidden1 < AI_HIDDEN_1; $hidden1++) {
            $next = (float)$policy['W2'][$hidden2][$hidden1] + $learningRate * $hiddenError * $forward['hidden1'][$hidden1];
            $policy['W2'][$hidden2][$hidden1] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
    }

    for ($hidden1 = 0; $hidden1 < AI_HIDDEN_1; $hidden1++) {
        $downstreamError = 0.0;
        for ($hidden2 = 0; $hidden2 < AI_HIDDEN_2; $hidden2++) {
            $downstreamError += (float)$originalHiddenWeights[$hidden2][$hidden1] * $hidden2Errors[$hidden2];
        }
        $activation = $forward['hidden1'][$hidden1];
        $hiddenError = (1.0 - $activation * $activation) * $downstreamError;
        $policy['b1'][$hidden1] = clamp_number((float)$policy['b1'][$hidden1] + $learningRate * $hiddenError, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        for ($feature = 0; $feature < AI_FEATURE_COUNT; $feature++) {
            $next = (float)$policy['W1'][$hidden1][$feature] + $learningRate * $hiddenError * (float)$features[$feature];
            $policy['W1'][$hidden1][$feature] = clamp_number($next, -AI_WEIGHT_LIMIT, AI_WEIGHT_LIMIT);
        }
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
    train_candidate_policy($model, $request['selectionFeatures'], $strategyIndex, $reward);

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

function read_state_locked(string $stateFile, string $lockFile): array {
    $lock = @fopen($lockFile, 'c+');
    if ($lock === false || !flock($lock, LOCK_SH)) {
        fail_json(503, 'lock_unavailable', 'AI model storage is busy.');
    }
    $contents = is_file($stateFile) ? @file_get_contents($stateFile) : '{}';
    flock($lock, LOCK_UN);
    fclose($lock);
    if ($contents === false || trim($contents) === '') {
        fail_json(503, 'storage_corrupt', 'AI model storage is empty.');
    }
    return decode_state($contents);
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
    $contributionEnabled = valid_model($state['model']);
    $token = $contributionEnabled ? contribution_token(contribution_secret($contributionSecretFile)) : '';
    send_json(200, [
        'ok' => true,
        'protocolVersion' => AI_PROTOCOL_VERSION,
        'modelSchema' => AI_MODEL_SCHEMA,
        'revision' => (int)$state['revision'],
        'modelDigest' => (string)($state['modelDigest'] ?? ''),
        'updatedAt' => $state['updatedAt'] ?? null,
        'model' => $state['model'],
        'writeEnabled' => configured_key_hash($keyHashFile) !== '',
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
    $current = decode_state($currentContents);
    if (!valid_model($current['model'])) {
        flock($lock, LOCK_UN);
        fclose($lock);
        fail_json(503, 'model_not_initialized', 'The global AI model must be initialized before accepting contributions.');
    }
    $baseRevision = $request['baseRevision'];
    $currentRevision = (int)$current['revision'];
    $currentEpoch = state_contribution_epoch($current);
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

if ($action !== 'commit' && $action !== 'reset') {
    fail_json(405, 'method_not_allowed', 'Only public contribution, authenticated commit, and authenticated reset POST requests are supported.');
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
if (!is_int($expectedRevision) || $expectedRevision < 0 || ($isKnowledgeReset ? !valid_fresh_model($model) : !valid_model($model))) {
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
$current = decode_state($currentContents);
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
