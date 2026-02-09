# ============================================
# SECTION 7: Practical Patterns
# ============================================


def run():
    print("=== Section 7: Practical Patterns ===")

    # ── Pattern 1: Counting Occurrences ──
    print("--- Counting Pattern ---")
    loot_drops = ["gold", "gem", "gold", "potion", "gold", "gem", "potion", "potion"]

    counts = {}
    for item in loot_drops:
        if item in counts:
            counts[item] += 1
        else:
            counts[item] = 1

    print(f"Loot counts: {counts}")

    # ── Pattern 2: Lookup Table ──
    print("\n--- Lookup Pattern ---")
    element_chart = {
        "fire": "Strong vs Ice",
        "water": "Strong vs Fire",
        "ice": "Strong vs Wind",
        "wind": "Strong vs Earth",
        "earth": "Strong vs Water"
    }

    spell = "fire"
    advantage = element_chart.get(spell, "Unknown element")
    print(f"{spell} → {advantage}")

    # ── Pattern 3: Building from Input ──
    print("\n--- Building Pattern ---")
    # (We'll demo this with hardcoded values instead of input() for guided notes)
    character = {}
    character["name"] = "Aria"
    character["class"] = "Mage"
    character["level"] = 5
    print(f"Built character: {character}")

    # TODO 1: Create a list of enemy attacks:
    #         ["slash", "bite", "slash", "fireball", "bite", "slash", "fireball", "bite", "bite"]
    #         Use the counting pattern to count each attack type
    #         Print the counts dictionary

    # TODO 2: Create a lookup table called "potion_effects" that maps:
    #         "health" → "Restores 50 HP"
    #         "mana" → "Restores 30 MP"
    #         "speed" → "Boosts speed for 10s"
    #         "strength" → "Boosts attack for 15s"
    #         Use .get() to look up "mana" and "invisibility" (with a default of "No effect")
    #         Print both results

    # TODO 3: Build a dictionary called "my_character" by asking the user for input:
    #         Ask for: name (string), class (string), and level (int)
    #         Store each response in the dictionary
    #         Then print the full dictionary
    #         (Hint: use input() for strings, int(input()) for the level)
