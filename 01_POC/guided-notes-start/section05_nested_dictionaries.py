# ============================================
# SECTION 5: Nested Dictionaries
# ============================================


def run():
    print("=== Section 5: Nested Dictionaries ===")

    # A dictionary inside a dictionary!
    party = {
        "warrior": {
            "name": "Kael",
            "health": 150,
            "attack": 40
        },
        "mage": {
            "name": "Lyra",
            "health": 80,
            "attack": 60
        }
    }

    # Access the entire inner dictionary
    print(f"Warrior data: {party['warrior']}")

    # Chain brackets to drill into nested values
    print(f"Warrior name: {party['warrior']['name']}")
    print(f"Mage attack: {party['mage']['attack']}")

    # Modify a nested value
    party["mage"]["health"] = 60
    print(f"Mage took damage! Health: {party['mage']['health']}")

    # Add a new key to an inner dict
    party["warrior"]["shield"] = 30
    print(f"Warrior got a shield: {party['warrior']}")

    # Loop through nested dicts
    print("\n--- Full Party ---")
    for role, stats in party.items():
        print(f"  --- {role} ---")
        for key, val in stats.items():
            print(f"    {key}: {val}")

    # TODO 1: Add a new party member called "healer" with:
    #         "name" → "Sage", "health" → 90, "attack" → 15
    #         Print the healer's name using chained brackets

    # TODO 2: The healer levels up! Increase the healer's health by 20
    #         and attack by 5 (read current value, add to it, reassign)
    #         Print the updated healer dictionary

    # TODO 3: Loop through the ENTIRE party using the nested loop pattern
    #         shown above to print all members and their stats
