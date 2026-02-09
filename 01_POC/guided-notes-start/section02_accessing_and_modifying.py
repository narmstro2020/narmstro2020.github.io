# ============================================
# SECTION 2: Accessing & Modifying Values
# ============================================


def run():
    print("=== Section 2: Accessing & Modifying Values ===")

    player = {"name": "Aria", "health": 100, "attack": 25}

    # ── Bracket Access ──
    print(f"Health: {player['health']}")

    # ⚠️ Accessing a missing key crashes with KeyError!
    # print(player["mana"])  # Uncomment to see the error

    # ── Safe Access with .get() ──
    print(f"Mana (bracket would crash): {player.get('mana')}")         # None
    print(f"Mana (with default): {player.get('mana', 0)}")            # 0
    print(f"Health (with .get): {player.get('health', 0)}")           # 100

    # ── Update an existing value ──
    player["health"] = 80
    print(f"After damage: {player['health']}")  # 80

    # ── Add a brand new key ──
    player["mana"] = 50
    print(f"Added mana: {player}")

    # ── Delete a key ──
    del player["attack"]
    print(f"After removing attack: {player}")

    # TODO 1: Create a dictionary called "weapon" with:
    #         "name" → "Iron Sword", "damage" → 15, "durability" → 100
    #         Print the weapon's damage using bracket notation

    # TODO 2: Use .get() to safely print the weapon's "enchantment" key
    #         with a default value of "None"

    # TODO 3: Update the weapon's durability to 85 (it took some hits!)
    #         Then add a new key "element" with value "fire"
    #         Print the entire weapon dictionary
