<?php
declare(strict_types=1);

set_time_limit(10);
if (ob_get_level()) ob_end_clean();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

const LOBBY_PROTOCOL_VERSION = 1;
const LOBBY_MAX_BODY_BYTES = 262144;
const LOBBY_MAX_SNAPSHOT_BYTES = 180000;
const LOBBY_NAME_MAX_BYTES = 32;
const LOBBY_ID_LENGTH = 16;
const LOBBY_CODE_LENGTH = 6;
const LOBBY_WAITING_TTL_SECONDS = 600;
const LOBBY_ACTIVE_TTL_SECONDS = 7200;
const LOBBY_PARTICIPANT_IDLE_SECONDS = 45;

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'lobbies';

if (!is_dir($dataDir) && !@mkdir($dataDir, 0775, true)) {
    fail_json(500, 'storage_unavailable', 'Unable to create lobby storage.');
}
if (!is_writable($dataDir)) {
    fail_json(500, 'storage_unavailable', 'Lobby storage is not writable.');
}

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

function same_origin_request(): bool {
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') return true;
    $scheme = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
    return rtrim($origin, '/') === $scheme . '://' . (string)($_SERVER['HTTP_HOST'] ?? '');
}

function request_body(): array {
    $length = isset($_SERVER['CONTENT_LENGTH']) ? (int)$_SERVER['CONTENT_LENGTH'] : 0;
    if ($length > LOBBY_MAX_BODY_BYTES) fail_json(413, 'body_too_large', 'Lobby request is too large.');
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > LOBBY_MAX_BODY_BYTES) fail_json(413, 'body_too_large', 'Lobby request is too large.');
    if ($raw === '') return [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) fail_json(400, 'invalid_json', 'Lobby request must be JSON.');
    return $decoded;
}

function valid_lobby_id($value): bool {
    return is_string($value) && preg_match('/^[a-f0-9]{16}$/', $value) === 1;
}

function valid_lobby_code($value): bool {
    return is_string($value) && preg_match('/^[0-9]{6}$/', $value) === 1;
}

function valid_token($value): bool {
    return is_string($value) && preg_match('/^[a-f0-9]{64}$/', $value) === 1;
}

function lobby_path(string $dataDir, string $lobbyId): string {
    return $dataDir . DIRECTORY_SEPARATOR . 'lobby-' . $lobbyId . '.json';
}

function token_hash(string $token): string {
    return hash('sha256', $token);
}

function new_token(): string {
    return bin2hex(random_bytes(32));
}

function write_locked_lobby($handle, array $lobby): void {
    $encoded = json_encode($lobby, JSON_UNESCAPED_SLASHES);
    if ($encoded === false || ftruncate($handle, 0) === false || rewind($handle) === false || fwrite($handle, $encoded) === false || fflush($handle) === false) {
        fail_json(500, 'storage_unavailable', 'Unable to write lobby.');
    }
}

function open_lobby_locked(string $path) {
    $handle = @fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        if (is_resource($handle)) fclose($handle);
        fail_json(503, 'lobby_busy', 'Lobby is temporarily busy.');
    }
    rewind($handle);
    $lobby = json_decode(stream_get_contents($handle) ?: '', true);
    if (!is_array($lobby)) {
        flock($handle, LOCK_UN);
        fclose($handle);
        fail_json(500, 'storage_unavailable', 'Lobby data is invalid.');
    }
    return [$handle, $lobby];
}

function close_lobby_locked($handle): void {
    flock($handle, LOCK_UN);
    fclose($handle);
}

function participant_role(array $lobby, string $token): ?string {
    $hash = token_hash($token);
    foreach (['host', 'guest'] as $role) {
        if (is_array($lobby[$role] ?? null) && isset($lobby[$role]['tokenHash']) && hash_equals((string)$lobby[$role]['tokenHash'], $hash)) return $role;
    }
    return null;
}

function clean_expired_lobbies(string $dataDir, int $now): void {
    $paths = glob($dataDir . DIRECTORY_SEPARATOR . 'lobby-*.json') ?: [];
    foreach ($paths as $path) {
        $handle = @fopen($path, 'c+');
        if ($handle === false || !@flock($handle, LOCK_EX | LOCK_NB)) {
            if (is_resource($handle)) fclose($handle);
            continue;
        }
        rewind($handle);
        $lobby = json_decode(stream_get_contents($handle) ?: '', true);
        if (is_array($lobby) && (int)($lobby['expiresAt'] ?? 0) <= $now) {
            ftruncate($handle, 0);
            fflush($handle);
            @unlink($path);
        }
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function lobby_summary(array $lobby, int $now): array {
    $hostAlive = is_array($lobby['host'] ?? null) && $now - (int)$lobby['host']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    $guestAlive = is_array($lobby['guest'] ?? null) && $now - (int)$lobby['guest']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    return [
        'lobbyId' => (string)$lobby['lobbyId'],
        'name' => (string)$lobby['name'],
        'players' => ($hostAlive ? 1 : 0) + ($guestAlive ? 1 : 0),
        'phase' => (string)$lobby['phase'],
        'createdAt' => (int)$lobby['createdAt'],
        'expiresAt' => (int)$lobby['expiresAt'],
        'spectatable' => (string)($lobby['phase'] ?? '') === 'active' && $hostAlive && $guestAlive,
    ];
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'OPTIONS') send_json(204, []);
if (!same_origin_request()) fail_json(403, 'cross_origin_denied', 'Cross-origin lobby requests are not allowed.');

$action = (string)($_GET['action'] ?? '');
$now = time();
clean_expired_lobbies($dataDir, $now);

if ($action === 'list' && $method === 'GET') {
    $lobbies = [];
    foreach (glob($dataDir . DIRECTORY_SEPARATOR . 'lobby-*.json') ?: [] as $path) {
        [$handle, $lobby] = open_lobby_locked($path);
        $hostAlive = is_array($lobby['host'] ?? null) && $now - (int)$lobby['host']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
        $guestAlive = is_array($lobby['guest'] ?? null) && $now - (int)$lobby['guest']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
        if (!$guestAlive && is_array($lobby['guest'] ?? null)) {
            $lobby['guest'] = null;
            $lobby['phase'] = 'waiting';
            $lobby['expiresAt'] = $now + LOBBY_WAITING_TTL_SECONDS;
            write_locked_lobby($handle, $lobby);
        }
        $phase = (string)($lobby['phase'] ?? '');
        if ((int)($lobby['expiresAt'] ?? 0) > $now && $hostAlive && (($phase === 'waiting' && !$guestAlive) || ($phase === 'active' && $guestAlive))) {
            $lobbies[] = lobby_summary($lobby, $now);
        }
        close_lobby_locked($handle);
    }
    usort($lobbies, static fn(array $a, array $b): int => $b['createdAt'] <=> $a['createdAt']);
    send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'lobbies' => array_slice($lobbies, 0, 50)]);
}

$body = $method === 'POST' ? request_body() : [];

if ($action === 'create' && $method === 'POST') {
    $name = trim((string)($body['name'] ?? ''));
    if ($name === '' || strlen($name) > LOBBY_NAME_MAX_BYTES) fail_json(400, 'invalid_lobby_name', 'Lobby name must be 1 to 32 bytes.');
    $hostSide = (int)($body['hostSide'] ?? 1);
    if ($hostSide !== 1 && $hostSide !== 2) fail_json(400, 'invalid_host_side', 'Host side must be left or right.');
    $hostToken = new_token();
    for ($attempt = 0; $attempt < 8; $attempt++) {
        $lobbyId = bin2hex(random_bytes(LOBBY_ID_LENGTH / 2));
        $roomCode = (string)random_int(100000, 999999);
        $path = lobby_path($dataDir, $lobbyId);
        $handle = @fopen($path, 'x');
        if ($handle === false) continue;
        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            @unlink($path);
            continue;
        }
        $lobby = [
            'protocolVersion' => LOBBY_PROTOCOL_VERSION,
            'lobbyId' => $lobbyId,
            'roomCode' => $roomCode,
            'name' => $name,
            'hostSide' => $hostSide,
            'createdAt' => $now,
            'expiresAt' => $now + LOBBY_WAITING_TTL_SECONDS,
            'phase' => 'waiting',
            'host' => ['tokenHash' => token_hash($hostToken), 'lastSeen' => $now],
            'guest' => null,
            'spectatorSnapshot' => null,
            'spectatorSequence' => 0,
        ];
        write_locked_lobby($handle, $lobby);
        close_lobby_locked($handle);
        send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'lobby' => lobby_summary($lobby, $now), 'roomCode' => $roomCode, 'participantToken' => $hostToken, 'role' => 'host', 'hostSide' => $hostSide]);
    }
    fail_json(503, 'lobby_unavailable', 'Unable to create a lobby.');
}

$lobbyId = (string)($body['lobbyId'] ?? '');
$token = (string)($body['participantToken'] ?? '');
if (!valid_lobby_id($lobbyId)) fail_json(400, 'invalid_lobby_id', 'Lobby identifier is invalid.');
$path = lobby_path($dataDir, $lobbyId);
if (!is_file($path)) fail_json(404, 'lobby_not_found', 'Lobby was not found.');

if ($action === 'spectate' && $method === 'POST') {
    [$handle, $lobby] = open_lobby_locked($path);
    $hostAlive = is_array($lobby['host'] ?? null) && $now - (int)$lobby['host']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    $guestAlive = is_array($lobby['guest'] ?? null) && $now - (int)$lobby['guest']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    if ((int)$lobby['expiresAt'] <= $now || !$hostAlive || !$guestAlive || (string)($lobby['phase'] ?? '') !== 'active') {
        close_lobby_locked($handle);
        fail_json(409, 'lobby_not_spectatable', 'This lobby is not currently spectatable.');
    }
    $snapshot = is_array($lobby['spectatorSnapshot'] ?? null) ? $lobby['spectatorSnapshot'] : null;
    $sequence = (int)($lobby['spectatorSequence'] ?? 0);
    $summary = lobby_summary($lobby, $now);
    close_lobby_locked($handle);
    send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'lobby' => $summary, 'sequence' => $sequence, 'snapshot' => $snapshot]);
}

if ($action === 'join' && $method === 'POST') {
    [$handle, $lobby] = open_lobby_locked($path);
    if ((int)$lobby['expiresAt'] <= $now) {
        close_lobby_locked($handle);
        @unlink($path);
        fail_json(410, 'lobby_expired', 'Lobby has expired.');
    }
    $hostAlive = is_array($lobby['host'] ?? null) && $now - (int)$lobby['host']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    $guestAlive = is_array($lobby['guest'] ?? null) && $now - (int)$lobby['guest']['lastSeen'] <= LOBBY_PARTICIPANT_IDLE_SECONDS;
    if (!$hostAlive || $guestAlive) {
        close_lobby_locked($handle);
        fail_json(409, 'lobby_full', 'Lobby is no longer available.');
    }
    $guestToken = new_token();
    $lobby['guest'] = ['tokenHash' => token_hash($guestToken), 'lastSeen' => $now];
    $lobby['phase'] = 'active';
    $lobby['expiresAt'] = $now + LOBBY_ACTIVE_TTL_SECONDS;
    write_locked_lobby($handle, $lobby);
    close_lobby_locked($handle);
    send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'lobby' => lobby_summary($lobby, $now), 'roomCode' => (string)$lobby['roomCode'], 'participantToken' => $guestToken, 'role' => 'guest', 'hostSide' => (int)($lobby['hostSide'] ?? 1)]);
}

if (!valid_token($token)) fail_json(400, 'invalid_participant_token', 'Lobby participant token is invalid.');
[$handle, $lobby] = open_lobby_locked($path);
if ((int)$lobby['expiresAt'] <= $now) {
    close_lobby_locked($handle);
    @unlink($path);
    fail_json(410, 'lobby_expired', 'Lobby has expired.');
}
$role = participant_role($lobby, $token);
if ($role === null) {
    close_lobby_locked($handle);
    fail_json(403, 'invalid_participant_token', 'Lobby participant token is invalid.');
}
$lobby[$role]['lastSeen'] = $now;

if ($action === 'publish' && $method === 'POST') {
    if ($role !== 'host') {
        close_lobby_locked($handle);
        fail_json(403, 'host_required', 'Only the host can publish spectator state.');
    }
    $snapshot = $body['snapshot'] ?? null;
    $encodedSnapshot = json_encode($snapshot, JSON_UNESCAPED_SLASHES);
    if (!is_array($snapshot) || $encodedSnapshot === false || strlen($encodedSnapshot) > LOBBY_MAX_SNAPSHOT_BYTES) {
        close_lobby_locked($handle);
        fail_json(413, 'snapshot_too_large', 'Spectator snapshot is too large.');
    }
    $lobby['spectatorSnapshot'] = $snapshot;
    $lobby['spectatorSequence'] = (int)($lobby['spectatorSequence'] ?? 0) + 1;
    write_locked_lobby($handle, $lobby);
    $sequence = (int)$lobby['spectatorSequence'];
    close_lobby_locked($handle);
    send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'sequence' => $sequence]);
}

if ($action === 'heartbeat' && $method === 'POST') {
    $phase = (string)($body['phase'] ?? 'waiting');
    if ($phase === 'active' || $lobby['phase'] === 'active') {
        $lobby['phase'] = 'active';
        $lobby['expiresAt'] = min($now + LOBBY_ACTIVE_TTL_SECONDS, (int)$lobby['createdAt'] + LOBBY_ACTIVE_TTL_SECONDS);
    }
    write_locked_lobby($handle, $lobby);
    $summary = lobby_summary($lobby, $now);
    close_lobby_locked($handle);
    send_json(200, ['ok' => true, 'protocolVersion' => LOBBY_PROTOCOL_VERSION, 'lobby' => $summary]);
}

if ($action === 'close' && $method === 'POST') {
    if ($role === 'host') {
        close_lobby_locked($handle);
        @unlink($path);
    } else {
        $lobby['guest'] = null;
        $lobby['phase'] = 'waiting';
        $lobby['expiresAt'] = $now + LOBBY_WAITING_TTL_SECONDS;
        $lobby['spectatorSnapshot'] = null;
        $lobby['spectatorSequence'] = 0;
        write_locked_lobby($handle, $lobby);
        close_lobby_locked($handle);
    }
    send_json(200, ['ok' => true]);
}

close_lobby_locked($handle);
fail_json(400, 'unknown_action', 'Unsupported lobby action.');
