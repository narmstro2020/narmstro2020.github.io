# =============================================================
#  U4B1 ACTIVITY — Dungeon Analytics Console
#  Principles of Computing | Unit 04
# =============================================================
#  The kingdom's Hero Registry has received a batch of raw
#  encounter data from scouts across the realm. The data is
#  messy — gold values that aren't numbers, hero levels out
#  of range, wrong types, you name it.
#
#  Your job: build the analytics tools that safely clean and
#  process this data so the kingdom's war council can use it.
#
#  HOW TO TEST:
#    Run your file after each task. Compare your printed
#    output to the expected output in the comments.
#    Your output should match exactly (including spacing).
#
#  SUBMIT: Push to GitHub (public) → link on Canvas (15 pts)
# =============================================================
#
#  POINT BREAKDOWN
#  ─────────────────────────────────────────────────────────
#  Task 1 — safe_parse_int()        2 pts
#  Task 2 — validate_hero()         3 pts
#  Task 3 — load_roster()           3 pts
#  Task 4 — Monster comprehensions  2 pts
#  Task 5 — build_leaderboard()     2 pts
#  Task 6 — round_report()          3 pts
# =============================================================


# =============================================================
# RAW DATA — do NOT modify these
# =============================================================

raw_heroes = [
    {"name": "Aria",   "level": "15",  "class": "Mage",    "hp": "120"},
    {"name": "Brom",   "level": "7",   "class": "Warrior", "hp": "200"},
    {"name": "Caela",  "level": "??",  "class": "Rogue",   "hp": "90"},   # bad level
    {"name": "Dex",    "level": "0",   "class": "Archer",  "hp": "110"},  # out of range
    {"name": "Elowen", "level": "22",  "class": "Paladin", "hp": "180"},
    {"name": 42,       "level": "5",   "class": "Bard",    "hp": "95"},   # bad name type
    {"name": "Fynn",   "level": "100", "class": "Ranger",  "hp": "130"},  # out of range (max 99)
    {"name": "Gara",   "level": "11",  "class": "Druid",   "hp": "160"},
]

raw_monsters = [
    {"name": "Goblin",   "hp": 30,  "gold": "8",      "zone": "Forest"},
    {"name": "Troll",    "hp": 85,  "gold": "twenty", "zone": "Bridge"},  # bad gold
    {"name": "Skeleton", "hp": 20,  "gold": "15",     "zone": "Crypt"},
    {"name": "Dragon",   "hp": 200, "gold": "500",    "zone": "Peak"},
    {"name": "Bat",      "hp": 10,  "gold": "2",      "zone": "Cave"},
    {"name": "Wraith",   "hp": 60,  "gold": "N/A",    "zone": "Crypt"},   # bad gold
    {"name": "Ogre",     "hp": 110, "gold": "45",     "zone": "Forest"},
    {"name": "Slime",    "hp": 15,  "gold": "1",      "zone": "Cave"},
]

round_scores = [
    {"name": "Aria",   "score": "4200"},
    {"name": "Brom",   "score": "three thousand"},   # bad
    {"name": "Caela",  "score": "3750"},
    {"name": "Gara",   "score": ""},                 # empty string
    {"name": "Elowen", "score": "5100"},
]


# =============================================================
# PART 1 — EXCEPTIONS
# =============================================================

print("=" * 55)
print("PART 1: EXCEPTIONS")
print("=" * 55)

# ── DOGFOOD EXAMPLE ──────────────────────────────────────────
# Pattern from the notes — return a safe default instead of
# crashing when the conversion fails.

def safe_parse_float(value):
    """Convert value to float. Return None if conversion fails."""
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

print(safe_parse_float("3.14"))   # 3.14
print(safe_parse_float("oops"))   # None
print(safe_parse_float(None))     # None


# ── TASK 1 (2 pts) — safe_parse_int() ────────────────────────
# Write safe_parse_int(value) — same idea as the dogfood above,
# but for integers.
#   - Return the int if conversion succeeds.
#   - Return None on ValueError or TypeError.
#
# Expected output:
#   15
#   None
#   None

def safe_parse_int(value):
    # YOUR CODE HERE
    return None  # replace this line

print("\n--- Task 1: safe_parse_int ---")
print(safe_parse_int("15"))    # 15
print(safe_parse_int("??"))    # None
print(safe_parse_int(None))    # None


# ── TASK 2 (3 pts) — validate_hero() ─────────────────────────
# Write validate_hero(hero) to check a hero dict and RAISE
# exceptions for bad data.
#
#   TypeError   if hero["name"] is not a str
#               message: "Name must be a string."
#
#   ValueError  if int(hero["level"]) raises ValueError,
#               OR if level < 1 or level > 99
#               message: f"Invalid level: {hero['level']}"
#
# If all checks pass, convert hero["level"] to int and
# return the hero dict.
#
# Expected output:
#   {'name': 'Aria', 'level': 15, 'class': 'Mage', 'hp': '120'}
#   Skipping hero: Invalid level: ??
#   Skipping hero: Name must be a string.

def validate_hero(hero):
    # YOUR CODE HERE
    return hero  # replace this line (currently passes everything through)

print("\n--- Task 2: validate_hero ---")
for test in [raw_heroes[0], raw_heroes[2], raw_heroes[5]]:
    try:
        print(validate_hero(test.copy()))
    except (TypeError, ValueError) as e:
        print(f"Skipping hero: {e}")


# ── TASK 3 (3 pts) — load_roster() ───────────────────────────
# Write load_roster(raw_list) that processes an entire list of
# raw hero dicts through validate_hero().
#
# For each hero:
#   - Call validate_hero(hero.copy())
#   - If it succeeds → add to the valid list
#   - If it raises TypeError or ValueError → silently skip it
#
# Return the list of valid heroes.
#
# Expected output:
#   Loaded 4 valid heroes.
#   ['Aria', 'Brom', 'Elowen', 'Gara']

def load_roster(raw_list):
    # YOUR CODE HERE
    return []  # replace this line

print("\n--- Task 3: load_roster ---")
roster = load_roster(raw_heroes)
print(f"Loaded {len(roster)} valid heroes.")
print([h["name"] for h in roster])


# =============================================================
# PART 2 — LIST COMPREHENSIONS
# =============================================================

print("\n" + "=" * 55)
print("PART 2: LIST COMPREHENSIONS")
print("=" * 55)

# ── DOGFOOD EXAMPLE ──────────────────────────────────────────
# From the notes — names (all caps) for monsters with hp > 50.

boss_names = [m["name"].upper() for m in raw_monsters if m["hp"] > 50]
print("Bosses:", boss_names)
# ['TROLL', 'DRAGON', 'WRAITH', 'OGRE']


# ── TASK 4 (2 pts) — Monster comprehensions ──────────────────
# Use raw_monsters for both parts. No for-loops allowed.
#
# Part A: zone_list — zones where the zone is "Crypt" or "Cave".
#         Keep duplicates.
#
# Expected:
#   Zone list: ['Crypt', 'Cave', 'Crypt', 'Cave']
#
# Part B: gold_values — gold as ints, for monsters whose gold
#         converts successfully. Use safe_parse_int() from Task 1.
#         Filter OUT any monster where it returns None.
#
# Expected:
#   Gold values: [8, 15, 500, 2, 45, 1]   (Troll and Wraith skipped)

print("\n--- Task 4: Monster comprehensions ---")

zone_list   = []   # replace with a comprehension
gold_values = []   # replace with a comprehension

print("Zone list:", zone_list)
print("Gold values:", gold_values)


# ── TASK 5 (2 pts) — build_leaderboard() ─────────────────────
# Write build_leaderboard(scores) — returns a sorted leaderboard.
#
# Steps:
#   1. Comprehension → list of (name, score_int) tuples.
#      Use safe_parse_int() on each "score".
#      Filter OUT entries where safe_parse_int returns None.
#
#   2. Sort descending by score.
#      Hint: sorted(..., key=lambda x: x[1], reverse=True)
#
#   3. Return the sorted list.
#
# Expected output:
#   Leaderboard:
#   1. Elowen    — 5100
#   2. Aria      — 4200
#   3. Caela     — 3750
#   (Brom and Gara skipped — unparseable scores)

def build_leaderboard(scores):
    # YOUR CODE HERE
    return []  # replace this line

print("\n--- Task 5: build_leaderboard ---")
board = build_leaderboard(round_scores)
print("Leaderboard:")
for rank, (name, score) in enumerate(board, start=1):
    print(f"  {rank}. {name:<8} — {score}")


# =============================================================
# PART 3 — COMBINED CHALLENGE
# =============================================================

print("\n" + "=" * 55)
print("PART 3: COMBINED CHALLENGE")
print("=" * 55)


# ── TASK 6 (3 pts) — round_report() ─────────────────────────
# Write round_report(monsters) — returns a summary dict.
#
# Required keys:
#
#   "dangerous"   → list of names of monsters with hp > 50
#                   (use a comprehension)
#
#   "total_gold"  → sum of all safely-parsed gold values
#                   (use safe_parse_int; skip Nones)
#                   (use a comprehension inside sum())
#
#   "zone_counts" → dict mapping each zone to its monster count.
#                   Build this with a regular loop — NOT a
#                   comprehension. (See the notes for the pattern.)
#
#   "avg_hp"      → average hp across ALL monsters, rounded to
#                   1 decimal place.
#                   Raise ValueError if monsters is empty.
#                   message: "Cannot report on an empty round."
#
# Expected output (using raw_monsters):
#   Dangerous: ['Troll', 'Dragon', 'Wraith', 'Ogre']
#   Total gold: 571
#   Zone counts: {'Forest': 2, 'Bridge': 1, 'Crypt': 2, 'Peak': 1, 'Cave': 2}
#   Avg HP: 66.2

def round_report(monsters):
    # YOUR CODE HERE
    return {}  # replace this line

print("\n--- Task 6: round_report ---")
try:
    report = round_report(raw_monsters)
    if not report:
        print("(stub — implement round_report to see output)")
    else:
        print("Dangerous:", report["dangerous"])
        print("Total gold:", report["total_gold"])
        print("Zone counts:", report["zone_counts"])
        print("Avg HP:", report["avg_hp"])
except ValueError as e:
    print(f"Error: {e}")

print("\nEmpty round test:")
try:
    round_report([])
except ValueError as e:
    print(f"Error caught: {e}")
