# ============================================
# SECTION 4: Looping Through Dictionaries
# ============================================


def run():
    print("=== Section 4: Looping Through Dictionaries ===")

    inventory = {"sword": 1, "potion": 5, "shield": 1, "arrow": 20}

    # ── Loop over KEYS (default behavior) ──
    print("--- Keys only ---")
    for item in inventory:
        print(f"  {item}")

    # ── Loop over VALUES ──
    print("\n--- Values only ---")
    for count in inventory.values():
        print(f"  {count}")

    # ── Loop over BOTH with .items() ──
    print("\n--- Keys and Values ---")
    for item, count in inventory.items():
        print(f"  {item}: {count}")

    # ── Practical: Find items with count > 1 ──
    print("\n--- Items with more than 1: ---")
    for item, count in inventory.items():
        if count > 1:
            print(f"  {item} x{count}")

    # TODO 1: Create a dictionary called "stats" with:
    #         "strength" → 14, "dexterity" → 18,
    #         "intelligence" → 10, "charisma" → 16
    #         Use a for loop with .items() to print each stat like:
    #         "strength: 14"

    # TODO 2: Loop through "stats" and find + print only the stats
    #         that have a value of 15 or higher
    #         Print them like: "HIGH STAT → dexterity: 18"

    # TODO 3: Use a loop over stats.values() to calculate and print
    #         the total of all stat values
    #         Hint: create a variable "total = 0" before the loop
    #               and add each value to it inside the loop
