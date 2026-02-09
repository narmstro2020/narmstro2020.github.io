# ============================================
# SECTION 3: Common Dictionary Methods
# ============================================


def run():
    print("=== Section 3: Common Dictionary Methods ===")

    player = {
        "name": "Aria",
        "health": 100,
        "attack": 25,
        "defense": 15
    }

    # ── .keys() — get all keys ──
    print(f"Keys: {list(player.keys())}")

    # ── .values() — get all values ──
    print(f"Values: {list(player.values())}")

    # ── .items() — get all (key, value) pairs ──
    print(f"Items: {list(player.items())}")

    # ── "in" operator — check if KEY exists ──
    print(f"Has 'health'? {'health' in player}")   # True
    print(f"Has 'mana'? {'mana' in player}")        # False

    # ⚠️ "in" checks KEYS, not values!
    print(f"Has 100? {100 in player}")              # False (100 is a value, not a key)
    print(f"Has 100 in values? {100 in player.values()}")  # True

    # ── len() — count pairs ──
    print(f"Number of stats: {len(player)}")

    # ── .pop() — remove and return ──
    removed = player.pop("defense")
    print(f"Removed defense: {removed}")
    print(f"Player now: {player}")

    # TODO 1: Create a dictionary called "shop" with:
    #         "health potion" → 25, "mana potion" → 30,
    #         "antidote" → 15, "revive crystal" → 100
    #         Print all the item names using .keys()

    # TODO 2: Use the "in" operator to check if "elixir" is in the shop
    #         Then check if "antidote" is in the shop
    #         Print both results with descriptive messages

    # TODO 3: Use .pop() to remove "revive crystal" from the shop
    #         Store the price in a variable and print:
    #         "Bought revive crystal for {price} gold!"
    #         Then print the remaining shop items using .items()
