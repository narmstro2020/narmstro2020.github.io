# ============================================
# SECTION 6: Dictionaries + Other Collections
# ============================================


def run():
    print("=== Section 6: Dictionaries + Other Collections ===")

    # ── Dict with LIST values ──
    inventory = {
        "weapons": ["sword", "bow"],
        "potions": ["health", "mana", "speed"],
        "armor": ["iron helmet"]
    }

    # Access the list
    print(f"Weapons: {inventory['weapons']}")

    # Access an item IN the list
    print(f"First weapon: {inventory['weapons'][0]}")

    # Append to a list value
    inventory["weapons"].append("axe")
    print(f"After finding axe: {inventory['weapons']}")

    # Loop through a dict-of-lists
    print("\n--- Full Inventory ---")
    for category, items in inventory.items():
        print(f"  {category}:")
        for item in items:
            print(f"    - {item}")

    # ── List OF dictionaries ──
    enemies = [
        {"name": "Goblin", "hp": 30, "xp": 10},
        {"name": "Skeleton", "hp": 45, "xp": 20},
        {"name": "Dragon", "hp": 500, "xp": 200}
    ]

    # Access by list index, then dict key
    print(f"\nFirst enemy: {enemies[0]['name']}")

    # Loop through list of dicts
    print("\n--- Enemy Roster ---")
    for enemy in enemies:
        print(f"  {enemy['name']} — HP: {enemy['hp']}, XP: {enemy['xp']}")

    # TODO 1: Add a new category to inventory called "quest_items"
    #         with a list value of ["old map", "ancient key"]
    #         Then append "dragon scale" to the quest_items list
    #         Print the quest_items list

    # TODO 2: Add a new enemy to the enemies list:
    #         {"name": "Witch", "hp": 120, "xp": 75}
    #         Then print the Witch's name by accessing it from the list

    # TODO 3: Loop through the enemies list and print only enemies
    #         that give 50 or more XP. Print like:
    #         "BOSS: Dragon — 200 XP"
