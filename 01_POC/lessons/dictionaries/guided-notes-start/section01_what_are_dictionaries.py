# ============================================
# SECTION 1: What Are Dictionaries?
# ============================================


def run():
    print("=== Section 1: What Are Dictionaries? ===")

    # A dictionary stores data as key-value pairs
    # Syntax: {key: value, key: value, ...}
    player = {
        "name": "Aria",
        "health": 100,
        "attack": 25
    }

    print(player)
    print(f"Player name: {player['name']}")
    print(f"Player health: {player['health']}")

    # You can also create an empty dictionary and add to it
    empty_dict = {}
    print(f"Empty dict: {empty_dict}")

    # Keys must be unique — duplicates overwrite!
    demo = {"a": 1, "b": 2, "a": 99}
    print(f"Duplicate key demo: {demo}")  # "a" is 99, not 1

    # TODO 1: Create a dictionary called "enemy" with the following keys and values:
    #         "name" → "Goblin"
    #         "health" → 50
    #         "attack" → 10
    #         "loot" → "gold coin"
    #         Print the entire dictionary

    # TODO 2: Print ONLY the enemy's name using bracket notation
    #         Then print ONLY the enemy's loot
