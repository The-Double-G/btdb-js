# v2.4.0 Competitive Balance Pass

## Goals

- Give every tower a defined early, mid, or late-game role.
- Make all three paths economically plausible without making them interchangeable.
- Remove frame-rate-dependent damage and multiplicative support exploits.
- Preserve the existing passive-ability design and compressed round pacing.
- Keep local play, Vs AI, mastery, practice, and self-play on the same rules.

## System Changes

- Projectiles can hit each Bloon once. Persistent rings, explosions, orbitals, and slashes no longer deal accidental damage every frame.
- Bloon Boost now uses the documented 1.4x speed factor instead of 1.25x.
- MOAB knockback uses its own chance, exact percentage rolls, mirrored map displacement, and correct freeplay health scaling.
- Bloon Impact, Bloon Crush, Flash Bomb, Master Bomber, and Shell Shock paths now apply real stuns. Bosses remain immune.
- Tight ceramic sends unlock on visible round 24 as documented.
- Grand Heist now transfers capped resources from the opponent instead of creating an uncapped copy.
- COBRA Monkey Stim now stacks at 2% with a 30% maximum cooldown reduction.
- Shinobi support now reaches about 0.59x cooldown and 1.61x pierce at ten stacks instead of 0.35x and 2.59x.
- Overclock and Ultraboost passive auras now use 0.85x and 0.75x cooldown factors.
- Trade Empire's fleet income multiplier is capped at 1.5x.
- Farmer now costs $250 instead of being unlimited free utility.
- Elite Sniper income is $3,500 per 30 seconds instead of $5,000.
- Banana Central produces $2,500 crates and buffs Factories by 15% instead of 25%.

## Base Prices

| Tower | v2.3.0 | v2.4.0 | Intent |
|---|---:|---:|---|
| Dart | $100 | $100 | Baseline starter |
| Tack | $300 | $300 | Close-range specialist |
| Bomb | $500 | $500 | Splash and control |
| Ice | $700 | $650 | Earlier access to control |
| Super | $1,250 | $1,250 | Premium damage |
| Farm | $1,250 | $1,400 | Slower greed opening |
| Farmer | $0 | $250 | Utility has an opportunity cost |
| Dartling | $750 | $800 | Manual aim premium |
| Wizard | $500 | $550 | Mixed damage premium |
| COBRA | $400 | $450 | Support/economy premium |
| Boomer | $400 | $375 | Better early lane control |
| Sniper | $250 | $300 | Infinite range premium |
| Ninja | $350 | $400 | Strong all-rounder premium |
| Engineer | $300 | $350 | Deployable/support premium |
| Buccaneer | $300 | $350 | Wide coverage premium |
| Mortar | $1,000 | $900 | Easier entry for manual splash |
| Sword | $500 | $450 | Easier entry for short range |

## Tier Five Prices

| Tower | Path 1 | Path 2 | Path 3 |
|---|---:|---:|---:|
| Dart | $18,000 | $40,000 | $26,000 |
| Tack | $60,000 | $50,000 | $52,000 |
| Bomb | $45,000 | $28,000 | $35,000 |
| Ice | $25,000 | $20,000 | $50,000 |
| Super | $500,000 | $150,000 | $110,000 |
| Farm | $75,000 | $48,000 | $55,000 |
| Dartling | $125,000 | $125,000 | $70,000 |
| Wizard | $40,000 | $50,000 | $65,000 |
| COBRA | $7,500 | $40,000 | $10,000 |
| Boomer | $60,000 | $45,000 | $50,000 |
| Sniper | $35,000 | $20,000 | $25,000 |
| Ninja | $60,000 | $30,000 | $60,000 |
| Engineer | $50,000 | $65,000 | $55,000 |
| Buccaneer | $45,000 | $42,000 | $30,000 |
| Mortar | $55,000 | $60,000 | $38,000 |
| Sword | $95,000 | $65,000 | $50,000 |

Farmer has no upgrades. Lower tiers were adjusted where a path had a severe price spike, an economy multiplier, permanent global support, or insufficient value after the one-hit correction. The authoritative values remain in `js/03-tower.js`.

## Correctness And Performance

- Fixed mirrored freeplay leak damage and Offside ricochet speed.
- Fixed Mastery rounds 3, 67, and 80 and removed duplicate round 43 branches.
- Fixed Engineer trap placement and pop attribution, Aircraft Master plane replacement, Sword child ownership, and Super projectile vectors.
- Replaced four full targeting scans with one squared-distance scan.
- Added a frame-local tower lookup for collision attribution.
- Removed dead projectile merge work, one redundant UI render, and per-frame FPS timeout allocation.

Run `node tools/validate-balance.js` for the balance metadata and regression gate.
